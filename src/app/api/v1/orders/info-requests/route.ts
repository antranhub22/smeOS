/** `GET /api/v1/orders/info-requests` (R1) — việc "Thiếu thông tin": mọi yêu cầu bổ sung còn mở, hạn gần nhất trước (checklist ALG 4.14). */

import { handle, jsonResponse } from "@/core/http/response"
import { requireCapability } from "@/core/rbac/capabilities"
import { listOpenInfoRequests } from "@/modules/orders/use-cases/order-info-requests"
import { requireTenantContext } from "@/modules/organization/use-cases/resolve-session"

export const GET = handle(async (request) => {
  const { ctx } = await requireTenantContext(request)
  requireCapability(ctx, "R1")
  return jsonResponse({ data: await listOpenInfoRequests(ctx) })
})

export const dynamic = "force-dynamic"
