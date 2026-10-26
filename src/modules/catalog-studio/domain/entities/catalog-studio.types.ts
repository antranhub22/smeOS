/**
 * Universal Catalog Studio 2026 — Core Domain Entities & Types.
 * Pure TypeScript — Zero ORM, Zero Infrastructure dependencies.
 */

export type IndustryGroup = "G1_VISUAL" | "G2_LIFESTYLE" | "G3_BEAUTY" | "G4_FOOD" | "G5_TECHNICAL" | "G6_ASSORTMENT"

export type PageSize = "A4_PORTRAIT" | "A4_LANDSCAPE" | "SQUARE_210"

export type OutputProfile = "DIGITAL_PDF" | "PRINT_READY_PDF" | "INTERACTIVE_WEB"

export interface BrandProfile {
  brandId: string
  name: string
  logoUrl?: string | null
  slogan?: string | null
  brandColors: {
    primary?: string | null
    secondary?: string | null
    accent?: string | null
    background?: string | null
  }
  approvedFonts?: string[] | null
  description?: string | null
  contacts: {
    phone?: string | null
    hotline?: string | null
    zalo?: string | null
    address?: string | null
    email?: string | null
  }
  websiteUrl?: string | null
  socialLinks?: {
    facebook?: string | null
    instagram?: string | null
    tiktok?: string | null
  } | null
}

export interface CatalogBrief {
  catalogId: string
  title: string
  purpose: "COLLECTION" | "SEASONAL" | "LOOKBOOK" | "B2B_PRICE_LIST" | "EVENT"
  audience: "CONSUMER" | "CORPORATE" | "VIP"
  language: string
  styleId: CatalogStyleId
  templateId?: CatalogTemplateId | null
  pageSize: PageSize
  outputProfile: OutputProfile
  brandId: string
  productIds: string[]
  chapterOrder?: string[] | null
  coverCopy?: {
    subtitle?: string | null
    badge?: string | null
    seasonYear?: string | null
  } | null
  closingCopy?: {
    thankYouNote?: string | null
    policyNote?: string | null
  } | null
}

export interface CatalogProductItem {
  productId: string
  name: string
  code: string
  category?: string | null
  primaryImage: string | null
  galleryImages?: string[]
  shortDescription?: string | null
  description?: string | null
  price: number | null
  currency: string
  unit?: string | null
  variants?: Array<{
    id: string
    name: string
    priceDelta?: number | null
  }>
  attributes?: Record<string, unknown>
  productUrl?: string | null
  qrTarget?: string | null
  sortOrder: number
  status: "ACTIVE" | "DRAFT" | "ARCHIVED"
}

export type CatalogStyleId =
  | "S01_EDITORIAL_MAGAZINE"
  | "S02_PURE_MINIMAL"
  | "S03_QUIET_LUXURY"
  | "S04_BOLD_POP"
  | "S05_ORGANIC_NATURAL"
  | "S06_BOTANICAL_ATELIER"
  | "S07_SWISS_GRID"
  | "S08_BENTO_GALLERY"
  | "S09_MODERN_RETRO"
  | "S10_PLAYFUL_ILLUSTRATION"
  | "S11_DARK_SHOWCASE"
  | "S12_MODERN_COMMERCE"

export type CatalogLayoutId =
  | "L01_COVER"
  | "L02_BRAND_STORY"
  | "L03_COLLECTION_DIVIDER"
  | "L04_HERO_PRODUCT"
  | "L05_PRODUCT_GRID"
  | "L06_PRODUCT_DETAIL"
  | "L07_BUNDLE"
  | "L08_CLOSING"

export type CatalogTemplateId =
  | "T01_SIGNATURE_COLLECTION"
  | "T02_MINIMAL_PRODUCT_LIST"
  | "T03_PREMIUM_LOOKBOOK"

export interface StyleDesignTokens {
  background: string
  surface: string
  textPrimary: string
  textSecondary: string
  accent: string
  border: string
  price: string
  badgeBg: string
  badgeText: string
}

export interface StyleTypography {
  fontDisplay: string
  fontBody: string
  fontAccent: string
  scale: {
    cover: string
    title: string
    heading: string
    subheading: string
    productName: string
    body: string
    caption: string
  }
}

export interface StyleDefinition {
  id: CatalogStyleId
  number: string
  name: string
  subtitle: string
  description: string
  visualLanguage: string
  recommendedIndustries: IndustryGroup[]
  preferredLayouts: CatalogLayoutId[]
  avoidPractices: string
  tokens: StyleDesignTokens
  typography: StyleTypography
  imageRules: {
    aspectRatio: "1:1" | "4:5" | "3:4" | "16:9"
    fitMode: "cover" | "contain"
    hasBorder: boolean
    borderRadius: string
    shadow: string
  }
  decorationRules: {
    showHairline: boolean
    hasGlassmorphism: boolean
    patternType?: "none" | "botanical" | "geometric" | "dots" | "hand_drawn"
  }
}

export interface LayoutDefinition {
  id: CatalogLayoutId
  name: string
  description: string
  requiredFields: string[]
  optionalFields: string[]
  gridColumns: number
  maxProductsPerPage: number
  overflowBehavior: "PAGINATE" | "TRUNCATE" | "SCALE_DOWN"
}

export interface CatalogTemplatePrototype {
  id: CatalogTemplateId
  name: string
  subtitle: string
  badge: string
  defaultStyleId: CatalogStyleId
  description: string
  recommendedFor: string
  structure: Array<{
    layoutId: CatalogLayoutId
    title: string
    description?: string
  }>
}

export type ValidationSeverity = "BLOCKING" | "WARNING" | "SUGGESTION"

export interface ValidationIssue {
  severity: ValidationSeverity
  code: string
  message: string
  entityId?: string | null
  suggestedFix?: string | null
}

export interface CatalogPageModel {
  pageNumber: number
  layoutId: CatalogLayoutId
  title?: string
  subtitle?: string
  heroImage?: string | null
  contentBlock?: {
    heading?: string
    body?: string
    quote?: string
  }
  products: CatalogProductItem[]
  styleId: CatalogStyleId
}
