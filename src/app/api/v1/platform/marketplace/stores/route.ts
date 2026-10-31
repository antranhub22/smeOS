/** GET /api/v1/platform/marketplace/stores — danh sách chợ đối tác (`N1`), ảnh qua URL ký có hạn. */
import { z } from "zod"

import { validationFailed } from "@/core/http/errors"
import { handle, jsonResponse } from "@/core/http/response"
import { listMarketplaceStores } from "@/modules/platform/use-cases/manage-partner-marketplace"
import { requirePlatformContext } from "@/modules/platform/use-cases/resolve-platform-session"

const query = z.object({
  search: z.string().max(200).optional(),
  field: z.string().max(80).optional(),
  tier: z.string().max(80).optional(),
  district: z.string().max(80).optional(),
})

export const GET = handle(async (request) => {
  const pctx = await requirePlatformContext(request)
  const parsed = query.safeParse(Object.fromEntries(new URL(request.url).searchParams))
  if (!parsed.success) throw validationFailed({ issues: parsed.error.issues })
  return jsonResponse({ data: await listMarketplaceStores(pctx, parsed.data) })
})

export const dynamic = "force-dynamic"
