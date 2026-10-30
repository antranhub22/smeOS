import { requireCapability } from "@/core/rbac/capabilities"
import { handle, jsonResponse } from "@/core/http/response"
import { requireTenantContext } from "@/modules/organization/use-cases/resolve-session"
import { getProductImageSetResult } from "@/modules/product-image-set/use-cases/get-product-image-set-result"

export const GET = handle(async (request, context: { params: Promise<{ id: string }> }) => {
  const { ctx } = await requireTenantContext(request)
  requireCapability(ctx, "G1")
  const params = await context.params
  const id = params.id

  const result = await getProductImageSetResult(ctx, id)
  return jsonResponse(result)
})
