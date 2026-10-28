import { requireCapability } from "@/core/rbac/capabilities"
import { handle, jsonResponse } from "@/core/http/response"
import { requireTenantContext } from "@/modules/organization/use-cases/resolve-session"
import { getProductPhotoResult } from "@/modules/product-photo-studio/use-cases/get-product-photo-result"

export const GET = handle(async (request, context: { params: Promise<{ id: string }> }) => {
  const { ctx } = await requireTenantContext(request)
  requireCapability(ctx, "G1")
  const params = await context.params
  const id = params.id

  const result = await getProductPhotoResult(ctx, id)
  return jsonResponse(result)
})
