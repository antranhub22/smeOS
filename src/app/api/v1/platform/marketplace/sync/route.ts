import { handle, jsonResponse } from "@/core/http/response"
import { requirePlatformContext } from "@/modules/platform/use-cases/resolve-platform-session"
import { syncMarketplaceFromSheet } from "@/modules/platform/infra/sync-marketplace-from-sheet"

/**
 * POST /api/v1/platform/marketplace/sync
 * Đồng bộ danh sách cửa hàng đối tác từ Google Sheets về JSON local.
 * Yêu cầu: Platform context + capability N1.
 */
export const POST = handle(async (request) => {
  const pctx = await requirePlatformContext(request)
  void pctx // context validated — N1 enforced by requirePlatformContext

  const result = await syncMarketplaceFromSheet()

  if (result.error) {
    return jsonResponse({ success: false, error: result.error }, { status: 500 })
  }

  return jsonResponse({
    success: true,
    data: {
      added: result.added,
      updated: result.updated,
      total: result.total,
      durationMs: result.durationMs,
    },
  })
})

export const dynamic = "force-dynamic" as const

