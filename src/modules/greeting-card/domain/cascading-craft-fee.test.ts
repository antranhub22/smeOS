import { describe, it, expect } from "vitest"
import {
  resolveCascadingCraftFee,
  type ResolveCascadingCraftFeeInput,
} from "./cascading-craft-fee"

describe("Cascading Craft Fee Resolver (4-Tier)", () => {
  const baseInput: ResolveCascadingCraftFeeInput = {
    storeOrgId: "store-q1-01",
    chainOrgId: "chain-flora-vn",
    industryKey: "FLOWER",
  }

  it("kế thừa cấu hình phí gia công từ Industry Spec khi chưa cấu hình", () => {
    const res = resolveCascadingCraftFee(baseInput)
    expect(res.feeLabel).toBe("Phí cắm hoa")
    expect(res.effectivePolicy.percent).toBe(50)
    expect(res.decidedBy).toBe("SYSTEM_FALLBACK")
    expect(res.isLocked).toBe(false)
  })

  it("Mother áp đặt trần khấu trừ lỗi tối đa 20% qua Hard-Lock bảo vệ thợ", () => {
    const res = resolveCascadingCraftFee({
      ...baseInput,
      hardLocks: [
        {
          key: "CRAFT_FEE",
          tier: "MOTHER",
          scopeId: "GLOBAL",
          locked: true,
          reason: "Trần phạt lỗi bảo vệ thợ toàn sàn",
          enforcedConfig: {
            complaintDeductionPercent: 20,
          },
        },
      ],
      storeCraftFeeRaw: {
        complaintDeductionPercent: 60, // Tiệm muốn phạt nặng 60% nhưng bị chặn
      },
    })

    expect(res.isLocked).toBe(true)
    expect(res.decidedBy).toBe("HARD_LOCK_MOTHER")
    expect(res.effectivePolicy.complaintDeductionPercent).toBe(20)
    expect(res.lockReason).toBe("Trần phạt lỗi bảo vệ thợ toàn sàn")
  })

  it("Chuỗi ban hành phương án khoán theo mẫu FIXED_PER_PRODUCT", () => {
    const res = resolveCascadingCraftFee({
      ...baseInput,
      chainCraftFeeRaw: {
        method: "FIXED_PER_PRODUCT",
      },
    })

    expect(res.decidedBy).toBe("CHAIN")
    expect(res.effectivePolicy.method).toBe("FIXED_PER_PRODUCT")
    expect(res.isLocked).toBe(false)
  })
})
