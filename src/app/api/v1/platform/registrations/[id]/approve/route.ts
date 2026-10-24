/**
 * POST /api/v1/platform/registrations/[id]/approve — duyệt đơn đăng ký (N1).
 */
import { z } from "zod"
import { validationFailed } from "@/core/http/errors"
import { handle, jsonResponse } from "@/core/http/response"
import { requirePlatformContext } from "@/modules/platform/use-cases/resolve-platform-session"
import { approveRegistration } from "@/modules/platform/use-cases/manage-registration"

const schema = z.object({
  review_note: z.string().max(500).nullish(),
})

export const POST = handle(async (request, { params }: { params: Promise<{ id: string }> }) => {
  const pctx = await requirePlatformContext(request)
  const { id } = await params
  const parsed = schema.safeParse(await request.json().catch(() => ({})))
  if (!parsed.success) throw validationFailed({ issues: parsed.error.issues })

  await approveRegistration(pctx, {
    registrationId: id,
    reviewNote: parsed.data.review_note ?? null,
  })

  return jsonResponse({ success: true })
})
