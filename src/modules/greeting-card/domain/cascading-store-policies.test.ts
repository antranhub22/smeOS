import { describe, it, expect } from "vitest"
import {
  resolveCascadingStorePolicies,
  type ResolveCascadingStorePoliciesInput,
} from "./cascading-store-policies"

describe("Cascading Store Policies Resolver (4-Tier)", () => {
  const baseInput: ResolveCascadingStorePoliciesInput = {
    storeOrgId: "store-dn-01",
    chainOrgId: "chain-flora-01",
    industryKey: "FLOWER",
  }

  it("tự động kế thừa Industry Profile khi Store và Chain chưa cấu hình (Zero Config)", () => {
    const res = resolveCascadingStorePolicies(baseInput)

    expect(res.decidedBy.promotions).toBe("SYSTEM_FALLBACK")
    expect(res.decidedBy.commitments).toBe("SYSTEM_FALLBACK")
    expect(res.decidedBy.agreements).toBe("SYSTEM_FALLBACK")

    // Đủ các cam kết mặc định của ngành hoa
    expect(res.effectivePolicies.commitments.length).toBeGreaterThan(0)
    expect(res.effectivePolicies.promotions.length).toBeGreaterThan(0)
    expect(res.lockedItems.promotions).toBe(false)
  })

  it("Store Delta Override ghi đè thành công khi không có Hard-Lock", () => {
    const res = resolveCascadingStorePolicies({
      ...baseInput,
      storePoliciesRaw: {
        promotions: [
          {
            id: "promo-store-special",
            title: "Ưu đãi riêng của Tiệm",
            description: "Giảm 15% cho khách check-in",
          },
        ],
      },
    })

    expect(res.decidedBy.promotions).toBe("STORE")
    expect(res.effectivePolicies.promotions).toHaveLength(1)
    expect(res.effectivePolicies.promotions[0]?.id).toBe("promo-store-special")
    // Commitments vẫn kế thừa
    expect(res.decidedBy.commitments).toBe("SYSTEM_FALLBACK")
  })

  it("Hard-Lock của Chuỗi (Chain) chặn Override của Tiệm và ép buộc áp dụng", () => {
    const res = resolveCascadingStorePolicies({
      ...baseInput,
      hardLocks: [
        {
          key: "COMMITMENTS",
          tier: "CHAIN",
          scopeId: "chain-flora-01",
          locked: true,
          reason: "Chuỗi bắt buộc tiêu chuẩn SOP 5 bước",
          enforcedConfig: {
            commitments: [
              {
                id: "chain-sop-qc",
                title: "Tiêu chuẩn kiểm duyệt QC Chuỗi",
                customerText: "Sản phẩm đạt chuẩn QC của Chuỗi trước khi xuất xưởng",
              },
            ],
          },
        },
      ],
      storePoliciesRaw: {
        commitments: [
          {
            id: "store-loose-commit",
            title: "Cam kết lỏng lẻo của tiệm",
            customerText: "Giao khi thợ rảnh",
          },
        ],
      },
    })

    expect(res.decidedBy.commitments).toBe("HARD_LOCK_CHAIN")
    expect(res.lockedItems.commitments).toBe(true)
    expect(res.effectivePolicies.commitments).toHaveLength(1)
    expect(res.effectivePolicies.commitments[0]?.id).toBe("chain-sop-qc")
  })
})
