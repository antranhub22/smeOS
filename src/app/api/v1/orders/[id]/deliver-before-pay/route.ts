/**
 * `POST /api/v1/orders/:id/deliver-before-pay` (R2) — Sale xin "giao trước, thu sau" cho đơn ngoài Thẻ chào.
 * Body `{ reason }`. Trong chính sách / hoả tốc / hạn mức → tự duyệt, đơn sang Điều phối; ngoài → chờ Điều hành.
 */

import { handle, jsonResponse } from "@/core/http/response"
import { requireCapability } from "@/core/rbac/capabilities"
import { requireTenantContext } from "@/modules/organization/use-cases/resolve-session"
import { requestDeliverBeforePay } from "@/modules/orders/use-cases/deliver-before-pay"

export const POST = handle(async (request, context: { params: Promise<{ id: string }> }) => {
  const { ctx } = await requireTenantContext(request)
  requireCapability(ctx, "R2")
  const { id } = await context.params
  const body = ((await request.json().catch(() => null)) ?? {}) as Record<string, unknown>
  const result = await requestDeliverBeforePay(ctx, id, { reason: typeof body.reason === "string" ? body.reason : undefined })
  return jsonResponse(result, { status: 201 })
})
