import { describe, it, expect } from "vitest"
import {
  resolveCascadingPaymentPolicy,
  type ResolveCascadingPaymentPolicyInput,
} from "./cascading-payment-policy"

describe("Cascading Payment Policy Resolver (4-Tier)", () => {
  const baseInput: ResolveCascadingPaymentPolicyInput = {
    storeOrgId: "store-dalat-01",
    chainOrgId: "chain-homestay-vn",
    industryKey: "HOMESTAY",
  }

  it("ngành Homestay mặc định tỷ lệ cọc 50% theo thói quen ngành", () => {
    const res = resolveCascadingPaymentPolicy(baseInput)
    expect(res.effectivePolicy.depositPercent).toBe(50)
    expect(res.effectivePolicy.requirePaidBeforeProduction).toBe(true)
    expect(res.decidedBy).toBe("SYSTEM_FALLBACK")
    expect(res.isLocked).toBe(false)
  })

  it("Chuỗi (Chain) ép buộc trần cọc 70% qua Hard-Lock", () => {
    const res = resolveCascadingPaymentPolicy({
      ...baseInput,
      hardLocks: [
        {
          key: "PAYMENT_POLICY",
          tier: "CHAIN",
          scopeId: "chain-homestay-vn",
          locked: true,
          reason: "Quy chế chuỗi mùa cao điểm du lịch",
          enforcedConfig: {
            depositPercent: 70,
            requireFullBeforeDispatch: true,
          },
        },
      ],
      storePolicyRaw: {
        depositPercent: 20, // Tiệm muốn giảm cọc nhưng bị khóa
      },
    })

    expect(res.isLocked).toBe(true)
    expect(res.decidedBy).toBe("HARD_LOCK_CHAIN")
    expect(res.effectivePolicy.depositPercent).toBe(70)
    expect(res.lockReason).toBe("Quy chế chuỗi mùa cao điểm du lịch")
  })

  it("Tiệm tùy biến số phút giữ đơn (paymentTimeoutMinutes) khi không bị khóa", () => {
    const res = resolveCascadingPaymentPolicy({
      ...baseInput,
      storePolicyRaw: {
        paymentTimeoutMinutes: 45,
      },
    })

    expect(res.decidedBy).toBe("STORE")
    expect(res.effectivePolicy.paymentTimeoutMinutes).toBe(45)
    expect(res.effectivePolicy.depositPercent).toBe(50) // Kế thừa homestay
  })
})
