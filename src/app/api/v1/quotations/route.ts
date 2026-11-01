import { z } from "zod"
import { validationFailed } from "@/core/http/errors"
import { handle, jsonResponse } from "@/core/http/response"
import { hasCapability, requireCapability } from "@/core/rbac/capabilities"
import { requireTenantContext } from "@/modules/organization/use-cases/resolve-session"
import type { QuotationStatus } from "@/modules/sales/domain/quotation"
import { createQuotationUseCase } from "@/modules/sales/use-cases/create-quotation.use-case"
import { listQuotationsUseCase } from "@/modules/sales/use-cases/list-quotations.use-case"

const quotationItemSchema = z.object({
  product_id: z.string().nullable().optional(),
  productId: z.string().nullable().optional(),
  name: z.string().min(1, "Tên sản phẩm không được để trống").max(200),
  qty: z.number().int().min(1, "Số lượng phải từ 1 trở lên"),
  unit_price: z.number().min(0, "Đơn giá không thể âm").optional(),
  unitPrice: z.number().min(0, "Đơn giá không thể âm").optional(),
  note: z.string().nullable().optional(),
})

const createQuotationSchema = z.object({
  lead_id: z.string().nullable().optional(),
  leadId: z.string().nullable().optional(),
  customer_id: z.string().nullable().optional(),
  customerId: z.string().nullable().optional(),
  asset_usage_id: z.string().nullable().optional(),
  assetUsageId: z.string().nullable().optional(),
  valid_until: z.string().nullable().optional(),
  validUntil: z.string().nullable().optional(),
  discount_amount: z.number().min(0).optional(),
  discountAmount: z.number().min(0).optional(),
  terms: z.string().nullable().optional(),
  notes: z.string().nullable().optional(),
  items: z.array(quotationItemSchema).min(1, "Báo giá phải có ít nhất một sản phẩm"),
})

export const GET = handle(async (request) => {
  const { ctx } = await requireTenantContext(request)
  if (!hasCapability(ctx, "R15") && !hasCapability(ctx, "Q1")) {
    requireCapability(ctx, "R15")
  }

  const url = new URL(request.url)
  const status = (url.searchParams.get("status") as QuotationStatus) ?? undefined
  const leadId = url.searchParams.get("leadId") ?? url.searchParams.get("lead_id") ?? undefined
  const customerId =
    url.searchParams.get("customerId") ?? url.searchParams.get("customer_id") ?? undefined
  const search = url.searchParams.get("search") ?? undefined
  const cursor = url.searchParams.get("cursor") ?? undefined

  const limit = url.searchParams.has("limit") ? Number(url.searchParams.get("limit")) : 20
  if (!Number.isInteger(limit) || limit < 1 || limit > 100) {
    throw validationFailed({ limit: "limit phải là số nguyên từ 1 đến 100" })
  }

  const result = await listQuotationsUseCase(ctx, {
    status,
    leadId,
    customerId,
    search,
    limit,
    cursor,
  })

  return jsonResponse({
    data: result.items,
    total: result.total,
    counts: result.counts,
    next_cursor: result.nextCursor,
  })
})

export const POST = handle(async (request) => {
  const { ctx } = await requireTenantContext(request)
  requireCapability(ctx, "R15")

  const raw = await request.json().catch(() => null)
  if (!raw || typeof raw !== "object") {
    throw validationFailed({ body: "Dữ liệu yêu cầu không hợp lệ" })
  }

  const parsed = createQuotationSchema.safeParse(raw)
  if (!parsed.success) {
    const details: Record<string, string> = {}
    for (const issue of parsed.error.issues) {
      const field = issue.path.join(".")
      details[field] = issue.message
    }
    throw validationFailed(details)
  }

  const data = parsed.data
  const quotation = await createQuotationUseCase(ctx, {
    leadId: data.leadId ?? data.lead_id ?? null,
    customerId: data.customerId ?? data.customer_id ?? null,
    assetUsageId: data.assetUsageId ?? data.asset_usage_id ?? null,
    validUntil: data.validUntil ?? data.valid_until ?? null,
    discountAmount: data.discountAmount ?? data.discount_amount ?? 0,
    terms: data.terms ?? null,
    notes: data.notes ?? null,
    items: data.items.map((it) => ({
      productId: it.productId ?? it.product_id ?? null,
      name: it.name,
      qty: it.qty,
      unitPrice: it.unitPrice ?? it.unit_price ?? 0,
      note: it.note ?? null,
    })),
  })

  return jsonResponse({ data: quotation }, { status: 201 })
})

