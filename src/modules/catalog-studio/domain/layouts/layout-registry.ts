/**
 * Universal Catalog Studio 2026 — 8 Layout Definitions (L01–L08).
 * Pure Domain — Zero ORM.
 */

import type { CatalogLayoutId, LayoutDefinition } from "../entities/catalog-studio.types"

export const CATALOG_LAYOUTS: Record<CatalogLayoutId, LayoutDefinition> = {
  L01_COVER: {
    id: "L01_COVER",
    name: "Trang bìa",
    description: "Trang bìa chính của bộ sưu tập với tên catalog, logo, ảnh chủ đạo (hero) và slogan.",
    requiredFields: ["title"],
    optionalFields: ["subtitle", "logo", "heroImage", "badge", "seasonYear"],
    gridColumns: 1,
    maxProductsPerPage: 0,
    overflowBehavior: "SCALE_DOWN",
  },

  L02_BRAND_STORY: {
    id: "L02_BRAND_STORY",
    name: "Câu chuyện thương hiệu",
    description: "Giới thiệu triết lý chế tác, nguồn gốc nguyên liệu và thông điệp gửi gắm.",
    requiredFields: ["heading", "body"],
    optionalFields: ["quote", "heroImage", "authorName"],
    gridColumns: 1,
    maxProductsPerPage: 0,
    overflowBehavior: "TRUNCATE",
  },

  L03_COLLECTION_DIVIDER: {
    id: "L03_COLLECTION_DIVIDER",
    name: "Phân chương",
    description: "Trang chuyển mục / chủ đề mới với tiêu đề lớn và ảnh đại diện chương.",
    requiredFields: ["title"],
    optionalFields: ["subtitle", "heroImage"],
    gridColumns: 1,
    maxProductsPerPage: 0,
    overflowBehavior: "SCALE_DOWN",
  },

  L04_HERO_PRODUCT: {
    id: "L04_HERO_PRODUCT",
    name: "Tác phẩm chủ đạo",
    description: "Trưng bày 1 sản phẩm nổi bật nhất trang với ảnh cực đại và lời tự sự chi tiết.",
    requiredFields: ["product"],
    optionalFields: ["curatorNote", "attributes", "qrTarget"],
    gridColumns: 1,
    maxProductsPerPage: 1,
    overflowBehavior: "SCALE_DOWN",
  },

  L05_PRODUCT_GRID: {
    id: "L05_PRODUCT_GRID",
    name: "Lưới sản phẩm",
    description: "Bố cục lưới sản phẩm cân đối (2 đến 6 sản phẩm/trang) với thông tin tên, mã và giá.",
    requiredFields: ["products"],
    optionalFields: ["categoryBadge", "unit"],
    gridColumns: 2,
    maxProductsPerPage: 6,
    overflowBehavior: "PAGINATE",
  },

  L06_PRODUCT_DETAIL: {
    id: "L06_PRODUCT_DETAIL",
    name: "Chi tiết sản phẩm",
    description: "Hiển thị 1–2 sản phẩm kèm ảnh chi tiết, phân tích nguyên liệu và bảng thông số.",
    requiredFields: ["product"],
    optionalFields: ["galleryImages", "attributes", "variants"],
    gridColumns: 2,
    maxProductsPerPage: 2,
    overflowBehavior: "PAGINATE",
  },

  L07_BUNDLE: {
    id: "L07_BUNDLE",
    name: "Gói quà tặng",
    description: "Trang combo quà tặng phối hợp nhiều thành phần với giá ưu đãi đặc biệt.",
    requiredFields: ["products", "bundlePrice"],
    optionalFields: ["discountBadge", "componentsList"],
    gridColumns: 2,
    maxProductsPerPage: 4,
    overflowBehavior: "SCALE_DOWN",
  },

  L08_CLOSING: {
    id: "L08_CLOSING",
    name: "Trang kết & đặt hàng",
    description: "Trang kết thúc với thông tin liên hệ, hotline, địa chỉ, website và mã QR quét đặt hàng.",
    requiredFields: ["contacts"],
    optionalFields: ["qrTarget", "policyNote", "thankYouNote"],
    gridColumns: 1,
    maxProductsPerPage: 0,
    overflowBehavior: "SCALE_DOWN",
  },
}
