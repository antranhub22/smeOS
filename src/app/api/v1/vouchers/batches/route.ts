import { z } from "zod"

import { validationFailed } from "@/core/http/errors"
import { handle, jsonResponse } from "@/core/http/response"
import { requireCapability } from "@/core/rbac/capabilities"
import { requireTenantContext } from "@/modules/organization/use-cases/resolve-session"
import { issueVoucherBatch, listVoucherBatches } from "@/modules/promotions/use-cases/voucher-batches"

/**
 * `GET · POST /vouchers/batches` (`Q8`) — Phát hành mã giảm giá: danh sách đợt và tạo đợt mới.
 * Kèm danh sách ưu đãi đang bật + trần % để màn hình chọn — cùng nguồn với ma trận ưu đãi.
 */
export const GET = handle(async (request) => {
  const { ctx } = await requireTenantContext(request)
  requireCapability(ctx, "Q8")
  return jsonResponse(await listVoucherBatches(ctx))
})

const optionalDate = z.string().datetime({ offset: true }).nullable().optional()
const optionalInt = z.number().int().nullable().optional()

const createSchema = z.object({
  name: z.string().max(200),
  mode: z.enum(["SHARED", "UNIQUE"]),
  shared_code: z.string().max(64).nullable().optional(),
  code_prefix: z.string().max(32).nullable().optional(),
  quantity: z.number().int().optional(),
  promotion_id: z.string().max(100).nullable().optional(),
  discount_type: z.enum(["PERCENTAGE", "FIXED_AMOUNT"]),
  discount_value: z.number(),
  min_order_vnd: z.number().int().optional(),
  max_discount_vnd: optionalInt,
  starts_at: optionalDate,
  expires_at: optionalDate,
  usage_limit: optionalInt,
  per_customer_limit: optionalInt,
})

export const POST = handle(async (request) => {
  const { ctx } = await requireTenantContext(request)
  requireCapability(ctx, "Q8")

  const parsed = createSchema.safeParse(await request.json().catch(() => null))
  if (!parsed.success) throw validationFailed({ issues: parsed.error.issues })
  const d = parsed.data
  const batch = await issueVoucherBatch(ctx, {
    name: d.name,
    mode: d.mode,
    sharedCode: d.shared_code ?? null,
    codePrefix: d.code_prefix ?? null,
    quantity: d.mode === "SHARED" ? 1 : d.quantity ?? 0,
    promotionId: d.promotion_id ?? null,
    discountType: d.discount_type,
    discountValue: d.discount_value,
    minOrderVnd: d.min_order_vnd ?? 0,
    maxDiscountVnd: d.max_discount_vnd ?? null,
    startsAt: d.starts_at ? new Date(d.starts_at) : null,
    expiresAt: d.expires_at ? new Date(d.expires_at) : null,
    usageLimit: d.usage_limit ?? null,
    perCustomerLimit: d.per_customer_limit ?? null,
  })
  return jsonResponse(batch, { status: 201 })
})
