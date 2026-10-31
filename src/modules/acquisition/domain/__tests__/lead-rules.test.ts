import { describe, expect, it } from "vitest"
import { isLeadStatus, sanitizeUtmValue, validateLeadInput } from "../lead-rules"

const ok = { name: "Lan", phone: "0901 234 567", message: "Hỏi giá", consent: true }

describe("validateLeadInput", () => {
  it("chấp nhận dữ liệu hợp lệ (SĐT có khoảng trắng)", () => {
    expect(validateLeadInput(ok)).toEqual({})
  })
  it("bắt buộc đồng ý liên hệ", () => {
    expect(validateLeadInput({ ...ok, consent: false }).consent).toBeDefined()
  })
  it("từ chối SĐT không phải di động Việt Nam", () => {
    expect(validateLeadInput({ ...ok, phone: "12345678" }).phone).toBeDefined()
    expect(validateLeadInput({ ...ok, phone: "+84901234567" }).phone).toBeUndefined()
  })
  it("bắt buộc tên, giới hạn độ dài tên và lời nhắn", () => {
    expect(validateLeadInput({ ...ok, name: "  " }).name).toBeDefined()
    expect(validateLeadInput({ ...ok, name: "a".repeat(101) }).name).toBeDefined()
    expect(validateLeadInput({ ...ok, message: "a".repeat(501) }).message).toBeDefined()
  })
})

describe("sanitizeUtmValue", () => {
  it("chuẩn hoá chữ thường, thay ký tự lạ bằng gạch, rỗng → null", () => {
    expect(sanitizeUtmValue(" Tờ Rơi 20/10 ")).toBe("t-r-i-20-10")
    expect(sanitizeUtmValue("<script>")).toBe("script")
    expect(sanitizeUtmValue("   ")).toBeNull()
    expect(sanitizeUtmValue(undefined)).toBeNull()
    expect(sanitizeUtmValue("a".repeat(100))).toHaveLength(60)
  })
})

it("isLeadStatus chỉ nhận 4 trạng thái", () => {
  expect(isLeadStatus("NEW")).toBe(true)
  expect(isLeadStatus("DELETED")).toBe(false)
})
