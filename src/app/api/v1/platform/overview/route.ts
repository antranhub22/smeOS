/** GET /api/v1/platform/overview (`N1`; phần sức khoẻ cần `N5`) — tổng quan Console, checklist ALG 9.8. */
import { handle, jsonResponse } from "@/core/http/response"
import { requirePlatformContext } from "@/modules/platform/use-cases/resolve-platform-session"
import { getPlatformOverview } from "@/modules/platform/use-cases/platform-overview"

export const GET = handle(async (request) => {
  const pctx = await requirePlatformContext(request)
  return jsonResponse({ data: await getPlatformOverview(pctx) })
})

export const dynamic = "force-dynamic" as const
export const revalidate = 0 as const
