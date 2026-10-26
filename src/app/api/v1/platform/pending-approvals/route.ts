/**
 * GET /api/v1/platform/pending-approvals
 * Trả về tất cả yêu cầu chờ Admin SaaS phê duyệt (mở khóa ngôn ngữ, chuyển đổi mô hình...).
 * Chỉ dành cho platform operator — yêu cầu capability N1.
 */
import { handle, jsonResponse } from "@/core/http/response"
import { requirePlatformContext } from "@/modules/platform/use-cases/resolve-platform-session"
import { getPendingApprovals } from "@/modules/platform/use-cases/list-pending-approvals"

export const GET = handle(async (request) => {
  const pctx = await requirePlatformContext(request)
  const items = await getPendingApprovals(pctx)
  return jsonResponse({ data: items, total: items.length })
})

export const dynamic = "force-dynamic" as const
export const revalidate = 0 as const
