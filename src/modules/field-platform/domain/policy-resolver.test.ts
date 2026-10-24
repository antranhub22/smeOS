import { describe, expect, it } from "vitest"
import { type PolicyDefinition } from "./policy-definition"
import {
  type PolicyValueEntry,
  resolvePolicyValue,
} from "./policy-resolver"

describe("Policy Resolver Engine — Mandatory CI Test Cases (§6.3 T1-T7)", () => {
  const asOf = new Date("2026-10-24T12:00:00Z")

  it("T1 (Fixes F-01): Restrictive max discount chooses 20% instead of 25%", () => {
    // Chain: 30%, Store: 20%, Product Sample: 25% -> Expected: 20%
    const policy: PolicyDefinition = {
      policyKey: "sales.max_discount",
      nameVi: "Giảm giá tối đa",
      nameEn: "Max discount",
      mergeMode: "RESTRICTIVE",
      restrictDirection: "MIN_VALUE",
      allowedScopes: ["STORE", "COLLECTION"],
      riskClass: "R2_OPERATIONAL",
    }

    const hierarchy: PolicyValueEntry<number>[] = [
      { scopeLevel: "CHAIN", value: 30 },
      { scopeLevel: "STORE", value: 20 },
      { scopeLevel: "PRODUCT", value: 25 },
    ]

    const result = resolvePolicyValue(policy, hierarchy, { asOfDate: asOf })
    expect(result.effectiveValue).toBe(20)
    expect(result.resolvedScope).toBe("STORE")
  })

  it("T2: Override with upper constraint rejects values exceeding limit", () => {
    const policy: PolicyDefinition = {
      policyKey: "sales.min_lead_time_hours",
      nameVi: "Thời gian đặt trước tối thiểu",
      nameEn: "Minimum lead time",
      mergeMode: "OVERRIDE",
      allowedScopes: ["STORE", "COLLECTION", "PRODUCT"],
      riskClass: "R3_PRESENTATIONAL",
    }

    // Chain upper limit is 96h; Product sets 72h -> OK
    const validHierarchy: PolicyValueEntry<number>[] = [
      { scopeLevel: "CHAIN", value: 4, bounds: { max: 96 } },
      { scopeLevel: "STORE", value: 4 },
      { scopeLevel: "COLLECTION", value: 48 },
      { scopeLevel: "PRODUCT", value: 72 },
    ]

    const result = resolvePolicyValue(policy, validHierarchy, { asOfDate: asOf })
    expect(result.effectiveValue).toBe(72)

    // Product sets 120h -> Should throw
    const invalidHierarchy: PolicyValueEntry<number>[] = [
      { scopeLevel: "CHAIN", value: 4, bounds: { max: 96 } },
      { scopeLevel: "PRODUCT", value: 120 },
    ]
    expect(() =>
      resolvePolicyValue(policy, invalidHierarchy, { asOfDate: asOf })
    ).toThrow("vượt quá mức tối đa")
  })

  it("T3: Bounded delivery fee automatically clamps into allowed range", () => {
    // Chain allows 20,000 to 40,000; Store sets 15,000 -> Should clamp to 20,000
    const policy: PolicyDefinition = {
      policyKey: "delivery.shipping_fee",
      nameVi: "Phí giao hàng",
      nameEn: "Shipping fee",
      mergeMode: "BOUNDED",
      allowedScopes: ["STORE", "COLLECTION"],
      riskClass: "R2_OPERATIONAL",
    }

    const hierarchy: PolicyValueEntry<number>[] = [
      { scopeLevel: "CHAIN", value: 30000, bounds: { min: 20000, max: 40000 } },
      { scopeLevel: "STORE", value: 15000 },
    ]

    const result = resolvePolicyValue(policy, hierarchy, { asOfDate: asOf })
    expect(result.effectiveValue).toBe(20000)
    expect(result.clamped).toBe(true)
  })

  it("T4: Additive mode combines values", () => {
    const policy: PolicyDefinition = {
      policyKey: "payment.methods",
      nameVi: "Phương thức thanh toán",
      nameEn: "Payment methods",
      mergeMode: "ADDITIVE",
      allowedScopes: ["STORE"],
      riskClass: "R1_FINANCIAL_LEGAL",
    }

    const hierarchy: PolicyValueEntry<string[]>[] = [
      { scopeLevel: "CHAIN", value: ["BANK_TRANSFER"] },
      { scopeLevel: "STORE", value: ["MOMO", "BANK_TRANSFER"] },
    ]

    const result = resolvePolicyValue(policy, hierarchy, { asOfDate: asOf })
    expect(result.effectiveValue).toEqual(
      expect.arrayContaining(["BANK_TRANSFER", "MOMO"])
    )
  })

  it("T5: Locked policy at Brand/Chain prevents Store from overriding", () => {
    const policy: PolicyDefinition = {
      policyKey: "refund.policy",
      nameVi: "Chính sách hoàn tiền",
      nameEn: "Refund policy",
      mergeMode: "OVERRIDE",
      allowedScopes: ["STORE"],
      riskClass: "R1_FINANCIAL_LEGAL",
    }

    const hierarchy: PolicyValueEntry<string>[] = [
      { scopeLevel: "CHAIN", value: "NO_REFUND", locked: true },
      { scopeLevel: "STORE", value: "FULL_REFUND" },
    ]

    const result = resolvePolicyValue(policy, hierarchy, { asOfDate: asOf })
    expect(result.effectiveValue).toBe("NO_REFUND")
    expect(result.resolvedScope).toBe("CHAIN")
    expect(result.warning).toContain("Bị khóa")
  })

  it("T7: Respects effectiveFrom and effectiveTo dates", () => {
    const policy: PolicyDefinition = {
      policyKey: "pricing.holiday_surcharge",
      nameVi: "Phụ thu ngày lễ",
      nameEn: "Holiday surcharge",
      mergeMode: "OVERRIDE",
      allowedScopes: ["STORE"],
      riskClass: "R2_OPERATIONAL",
    }

    const pastDate = new Date("2026-10-01T00:00:00Z")
    const futureDate = new Date("2026-11-01T00:00:00Z")

    const hierarchy: PolicyValueEntry<number>[] = [
      {
        scopeLevel: "STORE",
        value: 50000,
        effectiveFrom: pastDate,
        effectiveTo: new Date("2026-10-20T23:59:59Z"), // Expired
      },
      {
        scopeLevel: "STORE",
        value: 20000,
        effectiveFrom: new Date("2026-10-21T00:00:00Z"), // Active
        effectiveTo: futureDate,
      },
    ]

    const result = resolvePolicyValue(policy, hierarchy, { asOfDate: asOf })
    expect(result.effectiveValue).toBe(20000)
  })
})
