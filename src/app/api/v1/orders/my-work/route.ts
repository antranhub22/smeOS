/**
 * `GET /api/v1/orders/my-work` (R17) — việc chế tác đang giao cho người đăng nhập, sắp theo giờ giao.
 * `?scope=team` (R4) — mọi việc đang giao trong phạm vi chi nhánh của người phân công.
 */

import { handle, jsonResponse } from "@/core/http/response"
import { requireCapability } from "@/core/rbac/capabilities"
import { requireTenantContext } from "@/modules/organization/use-cases/resolve-session"
import { listFloristQueue } from "@/modules/orders/use-cases/florist-queue"

export const GET = handle(async (request) => {
  const { ctx } = await requireTenantContext(request)
  const scope = new URL(request.url).searchParams.get("scope") === "team" ? "team" : "mine"
  requireCapability(ctx, scope === "team" ? "R4" : "R17")
  return jsonResponse({ data: await listFloristQueue(ctx, scope) })
})

export const dynamic = "force-dynamic"
