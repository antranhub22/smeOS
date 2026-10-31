/**
 * `POST /api/v1/orders/approval-requests/:requestId/decision` (R16 — trần cứng Điều hành).
 * Body `{ approve: boolean, note?, collectDueAt? }` — từ chối bắt buộc ghi lý do.
 */

import { handle, jsonResponse } from "@/core/http/response"
import { requireCapability } from "@/core/rbac/capabilities"
import { requireTenantContext } from "@/modules/organization/use-cases/resolve-session"
import { decideDeliverBeforePay } from "@/modules/orders/use-cases/deliver-before-pay"

export const POST = handle(async (request, context: { params: Promise<{ requestId: string }> }) => {
  const { ctx } = await requireTenantContext(request)
  requireCapability(ctx, "R16")
  const { requestId } = await context.params
  const body = ((await request.json().catch(() => null)) ?? {}) as Record<string, unknown>
  return jsonResponse(await decideDeliverBeforePay(ctx, requestId, { approve: body.approve, note: body.note, collectDueAt: body.collectDueAt }))
})
