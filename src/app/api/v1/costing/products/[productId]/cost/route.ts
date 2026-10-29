import { requireCapability } from "@/core/rbac/capabilities"
import { handle, jsonResponse } from "@/core/http/response"
import { requireTenantContext } from "@/modules/organization/use-cases/resolve-session"
import { productCostAndPrice } from "@/modules/costing/use-cases/costing-service"

/** `GET /costing/products/:productId/cost` (`L5`) — giá vốn (#33) và kịch bản giá bán (#34). `?competitor_vnd=` tuỳ chọn. */
export const GET = handle(async (request, context: { params: Promise<{ productId: string }> }) => {
  const { ctx } = await requireTenantContext(request)
  requireCapability(ctx, "L5")
  const { productId } = await context.params
  const raw = Number(new URL(request.url).searchParams.get("competitor_vnd"))
  return jsonResponse({ data: await productCostAndPrice(ctx, productId, Number.isFinite(raw) && raw > 0 ? raw : null) })
})
