/**
 * POST /api/v1/platform/marketplace/sync-photos — tải một lượt ảnh khảo sát từ Drive vào kho
 * (`N16`). Mỗi lượt xử lý tối đa PHOTO_STORES_PER_RUN cửa hàng; `remaining` > 0 thì gọi tiếp.
 */
import { handle, jsonResponse } from "@/core/http/response"
import { syncMarketplacePhotos } from "@/modules/platform/use-cases/manage-partner-marketplace"
import { requirePlatformContext } from "@/modules/platform/use-cases/resolve-platform-session"

export const POST = handle(async (request) => {
  const pctx = await requirePlatformContext(request)
  return jsonResponse({ data: await syncMarketplacePhotos(pctx) })
})

export const dynamic = "force-dynamic"
