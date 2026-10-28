import { describe, expect, it } from "vitest"
import { decisionsFromSettings, effectiveDecision, parseDecisions, validateDecisions, type UpperLayer } from "./governance-decisions"

const upper: UpperLayer[] = [
  { tier: "MOTHER", decisions: { overrides: {}, locks: { deposit_min: { enabled: true } } } },
  { tier: "CHAIN", decisions: { overrides: {}, locks: { deposit_min: { enabled: false }, voucher: { enabled: false } } } },
]

describe("governance-decisions", () => {
  it("khoá tầng trên cùng thắng khoá tầng dưới và ghi đè của tầng đang xem", () => {
    const own = { overrides: { deposit_min: false }, locks: {} }
    expect(effectiveDecision("deposit_min", false, own, "STORE", upper)).toEqual({ enabled: true, source: "UPPER_LOCK", lockedBy: "MOTHER" })
    expect(effectiveDecision("voucher", true, own, "STORE", upper)).toEqual({ enabled: false, source: "UPPER_LOCK", lockedBy: "CHAIN" })
  })

  it("không có khoá thì ghi đè của mình, rồi mới tới mặc định", () => {
    const own = { overrides: { a: false }, locks: { b: { enabled: true } } }
    expect(effectiveDecision("a", true, own, "CHAIN", []).source).toBe("OWN_OVERRIDE")
    expect(effectiveDecision("b", false, own, "CHAIN", [])).toEqual({ enabled: true, source: "OWN_LOCK", lockedBy: "CHAIN" })
    expect(effectiveDecision("c", true, own, "CHAIN", [])).toEqual({ enabled: true, source: "DEFAULT", lockedBy: null })
  })

  it("từ chối ghi đè mục tầng trên đã khoá và khoá ở cấp cửa hàng", () => {
    const v = validateDecisions({ overrides: { voucher: true, free: true }, locks: { x: { enabled: true } } }, "STORE", upper)
    expect(v).toEqual([
      { key: "voucher", reason: "LOCKED_BY_UPPER" },
      { key: "x", reason: "STORE_CANNOT_LOCK" },
    ])
    expect(validateDecisions({ overrides: { free: true }, locks: { x: { enabled: true } } }, "CHAIN", [upper[0]!])).toEqual([])
  })

  it("đọc dữ liệu lưu an toàn, bỏ khoá sai định dạng", () => {
    expect(parseDecisions({ overrides: { ok: true, "bad key": true, n: 1 }, locks: { l: { enabled: false }, m: {} } })).toEqual({
      overrides: { ok: true },
      locks: { l: { enabled: false } },
    })
    expect(decisionsFromSettings({ governance_matrix: { PAYMENTS: { overrides: { a: true } } } }, "PAYMENTS").overrides).toEqual({ a: true })
    expect(decisionsFromSettings(null, "PAYMENTS")).toEqual({ overrides: {}, locks: {} })
  })
})
