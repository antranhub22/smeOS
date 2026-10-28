"use client"

import React from "react"
import { MessageCircle } from "lucide-react"
import type { PublicCatalogProduct, PublicCatalogShop } from "@/modules/catalog-links/use-cases/get-public-catalog"
import type { StyleDefinition } from "@/modules/catalog-studio/domain/entities/catalog-studio.types"
import { SmartFlowerImage } from "../smart-flower-image"
import { formatVnd, getZaloUrl } from "../product-detail-modal"

interface CatalogCardOverlayProps {
  product: PublicCatalogProduct
  index: number
  shop: PublicCatalogShop
  style?: StyleDefinition | undefined
  onSelectProduct: (product: PublicCatalogProduct) => void
}

export function CatalogCardOverlay({
  product,
  index,
  shop,
  style,
  onSelectProduct,
}: CatalogCardOverlayProps) {
  const fontDisplay = style?.typography.fontDisplay || ""
  const textPrimary = style?.tokens.textPrimary || "#FAFAFA"
  const textSecondary = style?.tokens.textSecondary || "#A1A1AA"
  const priceColor = style?.tokens.price || "#FBBF24"
  const ctaBg = style?.tokens.ctaBg || "#F59E0B"
  const ctaText = style?.tokens.ctaText || "#09090B"
  const cardBg = style?.tokens.cardBg || "#18181B"
  const shadowCard = style?.tokens.shadowCard || "0 18px 50px rgba(0,0,0,0.5)"
  const radiusPx = style?.imageRules.radiusPx ?? 16
  const innerFrame = style?.decorationRules.innerFrame

  const backdropGradient = style?.imageRules.useBackdrop
    ? `radial-gradient(110% 80% at 50% 38%, #ffffff 0%, #3f3f46 34%, ${cardBg} 100%)`
    : undefined

  return (
    <article
      className="group relative select-none overflow-hidden transition-all duration-300 hover:-translate-y-1"
      style={{
        borderRadius: `${radiusPx}px`,
        background: cardBg,
        boxShadow: shadowCard,
      }}
    >
      <button
        type="button"
        onClick={() => onSelectProduct(product)}
        className="block w-full text-left relative aspect-4/5 overflow-hidden"
      >
        <SmartFlowerImage
          src={product.imageUrl}
          alt={product.name}
          aspectRatio="4/5"
          fallbackIndex={index}
          fitMode={style?.imageRules.fitMode || "cover"}
          blendMode={style?.imageRules.blendMode}
          imageFilter={style?.tokens.photoFilter}
          backdropGradient={backdropGradient}
        />

        {/* Top Code Badge */}
        <div
          className="absolute top-3 left-3 px-2.5 py-1 text-caption font-mono font-bold z-20 backdrop-blur-md rounded-md"
          style={{
            backgroundColor: style?.tokens.badgeBg || "rgba(0,0,0,0.6)",
            color: style?.tokens.badgeText || "#FAFAFA",
          }}
        >
          {product.code}
        </div>

        {/* Inner Frame */}
        {innerFrame && (
          <div
            className="pointer-events-none absolute inset-3 z-10"
            style={{
              border: innerFrame,
              borderRadius: `${Math.max(0, radiusPx - 8)}px`,
            }}
          />
        )}

        {/* Bottom Scrim Gradient */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 bottom-0 h-3/5 z-10"
          style={{
            background:
              "linear-gradient(180deg, rgba(0,0,0,0) 0%, rgba(0,0,0,0.45) 40%, rgba(0,0,0,0.92) 100%)",
          }}
        />

        {/* Overlay Content */}
        <div className="absolute inset-x-0 bottom-0 z-20 p-5 pt-0 flex flex-col gap-1.5">
          {product.category && (
            <span
              className="text-[11px] uppercase tracking-widest font-semibold"
              style={{ color: textSecondary }}
            >
              {product.category}
            </span>
          )}
          <h4
            className={`text-lg font-bold leading-snug line-clamp-2 ${fontDisplay}`}
            style={{ color: textPrimary }}
          >
            {product.name}
          </h4>
          <div className="flex items-center justify-between pt-2">
            <div>
              <div className="text-[10px] uppercase tracking-wider opacity-80" style={{ color: textSecondary }}>
                Giá niêm yết
              </div>
              <div className="text-base font-black tracking-tight" style={{ color: priceColor }}>
                {formatVnd(product.price)}
              </div>
            </div>
            <a
              href={getZaloUrl(product, shop)}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all shadow-md active:scale-95"
              style={{ backgroundColor: ctaBg, color: ctaText }}
            >
              <MessageCircle size={14} />
              Đặt ngay
            </a>
          </div>
        </div>
      </button>
    </article>
  )
}
