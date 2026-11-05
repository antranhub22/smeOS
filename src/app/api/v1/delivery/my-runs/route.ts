/** `GET /api/v1/delivery/my-runs` (R18) — đơn đang giao gắn số điện thoại của shipper đăng nhập. */

import { handle, jsonResponse } from "@/core/http/response"
import { requireCapability } from "@/core/rbac/capabilities"
import { listShipperRuns } from "@/modules/coordinator/use-cases/shipper-runs"
import { requireTenantContext } from "@/modules/organization/use-cases/resolve-session"

export const GET = handle(async (request) => {
  const { ctx } = await requireTenantContext(request)
  requireCapability(ctx, "R18")
  return jsonResponse(await listShipperRuns(ctx))
})

export const dynamic = "force-dynamic"
