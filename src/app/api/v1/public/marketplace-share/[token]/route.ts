/**
 * GET /api/v1/public/marketplace-share/:token — danh sách chợ đối tác qua link chia sẻ.
 * Công khai, không phiên: gác bằng token (băm SHA-256, còn hạn, chưa huỷ) + giới hạn tần
 * suất theo IP. Dữ liệu luôn đã che một phần; lọc làm ở trình duyệt.
 */
import { enforceRateLimit } from "@/core/http/rate-limit"
import { handle, jsonResponse } from "@/core/http/response"
import { viewSharedMarketplace } from "@/modules/platform/use-cases/share-partner-marketplace"

export const GET = handle<[{ params: Promise<{ token: string }> }]>(async (request, context) => {
  await enforceRateLimit(request, { scope: "marketplace-share", limit: 60, windowMs: 10 * 60_000 })
  const { token } = await context.params
  const result = await viewSharedMarketplace(token)
  return jsonResponse(
    { data: { stores: result.stores, total: result.total, expiresAt: result.expiresAt.toISOString() } },
    { headers: { "Cache-Control": "no-store", "X-Robots-Tag": "noindex, nofollow" } }
  )
})

export const dynamic = "force-dynamic"
