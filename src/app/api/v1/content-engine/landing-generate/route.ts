import { z } from "zod"

import { validationFailed } from "@/core/http/errors"
import { handle, jsonResponse } from "@/core/http/response"
import { requireTenantContext } from "@/modules/organization/use-cases/resolve-session"
import { getBusinessProfile } from "@/modules/profiles/use-cases/get-business-profile"
import { getBrandProfile } from "@/modules/profiles/use-cases/get-brand-profile"
import { executeGenerateLandingContent } from "@/modules/content-engine/use-cases/generate-landing-page-content.use-case"
import { listActiveShopPromotions, shopDiscountPercent } from "@/modules/greeting-card/use-cases/active-shop-promotions"
import { LANDING_TYPE_OPTIONS } from "@/modules/landing-page/domain/preset-catalog"
import { saveLandingPage } from "@/modules/landing-page/use-cases/save-landing-page"

const PAGE_TYPES = LANDING_TYPE_OPTIONS.map((o) => o.type) as [string, ...string[]]

const requestSchema = z.object({
  occasionId: z.string().min(1),
  occasionLabel: z.string().min(1),
  archetypeId: z.string().optional(),
  selectedProducts: z.array(
    z.object({
      name: z.string().min(1),
      code: z.string().optional(),
      price: z.number().nullable().optional(),
      category: z.string().nullable().optional(),
    })
  ).default([]),
  userDirectives: z.string().optional(),
  discountPercent: z.number().int().min(1).max(99).optional(),
  usps: z.array(z.string()).optional(),
  guarantees: z.array(z.string()).optional(),
  targetAudience: z.string().optional(),
  designDirection: z.string().optional(),
  pageType: z.enum(PAGE_TYPES).optional(),
})

export const POST = handle(async (request) => {
  const { ctx } = await requireTenantContext(request)

  const body = await request.json().catch(() => null)
  const parsed = requestSchema.safeParse(body)
  if (!parsed.success) {
    throw validationFailed({ issues: parsed.error.issues })
  }

  // Lấy Nguồn 1: Cốt lõi Business Profile & Brand Profile của tiệm
  const [bizProfile, brandProfile, promotions] = await Promise.all([
    getBusinessProfile(ctx).catch(() => null),
    getBrandProfile(ctx).catch(() => null),
    listActiveShopPromotions(ctx.organizationId).catch(() => []),
  ])

  // Mục đích trang (bộ chọn loại trang trên /landing-page) → một dòng chỉ dẫn cho Writer AI.
  const pageOption = LANDING_TYPE_OPTIONS.find((o) => o.type === parsed.data.pageType)
  const shopName = bizProfile?.display_name || "Tiệm Sản Phẩm"
  const shopTone = brandProfile?.tone_of_voice || undefined

  const result = await executeGenerateLandingContent(
    {
      shopName,
      shopTone,
      occasionId: parsed.data.occasionId,
      occasionLabel: parsed.data.occasionLabel,
      archetypeId: parsed.data.archetypeId,
      selectedProducts: parsed.data.selectedProducts,
      userDirectives: parsed.data.userDirectives,
      // Ưu đãi chỉ lấy từ Hồ sơ tiệm (đang bật) — không nhận % từ trình duyệt, không mặc định
      discountPercent: shopDiscountPercent(promotions),
      usps: parsed.data.usps,
      guarantees: parsed.data.guarantees,
      targetAudience: parsed.data.targetAudience,
      designDirection: parsed.data.designDirection,
      pageGoal: pageOption ? `${pageOption.title} — ${pageOption.subTitle}` : undefined,
    },
    ctx
  )

  // Kho dữ liệu v2 (L-1): lưu để tìm lại; lỗi lưu không chặn kết quả sinh.
  const landingPageId = await saveLandingPage(ctx, {
    title: result.hero?.headline || parsed.data.occasionLabel,
    pageType: parsed.data.pageType ?? null,
    occasionLabel: parsed.data.occasionLabel,
    input: parsed.data,
    content: result,
  })

  return jsonResponse({
    data: { ...result, landing_page_id: landingPageId },
  })
})
