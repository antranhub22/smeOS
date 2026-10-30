import { requireCapability } from "@/core/rbac/capabilities"
import { handle, jsonResponse } from "@/core/http/response"
import { requireTenantContext } from "@/modules/organization/use-cases/resolve-session"
import { materialHistory } from "@/modules/costing/use-cases/costing-service"

/** `GET /costing/materials/:id/history` (`L5`) — lịch sử đơn giá, mới nhất trước. */
export const GET = handle(async (request, context: { params: Promise<{ id: string }> }) => {
  const { ctx } = await requireTenantContext(request)
  requireCapability(ctx, "L5")
  const { id } = await context.params
  return jsonResponse({ data: await materialHistory(ctx, id) })
})
