/** `GET /api/v1/orders/workbench` (R1) — đơn ngoài Thẻ chào cần Sale/Điều hành xử lý (mục Đơn hàng theo vai). */

import { handle, jsonResponse } from "@/core/http/response"
import { requireCapability } from "@/core/rbac/capabilities"
import { requireTenantContext } from "@/modules/organization/use-cases/resolve-session"
import { listWorkbench } from "@/modules/orders/use-cases/list-workbench"

export const GET = handle(async (request) => {
  const { ctx } = await requireTenantContext(request)
  requireCapability(ctx, "R1")
  return jsonResponse(await listWorkbench(ctx))
})

export const dynamic = "force-dynamic"
