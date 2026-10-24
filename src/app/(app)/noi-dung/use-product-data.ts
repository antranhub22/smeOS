"use client"

/**
 * Hook tải danh sách sản phẩm từ Product Master cho Chức năng 04.
 * Tách ra từ page.tsx để tuân thủ SRP.
 */

import { useState, useEffect } from "react"
import type { ProductOption } from "./product-selector"

interface RawProductRow {
  id: string
  name: string
  code?: string
  category?: string
  shape?: string
  pricing?: { selling_price?: number }
  master_image_url?: string
  image_url?: string
  images?: Array<{ url?: string }>
}

export function useProductData(sampleProductLabel: string) {
  const [products, setProducts] = useState<ProductOption[]>([])
  const [selectedProductId, setSelectedProductId] = useState<string>("")
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [loadError, setLoadError] = useState<string | null>(null)

  useEffect(() => {
    async function loadProducts() {
      setIsLoading(true)
      setLoadError(null)
      try {
        const [resProds, resAnalyses] = await Promise.all([
          fetch("/api/v1/products?limit=25"),
          fetch("/api/v1/vision/analyses?approval_state=APPROVED&limit=100").catch(() => null),
        ])

        const imageMap: Record<string, string> = {}
        if (resAnalyses?.ok) {
          try {
            const aj = await resAnalyses.json()
            for (const a of (aj.data || []) as Array<{
              image_url?: string
              product_id?: string
              product?: { id?: string; code?: string }
            }>) {
              if (a.image_url) {
                if (a.product_id) imageMap[a.product_id] = a.image_url
                if (a.product?.id) imageMap[a.product.id] = a.image_url
                if (a.product?.code) imageMap[a.product.code] = a.image_url
              }
            }
          } catch {
            // Bỏ qua lỗi đọc analyses
          }
        }

        if (resProds.ok) {
          const json = await resProds.json()
          const rawList: RawProductRow[] = json.data || json.items || []
          const mapped: ProductOption[] = rawList.map((p) => ({
            id: p.id,
            name: p.name,
            code: p.code,
            price: p.pricing?.selling_price || 0,
            flowers: p.category
              ? `Danh mục: ${p.category}`
              : p.shape || sampleProductLabel,
            color: p.shape || "Tiêu chuẩn",
            imageUrl:
              imageMap[p.id] ||
              (p.code ? imageMap[p.code] : undefined) ||
              p.master_image_url ||
              p.image_url ||
              p.images?.[0]?.url,
          }))
          setProducts(mapped)
          setSelectedProductId(mapped[0]?.id || "")
        } else {
          setLoadError("Không thể tải sản phẩm từ Product Master.")
        }
      } catch {
        setLoadError("Lỗi kết nối cơ sở dữ liệu sản phẩm.")
      } finally {
        setIsLoading(false)
      }
    }
    loadProducts()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  return { products, selectedProductId, setSelectedProductId, isLoading, loadError }
}
