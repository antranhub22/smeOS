/** `POST /api/v1/orders/:id/info-requests/:requestId` (R3) — đóng yêu cầu: đã nhận (`RECEIVED`) hoặc huỷ (`CANCELLED`, có lý do). */

import { z } from "zod"

import { handle, jsonResponse } from "@/core/http/response"
import { requireCapability } from "@/core/rbac/capabilities"
import { closeOrderInfoRequest } from "@/modules/orders/use-cases/order-info-requests"
import { requireTenantContext } from "@/modules/organization/use-cases/resolve-session"

const bodySchema = z.object({ outcome: z.enum(["RECEIVED", "CANCELLED"]), note: z.string().max(500).optional() })

export const POST = handle(async (request, context: { params: Promise<{ id: string; requestId: string }> }) => {
  const { ctx } = await requireTenantContext(request)
  requireCapability(ctx, "R3")
  const { id, requestId } = await context.params
  await closeOrderInfoRequest(ctx, id, requestId, bodySchema.parse(await request.json()))
  return jsonResponse({ ok: true })
})
