import { notFound, unprocessable } from "@/core/http/errors"
import type { TenantContext } from "@/core/tenancy"
import { recordAuditLog } from "@/modules/audit/use-cases/record-audit-log"
import { approveProposal, PROPOSAL_KEY, readProposal } from "@/modules/products/domain/product-proposal"
import { ProductRepository } from "@/modules/products/infra/product-repository"

/**
 * Điều hành duyệt mẫu đề xuất (`H3`, kiểm ở route): giữ lịch sử người đề xuất,
 * đánh dấu đã duyệt, ghi `audit_logs`. Mẫu tổ chức khác → 404.
 */
export async function approveProductProposal(ctx: TenantContext, id: string) {
  const repo = new ProductRepository()
  const current = await repo.findById(ctx, id)
  if (!current) throw notFound()

  const attrs = (current.attributes as Record<string, unknown> | null) ?? {}
  const proposal = readProposal(attrs)
  if (proposal?.status !== "pending") throw unprocessable("Mẫu này không có đề xuất nào đang chờ duyệt")

  const approved = approveProposal(proposal, ctx.userId)
  const updated = await repo.update(ctx, id, { attributes: { ...attrs, [PROPOSAL_KEY]: approved } })
  if (!updated) throw notFound()

  await recordAuditLog(ctx, {
    action: "product.approve",
    entityType: "product",
    entityId: id,
    before: { proposal },
    after: { proposal: approved },
  })
  return updated
}
