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
    subtitle: brief.coverCopy?.subtitle || brand.slogan || brand.name,
    heroImage: primaryHeroImage,
    products: [],
    styleId: style.id,
  })

  // 2. Page: Brand Story (L02)
  if (template.structure.some((s) => s.layoutId === "L02_BRAND_STORY")) {
    pages.push({
      pageNumber: currentPage++,
      layoutId: "L02_BRAND_STORY",
      title: "Câu chuyện của tiệm",
      subtitle: brief.title,
      heroImage: activeProducts[1]?.primaryImage || primaryHeroImage,
      contentBlock: {
        heading: `Về ${brand.name}`,
        body:
          brand.description ||
          `Bộ sưu tập "${brief.title}" gồm những mẫu ${brand.name} chọn theo màu và kiểu dáng dễ tặng. Cần đổi tông màu hay thêm thiệp, cứ liên hệ tiệm.`,
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
      title: "Mẫu nổi bật",
      subtitle: heroProd.name,
      heroImage: heroProd.primaryImage,
      contentBlock: {
        heading: heroProd.name,
        body: heroProd.shortDescription || heroProd.description || "",
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
      title: totalGridPages > 1 ? `Các mẫu trong bộ sưu tập (${i + 1}/${totalGridPages})` : "Các mẫu trong bộ sưu tập",
      subtitle: brief.title,
      products: pageSlice,
      styleId: style.id,
    })
  }

  // 5. Page: Closing (L08)
  pages.push({
    pageNumber: currentPage++,
    layoutId: "L08_CLOSING",
    title: "Đặt hoa",
    subtitle: brief.title,
    contentBlock: {
      heading: "Cảm ơn bạn đã xem bộ sưu tập",
      body:
        brief.closingCopy?.thankYouNote ||
        "Chọn mẫu bạn thích, gửi mã mẫu cho tiệm qua điện thoại hoặc Zalo để được xác nhận.",
      // Chính sách chỉ in khi tiệm tự nhập — không tự hứa hóa đơn/giao đúng hẹn
      ...(brief.closingCopy?.policyNote ? { quote: brief.closingCopy.policyNote } : {}),
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
