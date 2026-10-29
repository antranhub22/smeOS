"use client"

import React, { useState, useMemo } from "react"
import { AlertCircle } from "lucide-react"
import type { PublicCatalogResult, PublicCatalogProduct } from "@/modules/catalog-links/use-cases/get-public-catalog"
import type { GeneratedLandingPackage } from "@/modules/content-engine/domain/landing-content-generator"
import { ProductDetailModal } from "./product-detail-modal"
import { ShareCatalogModal } from "./share-catalog-modal"
import { CatalogStorefrontHeader } from "./catalog-storefront-header"
import {
  LandingTemplateHero,
  LandingTemplateStory,
  LandingTemplatePerks,
  LandingTemplateProcess,
  LandingTemplateReviews,
  LandingTemplateFaq,
  LandingTemplateLead,
  LandingTemplateVideo,
  LandingTemplateGallery,
} from "./landing-templates"
import { resolveFlowerImage } from "./flower-image-fallback"
import type { GalleryPhotoItem } from "./landing-templates/landing-template-gallery"
import { CatalogProductListView } from "./catalog-product-list-view"
import { CATALOG_STYLES } from "@/modules/catalog-studio/domain/styles/style-registry"
import { CATALOG_TEMPLATES } from "@/modules/catalog-studio/domain/templates/template-registry"
import { CatalogStorefrontHero } from "./catalog-storefront-hero"
import { CatalogStorefrontToolbar } from "./catalog-storefront-toolbar"

const EMPTY_PRODUCTS: PublicCatalogProduct[] = []

export interface CatalogStorefrontProps {
  initialData: PublicCatalogResult
}

export function CatalogStorefront({ initialData }: CatalogStorefrontProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedOccasion, setSelectedOccasion] = useState<string>("all")
  const [selectedProduct, setSelectedProduct] = useState<PublicCatalogProduct | null>(null)
  const [showShareModal, setShowShareModal] = useState(false)

  const templateId = (initialData.status === "ACTIVE" && initialData.templateId) || "T01_SIGNATURE_COLLECTION"
  const styleId = (initialData.status === "ACTIVE" && initialData.styleId) || "S01_EDITORIAL_MAGAZINE"
  const currentStyle = CATALOG_STYLES[styleId] || CATALOG_STYLES.S01_EDITORIAL_MAGAZINE
  const currentTemplate = CATALOG_TEMPLATES[templateId] || CATALOG_TEMPLATES.T01_SIGNATURE_COLLECTION

  const defaultLayout: "grid" | "lookbook" | "compact" = useMemo(() => {
    if (templateId === "T02_MINIMAL_PRODUCT_LIST") return "compact"
    if (["T01_SIGNATURE_COLLECTION", "T03_PREMIUM_LOOKBOOK", "T05_DARK_CINEMATIC"].includes(templateId)) return "lookbook"
    return "grid"
  }, [templateId])

  const [catalogStyle, setCatalogStyle] = useState<"grid" | "lookbook" | "compact">(defaultLayout)

  const products = initialData.status === "ACTIVE" ? initialData.products : EMPTY_PRODUCTS
  const allOccasions = useMemo(() => {
    const occs = new Set<string>()
    for (const p of products) for (const occ of p.occasions) if (occ) occs.add(occ)
    return Array.from(occs)
  }, [products])

  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const matchSearch =
        searchQuery.trim() === "" ||
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.code.toLowerCase().includes(searchQuery.toLowerCase())
      return matchSearch && (selectedOccasion === "all" || p.occasions.includes(selectedOccasion))
    })
  }, [products, searchQuery, selectedOccasion])

  if (initialData.status === "REVOKED") {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-surface rounded-3xl p-8 border border-border shadow-xl text-center flex flex-col items-center">
          <div className="w-16 h-16 rounded-2xl bg-warning-bg text-warning flex items-center justify-center mb-4">
            <AlertCircle size={32} />
          </div>
          <h1 className="text-xl font-black text-text mb-2">Bộ sưu tập đã đóng</h1>
          <p className="text-sm text-text-muted leading-relaxed mb-6">
            Bộ sưu tập <span className="font-semibold text-text">&quot;{initialData.catalogName}&quot;</span> đã tạm ngừng chia sẻ.
          </p>
          <div className="p-4 rounded-2xl bg-surface-alt border border-border text-xs text-text-muted w-full">
            Vui lòng liên hệ trực tiếp với cửa hàng để được tư vấn danh mục mới nhất.
          </div>
        </div>
      </div>
    )
  }

  if (initialData.status === "NOT_FOUND") {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-surface rounded-3xl p-8 border border-border shadow-xl text-center">
          <h1 className="text-xl font-black text-text mb-2">Không tìm thấy danh mục</h1>
          <p className="text-sm text-text-muted">Đường dẫn catalog này không tồn tại hoặc đã bị gỡ bỏ.</p>
        </div>
      </div>
    )
  }

  const { catalog, shop } = initialData
  const campaign = initialData.campaignConfig
  const customHeroImageUrl = campaign?.customHeroImageUrl as string | undefined
  const videoUrl = campaign?.videoUrl as string | undefined
  const generatedPackage = campaign?.generatedPackage as GeneratedLandingPackage | undefined
  const enabledSections = campaign?.enabledSections as Record<string, boolean> | undefined

  const realProductImageUrls = products
    .map((p) => p.imageUrl)
    .filter((url): url is string =>
      typeof url === "string" && url.trim().length > 0 && !url.startsWith("blob:") && !url.startsWith("data:")
    )

  const galleryPhotos: GalleryPhotoItem[] = products
    .filter((p): p is typeof p & { imageUrl: string } =>
      typeof p.imageUrl === "string" && p.imageUrl.trim().length > 0 &&
      !p.imageUrl.startsWith("blob:") && !p.imageUrl.startsWith("data:")
    )
    .map((p) => ({ src: p.imageUrl, title: p.name, caption: p.category ?? "Sản phẩm tuyển chọn" }))

  const storyImageUrl = realProductImageUrls[0] ?? null

  return (
    <div
      className="min-h-screen antialiased transition-colors pb-16"
      style={{ backgroundColor: currentStyle.tokens.background, color: currentStyle.tokens.textPrimary }}
    >
      <CatalogStorefrontHeader
        shop={shop}
        catalog={catalog}
        products={products}
        onOpenShareModal={() => setShowShareModal(true)}
        style={currentStyle}
        templateId={templateId}
        styleId={styleId}
      />

      <div className="max-w-4xl mx-auto px-4 pt-6 space-y-6">
        {/* Hero */}
        {campaign ? (
          <LandingTemplateHero
            headline={catalog.name}
            occasionId={campaign.occasion || "20-10"}
            archetypeId={campaign.archetype || "minimal-luxury"}
            heroImageUrl={customHeroImageUrl || resolveFlowerImage(products.find((p) => p.imageUrl)?.imageUrl, 0)}
          />
        ) : (
          <CatalogStorefrontHero
            catalogName={catalog.name}
            catalogDescription={catalog.description}
            style={currentStyle}
            template={currentTemplate}
            customerName={initialData.customer?.name ?? null}
            brandName={shop.name}
            productCount={products.length}
          />
        )}

        {campaign && videoUrl && (
          <LandingTemplateVideo videoUrl={videoUrl} archetypeId={campaign.archetype} title="Video Cận Cảnh Mẫu Thực Tế" />
        )}

        {campaign && enabledSections?.story !== false && generatedPackage?.story && storyImageUrl && (
          <LandingTemplateStory story={generatedPackage.story} archetypeId={campaign.archetype} storyImageUrl={storyImageUrl} />
        )}

        {/* Filter & Layout Toolbar */}
        <CatalogStorefrontToolbar
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          catalogStyle={catalogStyle}
          onStyleChange={setCatalogStyle}
          selectedOccasion={selectedOccasion}
          onOccasionChange={setSelectedOccasion}
          allOccasions={allOccasions}
          totalCount={products.length}
          hasCampaign={!!campaign}
          style={currentStyle}
        />

        {/* Products Grid */}
        <CatalogProductListView
          products={filteredProducts}
          catalogStyle={catalogStyle}
          shop={shop}
          style={currentStyle}
          onSelectProduct={(p) => setSelectedProduct(p)}
          onResetFilter={() => { setSearchQuery(""); setSelectedOccasion("all") }}
        />

        {campaign && enabledSections?.perks !== false && generatedPackage?.perks && (
          <LandingTemplatePerks perks={generatedPackage.perks} archetypeId={campaign.archetype} />
        )}
        {campaign && enabledSections?.process !== false && generatedPackage?.steps && (
          <LandingTemplateProcess steps={generatedPackage.steps} archetypeId={campaign.archetype} />
        )}
        {campaign && enabledSections?.gallery !== false && galleryPhotos.length > 0 && (
          <LandingTemplateGallery archetypeId={campaign.archetype} photos={galleryPhotos} />
        )}
        {campaign && enabledSections?.reviews !== false && (
          <LandingTemplateReviews archetypeId={campaign.archetype} />
        )}
        {campaign && enabledSections?.faq !== false && generatedPackage?.faq && (
          <LandingTemplateFaq faq={generatedPackage.faq} archetypeId={campaign.archetype} />
        )}
        {campaign && enabledSections?.lead !== false && (
          <LandingTemplateLead
            archetypeId={campaign.archetype || "minimal-luxury"}
            occasionTitle={catalog.name}
            catalogSlug={catalog.slug}
            lead={generatedPackage?.lead}
          />
        )}
      </div>

      {selectedProduct && (
        <ProductDetailModal
          product={selectedProduct}
          shop={shop}
          customer={initialData.customer}
          onClose={() => setSelectedProduct(null)}
        />
      )}
      {showShareModal && (
        <ShareCatalogModal
          slug={catalog.slug}
          name={catalog.name}
          description={catalog.description}
          onClose={() => setShowShareModal(false)}
        />
      )}
      <footer
        className="mt-12 text-center text-xs max-w-4xl mx-auto px-4"
        style={{ color: currentStyle.tokens.textSecondary }}
      >
        <div className="border-t pt-6" style={{ borderColor: currentStyle.tokens.border }}>
          <p className="font-medium">{shop.name} — Nền tảng Catalog Đa ngành Thông minh smeOS</p>
        </div>
      </footer>
    </div>
  )
}
