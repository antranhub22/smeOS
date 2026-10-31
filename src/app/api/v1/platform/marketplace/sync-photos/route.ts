import { handle, jsonResponse } from "@/core/http/response"
import { requirePlatformContext } from "@/modules/platform/use-cases/resolve-platform-session"
import { syncAllMarketplacePhotos } from "@/modules/platform/infra/sync-marketplace-photos"

/**
 * POST /api/v1/platform/marketplace/sync-photos
 * Tải toàn bộ ảnh thực tế từ Google Drive về lưu trữ tại public/partner-stores/
 */
export const POST = handle(async (request) => {
  const pctx = await requirePlatformContext(request)
  void pctx

  const result = await syncAllMarketplacePhotos()

  return jsonResponse({
    success: true,
    data: result,
  })
})

export const dynamic = "force-dynamic" as const

