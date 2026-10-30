import { requireCapability } from "@/core/rbac/capabilities"
import { handle, jsonResponse } from "@/core/http/response"
import { requireTenantContext } from "@/modules/organization/use-cases/resolve-session"
import { materialNeeds } from "@/modules/costing/use-cases/costing-service"

/** `GET /costing/needs?from=YYYY-MM-DD&to=YYYY-MM-DD` (`L5`) — dự toán mua nguyên liệu cho đơn giao trong khoảng (#35). */
export const GET = handle(async (request) => {
  const { ctx } = await requireTenantContext(request)
  requireCapability(ctx, "L5")
  const url = new URL(request.url)
  return jsonResponse({ data: await materialNeeds(ctx, url.searchParams.get("from") ?? "", url.searchParams.get("to") ?? "") })
})
