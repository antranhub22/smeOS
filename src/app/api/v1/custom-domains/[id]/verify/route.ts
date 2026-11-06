/**
 * POST /api/v1/custom-domains/:id/verify (`D19`) — kiểm bản ghi TXT `_smeos-verify.<tên miền>` (checklist ALG 10.8).
 * Đúng → tên miền chuyển "Đang hoạt động" và được gửi cấp chứng chỉ HTTPS; chưa đúng → `verified: false`.
 */
import { handle, jsonResponse } from "@/core/http/response"
import { enforceRateLimit } from "@/core/http/rate-limit"
import { requireTenantContext } from "@/modules/organization/use-cases/resolve-session"
import { verifyCustomDomain } from "@/modules/custom-domain/use-cases/manage-custom-domains"

type Ctx = { params: Promise<{ id: string }> }

export const POST = handle(async (request, context: Ctx) => {
  const { ctx } = await requireTenantContext(request)
  await enforceRateLimit(request, { scope: `custom-domain-verify:${ctx.organizationId}`, limit: 20, windowMs: 60_000 })
  const { id } = await context.params
  return jsonResponse({ data: await verifyCustomDomain(ctx, id) })
})

export const dynamic = "force-dynamic" as const
export const revalidate = 0 as const
