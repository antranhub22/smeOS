import type { TenantContext } from "@/core/tenancy/tenant-context"
import { notFound, validationFailed } from "@/core/http/errors"
import { recordAuditLog, type RecordAuditLogInput } from "@/modules/audit/use-cases/record-audit-log"
import { isLeadStatus, type LeadStatus } from "../domain/lead-rules"
import { LeadRepository } from "../infra/lead-repository"

export async function listLeads(
  ctx: TenantContext,
  opts: { status?: string | undefined; limit: number; cursor?: string | undefined },
  repo = new LeadRepository(),
) {
  if (opts.status !== undefined && !isLeadStatus(opts.status)) {
    throw validationFailed({ status: "Phải là một trong: NEW, CONTACTED, WON, LOST" })
  }
  const [page, counts] = await Promise.all([
    repo.list(ctx, { status: opts.status as LeadStatus | undefined, limit: opts.limit, cursor: opts.cursor }),
    repo.countByStatus(ctx),
  ])
  return { ...page, counts }
}

/** Đổi trạng thái chăm sóc và/hoặc người phụ trách. Lead tổ chức khác → 404. */
export async function updateLead(
  ctx: TenantContext,
  id: string,
  patch: { status?: string | undefined; assigneeUserId?: string | null | undefined },
  repo = new LeadRepository(),
  audit: (ctx: TenantContext, input: RecordAuditLogInput) => Promise<unknown> = recordAuditLog,
) {
  if (patch.status !== undefined && !isLeadStatus(patch.status)) {
    throw validationFailed({ status: "Phải là một trong: NEW, CONTACTED, WON, LOST" })
  }
  const existing = await repo.findById(ctx, id)
  if (!existing) throw notFound()
  if (patch.assigneeUserId && !(await repo.isActiveMember(ctx, patch.assigneeUserId))) {
    throw validationFailed({ assigneeUserId: "Người phụ trách phải là thành viên đang hoạt động của cửa hàng" })
  }
  const data: { status?: LeadStatus; assigneeUserId?: string | null } = {}
  if (patch.status !== undefined) data.status = patch.status as LeadStatus
  if (patch.assigneeUserId !== undefined) data.assigneeUserId = patch.assigneeUserId
  if (!(await repo.update(ctx, id, data))) throw notFound()
  await audit(ctx, {
    action: "lead.update",
    entityType: "lead",
    entityId: id,
    before: { status: existing.status, assigneeUserId: existing.assignee_user_id },
    after: data,
  })
  return repo.findById(ctx, id)
}
