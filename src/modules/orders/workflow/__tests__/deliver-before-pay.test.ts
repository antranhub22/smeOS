import { describe, expect, it } from "vitest"

import {
  decideDeliverBeforePay,
  defaultCollectDueAt,
  parseDeliverBeforePaySettings,
  validateDeliverBeforePaySettings,
  withinShopPolicy,
  type DeliverBeforePayContext,
} from "../deliver-before-pay"

const strict = { brochure_policy: { require_full_before_dispatch: true } }
const ctx = (over: Partial<DeliverBeforePayContext> = {}): DeliverBeforePayContext => ({
  totalVnd: 800_000, paidVnd: 0, isUrgent: false, customerCompletedOrders: 3, customerHasOverdueDebt: false, ...over,
})

describe("giao trước, thu sau — tầng 1: dùng lại chính sách thu tiền sẵn có", () => {
  it("tiệm không bắt thu trước chế tác / trước giao → trong chính sách, không cần duyệt", () => {
    expect(withinShopPolicy({}, { totalVnd: 5_000_000, paidVnd: 0 })).toBe(true)
    expect(decideDeliverBeforePay({}, ctx({ totalVnd: 5_000_000, customerCompletedOrders: 0 }))).toMatchObject({ outcome: "AUTO_APPROVE", basis: "POLICY" })
  })

  it("COD bật, trong mức tối đa: chưa cọc chỉ được khi COD không đòi cọc trước", () => {
    const cod = (requiresDeposit: boolean) => ({ ...strict, brochure_payment: { enable_cod: true, cod_requires_deposit: requiresDeposit, cod_max_vnd: 2_000_000 } })
    expect(withinShopPolicy(cod(false), { totalVnd: 1_500_000, paidVnd: 0 })).toBe(true)
    expect(withinShopPolicy(cod(true), { totalVnd: 1_500_000, paidVnd: 0 })).toBe(false)
    expect(withinShopPolicy(cod(true), { totalVnd: 1_500_000, paidVnd: 300_000 })).toBe(true)
    expect(withinShopPolicy(cod(false), { totalVnd: 2_500_000, paidVnd: 0 })).toBe(false)
  })
})

describe("tầng 2–3: ngoài chính sách", () => {
  it("đơn hoả tốc → Sale tự quyết", () => {
    expect(decideDeliverBeforePay(strict, ctx({ isUrgent: true, totalVnd: 9_000_000 }))).toMatchObject({ outcome: "AUTO_APPROVE", basis: "URGENT" })
  })

  it("trong hạn mức mặc định (≤ 1.000.000đ, ≥ 2 đơn hoàn tất, không nợ quá hạn) → Sale tự quyết", () => {
    expect(decideDeliverBeforePay(strict, ctx())).toMatchObject({ outcome: "AUTO_APPROVE", basis: "SELF_LIMIT" })
  })

  it("vượt hạn mức / khách mới / còn nợ quá hạn / tiệm tắt tự quyết → chờ Điều hành", () => {
    expect(decideDeliverBeforePay(strict, ctx({ totalVnd: 1_200_000 })).outcome).toBe("NEEDS_ADMIN")
    expect(decideDeliverBeforePay(strict, ctx({ customerCompletedOrders: 1 })).outcome).toBe("NEEDS_ADMIN")
    expect(decideDeliverBeforePay(strict, ctx({ customerHasOverdueDebt: true })).outcome).toBe("NEEDS_ADMIN")
    expect(decideDeliverBeforePay({ ...strict, order_deliver_before_pay: { allowSelfDecide: false } }, ctx()).outcome).toBe("NEEDS_ADMIN")
  })

  it("chưa báo giá → báo giá trước; đã thu đủ → không cần", () => {
    expect(decideDeliverBeforePay(strict, ctx({ totalVnd: 0 })).outcome).toBe("QUOTE_FIRST")
    expect(decideDeliverBeforePay(strict, ctx({ paidVnd: 800_000 })).outcome).toBe("ALREADY_PAID")
  })
})

describe("cài đặt hạn mức", () => {
  it("đọc mặc định, bỏ giá trị sai; hạn thu theo số ngày", () => {
    expect(parseDeliverBeforePaySettings(null)).toEqual({ allowSelfDecide: true, selfDecideMaxVnd: 1_000_000, minCompletedOrders: 2, collectDueDays: 3 })
    expect(parseDeliverBeforePaySettings({ order_deliver_before_pay: { selfDecideMaxVnd: -1, collectDueDays: 7 } })).toMatchObject({ selfDecideMaxVnd: 1_000_000, collectDueDays: 7 })
    expect(defaultCollectDueAt({}, new Date("2026-10-31T00:00:00Z")).toISOString()).toBe("2026-11-03T00:00:00.000Z")
    expect(Object.keys(validateDeliverBeforePaySettings({ collectDueDays: 0, allowSelfDecide: "x" })).sort()).toEqual(["allowSelfDecide", "collectDueDays"])
  })
})
