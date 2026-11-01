/** DELETE /api/v1/platform/marketplace/share-links/:id — huỷ link chia sẻ ngay lập tức (`N17`). */
import { notFound } from "@/core/http/errors"
import { handle, jsonResponse } from "@/core/http/response"
import { revokeShareLink } from "@/modules/platform/use-cases/share-partner-marketplace"
import { requirePlatformContext } from "@/modules/platform/use-cases/resolve-platform-session"

const UUID = /^[0-9a-f-]{36}$/i

export const DELETE = handle<[{ params: Promise<{ id: string }> }]>(async (request, context) => {
  const pctx = await requirePlatformContext(request)
  const { id } = await context.params
  if (!UUID.test(id)) throw notFound()
  return jsonResponse({ data: await revokeShareLink(pctx, id) })
})

export const dynamic = "force-dynamic"
