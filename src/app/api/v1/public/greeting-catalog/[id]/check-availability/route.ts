import { z } from "zod"
import { validationFailed } from "@/core/http/errors"
import { handle, jsonResponse } from "@/core/http/response"
import { enforceRateLimit } from "@/core/http/rate-limit"
import { issuesToDetails } from "@/modules/greeting-card/contracts/public-order-schema"
import { checkPublicCatalogProductAvailability } from "@/modules/greeting-card/use-cases/check-product-availability"

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
 * POST /api/v1/public/greeting-catalog/[id]/check-availability
 * Kiểm tra khả dụng sản phẩm real-time cho form đặt hàng đa ngành.
 */
export const POST = handle<[{ params: Promise<{ id: string }> }]>(async (request, context) => {
  await enforceRateLimit(request, { scope: "greeting-catalog-availability", limit: 120, windowMs: 60_000 })
  const { id } = await context.params

  const parsed = checkAvailabilitySchema.safeParse(await request.json().catch(() => null))
  if (!parsed.success) throw validationFailed(issuesToDetails(parsed.error.issues))

  const result = await checkPublicCatalogProductAvailability(id, parsed.data)
  return jsonResponse(result)
})

export const dynamic = "force-dynamic"
