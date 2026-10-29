/**
 * template-catalog.ts — Hệ thống Kho Template cho Poster và Banner quảng cáo.
 * Chuẩn Clean Architecture, trung lập đa ngành (Multi-Industry First).
 */

import type { BannerStylePresetId, BannerCopyPayload } from "./banner-types"

export type BannerPurposeCategory =
  | "ALL"
  | "PROMOTION_SALE"    // 🔥 Khuyến mãi bùng nổ, Flash Sale, Xả kho
  | "NEW_COLLECTION"    // ✨ Ra mắt mẫu mới, Bộ sưu tập
  | "OPENING_EVENT"     // 🎉 Khai trương, Kỷ niệm, Tri ân
  | "HOLIDAY_SEASON"    // 💐 Dịp lễ lớn (20/10, 8/3, Tết, Giáng sinh...)
  | "CHAIN_BRAND"       // 🏢 Nhận diện thương hiệu chuỗi

export type BannerLayoutArrangement =
  | "HERO_CENTER"       // Ảnh sản phẩm ở giữa, chữ trên/dưới
  | "SPLIT_LEFT_RIGHT"  // Ảnh một bên, chữ và ưu đãi một bên
  | "CARD_INSET"        // Sản phẩm nổi bật trong khung thẻ mềm mại
  | "FULL_BACKGROUND"   // Ảnh tràn nền kết hợp lớp phủ tương phản

export interface BannerTemplateItem {
  readonly id: string
  readonly name: string
  readonly category: BannerPurposeCategory
  readonly categoryLabel: string
  readonly stylePresetId: BannerStylePresetId
  readonly layout: BannerLayoutArrangement
  readonly defaultCopy: BannerCopyPayload
  readonly sampleImageUrl: string
  readonly tags: readonly string[]
  readonly isChainReady?: boolean | undefined
}

export const BANNER_TEMPLATE_CATEGORIES: readonly {
  readonly id: BannerPurposeCategory
  readonly label: string
  readonly icon: string
}[] = [
  { id: "ALL", label: "Tất cả mẫu", icon: "LayoutGrid" },
  { id: "PROMOTION_SALE", label: "Khuyến mãi & Sale", icon: "Flame" },
  { id: "NEW_COLLECTION", label: "Mẫu mới ra mắt", icon: "Sparkles" },
  { id: "HOLIDAY_SEASON", label: "Dịp lễ & Mùa vụ", icon: "Gift" },
  { id: "OPENING_EVENT", label: "Khai trương & Sự kiện", icon: "PartyPopper" },
  { id: "CHAIN_BRAND", label: "🏢 Chuỗi & Thương hiệu", icon: "Building2" },
] as const

export const BANNER_TEMPLATE_CATALOG: readonly BannerTemplateItem[] = [
  // ── 1. PROMOTION & SALE ──────────────────────────────────────────
  {
    id: "tpl-sale-flash",
    name: "Flash Sale Bùng Nổ",
    category: "PROMOTION_SALE",
    categoryLabel: "Khuyến mãi",
    stylePresetId: "VIBRANT_SALE",
    layout: "HERO_CENTER",
    defaultCopy: {
      headline: "FLASH SALE — CHỚP NGAY DEAL ĐỈNH",
      subHeadline: "Ưu đãi độc quyền áp dụng số lượng có hạn, nhanh tay săn ngay hôm nay.",
      promotionBadge: "GIẢM ĐẾN 50%",
      ctaText: "MUA NGAY KẺO LỠ",
      validityText: "Chỉ trong 24 giờ",
    },
    sampleImageUrl: "https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=600&auto=format&fit=crop&q=80",
    tags: ["Giảm 50%", "Flash sale", "Khuyến mãi", "Giá sốc"],
  },
  {
    id: "tpl-sale-bogo",
    name: "Ưu Đãi Mua 1 Tặng 1",
    category: "PROMOTION_SALE",
    categoryLabel: "Khuyến mãi",
    stylePresetId: "VIBRANT_SALE",
    layout: "CARD_INSET",
    defaultCopy: {
      headline: "SIÊU ƯU ĐÃI — MUA 1 TẶNG 1",
      subHeadline: "Tặng kèm quà giá trị khi đặt mua bất kỳ sản phẩm nào trong tuần này.",
      promotionBadge: "MUA 1 TẶNG 1",
      ctaText: "NHẬN QUÀ NGAY",
      validityText: "Số lượng quà tặng có hạn",
    },
    sampleImageUrl: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&auto=format&fit=crop&q=80",
    tags: ["Mua 1 tặng 1", "Tặng quà", "Quà tặng độc quyền"],
  },

  // ── 2. NEW COLLECTION ────────────────────────────────────────────
  {
    id: "tpl-new-minimal",
    name: "Bộ Sưu Tập Mới Tối Giản",
    category: "NEW_COLLECTION",
    categoryLabel: "Mẫu mới",
    stylePresetId: "MODERN_MINIMAL",
    layout: "HERO_CENTER",
    defaultCopy: {
      headline: "BỘ SƯU TẬP MỚI RA MẮT",
      subHeadline: "Thiết kế tinh xảo, đường nét đương đại tôn vinh phong cách sống của bạn.",
      promotionBadge: "NEW ARRIVAL",
      ctaText: "KHÁM PHÁ NGAY",
      validityText: "Phiên bản giới hạn",
    },
    sampleImageUrl: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&auto=format&fit=crop&q=80",
    tags: ["Mẫu mới", "Tối giản", "Phong cách", "Mới về"],
  },
  {
    id: "tpl-new-luxury",
    name: "Đẳng Cấp Sang Trọng",
    category: "NEW_COLLECTION",
    categoryLabel: "Mẫu mới",
    stylePresetId: "ELEGANT_LUXURY",
    layout: "SPLIT_LEFT_RIGHT",
    defaultCopy: {
      headline: "TUYỂN CHỌN ĐỘC BẢN CAO CẤP",
      subHeadline: "Được tạo tác tỉ mỉ từ những nguyên liệu tuyển chọn khắt khe nhất.",
      promotionBadge: "BOUTIQUE LUXURY",
      ctaText: "TRẢI NGHIỆM NGAY",
      validityText: "Độc quyền tại cửa hàng",
    },
    sampleImageUrl: "https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=600&auto=format&fit=crop&q=80",
    tags: ["Sang trọng", "Độc bản", "Quý phái", "Boutique"],
  },

  // ── 3. HOLIDAY & SEASONS ─────────────────────────────────────────
  {
    id: "tpl-holiday-festive",
    name: "Lễ Hội Tri Ân & Yêu Thương",
    category: "HOLIDAY_SEASON",
    categoryLabel: "Dịp lễ",
    stylePresetId: "FESTIVE_SEASON",
    layout: "HERO_CENTER",
    defaultCopy: {
      headline: "TRAO GỬI YÊU THƯƠNG TRỌN VẸN",
      subHeadline: "Món quà tinh tế thay lời tri ân ngọt ngào nhất gửi đến những người trân quý.",
      promotionBadge: "TẶNG THIỆP & FREESHIP",
      ctaText: "ĐẶT QUÀ NGAY",
      validityText: "Ưu đãi đặt sớm trước lễ",
    },
    sampleImageUrl: "https://images.unsplash.com/photo-1513519245088-0e12902e5a38?w=600&auto=format&fit=crop&q=80",
    tags: ["20/10", "8/3", "Lễ hội", "Tặng thiệp", "Freeship"],
  },

  // ── 4. OPENING & EVENTS ──────────────────────────────────────────
  {
    id: "tpl-opening-cheer",
    name: "Mừng Khai Trương Rộn Ràng",
    category: "OPENING_EVENT",
    categoryLabel: "Khai trương",
    stylePresetId: "FESTIVE_SEASON",
    layout: "CARD_INSET",
    defaultCopy: {
      headline: "MỪNG KHAI TRƯƠNG — RỘN RÀNG ƯU ĐÃI",
      subHeadline: "Chào đón quý khách ghé trải nghiệm với hàng ngàn ưu đãi và quà tặng hấp dẫn.",
      promotionBadge: "GIẢM 20% TOÀN BỘ ĐƠN",
      ctaText: "GHÉ CỬA HÀNG NGAY",
      validityText: "Tuần lễ khai trương",
    },
    sampleImageUrl: "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=600&auto=format&fit=crop&q=80",
    tags: ["Khai trương", "Sự kiện", "Mừng chi nhánh mới", "Giảm 20%"],
  },

  // ── 5. CHAIN BRAND ACCENT ────────────────────────────────────────
  {
    id: "tpl-chain-standard",
    name: "Chuỗi Thương Hiệu Chuẩn",
    category: "CHAIN_BRAND",
    categoryLabel: "Chuỗi",
    stylePresetId: "BRAND_ACCENT",
    layout: "HERO_CENTER",
    defaultCopy: {
      headline: "CHẤT LƯỢNG ĐỒNG BỘ TOÀN HỆ THỐNG",
      subHeadline: "Cam kết trải nghiệm dịch vụ và sản phẩm tiêu chuẩn hàng đầu tại mọi chi nhánh.",
      promotionBadge: "TIÊU CHUẨN HỆ THỐNG",
      ctaText: "TÌM CHI NHÁNH GẦN BẠN",
      validityText: "Áp dụng toàn bộ hệ thống",
    },
    sampleImageUrl: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=600&auto=format&fit=crop&q=80",
    tags: ["Chuỗi", "Thương hiệu", "Hệ thống", "Đồng bộ"],
    isChainReady: true,
  },
] as const

export function getTemplatesByCategory(
  category: BannerPurposeCategory
): readonly BannerTemplateItem[] {
  if (category === "ALL") return BANNER_TEMPLATE_CATALOG
  return BANNER_TEMPLATE_CATALOG.filter((t) => t.category === category)
}

export function findTemplateById(
  id: string
): BannerTemplateItem | undefined {
  return BANNER_TEMPLATE_CATALOG.find((t) => t.id === id)
}
