/**
 * GET /api/v1/platform/orgs-data
 *
 * Platform Admin: Lấy tóm tắt dữ liệu của tất cả tổ chức đăng ký.
 * Yêu cầu PlatformContext với capability N1.
 */

import { handle, jsonResponse } from "@/core/http/response"
import { requirePlatformContext } from "@/modules/platform/use-cases/resolve-platform-session"
import { getPlatformOrgsData } from "@/modules/platform/use-cases/get-platform-orgs-data"

export const GET = handle(async (request) => {
  const pctx = await requirePlatformContext(request)
  const result = await getPlatformOrgsData(pctx)
  return jsonResponse({ data: result })
})

export const dynamic = "force-dynamic" as const
export const revalidate = 0 as const
