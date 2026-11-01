import { z } from "zod"
import { validationFailed } from "@/core/http/errors"
import { handle, jsonResponse } from "@/core/http/response"
import { hasCapability, requireCapability } from "@/core/rbac/capabilities"
import { requireTenantContext } from "@/modules/organization/use-cases/resolve-session"
import type { QuotationStatus } from "@/modules/sales/domain/quotation"
import { getQuotationUseCase } from "@/modules/sales/use-cases/get-quotation.use-case"
import { updateQuotationUseCase } from "@/modules/sales/use-cases/update-quotation.use-case"

const quotationItemSchema = z.object({
  product_id: z.string().nullable().optional(),
  productId: z.string().nullable().optional(),
  name: z.string().min(1, "Tên sản phẩm không được để trống").max(200),
  qty: z.number().int().min(1, "Số lượng phải từ 1 trở lên"),
  unit_price: z.number().min(0, "Đơn giá không thể âm").optional(),
  unitPrice: z.number().min(0, "Đơn giá không thể âm").optional(),
  note: z.string().nullable().optional(),
})

const updateQuotationSchema = z.object({
  status: z
    .enum(["DRAFT", "SENT", "ACCEPTED", "REJECTED", "EXPIRED", "CONVERTED"])
    .optional(),
  valid_until: z.string().nullable().optional(),
  validUntil: z.string().nullable().optional(),
  discount_amount: z.number().min(0).optional(),
  discountAmount: z.number().min(0).optional(),
  terms: z.string().nullable().optional(),
  notes: z.string().nullable().optional(),
  items: z.array(quotationItemSchema).optional(),
})

export const GET = handle(async (request, context) => {
  const { ctx } = await requireTenantContext(request)
  if (!hasCapability(ctx, "R15") && !hasCapability(ctx, "Q1")) {
    requireCapability(ctx, "R15")
  }

  const { id } = (await (context as { params: Promise<{ id: string }> }).params)
  const quotation = await getQuotationUseCase(ctx, id)

  return jsonResponse({ data: quotation })
})

export const PATCH = handle(async (request, context) => {
  const { ctx } = await requireTenantContext(request)
  requireCapability(ctx, "R15")

  const { id } = (await (context as { params: Promise<{ id: string }> }).params)

  const raw = await request.json().catch(() => null)
  if (!raw || typeof raw !== "object") {
    throw validationFailed({ body: "Dữ liệu yêu cầu không hợp lệ" })
  }

  const parsed = updateQuotationSchema.safeParse(raw)
  if (!parsed.success) {
    const details: Record<string, string> = {}
    for (const issue of parsed.error.issues) {
      const field = issue.path.join(".")
      details[field] = issue.message
    }
    throw validationFailed(details)
  }

  const data = parsed.data
  const updated = await updateQuotationUseCase(ctx, id, {
    status: data.status as QuotationStatus | undefined,
    validUntil: data.validUntil ?? data.valid_until,
    discountAmount: data.discountAmount ?? data.discount_amount,
    terms: data.terms,
    notes: data.notes,
    items: data.items
      ? data.items.map((it) => ({
          productId: it.productId ?? it.product_id ?? null,
          name: it.name,
          qty: it.qty,
          unitPrice: it.unitPrice ?? it.unit_price ?? 0,
          note: it.note ?? null,
        }))
      : undefined,
  })

  return jsonResponse({ data: updated })
})

