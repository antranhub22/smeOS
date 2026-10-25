import { z } from "zod"
import { validationFailed } from "@/core/http/errors"
import { requireCapability } from "@/core/rbac/capabilities"
import { handle, jsonResponse } from "@/core/http/response"
import { requireTenantContext } from "@/modules/organization/use-cases/resolve-session"
import { requestLanguageUnlock } from "@/modules/greeting-card/use-cases/request-language-unlock"

const postSchema = z.object({
  note: z.string().trim().max(500).nullish(),
})

/**
 * `POST /api/v1/organizations/current/language-unlock-request` (F2 capability)
 * Điều hành gửi yêu cầu mở khóa gói Tiếng Anh cho Thẻ Chào lên Admin SaaS.
 */
export const POST = handle(async (request) => {
  const { ctx } = await requireTenantContext(request)
  requireCapability(ctx, "F2")

  const parsed = postSchema.safeParse(await request.json().catch(() => null))
  if (!parsed.success) throw validationFailed({ issues: parsed.error.issues })

  const result = await requestLanguageUnlock(ctx, {
    note: parsed.data.note ?? null,
  })

  return jsonResponse(result, { status: 201 })
})
