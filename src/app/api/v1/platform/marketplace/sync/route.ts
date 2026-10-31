/** POST /api/v1/platform/marketplace/sync — đồng bộ từ Google Sheet khảo sát (`N16`, ghi nhật ký nền tảng). */
import { handle, jsonResponse } from "@/core/http/response"
import { syncMarketplaceFromSheet } from "@/modules/platform/use-cases/manage-partner-marketplace"
import { requirePlatformContext } from "@/modules/platform/use-cases/resolve-platform-session"

export const POST = handle(async (request) => {
  const pctx = await requirePlatformContext(request)
  return jsonResponse({ data: await syncMarketplaceFromSheet(pctx) })
})

export const dynamic = "force-dynamic"
