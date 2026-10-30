/**
 * generate-banner-copy.use-case.ts — Use-case sinh nội dung quảng cáo thông minh cho Công cụ 05.
 * Tích hợp Content Engine / MultiLLMProvider và tự động Fallback về Instant Template.
 */

import { z } from "zod"
import { createContentLLM } from "@/core/ai/adapters/multi-llm-provider"
import type { BannerCopyPayload } from "../domain/banner-types"
import { buildBannerCopyPrompt } from "../domain/prompt-builder"
import { generateInstantBannerCopy } from "../domain/banner-template-generator"
import { enforceShopPromotion, shopPromotionBadge } from "../domain/promotion-guard"

export interface GenerateBannerCopyInput {
  readonly industryKey: string
  readonly occasionKey: string
  readonly occasionLabel: string
  readonly shopName: string
  readonly productTitle?: string | undefined
  readonly desiredPromotion?: string | undefined
  /** Ưu đãi tiệm đang bật (Hồ sơ tiệm) — nguồn duy nhất cho nhãn ưu đãi */
  readonly shopPromotions: readonly string[]
}

export interface GenerateBannerCopyOutput {
  readonly copy: BannerCopyPayload
  readonly source: "AI_CONTENT_ENGINE" | "INSTANT_TEMPLATE"
}

const copyResponseSchema = z.object({
  headline: z.string().min(2),
  subHeadline: z.string().min(3),
  promotionBadge: z.string(),
  ctaText: z.string().min(2),
  validityText: z.string().optional(),
})

export async function generateBannerCopyUseCase(
  input: GenerateBannerCopyInput
): Promise<GenerateBannerCopyOutput> {
  const prompt = buildBannerCopyPrompt({
    industryKey: input.industryKey,
    occasionLabel: input.occasionLabel,
    shopName: input.shopName,
    productTitle: input.productTitle,
    shopPromotions: input.shopPromotions,
  })

  // Thử gọi AI Content Engine
  try {
    const llm = createContentLLM()
    const response = await llm.complete({
      organizationId: "system",
      prompt,
      maxTokens: 500,
    })

    if (response?.text) {
      // Bóc tách JSON từ phản hồi LLM
      const jsonMatch = response.text.match(/\{[\s\S]*\}/)
      if (jsonMatch) {
        const rawJson = JSON.parse(jsonMatch[0])
        const parsed = copyResponseSchema.safeParse(rawJson)
        if (parsed.success) {
          const bannerCopy: BannerCopyPayload | null = enforceShopPromotion({
            headline: parsed.data.headline,
            subHeadline: parsed.data.subHeadline,
            promotionBadge: parsed.data.promotionBadge,
            ctaText: parsed.data.ctaText,
            validityText: parsed.data.validityText,
          }, input.shopPromotions)
          if (bannerCopy) {
            return {
              copy: bannerCopy,
              source: "AI_CONTENT_ENGINE",
            }
          }
        }
      }
    }
  } catch {
    // LLM lỗi hoặc thiếu API key, chuyển sang fallback
  }

  // Fallback an toàn về Instant Template
  const fallbackCopy = generateInstantBannerCopy({
    occasionKey: input.occasionKey,
    shopName: input.shopName,
    productTitle: input.productTitle,
    suggestedPromotion: shopPromotionBadge(input.shopPromotions, input.desiredPromotion),
  })

  return {
    copy: fallbackCopy,
    source: "INSTANT_TEMPLATE",
  }
}
