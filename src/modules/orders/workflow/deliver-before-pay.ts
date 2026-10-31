/**
 * "Giao trước, thu sau" cho đơn NGOÀI Thẻ chào (PO 31/10/2026 — KIEN_TRUC_SSOT_DON_HANG_DA_NGUON.md §5).
 * Pure TypeScript.
 *
 * Ba tầng:
 *  1. Chính sách sẵn có của tiệm — DÙNG LẠI cài đặt Thẻ chào (chỉ đọc): ma trận "thu đủ trước khi giao" /
 *     "thu trước khi chế tác" (`brochure_policy`) và mục COD (`brochure_payment`: bật, cọc trước, mức tối đa).
 *     Đơn nằm trong chính sách → không cần ai duyệt.
 *  2. Ngoài chính sách: Sale tự quyết khi đơn hoả tốc hoặc trong hạn mức tự quyết.
 *  3. Còn lại: Sale xin, Điều hành duyệt (R16).
 */

import { parsePaymentPolicy } from "@/modules/greeting-card/domain/brochure-payment-policy"
import { parseStorePaymentMethods } from "@/modules/greeting-card/domain/store-payment-methods"

export const DELIVER_BEFORE_PAY = "DELIVER_BEFORE_PAY"
export const DELIVER_BEFORE_PAY_SETTINGS_KEY = "order_deliver_before_pay"

export interface DeliverBeforePaySettings {
  /** Sale được tự quyết trong hạn mức. */
  allowSelfDecide: boolean
  /** Tổng đơn tối đa Sale tự quyết (VND). */
  selfDecideMaxVnd: number
  /** Khách phải có ít nhất bấy nhiêu đơn hoàn tất. */
  minCompletedOrders: number
  /** Hạn thu tiền mặc định sau khi duyệt (ngày). */
  collectDueDays: number
}

export const DEFAULT_DELIVER_BEFORE_PAY_SETTINGS: DeliverBeforePaySettings = Object.freeze({
  allowSelfDecide: true,
  selfDecideMaxVnd: 1_000_000,
  minCompletedOrders: 2,
  collectDueDays: 3,
})

const MAX_VND = 1_000_000_000

function int(value: unknown, min: number, max: number): number | null {
  return typeof value === "number" && Number.isFinite(value) && value >= min && value <= max ? Math.round(value) : null
}

export function parseDeliverBeforePaySettings(orgSettings: unknown): DeliverBeforePaySettings {
  const root = orgSettings && typeof orgSettings === "object" ? (orgSettings as Record<string, unknown>) : {}
  const raw = root[DELIVER_BEFORE_PAY_SETTINGS_KEY]
  const r = raw && typeof raw === "object" ? (raw as Record<string, unknown>) : {}
  const d = DEFAULT_DELIVER_BEFORE_PAY_SETTINGS
  return {
    allowSelfDecide: typeof r.allowSelfDecide === "boolean" ? r.allowSelfDecide : d.allowSelfDecide,
    selfDecideMaxVnd: int(r.selfDecideMaxVnd, 0, MAX_VND) ?? d.selfDecideMaxVnd,
    minCompletedOrders: int(r.minCompletedOrders, 0, 1000) ?? d.minCompletedOrders,
    collectDueDays: int(r.collectDueDays, 1, 90) ?? d.collectDueDays,
  }
}

/** Kiểm đầu vào khi Điều hành lưu cài đặt; trả lỗi theo khoá. */
export function validateDeliverBeforePaySettings(input: unknown): Record<string, string> {
  const r = input && typeof input === "object" ? (input as Record<string, unknown>) : {}
  const errors: Record<string, string> = {}
  if (r.allowSelfDecide !== undefined && typeof r.allowSelfDecide !== "boolean") errors.allowSelfDecide = "Chọn bật hoặc tắt"
  if (r.selfDecideMaxVnd !== undefined && int(r.selfDecideMaxVnd, 0, MAX_VND) === null) errors.selfDecideMaxVnd = "Số tiền không hợp lệ"
  if (r.minCompletedOrders !== undefined && int(r.minCompletedOrders, 0, 1000) === null) errors.minCompletedOrders = "Số đơn không hợp lệ"
  if (r.collectDueDays !== undefined && int(r.collectDueDays, 1, 90) === null) errors.collectDueDays = "Hạn thu từ 1 đến 90 ngày"
  return errors
}

export interface DeliverBeforePayContext {
  totalVnd: number
  paidVnd: number
  isUrgent: boolean
  customerCompletedOrders: number
  customerHasOverdueDebt: boolean
}

export type DeliverBeforePayBasis = "POLICY" | "URGENT" | "SELF_LIMIT"

export type DeliverBeforePayDecision =
  | { outcome: "ALREADY_PAID" }
  | { outcome: "QUOTE_FIRST" }
  | { outcome: "AUTO_APPROVE"; basis: DeliverBeforePayBasis; label: string }
  | { outcome: "NEEDS_ADMIN"; why: string }

/** Đơn nằm trong chính sách thu tiền sẵn có của tiệm (không cần ai duyệt)? */
export function withinShopPolicy(orgSettings: unknown, money: { totalVnd: number; paidVnd: number }): boolean {
  const policy = parsePaymentPolicy(orgSettings)
  const cod = parseStorePaymentMethods(orgSettings)
  const unpaidAllowed = !policy.requirePaidBeforeProduction && !policy.requireFullBeforeDispatch
  const codAllowed =
    cod.enableCod &&
    (cod.codMaxVnd === null || money.totalVnd <= cod.codMaxVnd) &&
    (!cod.codRequiresDeposit || money.paidVnd > 0)
  return unpaidAllowed || codAllowed
}

export function decideDeliverBeforePay(
  orgSettings: unknown,
  ctx: DeliverBeforePayContext,
): DeliverBeforePayDecision {
  if (ctx.totalVnd <= 0) return { outcome: "QUOTE_FIRST" }
  if (ctx.paidVnd >= ctx.totalVnd) return { outcome: "ALREADY_PAID" }
  if (withinShopPolicy(orgSettings, ctx)) {
    return { outcome: "AUTO_APPROVE", basis: "POLICY", label: "Trong chính sách thu tiền của tiệm (COD / thu sau)" }
  }
  if (ctx.isUrgent) return { outcome: "AUTO_APPROVE", basis: "URGENT", label: "Đơn hoả tốc — Sale tự quyết" }
  const s = parseDeliverBeforePaySettings(orgSettings)
  if (!s.allowSelfDecide) return { outcome: "NEEDS_ADMIN", why: "Tiệm chưa cho Sale tự quyết" }
  if (ctx.totalVnd > s.selfDecideMaxVnd) return { outcome: "NEEDS_ADMIN", why: "Tổng đơn vượt hạn mức Sale tự quyết" }
  if (ctx.customerCompletedOrders < s.minCompletedOrders) return { outcome: "NEEDS_ADMIN", why: "Khách chưa đủ số đơn hoàn tất" }
  if (ctx.customerHasOverdueDebt) return { outcome: "NEEDS_ADMIN", why: "Khách còn nợ quá hạn" }
  return { outcome: "AUTO_APPROVE", basis: "SELF_LIMIT", label: "Trong hạn mức Sale tự quyết" }
}

export function defaultCollectDueAt(orgSettings: unknown, from: Date): Date {
  const days = parseDeliverBeforePaySettings(orgSettings).collectDueDays
  return new Date(from.getTime() + days * 24 * 60 * 60 * 1000)
}
