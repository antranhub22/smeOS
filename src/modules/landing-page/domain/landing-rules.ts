/**
 * Luật nghiệp vụ thuần kiểm định chất lượng (QC Rules) cho Công cụ 08 — Tạo Landing Page.
 * Đảm bảo 100% testable mà không cần phụ thuộc vào database hay external API.
 */

import { OUTPUT_STANDARDS_08 } from "./output-standard"

export interface LandingQcInput {
  readonly hasShopName: boolean
  readonly hasPhone: boolean
  readonly hasAddress: boolean
  readonly hasHeroHeadline: boolean
  readonly hasCtaButton: boolean
  readonly productCount: number
  readonly storyWordCount: number
  readonly perksCount: number
  readonly isMobileOptimized: boolean
}

export interface LandingQcScoreItem {
  readonly code: string
  readonly name: string
  readonly passed: boolean
  readonly score: number
  readonly message?: string | undefined
}

export interface LandingQcEvaluation {
  readonly isPassed: boolean
  readonly overallScore: number
  readonly criteria: readonly LandingQcScoreItem[]
}

export function evaluateLandingQc(input: LandingQcInput): LandingQcEvaluation {
  const criteria: LandingQcScoreItem[] = []

  // 1. store_identity_fidelity (MANDATORY)
  const identityScore = (input.hasShopName ? 0.5 : 0) + (input.hasPhone ? 0.3 : 0) + (input.hasAddress ? 0.2 : 0)
  criteria.push({
    code: "store_identity_fidelity",
    name: "Thông tin thương hiệu chính xác",
    passed: input.hasShopName && input.hasPhone,
    score: identityScore,
    message: !input.hasPhone ? "Thiếu số điện thoại liên hệ" : undefined,
  })

  // 2. mobile_first_responsive (MANDATORY)
  criteria.push({
    code: "mobile_first_responsive",
    name: "Tối ưu hiển thị di động (Mobile-First)",
    passed: input.isMobileOptimized,
    score: input.isMobileOptimized ? 1.0 : 0.4,
    message: !input.isMobileOptimized ? "Chưa tối ưu giao diện điện thoại" : undefined,
  })

  // 3. clear_call_to_action (MANDATORY)
  criteria.push({
    code: "clear_call_to_action",
    name: "Nút hành động (CTA) rõ ràng",
    passed: input.hasCtaButton,
    score: input.hasCtaButton ? 1.0 : 0.0,
    message: !input.hasCtaButton ? "Thiếu nút kêu gọi hành động (CTA)" : undefined,
  })

  // 4. product_showcase_quality (SCORED)
  const productScore = Math.min(1.0, input.productCount >= 3 ? 1.0 : input.productCount * 0.33)
  criteria.push({
    code: "product_showcase_quality",
    name: "Trưng bày sản phẩm/dịch vụ nổi bật",
    passed: productScore >= 0.8,
    score: productScore,
    message: input.productCount < 3 ? "Nên chọn ít nhất 3 sản phẩm/dịch vụ tiêu biểu" : undefined,
  })

  // 5. compelling_storytelling (SCORED)
  const storyScore = input.storyWordCount >= 30 ? 1.0 : input.storyWordCount >= 15 ? 0.7 : 0.4
  criteria.push({
    code: "compelling_storytelling",
    name: "Văn phong tiếp thị & câu chuyện thương hiệu",
    passed: storyScore >= 0.7,
    score: storyScore,
  })

  // 6. trust_and_credibility (SCORED)
  const perksScore = Math.min(1.0, input.perksCount >= 3 ? 1.0 : input.perksCount * 0.3)
  criteria.push({
    code: "trust_and_credibility",
    name: "Yếu tố tạo dựng niềm tin",
    passed: perksScore >= 0.8,
    score: perksScore,
  })

  // Check mandatory passes
  const mandatoryItems = criteria.filter((c) => {
    const std = OUTPUT_STANDARDS_08.find((s) => s.code === c.code)
    return std?.type === "MANDATORY"
  })

  const allMandatoryPassed = mandatoryItems.every((c) => c.passed)
  const totalScore = criteria.reduce((sum, c) => sum + c.score, 0) / criteria.length
  const isPassed = allMandatoryPassed && totalScore >= 0.75

  return {
    isPassed,
    overallScore: Math.round(totalScore * 100) / 100,
    criteria,
  }
}
