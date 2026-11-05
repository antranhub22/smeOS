import type { Prisma } from "@/generated/prisma/client"
import type { PublicQuotationView, Quotation, QuotationStatus } from "../domain/quotation"

/** Quan hệ nạp kèm mỗi lần đọc báo giá trong phạm vi tổ chức. */
export const QUOTATION_INCLUDE = {
  items: true,
  lead: { select: { id: true, name: true, phone: true } },
  customer: { select: { id: true, name: true, phone: true } },
} as const satisfies Prisma.quotationsInclude

export type QuotationRowWithRelations = Prisma.quotationsGetPayload<{
  include: typeof QUOTATION_INCLUDE
}>

/** Quan hệ nạp kèm cho link công khai — chỉ tên người nhận, không số điện thoại. */
export const PUBLIC_QUOTATION_INCLUDE = {
  items: true,
  lead: { select: { name: true } },
  customer: { select: { name: true } },
} as const satisfies Prisma.quotationsInclude

type PublicQuotationRow = Prisma.quotationsGetPayload<{
  include: typeof PUBLIC_QUOTATION_INCLUDE
}>

export function toDomain(row: QuotationRowWithRelations): Quotation {
  return {
    id: row.id,
    organizationId: row.organization_id,
    code: row.code,
    publicToken: row.public_token,
    leadId: row.lead_id,
    customerId: row.customer_id,
    assetUsageId: row.asset_usage_id,
    status: row.status as QuotationStatus,
    validUntil: row.valid_until,
    subtotal: Number(row.subtotal),
    discountAmount: Number(row.discount_amount),
    shippingFee: Number(row.shipping_fee),
    totalAmount: Number(row.total_amount),
    terms: row.terms,
    notes: row.notes,
    convertedOrderId: row.converted_order_id,
    createdBy: row.created_by,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    items: (row.items || []).map((it) => ({
      id: it.id,
      productId: it.product_id,
      name: it.name,
      variantLabel: it.variant_label,
      qty: it.qty,
      unitPrice: Number(it.unit_price),
      totalPrice: Number(it.total_price),
      note: it.note,
    })),
    lead: row.lead ? { id: row.lead.id, name: row.lead.name, phone: row.lead.phone } : null,
    customer: row.customer
      ? { id: row.customer.id, name: row.customer.name, phone: row.customer.phone }
      : null,
  }
}

export function toPublicView(row: PublicQuotationRow): PublicQuotationView {
  return {
    code: row.code,
    status: row.status as QuotationStatus,
    validUntil: row.valid_until,
    subtotal: Number(row.subtotal),
    discountAmount: Number(row.discount_amount),
    shippingFee: Number(row.shipping_fee),
    totalAmount: Number(row.total_amount),
    terms: row.terms,
    createdAt: row.created_at,
    recipientName: row.customer?.name ?? row.lead?.name ?? null,
    items: row.items.map((it) => ({
      id: it.id,
      name: it.name,
      variantLabel: it.variant_label,
      qty: it.qty,
      unitPrice: Number(it.unit_price),
      totalPrice: Number(it.total_price),
      note: it.note,
    })),
  }
}
