import { requireCapability } from "@/core/rbac/capabilities"
import { handle, jsonResponse } from "@/core/http/response"
import { requireTenantContext } from "@/modules/organization/use-cases/resolve-session"
import { createStoreShareLink, getStoreShareLink } from "@/modules/profiles/use-cases/store-share-link"

/** Công cụ 11 — link hồ sơ cửa hàng công khai của tổ chức hiện tại. */
export const GET = handle(async (request) => {
  const { ctx } = await requireTenantContext(request)
  requireCapability(ctx, "F1")
  return jsonResponse({ data: await getStoreShareLink(ctx) })
})

export const POST = handle(async (request) => {
  const { ctx } = await requireTenantContext(request)
  requireCapability(ctx, "F2")
  return jsonResponse({ data: await createStoreShareLink(ctx) }, { status: 201 })
})
