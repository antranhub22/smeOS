import { describe, it, expect } from "vitest"
import { evaluateLandingQc, type LandingQcInput } from "./landing-rules"

describe("evaluateLandingQc (QC Engine cho Công cụ 08)", () => {
  it("đạt chuẩn (PASSED) khi đầy đủ thông tin thương hiệu, nút CTA và tối ưu di động", () => {
    const input: LandingQcInput = {
      hasShopName: true,
      hasPhone: true,
      hasAddress: true,
      hasHeroHeadline: true,
      hasCtaButton: true,
      productCount: 4,
      storyWordCount: 50,
      perksCount: 4,
      isMobileOptimized: true,
    }

    const result = evaluateLandingQc(input)
    expect(result.isPassed).toBe(true)
    expect(result.overallScore).toBeGreaterThanOrEqual(0.8)
  })

  it("thất bại (FAILED) nếu thiếu số điện thoại liên hệ (vi phạm tiêu chí bắt buộc)", () => {
    const input: LandingQcInput = {
      hasShopName: true,
      hasPhone: false,
      hasAddress: true,
      hasHeroHeadline: true,
      hasCtaButton: true,
      productCount: 4,
      storyWordCount: 50,
      perksCount: 4,
      isMobileOptimized: true,
    }

    const result = evaluateLandingQc(input)
    expect(result.isPassed).toBe(false)
    const identityCrit = result.criteria.find((c) => c.code === "store_identity_fidelity")
    expect(identityCrit?.passed).toBe(false)
  })

  it("thất bại (FAILED) nếu thiếu nút hành động CTA", () => {
    const input: LandingQcInput = {
      hasShopName: true,
      hasPhone: true,
      hasAddress: true,
      hasHeroHeadline: true,
      hasCtaButton: false,
      productCount: 4,
      storyWordCount: 50,
      perksCount: 4,
      isMobileOptimized: true,
    }

    const result = evaluateLandingQc(input)
    expect(result.isPassed).toBe(false)
  })
})
