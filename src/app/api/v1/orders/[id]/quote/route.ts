/** `POST /api/v1/orders/:id/quote` (R15) — Sale báo giá đơn ngoài Thẻ chào. Body `{ totalVnd, note? }`. */

import { handle, jsonResponse } from "@/core/http/response"
import { requireCapability } from "@/core/rbac/capabilities"
import { requireTenantContext } from "@/modules/organization/use-cases/resolve-session"
import { quoteOrder } from "@/modules/orders/use-cases/quote-order"

export const POST = handle(async (request, context: { params: Promise<{ id: string }> }) => {
  const { ctx } = await requireTenantContext(request)
  requireCapability(ctx, "R15")
  const { id } = await context.params
  const body = ((await request.json().catch(() => null)) ?? {}) as Record<string, unknown>
  return jsonResponse(await quoteOrder(ctx, id, { totalVnd: body.totalVnd, note: body.note }))
})
