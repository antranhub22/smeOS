import { z } from "zod"
import { validationFailed } from "@/core/http/errors"
import { handle, jsonResponse } from "@/core/http/response"
import { enforceRateLimit } from "@/core/http/rate-limit"
import { assertBrochureOwner } from "@/modules/greeting-card/use-cases/brochure-owner"
import { issuesToDetails } from "@/modules/greeting-card/contracts/public-order-schema"
import { checkPublicBrochureProductAvailability } from "@/modules/greeting-card/use-cases/check-product-availability"

const checkAvailabilitySchema = z.object({
  productId: z.string().min(1).max(64),
  industryKey: z.string().max(64).optional().nullable(),
  checkInDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Định dạng ngày YYYY-MM-DD").optional(),
  checkOutDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Định dạng ngày YYYY-MM-DD").optional(),
  deliveryDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Định dạng ngày YYYY-MM-DD").optional(),
  deliveryTimeSlot: z.string().max(64).optional(),
  variantId: z.string().max(64).optional(),
  quantity: z.number().int().min(1).max(999).optional(),
})

/**
 * POST /api/v1/public/brochure/[sendCode]/check-availability
 * Kiểm tra khả dụng phòng / sản phẩm real-time trên link chào gửi khách.
 */
export const POST = handle<[{ params: Promise<{ sendCode: string }> }]>(async (request, context) => {
  await enforceRateLimit(request, { scope: "brochure-availability", limit: 120, windowMs: 60_000 })
  const { sendCode } = await context.params
  await assertBrochureOwner(request, sendCode)

  const parsed = checkAvailabilitySchema.safeParse(await request.json().catch(() => null))
  if (!parsed.success) throw validationFailed(issuesToDetails(parsed.error.issues))

  const result = await checkPublicBrochureProductAvailability(sendCode, parsed.data)
  return jsonResponse(result)
})

export const dynamic = "force-dynamic"
