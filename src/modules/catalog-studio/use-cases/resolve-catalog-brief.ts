/**
 * Universal Catalog Studio 2026 — Resolve Catalog Brief Use Case.
 * Transforms raw inputs into concrete paginated CatalogPageModels.
 * Pure TypeScript — Clean Architecture.
 */

import type {
  CatalogBrief,
  BrandProfile,
  CatalogProductItem,
  CatalogPageModel,
  StyleDefinition,
  CatalogTemplatePrototype,
  ValidationIssue,
} from "../domain/entities/catalog-studio.types"
import { CATALOG_STYLES } from "../domain/styles/style-registry"
import { CATALOG_TEMPLATES } from "../domain/templates/template-registry"
import { validateCatalogBrief } from "../domain/validation/catalog-validator"

export interface ResolvedCatalogResult {
  brief: CatalogBrief
  brand: BrandProfile
  style: StyleDefinition
  template: CatalogTemplatePrototype
  pages: CatalogPageModel[]
  issues: ValidationIssue[]
  isExportReady: boolean
}

export function resolveCatalogBrief(
  brief: CatalogBrief,
  brand: BrandProfile,
  products: CatalogProductItem[]
): ResolvedCatalogResult {
  const issues = validateCatalogBrief(brief, products)
  const isExportReady = !issues.some((i) => i.severity === "BLOCKING")

  // Resolve Template & Style
  const templateId = brief.templateId || "T01_SIGNATURE_COLLECTION"
  const template = CATALOG_TEMPLATES[templateId] || CATALOG_TEMPLATES.T01_SIGNATURE_COLLECTION
  const styleId = brief.styleId || template.defaultStyleId
  const style = CATALOG_STYLES[styleId] || CATALOG_STYLES.S01_EDITORIAL_MAGAZINE

  const pages: CatalogPageModel[] = []
  let currentPage = 1

  const activeProducts = products.filter((p) => p.status === "ACTIVE")
  const primaryHeroImage = activeProducts.find((p) => p.primaryImage)?.primaryImage || null

  // 1. Page: Cover (L01)
  pages.push({
    pageNumber: currentPage++,
    layoutId: "L01_COVER",
    title: brief.title,
    subtitle: brief.coverCopy?.subtitle || brand.slogan || "Bộ Sưu Tập Tinh Tuyển",
    heroImage: primaryHeroImage,
    products: [],
    styleId: style.id,
  })

  // 2. Page: Brand Story (L02)
  if (template.structure.some((s) => s.layoutId === "L02_BRAND_STORY")) {
    pages.push({
      pageNumber: currentPage++,
      layoutId: "L02_BRAND_STORY",
      title: "Triết Lý & Nghệ Thuật Chế Tác",
      subtitle: brand.name,
      heroImage: activeProducts[1]?.primaryImage || primaryHeroImage,
      contentBlock: {
        heading: `Tuyển tập tinh hoa từ ${brand.name}`,
        body:
          brand.description ||
          `Mỗi tác phẩm trong bộ sưu tập "${brief.title}" đều được chăm chút tỉ mỉ từ những nguyên liệu tuyển chọn khắt khe nhất, gửi gắm trọn vẹn cảm xúc và thẩm mỹ thanh lịch đến người nhận.`,
        quote: "Nơi vẻ đẹp và sự tinh tế giao hòa trong từng chi tiết độc bản.",
      },
      products: [],
      styleId: style.id,
    })
  }

  // 3. Page: Hero Product (L04) if template has it
  if (template.structure.some((s) => s.layoutId === "L04_HERO_PRODUCT") && activeProducts.length > 0) {
    const heroProd = activeProducts[0]!
    pages.push({
      pageNumber: currentPage++,
      layoutId: "L04_HERO_PRODUCT",
      title: "Tác Phẩm Chủ Đạo",
      subtitle: heroProd.name,
      heroImage: heroProd.primaryImage,
      contentBlock: {
        heading: heroProd.name,
        body: heroProd.shortDescription || heroProd.description || "Tác phẩm tiêu biểu đại diện cho phong cách thiết kế độc bản của bộ sưu tập.",
      },
      products: [heroProd],
      styleId: style.id,
    })
  }

  // 4. Pages: Product Grid (L05)
  // For T01, show remaining or all; for T02 show all with 4 per page
  const gridProducts =
    template.structure.some((s) => s.layoutId === "L04_HERO_PRODUCT") && activeProducts.length > 1
      ? activeProducts.slice(1)
      : activeProducts

  const itemsPerPage = style.id === "S02_PURE_MINIMAL" ? 6 : 4
  const totalGridPages = Math.ceil(Math.max(1, gridProducts.length) / itemsPerPage)

  for (let i = 0; i < totalGridPages; i++) {
    const pageSlice = gridProducts.slice(i * itemsPerPage, (i + 1) * itemsPerPage)
    pages.push({
      pageNumber: currentPage++,
      layoutId: "L05_PRODUCT_GRID",
      title: totalGridPages > 1 ? `Danh Mục Sản Phẩm (${i + 1}/${totalGridPages})` : "Danh Mục Sản Phẩm",
      subtitle: brief.title,
      products: pageSlice,
      styleId: style.id,
    })
  }

  // 5. Page: Closing (L08)
  pages.push({
    pageNumber: currentPage++,
    layoutId: "L08_CLOSING",
    title: "Thông Tin & Đặt Hàng",
    subtitle: brand.name,
    contentBlock: {
      heading: "Trân trọng cảm ơn quý khách",
      body:
        brief.closingCopy?.thankYouNote ||
        "Chúng tôi hân hạnh đồng hành cùng quý khách tạo nên những khoảnh khắc đáng nhớ và ý nghĩa nhất.",
      quote: brief.closingCopy?.policyNote || "Hỗ trợ xuất hóa đơn VAT điện tử • Giao hàng chuyên nghiệp đúng hẹn.",
    },
    products: [],
    styleId: style.id,
  })

  return {
    brief,
    brand,
    style,
    template,
    pages,
    issues,
    isExportReady,
  }
}
