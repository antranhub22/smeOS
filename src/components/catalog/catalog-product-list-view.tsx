"use client"

import React from "react"
import { Check, ShoppingBag, MessageCircle } from "lucide-react"
import type { PublicCatalogProduct, PublicCatalogShop } from "@/modules/catalog-links/use-cases/get-public-catalog"
import { formatVnd, getZaloUrl } from "./product-detail-modal"
import { SmartFlowerImage } from "./smart-flower-image"
import type { StyleDefinition } from "@/modules/catalog-studio/domain/entities/catalog-studio.types"
import { CatalogCardOverlay } from "./cards/catalog-card-overlay"
import { CatalogCardPaper } from "./cards/catalog-card-paper"
import { CatalogCardGlass } from "./cards/catalog-card-glass"

interface CatalogProductListViewProps {
  products: PublicCatalogProduct[]
  catalogStyle: "grid" | "lookbook" | "compact"
  shop: PublicCatalogShop
  style?: StyleDefinition | undefined
  onSelectProduct: (product: PublicCatalogProduct) => void
  onResetFilter: () => void
}

export function CatalogProductListView({
  products,
  catalogStyle,
  shop,
  style,
  onSelectProduct,
  onResetFilter,
}: CatalogProductListViewProps) {
  const fontDisplay = style?.typography.fontDisplay || ""
  const accentColor = style?.tokens.accent || "#9A3412"
  const priceColor = style?.tokens.price || accentColor
  const surfaceStyle = style ? { backgroundColor: style.tokens.surface, borderColor: style.tokens.border } : {}
  const textPrimaryStyle = style ? { color: style.tokens.textPrimary } : {}
  const textSecondaryStyle = style ? { color: style.tokens.textSecondary } : {}

  const infoMode = style?.imageRules.infoMode || "paper"

  const renderProductCard = (p: PublicCatalogProduct, idx: number, aspect: "square" | "4/5" = "square") => {
    if (infoMode === "overlay") {
      return (
        <CatalogCardOverlay
          key={p.id}
          product={p}
          index={idx}
          shop={shop}
          style={style}
          onSelectProduct={onSelectProduct}
        />
      )
    }

    if (infoMode === "glass") {
      return (
        <CatalogCardGlass
          key={p.id}
          product={p}
          index={idx}
          shop={shop}
          style={style}
          onSelectProduct={onSelectProduct}
        />
      )
    }

    // Default to paper mode (Editorial, Minimal, Quiet Luxury, etc.)
    return (
      <CatalogCardPaper
        key={p.id}
        product={p}
        index={idx}
        shop={shop}
        style={style}
        aspectRatio={aspect}
        onSelectProduct={onSelectProduct}
      />
    )
  }

  return (
    <main>
      <div className="flex items-center justify-between text-xs text-text-muted mb-3 px-1">
        <span style={textSecondaryStyle}>
          Hiển thị <strong>{products.length}</strong> sản phẩm
        </span>
        <span className="flex items-center gap-1 font-medium" style={{ color: accentColor }}>
          <Check size={13} />
          Sản phẩm tuyển chọn chính hãng
        </span>
      </div>

      {products.length === 0 ? (
        <div
          style={surfaceStyle}
          className="rounded-3xl p-12 text-center border shadow-xs my-6"
        >
          <ShoppingBag size={40} className="mx-auto text-text-muted mb-3" />
          <h3 className={`text-base font-bold ${fontDisplay}`} style={textPrimaryStyle}>
            Không tìm thấy sản phẩm phù hợp
          </h3>
          <p className="text-xs text-text-muted mt-1 max-w-sm mx-auto" style={textSecondaryStyle}>
            Hãy thử từ khóa khác hoặc bấm nút bên dưới để xem lại toàn bộ danh mục.
          </p>
          <button
            onClick={onResetFilter}
            style={{ backgroundColor: style?.tokens.ctaBg || accentColor, color: style?.tokens.ctaText || "#FFFFFF" }}
            className="mt-4 px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-sm active:scale-95"
          >
            Xem lại tất cả
          </button>
        </div>
      ) : catalogStyle === "lookbook" ? (
        /* Editorial Lookbook Style — 2 columns with 4/5 aspect ratio */
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {products.map((p, idx) => renderProductCard(p, idx, "4/5"))}
        </div>
      ) : catalogStyle === "compact" ? (
        /* Compact List Style */
        <div className="space-y-2.5">
          {products.map((p, idx) => (
            <div
              key={p.id}
              style={surfaceStyle}
              className="p-3.5 rounded-2xl bg-surface border shadow-xs flex items-center justify-between gap-3 hover:border-primary transition-all"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div
                  className="w-14 h-14 rounded-xl bg-surface-alt overflow-hidden shrink-0 border"
                  style={{ borderColor: style?.tokens.border || undefined }}
                >
                  <SmartFlowerImage
                    src={p.imageUrl}
                    alt={p.name}
                    aspectRatio="square"
                    fallbackIndex={idx}
                    fitMode={style?.imageRules.fitMode || "cover"}
                    blendMode={style?.imageRules.blendMode}
                    imageFilter={style?.tokens.photoFilter}
                  />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-caption font-mono font-bold text-text-muted">{p.code}</span>
                    <h4 className={`text-xs font-bold truncate ${fontDisplay}`} style={textPrimaryStyle}>
                      {p.name}
                    </h4>
                  </div>
                  <div className="text-caption mt-0.5 truncate" style={textSecondaryStyle}>
                    {p.category || "Sản phẩm chọn lọc"}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3 shrink-0">
                <div className="text-right">
                  <div className="text-caption text-text-muted" style={textSecondaryStyle}>
                    Giá
                  </div>
                  <div className="text-xs font-black" style={{ color: priceColor }}>
                    {formatVnd(p.price)}
                  </div>
                </div>
                <a
                  href={getZaloUrl(p, shop)}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ backgroundColor: `${accentColor}18`, color: accentColor }}
                  className="p-2 rounded-xl transition-colors"
                  title="Đặt Zalo"
                >
                  <MessageCircle size={16} />
                </a>
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* Standard Grid Style — 1, 2, or 3 columns based on screen width */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {products.map((p, idx) => renderProductCard(p, idx, "square"))}
        </div>
      )}
    </main>
  )
}
