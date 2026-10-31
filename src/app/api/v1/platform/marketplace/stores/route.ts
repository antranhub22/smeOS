import { handle, jsonResponse } from "@/core/http/response"
import { requirePlatformContext } from "@/modules/platform/use-cases/resolve-platform-session"
import { listMarketplaceStores } from "@/modules/platform/use-cases/list-marketplace-stores"

export const GET = handle(async (request) => {
  const pctx = await requirePlatformContext(request)
  const url = new URL(request.url)
  const search = url.searchParams.get("search") || undefined
  const field = url.searchParams.get("field") || undefined
  const tier = url.searchParams.get("tier") || undefined
  const district = url.searchParams.get("district") || undefined

  const result = await listMarketplaceStores(pctx, { search, field, tier, district })
  return jsonResponse({ data: result })
})

export const dynamic = "force-dynamic" as const
export const revalidate = 0 as const

