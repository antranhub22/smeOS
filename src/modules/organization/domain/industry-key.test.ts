import { describe, expect, it } from "vitest"

import { industryKeyOf, withIndustryKey } from "./industry-key"

describe("ngành của tổ chức theo cột industry_key (ADR-012 T-6b)", () => {
  it("cột trước, settings.industry sau", () => {
    expect(industryKeyOf({ industry_key: "FNB", settings: { industry: "FLORAL" } })).toBe("FNB")
    expect(industryKeyOf({ industry_key: null, settings: { industry: "HOMESTAY" } })).toBe("HOMESTAY")
    expect(industryKeyOf({ settings: null })).toBeNull()
    expect(industryKeyOf(null)).toBeNull()
  })

  it("withIndustryKey đặt settings.industry theo cột, giữ khoá khác; cột trống thì giữ nguyên", () => {
    const org = { id: "o", industry_key: "FNB", settings: { industry: "floral", other: 1 } }
    expect(withIndustryKey(org).settings).toEqual({ industry: "FNB", other: 1 })
    expect(withIndustryKey({ industry_key: "FNB", settings: null }).settings).toEqual({ industry: "FNB" })
    const unchanged = { industry_key: null, settings: { industry: "KHONG_CO" } }
    expect(withIndustryKey(unchanged)).toBe(unchanged)
  })
})
