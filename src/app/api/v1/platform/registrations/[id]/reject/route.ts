/**
 * POST /api/v1/platform/registrations/[id]/reject — từ chối đơn đăng ký (N1).
 */
import { z } from "zod"
import { validationFailed } from "@/core/http/errors"
import { handle, jsonResponse } from "@/core/http/response"
import { requirePlatformContext } from "@/modules/platform/use-cases/resolve-platform-session"
import { rejectRegistration } from "@/modules/platform/use-cases/manage-registration"

const schema = z.object({
  review_note: z.string().min(1, "Cần ghi lý do từ chối").max(500),
})

export const POST = handle(async (request, { params }: { params: Promise<{ id: string }> }) => {
  const pctx = await requirePlatformContext(request)
  const { id } = await params
  const parsed = schema.safeParse(await request.json().catch(() => null))
  if (!parsed.success) throw validationFailed({ issues: parsed.error.issues })

  await rejectRegistration(pctx, {
    registrationId: id,
    reviewNote: parsed.data.review_note,
  })

  return jsonResponse({ success: true })
})
