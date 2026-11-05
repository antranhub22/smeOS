/** GET /api/v1/platform/margin?period=YYYY-MM (`N4`) — biên lợi nhuận nền tảng theo tháng và tổ chức, checklist ALG 10.4. */
import { handle, jsonResponse } from "@/core/http/response"
import { requirePlatformContext } from "@/modules/platform/use-cases/resolve-platform-session"
import { getPlatformMargin } from "@/modules/platform/use-cases/platform-margin"

export const GET = handle(async (request) => {
  const pctx = await requirePlatformContext(request)
  const period = new URL(request.url).searchParams.get("period") ?? undefined
  return jsonResponse({ data: await getPlatformMargin(pctx, period) })
})

export const dynamic = "force-dynamic" as const
export const revalidate = 0 as const
