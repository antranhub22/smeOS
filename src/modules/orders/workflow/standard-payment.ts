/**
 * Thu tiền đơn ngoài Thẻ chào (P3b — KIEN_TRUC_SSOT_DON_HANG_DA_NGUON.md §4.2 mục 5, §5.1). Pure TypeScript.
 * Lần thu đầu = cọc (hoặc trả đủ) → đơn `CONFIRMED` và sang Điều phối; các lần sau = phần còn lại.
 */

/**
 * Mã đơn cổng chung `DH<yymmdd>-<4 số>` (`generateOrderCode`) trong nội dung chuyển khoản. Mã Thẻ chào có đuôi
 * 8 ký tự chữ-số nên không khớp mẫu này (và đã được bộ khớp Thẻ chào xử lý trước).
 */
const STANDARD_CODE_IN_TEXT = /DH\s*(\d{6})\s*[-_.\s]?\s*(\d{4})(?![0-9A-Z])/

export function extractStandardOrderCode(content: string): string | null {
  const m = STANDARD_CODE_IN_TEXT.exec(content.toUpperCase())
  return m?.[1] && m[2] ? `DH${m[1]}-${m[2]}` : null
}

export type PaymentKind = "DEPOSIT" | "BALANCE"

export interface PaymentPlanResult {
  kind: PaymentKind
  paidAfter: number
  balanceAfter: number
  /** Lần thu đầu tiên → xác nhận đơn và chuyển Điều phối. */
  firstPayment: boolean
}

/** Kiểm số tiền và tính số đã thu/còn lại; trả lý do (tiếng Việt) nếu không ghi được. */
export function planPayment(order: { totalVnd: number; paidVnd: number; status: string }, amountVnd: number): PaymentPlanResult | string {
  if (order.status === "CANCELLED") return "Đơn đã huỷ"
  if (order.totalVnd <= 0) return "Đơn chưa có giá — báo giá trước"
  if (!Number.isInteger(amountVnd) || amountVnd <= 0) return "Số tiền phải là số nguyên dương"
  const balance = order.totalVnd - order.paidVnd
  if (balance <= 0) return "Đơn đã thu đủ"
  if (amountVnd > balance) return "Số tiền vượt phần còn phải thu"
  const paidAfter = order.paidVnd + amountVnd
  return { kind: order.paidVnd > 0 ? "BALANCE" : "DEPOSIT", paidAfter, balanceAfter: order.totalVnd - paidAfter, firstPayment: order.paidVnd <= 0 }
}
