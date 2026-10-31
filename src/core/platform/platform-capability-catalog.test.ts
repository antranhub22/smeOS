import { describe, expect, it } from "vitest"

import {
  ALL_PLATFORM_CAPABILITY_CODES,
  isPlatformCapabilityCode,
  PLATFORM_CAPABILITIES,
  platformCapability,
} from "./platform-capability-catalog"

describe("platform-capability-catalog", () => {
  it("có đúng mười ba mã (N1..N8, N12..N16), không nhiều hơn không ít hơn", () => {
    expect(ALL_PLATFORM_CAPABILITY_CODES).toEqual([
      "N1", "N12", "N13", "N14", "N15", "N16", "N2", "N3", "N4", "N5", "N6", "N7", "N8",
    ])
  })

  it("N16 là mã khoá tích hợp theo tầng nền tảng/ngành (Trung tâm Tích hợp GĐ3)", () => {
    expect(platformCapability("N16").name).toBe("platform.integrations.govern")
  })

  it("N15 là mã xử lý hàng đợi lỗi; N5 vẫn chỉ đọc (ROADMAP E5.2, D-N5)", () => {
    expect(platformCapability("N15").name).toBe("platform.jobs.manage")
    expect(platformCapability("N5").name).toBe("platform.health.read")
  })

  it("N14 là mã giữ dữ liệu theo yêu cầu pháp lý (PO 29/10/2026, SDAGF D-04)", () => {
    expect(platformCapability("N14").name).toBe("platform.legal_hold.manage")
  })

  it("N13 là mã duyệt tài khoản tự đăng ký (PO 22/10/2026)", () => {
    expect(platformCapability("N13").name).toBe("platform.registrations.manage")
  })

  it("N9-N11 không tồn tại trong dải này — giữ chỗ cho tuyến AI-1", () => {
    expect(isPlatformCapabilityCode("N9")).toBe(false)
    expect(isPlatformCapabilityCode("N10")).toBe(false)
    expect(isPlatformCapabilityCode("N11")).toBe(false)
  })

  it("N12 là mã quản trị trường dữ liệu của ĐP-3", () => {
    expect(isPlatformCapabilityCode("N12")).toBe(true)
    expect(platformCapability("N12").name).toBe("platform.field_catalog.manage")
  })

  it("không mã nào trùng với dải mã tenant (A-L, chữ cái khác N)", () => {
    for (const code of ALL_PLATFORM_CAPABILITY_CODES) {
      expect(code.startsWith("N")).toBe(true)
    }
  })

  it("mỗi mã có code khớp key và tên đọc được duy nhất", () => {
    const names = new Set<string>()
    for (const code of ALL_PLATFORM_CAPABILITY_CODES) {
      const def = platformCapability(code)
      expect(def.code).toBe(code)
      names.add(def.name)
    }
    expect(names.size).toBe(ALL_PLATFORM_CAPABILITY_CODES.length)
  })

  it("platformCapability ném lỗi rõ ràng cho mã không tồn tại", () => {
    expect(() => platformCapability("N99")).toThrow(/không tồn tại/)
  })

  it("PLATFORM_CAPABILITIES là nguồn duy nhất — không tách rời với ALL_PLATFORM_CAPABILITY_CODES", () => {
    expect(Object.keys(PLATFORM_CAPABILITIES).sort()).toEqual([...ALL_PLATFORM_CAPABILITY_CODES])
  })
})
