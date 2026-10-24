"use client"

import React, { useState, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft, Sparkles, QrCode } from "lucide-react"
import { Button } from "@/components/ui/button"
import { SkeletonBlock } from "@/components/ui/skeleton"
import { LandingGuidanceCard } from "./landing-guidance-card"
import { LandingTypeSelector } from "./landing-type-selector"
import { LandingCampaignTab } from "@/components/catalog/landing-campaign-tab"
import type { CatalogProduct } from "@/components/catalog/catalog-management-tab"
import type { LandingPageType } from "@/modules/landing-page/domain/preset-catalog"

export function LandingPageStudioClient() {
  const router = useRouter()
  const [pageType, setPageType] = useState<LandingPageType>("STORE_BRAND")
  const [products, setProducts] = useState<CatalogProduct[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchProducts = useCallback(async () => {
    try {
      const res = await fetch("/api/v1/products?limit=100&status=ACTIVE")
      if (res.status === 401) {
        router.push("/dang-nhap")
        return
      }
      if (!res.ok) throw new Error("Không thể tải danh sách sản phẩm")
      const json = await res.json()
      setProducts(json.data || [])
    } catch (e) {
      setError(e instanceof Error ? e.message : "Lỗi khi tải dữ liệu")
    } finally {
      setLoading(false)
    }
  }, [router])

  useEffect(() => {
    fetchProducts()
  }, [fetchProducts])

  if (loading) {
    return (
      <div className="flex h-full flex-col p-6 space-y-4">
        <div className="flex items-center justify-between border-b border-border pb-4">
          <div className="h-8 w-48 bg-surface-alt rounded animate-pulse" />
        </div>
        <SkeletonBlock lines={5} label="Đang khởi tạo Landing Page Studio" />
      </div>
    )
  }

  return (
    <div className="flex h-full flex-col overflow-hidden">
      {/* Top Header */}
      <div className="flex flex-shrink-0 items-center justify-between border-b border-border bg-surface px-4 sm:px-6 py-3.5">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push("/cong-cu" as never)}
            className="flex items-center gap-1.5 text-text-muted hover:text-text"
          >
            <ArrowLeft className="h-4 w-4" /> Về Hub Công cụ
          </Button>
          <div className="h-4 w-px bg-border" />
          <div className="flex items-center gap-2">
            <span className="font-extrabold text-base text-text">Landing Page Studio</span>
            <span className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary font-bold">
              Công cụ 08
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => router.push("/the-chao" as never)}
            className="flex items-center gap-1.5 text-xs font-semibold"
          >
            <QrCode className="h-3.5 w-3.5" /> Thẻ chào & QR
          </Button>
        </div>
      </div>

      {/* Main Workspace */}
      <div className="flex flex-1 flex-col overflow-y-auto p-4 sm:p-6 space-y-5">
        {error && (
          <div className="rounded-xl bg-destructive-bg p-3 text-sm text-destructive flex items-center gap-2">
            ⚠️ {error}
          </div>
        )}

        {/* Khối hướng dẫn SSOT */}
        <LandingGuidanceCard />

        {/* Lựa chọn loại trang */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-text-muted uppercase tracking-wider">
              Chọn mục đích trang Landing Page
            </span>
          </div>
          <LandingTypeSelector selectedType={pageType} onSelectType={setPageType} />
        </div>

        {/* Bộ dựng Landing Page chuyên biệt */}
        <div className="pt-2">
          <LandingCampaignTab products={products} onRefresh={fetchProducts} />
        </div>
      </div>
    </div>
  )
}
