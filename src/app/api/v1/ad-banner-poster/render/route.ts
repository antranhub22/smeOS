import { requireCapability } from "@/core/rbac/capabilities"
import { z } from "zod"
import { validationFailed } from "@/core/http/errors"
import { handle, jsonResponse } from "@/core/http/response"
import { requireTenantContext } from "@/modules/organization/use-cases/resolve-session"
import { renderBannerSingleCallUseCase } from "@/modules/ad-banner-poster/use-cases/render-banner-single-call.use-case"
import type { BannerAspectRatio, BannerStylePresetId } from "@/modules/ad-banner-poster/domain/banner-types"

const renderSchema = z.object({
  occasion_key: z.string(),
  occasion_label: z.string(),
  industry_key: z.string().default("GENERAL_RETAIL"),
  copy: z.object({
    headline: z.string().min(1),
    subHeadline: z.string().min(1),
    promotionBadge: z.string().min(1),
    ctaText: z.string().min(1),
    validityText: z.string().optional(),
  }),
  product_image_url: z.string().optional(),
  brand_info: z.object({
    shopName: z.string().min(1),
    hotline: z.string().optional(),
    address: z.string().optional(),
    logoUrl: z.string().optional(),
    primaryColor: z.string().optional(),
  }),
  style_preset_id: z.enum([
    "MODERN_MINIMAL",
    "VIBRANT_SALE",
    "ELEGANT_LUXURY",
    "FESTIVE_SEASON",
    "BRAND_ACCENT",
  ] as const),
  target_formats: z.array(z.enum(["1:1", "4:5", "9:16", "16:9", "A4"] as const)).min(1),
})

export const POST = handle(async (request) => {
  const { ctx } = await requireTenantContext(request)
  requireCapability(ctx, "I1")

  const body = await request.json().catch(() => null)
  const parsed = renderSchema.safeParse(body)
  if (!parsed.success) {
    throw validationFailed({ issues: parsed.error.issues })
  }

  const { data } = parsed
  const result = await renderBannerSingleCallUseCase({
    project: {
      occasionKey: data.occasion_key,
      occasionLabel: data.occasion_label,
      industryKey: data.industry_key,
      copy: {
        headline: data.copy.headline,
        subHeadline: data.copy.subHeadline,
        promotionBadge: data.copy.promotionBadge,
        ctaText: data.copy.ctaText,
        validityText: data.copy.validityText,
      },
      productImageUrl: data.product_image_url,
      brandInfo: {
        shopName: data.brand_info.shopName,
        hotline: data.brand_info.hotline,
        address: data.brand_info.address,
        logoUrl: data.brand_info.logoUrl,
        primaryColor: data.brand_info.primaryColor,
      },
      stylePresetId: data.style_preset_id as BannerStylePresetId,
      targetFormats: data.target_formats as BannerAspectRatio[],
    },
    formats: data.target_formats as BannerAspectRatio[],
  })

  return jsonResponse({
    success: true,
    qc: result.qc,
    results: result.results,
  })
})
