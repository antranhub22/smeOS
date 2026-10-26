"use client"

import React, { useMemo } from "react"
import { Phone, Share2, MapPin, Flower2 } from "lucide-react"
import { CatalogPdfExportButton } from "./studio/catalog-pdf-export-button"
import type {
  CatalogTemplateId,
  CatalogStyleId,
  CatalogProductItem,
  BrandProfile,
} from "@/modules/catalog-studio/domain/entities/catalog-studio.types"
import { resolveCatalogBrief } from "@/modules/catalog-studio/use-cases/resolve-catalog-brief"
import type { PublicCatalogProduct } from "@/modules/catalog-links/use-cases/get-public-catalog"

interface CatalogStorefrontHeaderProps {
  shop: {
    id?: string
    name: string
    logoUrl?: string | null
    phone?: string | null
    address?: string | null
  }
  catalog: {
    id?: string
    name: string
    description?: string | null
    filters?: Record<string, unknown> | null
  }
  products: PublicCatalogProduct[]
  onOpenShareModal: () => void
}

export function CatalogStorefrontHeader({
  shop,
  catalog,
  products,
  onOpenShareModal,
}: CatalogStorefrontHeaderProps) {
  const studioProducts: CatalogProductItem[] = useMemo(() => {
    return products.map((p, idx) => ({
      productId: p.id,
      name: p.name,
      code: p.code || p.id,
      category: p.category,
      primaryImage: p.imageUrl || null,
      price: p.price ?? null,
      currency: "VND",
      sortOrder: idx + 1,
      status: "ACTIVE",
    }))
  }, [products])

  const brandProfile: BrandProfile = useMemo(() => ({
    brandId: shop.id || "shop",
    name: shop.name,
    slogan: catalog.description || "Bộ Sưu Tập Tinh Tuyển 2026",
    brandColors: { primary: "#9A3412" },
    contacts: {
      phone: shop.phone || null,
      hotline: shop.phone || null,
      zalo: shop.phone || null,
      address: shop.address || null,
    },
  }), [shop, catalog])

  const resolvedCatalog = useMemo(() => {
    const filters = (catalog.filters as Record<string, unknown>) || {}
    const templateId = (filters.template_id as CatalogTemplateId) || "T01_SIGNATURE_COLLECTION"
    const styleId = (filters.style_id as CatalogStyleId) || "S01_EDITORIAL_MAGAZINE"

    return resolveCatalogBrief(
      {
        catalogId: catalog.id || "catalog",
        title: catalog.name,
        purpose: "COLLECTION",
        audience: "CONSUMER",
        language: "vi-VN",
        styleId,
        templateId,
        pageSize: "A4_PORTRAIT",
        outputProfile: "DIGITAL_PDF",
        brandId: brandProfile.brandId,
        productIds: studioProducts.map((p) => p.productId),
      },
      brandProfile,
      studioProducts
    )
  }, [catalog, brandProfile, studioProducts])

  return (
    <header className="sticky top-0 z-40 bg-surface/90 backdrop-blur-md border-b border-border shadow-xs">
      <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          {shop.logoUrl ? (
            <img src={shop.logoUrl} alt={shop.name} className="w-10 h-10 rounded-full object-cover border border-border" />
          ) : (
            <div className="w-10 h-10 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-primary font-bold">
              <Flower2 size={20} />
            </div>
          )}
          <div>
            <div className="text-sm font-extrabold text-text leading-tight">{shop.name}</div>
            {shop.address && (
              <div className="text-caption text-text-muted flex items-center gap-1 mt-0.5 line-clamp-1">
                <MapPin size={11} className="shrink-0 text-primary" />
                {shop.address}
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Nút xuất PDF chuẩn A4 Universal Catalog Studio */}
          <CatalogPdfExportButton
            pages={resolvedCatalog.pages}
            style={resolvedCatalog.style}
            brand={resolvedCatalog.brand}
            catalogTitle={catalog.name}
            variant="outline"
            size="sm"
            className="text-xs rounded-full h-8 px-3"
          />

          <button
            onClick={onOpenShareModal}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-primary/10 text-primary hover:bg-primary/15 transition-colors"
          >
            <Share2 size={14} />
            <span>Chia sẻ</span>
          </button>

          {shop.phone && (
            <a
              href={`tel:${shop.phone}`}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-primary text-white hover:bg-primary-dark shadow-sm transition-colors"
            >
              <Phone size={13} />
              <span className="hidden sm:inline">{shop.phone}</span>
            </a>
          )}
        </div>
      </div>
    </header>
  )
}
