import { describe, expect, it } from "vitest"
import {
  approveConfigVersion,
  type ConfigVersionEntity,
  generateImpactPreview,
  publishConfigVersion,
  rollbackConfigVersion,
  validateDraftConfig,
} from "./config-change-lifecycle"

describe("Configuration Change Lifecycle Engine (§6.4)", () => {
  const baseConfig: ConfigVersionEntity<{ maxDiscount: number }> = {
    versionId: "ver-1",
    organizationId: "org-chain-1",
    policyKey: "sales.max_discount",
    value: { maxDiscount: 25 },
    stage: "DRAFT",
    effectiveFrom: new Date(),
    isFrozen: false,
    authorId: "user-admin",
    createdAt: new Date(),
  }

  it("validates draft configuration", () => {
    const validated = validateDraftConfig(baseConfig, (val) => {
      return val.maxDiscount > 50 ? ["Giảm giá không được quá 50%"] : []
    })
    expect(validated.isValid).toBe(true)
  })

  it("generates impact preview and enforces owner approval for wide-scale impact", () => {
    const previewed = generateImpactPreview(baseConfig, {
      totalStores: 10, // >= 5 stores
      totalProducts: 100,
      openOrders: 5,
      outOfBoundsCount: 0,
    })

    expect(previewed.stage).toBe("PREVIEWED")
    expect(previewed.impactPreview?.requiresHighLevelApproval).toBe(true)

    // Manager approval fails
    expect(() =>
      approveConfigVersion(previewed, "manager-1", "MANAGER")
    ).toThrow("bắt buộc OWNER phê duyệt")

    // Owner approval succeeds
    const approved = approveConfigVersion(previewed, "owner-1", "OWNER")
    expect(approved.stage).toBe("APPROVED")
  })

  it("publishes approved configuration and prevents publishing if frozen", () => {
    const previewed = generateImpactPreview(baseConfig, {
      totalStores: 2,
      totalProducts: 10,
      openOrders: 0,
      outOfBoundsCount: 0,
    })
    const approved = approveConfigVersion(previewed, "manager-1", "MANAGER")
    const published = publishConfigVersion(approved)
    expect(published.stage).toBe("PUBLISHED")

    const frozen = { ...approved, isFrozen: true }
    expect(() => publishConfigVersion(frozen)).toThrow("ĐÓNG BĂNG")
  })

  it("rolls back published version safely creating a new immutable version", () => {
    const v1: ConfigVersionEntity<{ maxDiscount: number }> = {
      ...baseConfig,
      versionId: "ver-1",
      value: { maxDiscount: 20 },
      stage: "PUBLISHED",
    }
    const v2: ConfigVersionEntity<{ maxDiscount: number }> = {
      ...baseConfig,
      versionId: "ver-2",
      value: { maxDiscount: 35 },
      stage: "PUBLISHED",
    }

    const rolledBack = rollbackConfigVersion(v2, v1, "owner-1", "ver-3")
    expect(rolledBack.versionId).toBe("ver-3")
    expect(rolledBack.value.maxDiscount).toBe(20)
    expect(rolledBack.stage).toBe("PUBLISHED")
    expect(rolledBack.rollbackFromVersionId).toBe("ver-2")
  })
})
