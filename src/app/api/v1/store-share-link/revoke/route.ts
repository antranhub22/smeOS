import { requireCapability } from "@/core/rbac/capabilities"
import { handle, jsonResponse } from "@/core/http/response"
import { requireTenantContext } from "@/modules/organization/use-cases/resolve-session"
import { revokeStoreShareLink } from "@/modules/profiles/use-cases/store-share-link"

/** Ngừng link công khai đang hoạt động; link cũ hiện "đã ngừng chia sẻ". */
export const POST = handle(async (request) => {
  const { ctx } = await requireTenantContext(request)
  requireCapability(ctx, "F2")
  await revokeStoreShareLink(ctx)
  return jsonResponse({ revoked: true })
})
