import { describe, it, expect } from "vitest"
import {
  resolveCascadingTemplate,
  type ResolveCascadingTemplateInput,
} from "./cascading-template-resolver"

describe("Cascading Template & Brand Style Resolver (4-Tier)", () => {
  const baseInput: ResolveCascadingTemplateInput = {
    templateKey: "TAG",
    storeOrgId: "store-q3-01",
    chainOrgId: "chain-flora-saigon",
    industryKey: "FLOWER",
  }

  it("kế thừa tiêu đề mẫu Tag giá từ Industry Profile khi chưa chỉnh sửa", () => {
    const res = resolveCascadingTemplate(baseInput)
    expect(res.effectiveTemplate.templateKey).toBe("TAG")
    expect(res.decidedBy).toBe("SYSTEM_FALLBACK")
    expect(res.isLocked).toBe(false)
  })

  it("Chuỗi ép buộc nhận diện thương hiệu (Logo & Slogan) qua Hard-Lock", () => {
    const res = resolveCascadingTemplate({
      ...baseInput,
      hardLocks: [
        {
          key: "TAG",
          tier: "CHAIN",
          scopeId: "chain-flora-saigon",
          locked: true,
          reason: "Nhận diện thương hiệu chuẩn toàn chuỗi Sài Gòn",
          enforcedConfig: {
            brandOverlay: {
              logoUrl: "https://storage.smeos.vn/brands/flora-logo.png",
              slogan: "Hoa tươi trao cảm xúc",
              enforceBrandLogo: true,
              logoPlacement: "TOP_RIGHT",
            },
          },
        },
      ],
      storeTemplateRaw: {
        brandOverlay: {
          enforceBrandLogo: false, // Tiệm muốn giấu logo chuỗi nhưng bị chặn
        },
      },
    })

    expect(res.isLocked).toBe(true)
    expect(res.decidedBy).toBe("HARD_LOCK_CHAIN")
    expect(res.effectiveTemplate.brandOverlay.enforceBrandLogo).toBe(true)
    expect(res.effectiveTemplate.brandOverlay.logoUrl).toBe(
      "https://storage.smeos.vn/brands/flora-logo.png"
    )
  })

  it("Tiệm tùy biến thông tin liên hệ cơ sở (StoreContactOverlay) khi không bị khóa", () => {
    const res = resolveCascadingTemplate({
      ...baseInput,
      storeTemplateRaw: {
        storeContact: {
          branchName: "Chi nhánh Quận 3",
          hotline: "0909123456",
          address: "123 Võ Văn Tần, Q.3, TP.HCM",
        },
      },
    })

    expect(res.decidedBy).toBe("STORE")
    expect(res.effectiveTemplate.storeContact?.branchName).toBe("Chi nhánh Quận 3")
    expect(res.effectiveTemplate.storeContact?.hotline).toBe("0909123456")
  })
})
