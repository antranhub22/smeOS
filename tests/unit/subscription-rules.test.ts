import { describe, expect, it } from "vitest"

import { addCycle, expiringPlanCredit, findInvoiceCode, formatInvoiceCode, reminderDue, renewalOpensAt } from "@/modules/subscription/domain/subscription-rules"

/** Checklist ALG 10.7, PO Q9/Q10 — chu kỳ, mã hoá đơn đối soát, nhắc gia hạn, credit tặng hết hạn cuối tháng. */
describe("vòng đời thuê bao", () => {
  it("cộng kỳ tháng/năm, lùi về cuối tháng ngắn", () => {
    expect(addCycle(new Date("2026-01-31T00:00:00Z"), "MONTHLY").toISOString()).toBe("2026-02-28T00:00:00.000Z")
    expect(addCycle(new Date("2026-11-05T03:00:00Z"), "MONTHLY").toISOString()).toBe("2026-12-05T03:00:00.000Z")
    expect(addCycle(new Date("2028-02-29T00:00:00Z"), "YEARLY").toISOString()).toBe("2029-02-28T00:00:00.000Z")
  })

  it("mã hoá đơn đọc lại được từ nội dung chuyển khoản có khoảng trắng, chữ thường", () => {
    const code = formatInvoiceCode([0, 1, 2, 3, 4, 5, 6, 31])
    expect(code).toBe("TBABCDEFG9")
    expect(() => formatInvoiceCode([0, 1, 2, 3, 4, 5, 6, 32])).toThrow(RangeError)
    expect(findInvoiceCode(`ck thanh toan ${code.slice(0, 5).toLowerCase()} ${code.slice(5)} cam on`)).toBe(code)
    expect(findInvoiceCode("chuyen tien an trua")).toBeNull()
  })

  it("mở hoá đơn gia hạn 7 ngày trước; nhắc 7 ngày và 1 ngày", () => {
    const end = new Date("2026-12-05T00:00:00Z")
    expect(renewalOpensAt(end).toISOString()).toBe("2026-11-28T00:00:00.000Z")
    expect(reminderDue(end, 1, new Date("2026-12-03T23:00:00Z"))).toBe(false)
    expect(reminderDue(end, 1, new Date("2026-12-04T00:00:00Z"))).toBe(true)
  })

  it("credit tặng còn thừa = tặng − đã dùng, không vượt số dư", () => {
    expect(expiringPlanCredit(300, 120, 500)).toBe(180)
    expect(expiringPlanCredit(300, 400, 500)).toBe(0)
    expect(expiringPlanCredit(300, 0, 50)).toBe(50)
  })
})
