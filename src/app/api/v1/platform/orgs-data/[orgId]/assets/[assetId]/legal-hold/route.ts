import { z } from "zod"
import { validationFailed } from "@/core/http/errors"
import { handle, jsonResponse } from "@/core/http/response"
import { requirePlatformContext } from "@/modules/platform/use-cases/resolve-platform-session"
import { setAssetLegalHold } from "@/modules/platform/use-cases/set-asset-legal-hold"

const bodySchema = z.object({
  /** ISO 8601; `null` để gỡ giữ. */
  until: z.string().datetime().nullable(),
  reason: z.string().trim().min(3).max(500),
})

/** PUT — đặt/gỡ legal hold cho một asset (N14, SDAGF D-04). */
export const PUT = handle(async (request, context: { params: Promise<{ orgId: string; assetId: string }> }) => {
  const pctx = await requirePlatformContext(request)
  const { orgId, assetId } = await context.params
  const parsed = bodySchema.safeParse(await request.json().catch(() => null))
  if (!parsed.success) throw validationFailed({ issues: parsed.error.issues })

  const data = await setAssetLegalHold(pctx, {
    organizationId: orgId,
    assetId,
    until: parsed.data.until ? new Date(parsed.data.until) : null,
    reason: parsed.data.reason,
  })
  return jsonResponse({ data })
})
