import { requireCapability } from "@/core/rbac/capabilities"
import { handle, jsonResponse } from "@/core/http/response"
import { decidePendingPayment } from "@/modules/coordinator/use-cases/decide-pending-payment"
import { PAYMENT_CONFIRM_CAPABILITY } from "@/modules/coordinator/use-cases/record-payment"
import { requireTenantContext } from "@/modules/organization/use-cases/resolve-session"

type Params = { params: Promise<{ id: string; paymentId: string }> }

/**
 * `POST /api/v1/coordinator/orders/:id/payments/:paymentId/decision` — Điều hành (R11) xác nhận hoặc từ
 * chối khoản Sale/Điều phối đã ghi (checklist ALG 1.16). Body `{ approve, note? }`.
 */
export const POST = handle(async (request, context: Params) => {
  const { ctx } = await requireTenantContext(request)
  requireCapability(ctx, PAYMENT_CONFIRM_CAPABILITY)
  const { id, paymentId } = await context.params
  const body = (await request.json().catch(() => ({}))) as { approve?: unknown; note?: unknown }
  const order = await decidePendingPayment(ctx, id, paymentId, body)
  return jsonResponse({ order })
})
