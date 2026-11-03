/** DELETE /api/v1/platform/marketplace/stores/:id — xoá hồ sơ cửa hàng khỏi chợ đối tác (`N18`, chỉ superadmin). */
import { notFound } from "@/core/http/errors"
import { handle, jsonResponse } from "@/core/http/response"
import { deleteMarketplaceStore } from "@/modules/platform/use-cases/delete-partner-marketplace-store"
import { requirePlatformContext } from "@/modules/platform/use-cases/resolve-platform-session"

const UUID = /^[0-9a-f-]{36}$/i

export const DELETE = handle<[{ params: Promise<{ id: string }> }]>(async (request, context) => {
  const pctx = await requirePlatformContext(request)
  const { id } = await context.params
  if (!UUID.test(id)) throw notFound()
  return jsonResponse({ data: await deleteMarketplaceStore(pctx, id) })
})

export const dynamic = "force-dynamic"
