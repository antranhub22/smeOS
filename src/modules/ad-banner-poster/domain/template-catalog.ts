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
      headline: "FLASH SALE CUỐI TUẦN",
      subHeadline: "Ghé tiệm hoặc nhắn tin để chọn mẫu ưng ý.",
      promotionBadge: "",
      ctaText: "MUA NGAY KẺO LỠ",
      validityText: "",
    },
    tags: ["Flash sale", "Khuyến mãi"],
  },
  {
    id: "tpl-sale-bogo",
    name: "Quà Tặng Yêu Thương",
    category: "PROMOTION_SALE",
    categoryLabel: "Khuyến mãi",
    stylePresetId: "VIBRANT_SALE",
    layout: "CARD_INSET",
    defaultCopy: {
      headline: "QUÀ TẶNG Ý NGHĨA CHO NGƯỜI THƯƠNG",
      subHeadline: "Chọn mẫu ưng ý, tiệm chuẩn bị chu đáo đến tận tay người nhận.",
      promotionBadge: "",
      ctaText: "NHẬN QUÀ NGAY",
      validityText: "",
    },
    tags: ["Quà tặng", "Khuyến mãi"],
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
      promotionBadge: "",
      ctaText: "KHÁM PHÁ NGAY",
      validityText: "",
    },
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
      promotionBadge: "",
      ctaText: "TRẢI NGHIỆM NGAY",
      validityText: "",
    },
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
      promotionBadge: "",
      ctaText: "ĐẶT QUÀ NGAY",
      validityText: "",
    },
    tags: ["20/10", "8/3", "Lễ hội"],
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
      headline: "MỪNG KHAI TRƯƠNG — HÂN HẠNH ĐÓN KHÁCH",
      subHeadline: "Chào đón quý khách ghé tiệm xem mẫu và đặt hàng.",
      promotionBadge: "",
      ctaText: "GHÉ CỬA HÀNG NGAY",
      validityText: "",
    },
    tags: ["Khai trương", "Sự kiện", "Mừng chi nhánh mới"],
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
      promotionBadge: "",
      ctaText: "TÌM CHI NHÁNH GẦN BẠN",
      validityText: "",
    },
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
