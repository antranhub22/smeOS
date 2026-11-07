import { z } from "zod"
import { validationFailed } from "@/core/http/errors"
import { handle, jsonResponse } from "@/core/http/response"
import { requireCapability } from "@/core/rbac/capabilities"
import { requireTenantContext } from "@/modules/organization/use-cases/resolve-session"
import { ingestOrder } from "@/modules/orders/use-cases/ingest-order"
import { syncOrderInfoRequests } from "@/modules/orders/use-cases/order-info-requests"
import { listOrders } from "@/modules/orders/use-cases/list-orders"
import { parseDeliveryDate } from "@/modules/orders/domain/order-list-filter"
import type { OrderStatus, ProductionStatus, DeliveryStatus } from "@/modules/orders/domain/order-types"

const createOrderSchema = z.object({
  branchId: z.string().optional(),
  customerId: z.string().optional(),
  items: z.array(
    z.object({
      productId: z.string().optional(),
      variantId: z.string().optional(),
      description: z.string().optional(),
      quantity: z.number().int().positive().max(999).default(1),
      unitPriceVnd: z.number().int().nonnegative(),
      metadata: z.record(z.string(), z.unknown()).optional(),
    })
  ).min(1, "Đơn hàng phải có ít nhất 1 sản phẩm"),
  pricingRuleRef: z.record(z.string(), z.unknown()).optional(),
  voucherId: z.string().optional(),
  cardMessage: z.string().optional(),
  internalNote: z.string().optional(),
  deliveryWindow: z
    .object({
      date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Ngày giao dạng YYYY-MM-DD"),
      timeSlot: z.string().optional(),
    })
    .optional(),
  deliveryAddress: z
    .object({
      recipientName: z.string(),
      phone: z.string(),
      street: z.string(),
      ward: z.string().optional(),
      district: z.string().optional(),
      province: z.string().optional(),
      notes: z.string().optional(),
    })
    .optional(),
})

/** `GET /api/v1/orders` (R1) — Danh sách đơn hàng */
export const GET = handle(async (request) => {
  const { ctx } = await requireTenantContext(request)
  requireCapability(ctx, "R1")

  const url = new URL(request.url)
  const status = url.searchParams.get("status") as OrderStatus | null
  const productionStatus = url.searchParams.get("production_status") as ProductionStatus | null
  const deliveryStatus = url.searchParams.get("delivery_status") as DeliveryStatus | null
  const branchId = url.searchParams.get("branch_id") ?? undefined
  const customerId = url.searchParams.get("customer_id") ?? undefined
  const search = url.searchParams.get("search") ?? undefined
  // Lọc nâng cao (checklist ALG 4.3): khoảng ngày giao YYYY-MM-DD, nhân viên bán
  const deliveryFrom = parseDeliveryDate(url.searchParams.get("delivery_from"))
  const deliveryTo = parseDeliveryDate(url.searchParams.get("delivery_to"))
  const saleId = url.searchParams.get("sale_id")?.trim().slice(0, 64) || undefined
  const limitParam = url.searchParams.get("limit")
  // Trần 100 (audit API-03): trước đây `?limit=` không chặn — số lớn tải hết đơn kèm quan hệ, chữ → NaN → 500
  const limit = limitParam ? Number(limitParam) : 50
  if (!Number.isInteger(limit) || limit < 1 || limit > 100) {
    throw validationFailed({ limit: "Phải là số nguyên từ 1 đến 100" })
  }

  const result = await listOrders(ctx, {
    status: status || undefined,
    productionStatus: productionStatus || undefined,
    deliveryStatus: deliveryStatus || undefined,
    branchId,
    customerId,
    search,
    deliveryFrom,
    deliveryTo,
    saleId,
    limit,
  })

  return jsonResponse(result)
})

/** `POST /api/v1/orders` (R2) — Tạo đơn hàng mới */
export const POST = handle(async (request) => {
  const { ctx } = await requireTenantContext(request)
  requireCapability(ctx, "R2")

  const body = await request.json()
  const parsed = createOrderSchema.parse(body)

  const order = await ingestOrder(ctx, { ...parsed, source: "MANUAL" })
  // Đơn thiếu địa chỉ/SĐT người nhận → tự sinh yêu cầu bổ sung (checklist ALG 4.14)
  await syncOrderInfoRequests(ctx, order.id)
  return jsonResponse({ order }, { status: 201 })
})
