import { describe, expect, it } from "vitest"

import { creditPeriod, lowBalanceThreshold, parseMonthlyLimit, reachesNearLimit } from "@/modules/usage/domain/monthly-limit"
import { creditPricingProblem, DEFAULT_CREDIT_PRICING, parseCreditPricing } from "@/modules/usage/domain/credit-pricing"

/** Checklist ALG 10.3, 9.7, 10.5 — kỳ tháng giờ Việt Nam, ngưỡng 80%/20%, quy đổi credit (PO Q10). */
describe("hạn mức credit tháng", () => {
  it("kỳ tính theo giờ Việt Nam", () => {
    expect(creditPeriod(new Date("2026-10-31T17:30:00Z"))).toBe("2026-11")
    expect(creditPeriod(new Date("2026-10-31T16:59:00Z"))).toBe("2026-10")
  })

  it("hạn mức hợp lệ: null hoặc số nguyên không âm", () => {
    expect(parseMonthlyLimit(null)).toBeNull()
    expect(parseMonthlyLimit(500)).toBe(500)
    expect(parseMonthlyLimit(-1)).toBeUndefined()
    expect(parseMonthlyLimit(1.5)).toBeUndefined()
  })

  it("80% hạn mức thì báo; không giới hạn thì không báo", () => {
    expect(reachesNearLimit(79, 100)).toBe(false)
    expect(reachesNearLimit(80, 100)).toBe(true)
    expect(reachesNearLimit(10_000, null)).toBe(false)
  })

  it("ngưỡng sắp hết: 20% lần nạp gần nhất, không có thì 20% hạn mức", () => {
    expect(lowBalanceThreshold(500, 1000)).toBe(100)
    expect(lowBalanceThreshold(null, 1000)).toBe(200)
    expect(lowBalanceThreshold(null, null)).toBeNull()
  })
})

describe("quy đổi credit", () => {
  it("mặc định SMS/ZNS không thu; giá trị sai lấy mặc định", () => {
    expect(parseCreditPricing(undefined)).toEqual(DEFAULT_CREDIT_PRICING)
    expect(parseCreditPricing({ smsCredit: 2, znsCredit: -1, usdToVnd: 26_000 })).toMatchObject({ smsCredit: 2, znsCredit: 0, usdToVnd: 26_000 })
  })

  it("kiểm khi lưu", () => {
    expect(creditPricingProblem({ smsCredit: 1, defaultMonthlyLimit: null })).toBeNull()
    expect(creditPricingProblem({ smsCredit: 1.5 })).not.toBeNull()
    expect(creditPricingProblem({ usdToVnd: 5 })).not.toBeNull()
  })
})
