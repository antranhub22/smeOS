import { requireCapability } from "@/core/rbac/capabilities"
import { handle, jsonResponse } from "@/core/http/response"
import { requireTenantContext } from "@/modules/organization/use-cases/resolve-session"
import { undoImportBatch } from "@/modules/products/use-cases/product-import-batches"

/** `POST /products/import-batches/:id/undo` (`H3`) — hoàn tác lô nhập trong 24 giờ. */
export const POST = handle(async (request, context: { params: Promise<{ id: string }> }) => {
  const { ctx } = await requireTenantContext(request)
  requireCapability(ctx, "H3")
  const { id } = await context.params
  return jsonResponse(await undoImportBatch(ctx, id))
})
