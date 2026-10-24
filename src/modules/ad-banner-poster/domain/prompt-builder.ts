/**
 * prompt-builder.ts — Prompt Builder cho Công cụ 05: Tạo poster và banner quảng cáo.
 * Chuẩn Single-Call Provider và Prompt Content Engine, trung lập đa ngành.
 */

import type { BannerProjectInput } from "./banner-types"

export function buildBannerSingleCallPrompt(project: BannerProjectInput): string {
  const { occasionLabel, industryKey, copy, brandInfo, stylePresetId } = project

  return JSON.stringify(
    {
      task: "commercial_ad_poster_banner_generation",
      standard_ref: "output_standard_05_v1",
      industry_key: industryKey,
      occasion: occasionLabel,
      style_preset: stylePresetId,
      copywriting: {
        headline: copy.headline,
        sub_headline: copy.subHeadline,
        promotion_badge: copy.promotionBadge,
        cta_text: copy.ctaText,
        validity: copy.validityText,
      },
      brand: {
        shop_name: brandInfo.shopName,
        hotline: brandInfo.hotline,
        address: brandInfo.address,
      },
      rules: {
        preserve_product_fidelity: true,
        accurate_vietnamese_typography: true,
        high_contrast_cta: true,
        no_distorted_text: true,
      },
      aspect_ratios: project.targetFormats,
    },
    null,
    2
  )
}

export function buildBannerCopyPrompt(params: {
  industryKey: string
  occasionLabel: string
  shopName: string
  productTitle?: string | undefined
  desiredPromotion?: string | undefined
}): string {
  const { industryKey, occasionLabel, shopName, productTitle, desiredPromotion } = params

  return `Bạn là Giám đốc Sáng tạo và Chuyên gia Tiếp thị trực tuyến hàng đầu cho doanh nghiệp vừa và nhỏ (SME).
Hãy sáng tạo 1 bộ thông điệp quảng cáo (Banner/Poster Copy) cực kỳ bắt mắt, kích thích khách hàng mua sắm cho dịp "${occasionLabel}".

=== THÔNG TIN ĐẦU VÀO ===
- Tên cửa hàng/thương hiệu: ${shopName}
- Ngành hàng: ${industryKey}
- Dịp sự kiện: ${occasionLabel}
${productTitle ? `- Sản phẩm trọng tâm: ${productTitle}` : ""}
${desiredPromotion ? `- Mong muốn ưu đãi: ${desiredPromotion}` : "- Ưu đãi: Hãy đề xuất 1 ưu đãi phù hợp, hấp dẫn"}

=== YÊU CẦU ĐẦU RA (JSON FORMAT) ===
Chỉ trả về duy nhất 1 JSON hợp lệ, không giải thích thêm:
{
  "headline": "Tiêu đề giật tít, ngắn gọn, dưới 10 từ (VD: BÙNG NỔ ƯU ĐÃI THÁNG 10)",
  "subHeadline": "Thông điệp phụ truyền cảm hứng, nêu bật giá trị sản phẩm (1-2 câu súc tích)",
  "promotionBadge": "Nhãn ưu đãi cực ngắn gọn (VD: GIẢM 20%, MUA 1 TẶNG 1, FREESHIP TOÀN QUỐC)",
  "ctaText": "Lời kêu gọi hành động mạnh mẽ (VD: ĐẶT HÀNG NGAY, NHẮN TIN NHẬN ƯU ĐÃI)",
  "validityText": "Thời gian áp dụng (VD: Duy nhất từ 20/10 - 25/10)"
}`
}
