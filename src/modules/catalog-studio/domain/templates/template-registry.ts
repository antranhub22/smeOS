/**
 * Universal Catalog Studio 2026 — 5 Core Prototypes (T01–T05).
 * Pure Domain — Zero ORM.
 */

import type { CatalogTemplateId, CatalogTemplatePrototype } from "../entities/catalog-studio.types"

export const CATALOG_TEMPLATES: Record<CatalogTemplateId, CatalogTemplatePrototype> = {
  T01_SIGNATURE_COLLECTION: {
    id: "T01_SIGNATURE_COLLECTION",
    name: "Bộ sưu tập đặc trưng",
    subtitle: "Bộ sưu tập nghệ thuật & Tạp chí thời trang",
    badge: "Editorial High-Fashion",
    defaultStyleId: "S01_EDITORIAL_MAGAZINE",
    description: "Bố cục tạp chí biên tập ấn tượng, ảnh lớn 4:5, khoảng trắng rộng rãi tôn vinh phẩm cấp thương hiệu.",
    recommendedFor: "Bộ sưu tập theo mùa, dòng sản phẩm cao cấp, thời trang, hoa tươi nghệ thuật và quà tặng VIP.",
    structure: [
      { layoutId: "L01_COVER", title: "Bìa tạp chí nghệ thuật" },
      { layoutId: "L02_BRAND_STORY", title: "Câu chuyện & Triết lý chế tác" },
      { layoutId: "L04_HERO_PRODUCT", title: "Tác phẩm chủ đạo nổi bật" },
      { layoutId: "L05_PRODUCT_GRID", title: "Lưới danh mục tinh tuyển" },
      { layoutId: "L08_CLOSING", title: "Trang kết & Liên hệ đặt hàng" },
    ],
  },

  T02_MINIMAL_PRODUCT_LIST: {
    id: "T02_MINIMAL_PRODUCT_LIST",
    name: "Danh sách tối giản",
    subtitle: "Danh mục tối giản, thông tin mạch lạc chuẩn Bắc Âu",
    badge: "Pure Minimalist",
    defaultStyleId: "S02_PURE_MINIMAL",
    description: "Lưới sản phẩm quang đãng, bố cục gọn gàng, tối đa sự tập trung vào sản phẩm, tối ưu cho danh mục nhiều mẫu.",
    recommendedFor: "Bán lẻ, mỹ phẩm, phụ kiện, hàng thiết kế và danh mục nhiều mặt hàng cần duyệt nhanh.",
    structure: [
      { layoutId: "L01_COVER", title: "Bìa tối giản thanh lịch" },
      { layoutId: "L05_PRODUCT_GRID", title: "Lưới sản phẩm đa tầng" },
      { layoutId: "L06_PRODUCT_DETAIL", title: "Chi tiết & Bảng thông số" },
      { layoutId: "L08_CLOSING", title: "Thông tin thanh toán & Đặt hàng" },
    ],
  },

  T03_PREMIUM_LOOKBOOK: {
    id: "T03_PREMIUM_LOOKBOOK",
    name: "Sách ảnh cao cấp",
    subtitle: "Lookbook sang trọng thầm lặng & Kể chuyện bằng hình ảnh",
    badge: "Quiet Luxury",
    defaultStyleId: "S03_QUIET_LUXURY",
    description: "Tông ấm trầm sang trọng, từng trang là một trải nghiệm thị giác tĩnh tại, đậm chất thơ và giá trị độc bản.",
    recommendedFor: "Sự kiện cưới, quà kỷ niệm, đồ nội thất cao cấp, trang sức và các bộ sưu tập giới hạn.",
    structure: [
      { layoutId: "L01_COVER", title: "Bìa Lookbook sang trọng" },
      { layoutId: "L02_BRAND_STORY", title: "Cảm xúc & Nguồn cảm hứng" },
      { layoutId: "L04_HERO_PRODUCT", title: "Tác phẩm đỉnh cao" },
      { layoutId: "L07_BUNDLE", title: "Bộ phối quà tặng độc quyền" },
      { layoutId: "L08_CLOSING", title: "Trân trọng cảm ơn & Kết nối" },
    ],
  },

  T04_BENTO_SHOWCASE: {
    id: "T04_BENTO_SHOWCASE",
    name: "Trưng bày ô lưới",
    subtitle: "Khối Bento năng động 2026 — Thương mại hiện đại đa năng",
    badge: "2026 Trending",
    defaultStyleId: "S08_BENTO_GALLERY",
    description: "Bố cục chia ô Bento bất quy tắc cân bằng, kết hợp hình ảnh nổi bật với thẻ thông tin phụ trực quan, tối ưu cho lướt nhanh và chốt đơn tức thì.",
    recommendedFor: "Thương mại tổng hợp, F&B, bán lẻ Gen Z, sản phẩm đa dạng cần trình bày sinh động không nhàm chán.",
    structure: [
      { layoutId: "L01_COVER", title: "Bìa Bento năng động" },
      { layoutId: "L03_COLLECTION_DIVIDER", title: "Phân vùng danh mục" },
      { layoutId: "L05_PRODUCT_GRID", title: "Lưới sản phẩm Bento đa tầng" },
      { layoutId: "L07_BUNDLE", title: "Combo & Bộ sản phẩm gợi ý" },
      { layoutId: "L08_CLOSING", title: "Gọi hành động & Đặt hàng ngay" },
    ],
  },

  T05_DARK_CINEMATIC: {
    id: "T05_DARK_CINEMATIC",
    name: "Điện ảnh nền tối",
    subtitle: "Điện ảnh studio huyền bí — Cao cấp không giới hạn",
    badge: "Premium Dark",
    defaultStyleId: "S11_DARK_SHOWCASE",
    description: "Nền đen huyền bí sang trọng, ánh sáng spotlight tôn vinh từng chi tiết sản phẩm, contrast kịch tính mạnh mẽ như một thước phim điện ảnh.",
    recommendedFor: "Trang sức, đồng hồ, mỹ phẩm cao cấp, rượu vang, công nghệ premium và thương hiệu cần định vị độc bản.",
    structure: [
      { layoutId: "L01_COVER", title: "Bìa điện ảnh huyền bí" },
      { layoutId: "L04_HERO_PRODUCT", title: "Tác phẩm spotlight chủ đạo" },
      { layoutId: "L06_PRODUCT_DETAIL", title: "Chi tiết & Thông số kỹ thuật" },
      { layoutId: "L08_CLOSING", title: "Kết nối VIP & Đặt hàng riêng" },
    ],
  },
}

export const CATALOG_TEMPLATE_LIST = Object.values(CATALOG_TEMPLATES)
