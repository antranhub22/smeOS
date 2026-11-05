/** `GET /api/v1/quotations/:id/revisions` (R15) — lịch sử phiên bản báo giá (checklist ALG 3.10). */

import { handle, jsonResponse } from "@/core/http/response"
import { requireCapability } from "@/core/rbac/capabilities"
import { requireTenantContext } from "@/modules/organization/use-cases/resolve-session"
import { listQuotationRevisionsUseCase } from "@/modules/sales/use-cases/list-quotation-revisions.use-case"

export const GET = handle(async (request, context: { params: Promise<{ id: string }> }) => {
  const { ctx } = await requireTenantContext(request)
  requireCapability(ctx, "R15")
  const { id } = await context.params
  return jsonResponse({ data: await listQuotationRevisionsUseCase(ctx, id) })
})

export const dynamic = "force-dynamic"
