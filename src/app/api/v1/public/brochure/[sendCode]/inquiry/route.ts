import { z } from "zod"
import { validationFailed } from "@/core/http/errors"
import { handle, jsonResponse } from "@/core/http/response"
import { enforceRateLimit } from "@/core/http/rate-limit"
import { issuesToDetails, rejectBotSubmission } from "@/modules/greeting-card/contracts/public-order-schema"
import { INQUIRY_MESSAGE_MAX, INQUIRY_NAME_MAX } from "@/modules/crm/domain/product-inquiry"
import { submitBrochureInquiry } from "@/modules/greeting-card/use-cases/submit-product-inquiry"
import { assertBrochureOwner } from "@/modules/greeting-card/use-cases/brochure-owner"

const bodySchema = z.object({
  productId: z.string().min(1).max(64),
  customerName: z.string().max(INQUIRY_NAME_MAX * 2),
  customerPhone: z.string().max(20),
  message: z.string().max(INQUIRY_MESSAGE_MAX * 2),
  variantName: z.string().max(120).optional(),
  /** Ô bẫy máy tự điền */
  website: z.string().max(200).optional(),
})

/** POST /api/v1/public/brochure/[sendCode]/inquiry — khách ở link chào riêng gửi yêu cầu tư vấn một mẫu. */
export const POST = handle<[{ params: Promise<{ sendCode: string }> }]>(async (request, context) => {
  await enforceRateLimit(request, { scope: "brochure-inquiry", limit: 10, windowMs: 10 * 60_000 })
  const { sendCode } = await context.params
  await assertBrochureOwner(request, sendCode)
  const parsed = bodySchema.safeParse(await request.json().catch(() => null))
  if (!parsed.success) throw validationFailed(issuesToDetails(parsed.error.issues))
  rejectBotSubmission(parsed.data)
  const { website: _bot, ...input } = parsed.data
  const result = await submitBrochureInquiry(sendCode, input)
  return jsonResponse(result, { status: 201 })
})

export const dynamic = "force-dynamic"
