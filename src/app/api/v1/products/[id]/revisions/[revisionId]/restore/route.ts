import { requireCapability } from "@/core/rbac/capabilities"
import { handle, jsonResponse } from "@/core/http/response"
import { requireTenantContext } from "@/modules/organization/use-cases/resolve-session"
import { restoreProductRevision } from "@/modules/products/use-cases/product-revisions"

/** `POST /products/:id/revisions/:revisionId/restore` (`H3`) — khôi phục nội dung mẫu về một phiên bản. */
export const POST = handle(async (request, context: { params: Promise<{ id: string; revisionId: string }> }) => {
  const { ctx } = await requireTenantContext(request)
  requireCapability(ctx, "H3")
  const { id, revisionId } = await context.params
  return jsonResponse(await restoreProductRevision(ctx, id, revisionId))
})
