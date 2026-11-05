/**
 * Cấu hình quy đổi credit cấp nền tảng (PO Q10, checklist ALG 10.3, 10.4) — khoá `platform_settings.credit_pricing`,
 * Console sửa. SMS/ZNS mặc định 0 credit/tin: tin nhắn đang gửi bằng tài khoản nhà mạng của chính cửa hàng,
 * nền tảng chỉ thu khi Console đặt tỷ lệ.
 */

export interface CreditPricing {
  /** Credit trừ cho mỗi tin SMS cửa hàng gửi khách */
  smsCredit: number
  /** Credit trừ cho mỗi tin Zalo ZNS */
  znsCredit: number
  /** Tỷ giá USD → VND để quy đổi chi phí nhà cung cấp (10.4) */
  usdToVnd: number
  /** Giá trị 1 credit theo VND để tính biên lợi nhuận (10.4) */
  creditValueVnd: number
  /** Hạn mức credit/tháng mặc định cho tổ chức chưa đặt riêng; null = không giới hạn */
  defaultMonthlyLimit: number | null
}

export const DEFAULT_CREDIT_PRICING: CreditPricing = {
  smsCredit: 0, znsCredit: 0, usdToVnd: 25_000, creditValueVnd: 1_000, defaultMonthlyLimit: null,
}

const num = (v: unknown, min: number, max: number): number | undefined =>
  typeof v === "number" && Number.isFinite(v) && v >= min && v <= max ? v : undefined

/** Đọc giá trị đã lưu; trường thiếu/sai lấy mặc định. */
export function parseCreditPricing(raw: unknown): CreditPricing {
  const r = raw && typeof raw === "object" && !Array.isArray(raw) ? (raw as Record<string, unknown>) : {}
  const limit = r.defaultMonthlyLimit
  return {
    smsCredit: Math.round(num(r.smsCredit, 0, 1000) ?? DEFAULT_CREDIT_PRICING.smsCredit),
    znsCredit: Math.round(num(r.znsCredit, 0, 1000) ?? DEFAULT_CREDIT_PRICING.znsCredit),
    usdToVnd: num(r.usdToVnd, 1000, 100_000) ?? DEFAULT_CREDIT_PRICING.usdToVnd,
    creditValueVnd: num(r.creditValueVnd, 1, 1_000_000) ?? DEFAULT_CREDIT_PRICING.creditValueVnd,
    defaultMonthlyLimit: limit === null ? null : (num(limit, 0, 10_000_000) !== undefined ? Math.round(limit as number) : null),
  }
}

/** Lỗi khi lưu (giá trị ngoài khoảng cho phép); `null` = hợp lệ. */
export function creditPricingProblem(input: Record<string, unknown>): string | null {
  if (input.smsCredit !== undefined && (num(input.smsCredit, 0, 1000) === undefined || !Number.isInteger(input.smsCredit))) return "Credit mỗi tin SMS là số nguyên 0–1.000"
  if (input.znsCredit !== undefined && (num(input.znsCredit, 0, 1000) === undefined || !Number.isInteger(input.znsCredit))) return "Credit mỗi tin ZNS là số nguyên 0–1.000"
  if (input.usdToVnd !== undefined && num(input.usdToVnd, 1000, 100_000) === undefined) return "Tỷ giá USD→VND trong khoảng 1.000–100.000"
  if (input.creditValueVnd !== undefined && num(input.creditValueVnd, 1, 1_000_000) === undefined) return "Giá trị 1 credit trong khoảng 1–1.000.000đ"
  const l = input.defaultMonthlyLimit
  if (l !== undefined && l !== null && (num(l, 0, 10_000_000) === undefined || !Number.isInteger(l))) return "Hạn mức mặc định là số nguyên 0–10.000.000 hoặc bỏ trống"
  return null
}
