"use client"

import React from "react"
import type {
  CatalogProductItem,
  StyleDefinition,
  BrandProfile,
} from "@/modules/catalog-studio/domain/entities/catalog-studio.types"
import { Sparkles } from "lucide-react"

interface CatalogCoverPosterProps {
  products: CatalogProductItem[]
  style: StyleDefinition
  brand: BrandProfile
  catalogTitle: string
  catalogUrl?: string
  productCount?: number
}

/**
 * Catalog Cover Poster — Square 1080×1080 (Instagram / Zalo / Facebook-ready)
 * Renders a visually-rich poster image with:
 *  - Brand header bar
 *  - Up to 6 product thumbnail grid
 *  - Collection title + subtitle
 *  - Shop contact / URL footer
 */
export function CatalogCoverPoster({
  products,
  style,
  brand,
  catalogTitle,
  catalogUrl,
  productCount,
}: CatalogCoverPosterProps) {
  const { tokens, typography } = style
  const showcaseProducts = products.slice(0, 6)
  const totalCount = productCount ?? products.length

  const formatPrice = (price: number | null | undefined) => {
    if (!price) return null
    if (price >= 1_000_000) return `${(price / 1_000_000).toFixed(1).replace(".0", "")}M₫`
    if (price >= 1_000) return `${Math.round(price / 1_000)}K₫`
    return `${price}₫`
  }

  const gridCols = showcaseProducts.length <= 2 ? "2" : showcaseProducts.length <= 4 ? "2" : "3"

  return (
    <div
      data-poster-root
      style={{
        width: "1080px",
        height: "1080px",
        backgroundColor: tokens.background,
        color: tokens.textPrimary,
        fontFamily: "system-ui, -apple-system, sans-serif",
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
        position: "relative",
      }}
    >
      {/* Top Brand Bar */}
      <div
        style={{
          backgroundColor: tokens.accent,
          padding: "28px 48px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexShrink: 0,
        }}
      >
        <div>
          <div
            style={{
              color: "rgba(255,255,255,0.8)",
              fontSize: "18px",
              fontWeight: 700,
              letterSpacing: "0.25em",
              textTransform: "uppercase",
            }}
          >
            {brand.name}
          </div>
          <div
            style={{
              color: "rgba(255,255,255,0.6)",
              fontSize: "14px",
              marginTop: "2px",
              letterSpacing: "0.05em",
            }}
          >
            Bộ sưu tập độc quyền • {new Date().getFullYear()}
          </div>
        </div>
        <div
          style={{
            backgroundColor: "rgba(255,255,255,0.15)",
            borderRadius: "40px",
            padding: "8px 20px",
            color: "white",
            fontSize: "14px",
            fontWeight: 700,
            letterSpacing: "0.05em",
          }}
        >
          {totalCount} Mẫu
        </div>
      </div>

      {/* Product Grid */}
      <div
        style={{
          flex: 1,
          display: "grid",
          gridTemplateColumns: `repeat(${gridCols}, 1fr)`,
          gap: "4px",
          backgroundColor: tokens.border,
          overflow: "hidden",
        }}
      >
        {showcaseProducts.map((product, idx) => (
          <div
            key={product.productId}
            style={{
              backgroundColor: tokens.surface,
              position: "relative",
              overflow: "hidden",
            }}
          >
            {product.primaryImage ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={product.primaryImage}
                alt={product.name}
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                  display: "block",
                }}
              />
            ) : (
              <div
                style={{
                  width: "100%",
                  height: "100%",
                  backgroundColor: tokens.badgeBg,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <svg
                  width="48"
                  height="48"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke={tokens.textSecondary}
                  strokeWidth="1.5"
                >
                  <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" />
                  <circle cx="12" cy="9" r="2.5" />
                </svg>
              </div>
            )}
            {/* Price badge overlay */}
            {product.price && (
              <div
                style={{
                  position: "absolute",
                  bottom: "8px",
                  right: "8px",
                  backgroundColor: tokens.accent,
                  color: "white",
                  fontSize: "15px",
                  fontWeight: 800,
                  padding: "4px 10px",
                  borderRadius: "8px",
                  letterSpacing: "0.02em",
                }}
              >
                {formatPrice(product.price)}
              </div>
            )}
            {/* First product badge */}
            {idx === 0 && (
              <div
                style={{
                  position: "absolute",
                  top: "10px",
                  left: "10px",
                  backgroundColor: "rgba(0,0,0,0.6)",
                  color: "white",
                  fontSize: "11px",
                  fontWeight: 700,
                  padding: "3px 9px",
                  borderRadius: "6px",
                  textTransform: "uppercase",
                  letterSpacing: "0.1em",
                }}
              >
                ✦ Nổi bật
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Bottom Info Bar */}
      <div
        style={{
          backgroundColor: tokens.surface,
          borderTop: `3px solid ${tokens.accent}`,
          padding: "22px 48px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexShrink: 0,
        }}
      >
        <div>
          <div
            style={{
              fontSize: "26px",
              fontWeight: 800,
              color: tokens.textPrimary,
              letterSpacing: "-0.02em",
              lineHeight: 1.2,
              maxWidth: "600px",
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            {catalogTitle}
          </div>
          <div
            style={{
              fontSize: "15px",
              color: tokens.textSecondary,
              marginTop: "4px",
              display: "flex",
              alignItems: "center",
              gap: "8px",
            }}
          >
            {brand.contacts.phone && (
              <>
                <span>{brand.contacts.phone}</span>
                <span style={{ color: tokens.border }}>•</span>
              </>
            )}
            {catalogUrl ? (
              <span
                style={{
                  fontSize: "13px",
                  color: tokens.accent,
                  fontWeight: 600,
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  maxWidth: "380px",
                  whiteSpace: "nowrap",
                }}
              >
                🔗 {catalogUrl.replace("https://", "")}
              </span>
            ) : (
              <span
                style={{
                  fontSize: "13px",
                  color: tokens.textSecondary,
                  fontStyle: "italic",
                }}
              >
                Nhấn QR để xem đầy đủ sản phẩm
              </span>
            )}
          </div>
        </div>

        {/* Powered by badge */}
        <div
          style={{
            backgroundColor: tokens.badgeBg,
            borderRadius: "12px",
            padding: "8px 16px",
            display: "flex",
            alignItems: "center",
            gap: "6px",
            color: tokens.textSecondary,
            fontSize: "12px",
            fontWeight: 600,
            flexShrink: 0,
          }}
        >
          <span style={{ fontSize: "14px" }}>✦</span>
          <span>smeOS Catalog</span>
        </div>
      </div>
    </div>
  )
}
