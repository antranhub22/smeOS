import { requireCapability } from "@/core/rbac/capabilities"
import { handle, jsonResponse } from "@/core/http/response"
import { requireTenantContext } from "@/modules/organization/use-cases/resolve-session"
import { listProductRevisions } from "@/modules/products/use-cases/product-revisions"

/** `GET /products/:id/revisions` (`H3`) — các phiên bản đã lưu của mẫu, mới nhất trước. */
export const GET = handle(async (request, context: { params: Promise<{ id: string }> }) => {
  const { ctx } = await requireTenantContext(request)
  requireCapability(ctx, "H3")
  const { id } = await context.params
  return jsonResponse({ data: await listProductRevisions(ctx, id) })
})
