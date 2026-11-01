/** GET · POST /api/v1/platform/marketplace/share-links — liệt kê / tạo link chia sẻ chợ đối tác (`N17`). */
import { z } from "zod"

import { validationFailed } from "@/core/http/errors"
import { handle, jsonResponse } from "@/core/http/response"
import { createShareLink, listShareLinks } from "@/modules/platform/use-cases/share-partner-marketplace"
import { requirePlatformContext } from "@/modules/platform/use-cases/resolve-platform-session"

const body = z.object({
  label: z.string().max(200),
  days: z.number().int(),
})

export const GET = handle(async (request) => {
  const pctx = await requirePlatformContext(request)
  return jsonResponse({ data: { links: await listShareLinks(pctx) } })
})

export const POST = handle(async (request) => {
  const pctx = await requirePlatformContext(request)
  const parsed = body.safeParse(await request.json().catch(() => null))
  if (!parsed.success) throw validationFailed({ issues: parsed.error.issues })
  return jsonResponse({ data: await createShareLink(pctx, parsed.data) }, { status: 201 })
})

export const dynamic = "force-dynamic"
