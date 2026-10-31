/**
 * `POST /api/v1/orders/:id/payments` (R11 — trần cứng Điều hành) — xác nhận tiền đơn ngoài Thẻ chào.
 * Body `{ amountVnd, method: BANK_TRANSFER|CASH|CARD|E_WALLET|COD, reference?, note? }`.
 */

import { handle, jsonResponse } from "@/core/http/response"
import { requireCapability } from "@/core/rbac/capabilities"
import { requireTenantContext } from "@/modules/organization/use-cases/resolve-session"
import { confirmOrderPayment } from "@/modules/orders/use-cases/confirm-order-payment"

export const POST = handle(async (request, context: { params: Promise<{ id: string }> }) => {
  const { ctx } = await requireTenantContext(request)
  requireCapability(ctx, "R11")
  const { id } = await context.params
  const body = ((await request.json().catch(() => null)) ?? {}) as Record<string, unknown>
  return jsonResponse(await confirmOrderPayment(ctx, id, body), { status: 201 })
})
