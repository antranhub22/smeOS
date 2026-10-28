import { describe, it, expect } from "vitest"
import {
  resolveCascadingGovernance,
  type HardLock,
  type ResolveCascadingInput,
} from "./cascading-resolver"

describe("4-Tier Cascading Governance Domain Resolver", () => {
  interface MockPromoConfig {
    discountPercent: number
    label: string
  }

  const defaultFallback: MockPromoConfig = {
    discountPercent: 10,
    label: "Giảm giá 10% mặc định",
  }

  const baseInput: ResolveCascadingInput<MockPromoConfig> = {
    key: "PROMO_DISCOUNT",
    storeScopeId: "store-dn-01",
    chainScopeId: "chain-flora-01",
    industryScopeId: "FLOWER",
    systemFallback: defaultFallback,
  }

  it("trả về fallback hệ thống khi chưa có tầng nào cấu hình", () => {
    const result = resolveCascadingGovernance(baseInput)
    expect(result.decidedBy).toBe("SYSTEM_FALLBACK")
    expect(result.config.discountPercent).toBe(10)
    expect(result.isLocked).toBe(false)
  })

  it("dừng ngay và trả về DEACTIVATED khi nền tảng tắt toàn sàn", () => {
    const result = resolveCascadingGovernance({
      ...baseInput,
      isGloballyActivated: false,
    })
    expect(result.decidedBy).toBe("GLOBALLY_DEACTIVATED")
    expect(result.enabled).toBe(false)
    expect(result.isLocked).toBe(true)
    expect(result.lockedBy).toBe("MOTHER")
  })

  it("Hard-Lock của Mother đè mọi tầng bên dưới", () => {
    const hardLocks: HardLock<MockPromoConfig>[] = [
      {
        key: "PROMO_DISCOUNT",
        tier: "MOTHER",
        scopeId: "GLOBAL",
        locked: true,
        enforcedConfig: { discountPercent: 5, label: "Trần giảm giá Nền tảng" },
        reason: "Trần chống bán phá giá",
      },
    ]

    const result = resolveCascadingGovernance({
      ...baseInput,
      hardLocks,
      storeOverride: {
        key: "PROMO_DISCOUNT",
        tier: "STORE",
        scopeId: "store-dn-01",
        enabled: true,
        config: { discountPercent: 30, label: "Tiệm tự giảm" },
      },
    })

    expect(result.decidedBy).toBe("HARD_LOCK_MOTHER")
    expect(result.isLocked).toBe(true)
    expect(result.config.discountPercent).toBe(5)
    expect(result.lockReason).toBe("Trần chống bán phá giá")
  })

  it("Hard-Lock của Chuỗi đè Store cơ sở", () => {
    const hardLocks: HardLock<MockPromoConfig>[] = [
      {
        key: "PROMO_DISCOUNT",
        tier: "CHAIN",
        scopeId: "chain-flora-01",
        locked: true,
        enforcedConfig: { discountPercent: 15, label: "Chiết khấu toàn chuỗi" },
        reason: "Chính sách tháng khai trương chuỗi",
      },
    ]

    const result = resolveCascadingGovernance({
      ...baseInput,
      hardLocks,
      storeOverride: {
        key: "PROMO_DISCOUNT",
        tier: "STORE",
        scopeId: "store-dn-01",
        enabled: true,
        config: { discountPercent: 20, label: "Tiệm muốn giảm riêng" },
      },
    })

    expect(result.decidedBy).toBe("HARD_LOCK_CHAIN")
    expect(result.isLocked).toBe(true)
    expect(result.config.discountPercent).toBe(15)
  })

  it("kế thừa ngược Bottom-Up: Store thắng Chain, Industry và Mother Default khi không bị khóa", () => {
    const result = resolveCascadingGovernance({
      ...baseInput,
      storeOverride: {
        key: "PROMO_DISCOUNT",
        tier: "STORE",
        scopeId: "store-dn-01",
        enabled: true,
        config: { discountPercent: 25, label: "Tiệm tự quyết" },
      },
      chainOverride: {
        key: "PROMO_DISCOUNT",
        tier: "CHAIN",
        scopeId: "chain-flora-01",
        enabled: true,
        config: { discountPercent: 12, label: "Chuỗi cấu hình" },
      },
      industryDefault: {
        key: "PROMO_DISCOUNT",
        tier: "INDUSTRY",
        scopeId: "FLOWER",
        enabled: true,
        config: { discountPercent: 10, label: "Ngành Hoa mẫu" },
      },
    })

    expect(result.decidedBy).toBe("STORE")
    expect(result.config.discountPercent).toBe(25)
    expect(result.isLocked).toBe(false)
  })

  it("kế thừa ngược Bottom-Up: Chain thắng Industry khi Store không có override", () => {
    const result = resolveCascadingGovernance({
      ...baseInput,
      chainOverride: {
        key: "PROMO_DISCOUNT",
        tier: "CHAIN",
        scopeId: "chain-flora-01",
        enabled: true,
        config: { discountPercent: 18, label: "Chuỗi cấu hình" },
      },
      industryDefault: {
        key: "PROMO_DISCOUNT",
        tier: "INDUSTRY",
        scopeId: "FLOWER",
        enabled: true,
        config: { discountPercent: 10, label: "Ngành Hoa mẫu" },
      },
    })

    expect(result.decidedBy).toBe("CHAIN")
    expect(result.config.discountPercent).toBe(18)
    expect(result.isLocked).toBe(false)
  })
})
