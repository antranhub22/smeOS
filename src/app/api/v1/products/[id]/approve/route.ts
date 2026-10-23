import { requireCapability } from "@/core/rbac/capabilities"
import { handle, jsonResponse } from "@/core/http/response"
import { requireTenantContext } from "@/modules/organization/use-cases/resolve-session"
import { approveProductProposal } from "@/modules/products/use-cases/review-product-proposal"

/** `POST /products/:id/approve` (`H3`, trần cứng `dieu_hanh`) — duyệt mẫu do nhân viên đề xuất. */
export const POST = handle(async (request, context: { params: Promise<{ id: string }> }) => {
  const { ctx } = await requireTenantContext(request)
  requireCapability(ctx, "H3")

  const { id } = await context.params
  return jsonResponse(await approveProductProposal(ctx, id))
})
