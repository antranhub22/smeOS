/** `GET /api/v1/orders/coordination-queue` (R1) — đơn ngoài Thẻ chào đang điều phối (tab Điều phối của Đơn hàng). */

import { handle, jsonResponse } from "@/core/http/response"
import { requireCapability } from "@/core/rbac/capabilities"
import { requireTenantContext } from "@/modules/organization/use-cases/resolve-session"
import { listCoordinationQueue } from "@/modules/orders/use-cases/list-coordination-queue"

export const GET = handle(async (request) => {
  const { ctx } = await requireTenantContext(request)
  requireCapability(ctx, "R1")
  return jsonResponse(await listCoordinationQueue(ctx))
})

export const dynamic = "force-dynamic"
