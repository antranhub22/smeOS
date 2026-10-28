import { requireCapability } from "@/core/rbac/capabilities"
import { z } from "zod"
import { validationFailed } from "@/core/http/errors"
import { handle, jsonResponse } from "@/core/http/response"
import { requireTenantContext } from "@/modules/organization/use-cases/resolve-session"
import { generateBannerCopyUseCase } from "@/modules/ad-banner-poster/use-cases/generate-banner-copy.use-case"

const postSchema = z.object({
  industry_key: z.string().default("GENERAL_RETAIL"),
  occasion_key: z.string().min(1, "Bắt buộc có occasion_key"),
  occasion_label: z.string().min(1, "Bắt buộc có occasion_label"),
  shop_name: z.string().min(1, "Bắt buộc có shop_name"),
  product_title: z.string().optional(),
  desired_promotion: z.string().optional(),
})

export const POST = handle(async (request) => {
  const { ctx } = await requireTenantContext(request)
  requireCapability(ctx, "I1")

  const body = await request.json().catch(() => null)
  const parsed = postSchema.safeParse(body)
  if (!parsed.success) {
    throw validationFailed({ issues: parsed.error.issues })
  }

  const result = await generateBannerCopyUseCase({
    industryKey: parsed.data.industry_key,
    occasionKey: parsed.data.occasion_key,
    occasionLabel: parsed.data.occasion_label,
    shopName: parsed.data.shop_name,
    productTitle: parsed.data.product_title,
    desiredPromotion: parsed.data.desired_promotion,
  })

  return jsonResponse({
    success: true,
    copy: result.copy,
    source: result.source,
  })
})
