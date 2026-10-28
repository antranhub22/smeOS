"use client"

import React from "react"
import { MessageCircle } from "lucide-react"
import type { PublicCatalogProduct, PublicCatalogShop } from "@/modules/catalog-links/use-cases/get-public-catalog"
import type { StyleDefinition } from "@/modules/catalog-studio/domain/entities/catalog-studio.types"
import { SmartFlowerImage } from "../smart-flower-image"
import { formatVnd, getZaloUrl } from "../product-detail-modal"

interface CatalogCardGlassProps {
  product: PublicCatalogProduct
  index: number
  shop: PublicCatalogShop
  style?: StyleDefinition | undefined
  onSelectProduct: (product: PublicCatalogProduct) => void
}

export function CatalogCardGlass({
  product,
  index,
  shop,
  style,
  onSelectProduct,
}: CatalogCardGlassProps) {
  const fontDisplay = style?.typography.fontDisplay || ""
  const textPrimary = style?.tokens.textPrimary || "#0F172A"
  const textSecondary = style?.tokens.textSecondary || "#64748B"
  const priceColor = style?.tokens.price || "#4F46E5"
  const ctaBg = style?.tokens.ctaBg || "#6366F1"
  const ctaText = style?.tokens.ctaText || "#FFFFFF"
  const cardBg = style?.tokens.cardBg || "rgba(255,255,255,0.08)"
  const shadowCard = style?.tokens.shadowCard || "0 8px 32px rgba(15,23,42,0.25)"
  const radiusPx = style?.imageRules.radiusPx ?? 24

  return (
    <article
      className="group relative select-none overflow-hidden transition-all duration-300 hover:-translate-y-1 backdrop-blur-xl flex flex-col justify-between"
      style={{
        borderRadius: `${radiusPx}px`,
        background: cardBg,
        border: "1px solid rgba(255,255,255,0.18)",
        boxShadow: shadowCard,
      }}
    >
      <button
        type="button"
        onClick={() => onSelectProduct(product)}
        className="block w-full text-left"
      >
        <div className="relative aspect-square w-full overflow-hidden p-2.5 pb-0">
          <div className="relative w-full h-full overflow-hidden rounded-2xl">
            <SmartFlowerImage
              src={product.imageUrl}
              alt={product.name}
              aspectRatio="square"
              fallbackIndex={index}
              fitMode={style?.imageRules.fitMode || "cover"}
              blendMode={style?.imageRules.blendMode}
              imageFilter={style?.tokens.photoFilter}
            />

            {/* Top Code Badge */}
            <div
              className="absolute top-2 left-2 px-2.5 py-1 text-caption font-mono font-bold z-20 rounded-lg backdrop-blur-md"
              style={{
                backgroundColor: style?.tokens.badgeBg || "rgba(255,255,255,0.85)",
                color: style?.tokens.badgeText || "#4338CA",
              }}
            >
              {product.code}
            </div>
          </div>
        </div>

        {/* Info Area */}
        <div className="p-4 pb-2">
          {product.category && (
            <span
              className="text-caption uppercase tracking-wider font-semibold block mb-1"
              style={{ color: textSecondary }}
            >
              {product.category}
            </span>
          )}
          <h4
            className={`text-sm md:text-base font-bold leading-snug line-clamp-1 ${fontDisplay}`}
            style={{ color: textPrimary }}
          >
            {product.name}
          </h4>
          {product.description && (
            <p
              className="text-xs mt-1 line-clamp-2 leading-relaxed opacity-80"
              style={{ color: textSecondary }}
            >
              {product.description}
            </p>
          )}
        </div>
      </button>

      {/* Footer / Price & Action */}
      <div
        className="p-4 pt-3 border-t border-white/10 flex items-center justify-between mt-auto"
      >
        <div>
          <div className="text-caption uppercase tracking-wider opacity-75" style={{ color: textSecondary }}>
            Giá niêm yết
          </div>
          <div className="text-sm md:text-base font-black tracking-tight" style={{ color: priceColor }}>
            {formatVnd(product.price)}
          </div>
        </div>
        <a
          href={getZaloUrl(product, shop)}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all shadow-md active:scale-95"
          style={{ backgroundColor: ctaBg, color: ctaText }}
        >
          <MessageCircle size={14} />
          Đặt ngay
        </a>
      </div>
    </article>
  )
}
