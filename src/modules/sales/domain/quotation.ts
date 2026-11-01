/**
 * Báo giá bán hàng (Quotation Domain) — Pure TypeScript.
 *
 * Quản lý báo giá cho khách hoặc đối tác: tính tiền, ưu đãi, hạn hiệu lực,
 * chuyển trạng thái và quy đổi thành đơn hàng.
 * Tuân thủ SSR/SRP, không import Prisma/ORM.
 */

export const QUOTATION_STATUSES = [
  "DRAFT",
  "SENT",
  "ACCEPTED",
  "REJECTED",
  "EXPIRED",
  "CONVERTED",
] as const

export type QuotationStatus = (typeof QUOTATION_STATUSES)[number]

export const QUOTATION_STATUS_LABELS: Record<QuotationStatus, string> = {
  DRAFT: "Bản nháp",
  SENT: "Đã gửi khách",
  ACCEPTED: "Khách đồng ý",
  REJECTED: "Khách từ chối",
  EXPIRED: "Hết hiệu lực",
  CONVERTED: "Đã tạo đơn",
}

export interface QuotationItem {
  id?: string | undefined
  productId?: string | null | undefined
  name: string
  qty: number
  unitPrice: number
  totalPrice: number
  note?: string | null | undefined
}

export interface Quotation {
  id: string
  organizationId: string
  code: string
  leadId?: string | null | undefined
  customerId?: string | null | undefined
  assetUsageId?: string | null | undefined
  status: QuotationStatus
  validUntil?: Date | null | undefined
  subtotal: number
  discountAmount: number
  totalAmount: number
  terms?: string | null | undefined
  notes?: string | null | undefined
  convertedOrderId?: string | null | undefined
  createdBy: string
  createdAt: Date
  updatedAt: Date
  items: QuotationItem[]
  lead?: { id: string; name: string; phone: string } | null | undefined
  customer?: { id: string; name: string; phone: string } | null | undefined
}

/** Ma trận chuyển trạng thái hợp lệ của báo giá */
export const QUOTATION_TRANSITIONS: Record<QuotationStatus, readonly QuotationStatus[]> = {
  DRAFT: ["SENT", "ACCEPTED", "REJECTED", "EXPIRED"],
  SENT: ["ACCEPTED", "REJECTED", "EXPIRED", "CONVERTED"],
  ACCEPTED: ["CONVERTED", "EXPIRED"],
  REJECTED: ["DRAFT"],
  EXPIRED: ["DRAFT"],
  CONVERTED: [],
}

export function canTransitionQuotationStatus(
  current: QuotationStatus,
  next: QuotationStatus,
): boolean {
  if (current === next) return true
  const allowed = QUOTATION_TRANSITIONS[current]
  return allowed ? allowed.includes(next) : false
}

/** Kiểm tra báo giá đã quá hạn hiệu lực */
export function isQuotationExpired(
  quotation: { validUntil?: Date | null | undefined; status: QuotationStatus },
  now: Date = new Date(),
): boolean {
  if (quotation.status === "CONVERTED" || quotation.status === "REJECTED") {
    return false
  }
  if (!quotation.validUntil) return false
  return new Date(quotation.validUntil).getTime() < now.getTime()
}

/** Tính tổng tiền chi tiết một dòng */
export function calculateItemTotal(qty: number, unitPrice: number): number {
  const safeQty = Math.max(0, Math.floor(qty || 0))
  const safePrice = Math.max(0, Math.round(unitPrice || 0))
  return safeQty * safePrice
}

/** Tính tổng tiền đơn báo giá: subtotal, discount, total */
export function calculateQuotationTotals(
  items: Array<{ qty: number; unitPrice: number }>,
  discountAmount = 0,
): {
  subtotal: number
  discountAmount: number
  totalAmount: number
} {
  const subtotal = items.reduce(
    (sum, item) => sum + calculateItemTotal(item.qty, item.unitPrice),
    0,
  )
  const validDiscount = Math.max(0, Math.min(Math.round(discountAmount || 0), subtotal))
  const totalAmount = Math.max(0, subtotal - validDiscount)

  return {
    subtotal,
    discountAmount: validDiscount,
    totalAmount,
  }
}

/** Validate danh sách dòng sản phẩm báo giá */
export function validateQuotationItems(
  items: Array<{ name: string; qty: number; unitPrice: number }>,
): string | null {
  if (!Array.isArray(items) || items.length === 0) {
    return "Báo giá phải có ít nhất một dòng sản phẩm."
  }
  for (let i = 0; i < items.length; i++) {
    const it = items[i]
    if (!it || !it.name || it.name.trim() === "") {
      return `Dòng sản phẩm số ${i + 1} chưa có tên sản phẩm.`
    }
    if (typeof it.qty !== "number" || it.qty <= 0) {
      return `Số lượng dòng "${it.name}" phải lớn hơn 0.`
    }
    if (typeof it.unitPrice !== "number" || it.unitPrice < 0) {
      return `Đơn giá dòng "${it.name}" không thể là số âm.`
    }
  }
  return null
}

