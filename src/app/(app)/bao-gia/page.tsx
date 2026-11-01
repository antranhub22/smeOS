"use client"

import { useCallback, useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft, Receipt, SlidersHorizontal } from "@/components/ui/icons"
import { Button } from "@/components/ui/button"
import { SkeletonBlock } from "@/components/ui/skeleton"
import { useSession } from "@/lib/session"
import { getIndustryTerminology } from "@/modules/organization/domain/industry-profile"
import { extractComponentNames } from "@/modules/products/domain/bom"
import { CustomerQuoteBuilder } from "@/components/sales/quotation/customer-quote-builder"
import { PartnerQuoteBuilder } from "@/components/sales/quotation/partner-quote-builder"
import { QuotationsListView } from "@/components/sales/quotation/quotations-list-view"
import type { ProductItem } from "@/components/sales/quotation/quotation-types"

type ActiveTab = "CUSTOMER" | "PARTNER" | "LIST"

export default function BaoGiaPage() {
  const router = useRouter()
  const { organization } = useSession()
  const ti = getIndustryTerminology(organization?.industry)
  const [activeTab, setActiveTab] = useState<ActiveTab>("CUSTOMER")
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [products, setProducts] = useState<ProductItem[]>([])

  const napDuLieu = useCallback(async () => {
    try {
      const res = await fetch("/api/v1/products?status=ACTIVE&limit=100")
      if (!res.ok) throw new Error(String(res.status))
      const body = (await res.json()) as { data?: Array<Record<string, unknown>> }
      setProducts(
        (body.data ?? [])
          .filter((item) => typeof item.price_vnd === "number")
          .map((item) => ({
            id: String(item.id),
            title: String(item.name ?? ""),
            price: Number(item.price_vnd),
            category: typeof item.category === "string" ? item.category : ti.catalogTitle,
            image_url: typeof item.masterImageUrl === "string" ? item.masterImageUrl : "",
            composition: extractComponentNames((item.attributes as Record<string, unknown> | null)?.bom),
          })),
      )
    } catch {
      setLoadError("Chưa tải được danh sách sản phẩm. Hãy thử tải lại trang.")
    }
  }, [ti.catalogTitle])

  useEffect(() => {
    let cancelled = false
    napDuLieu().finally(() => {
      if (!cancelled) setLoading(false)
    })
    return () => {
      cancelled = true
    }
  }, [napDuLieu])

  return (
    <div className="flex h-full flex-col overflow-hidden bg-background">
      {/* Top Header */}
      <header className="flex flex-shrink-0 items-center justify-between border-b border-border bg-surface px-4 py-4">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-selected text-primary">
            <Receipt className="w-5 h-5" aria-hidden="true" />
          </div>
          <div>
            <h1 className="text-title font-extrabold text-primary">Tạo Thẻ báo giá sản phẩm</h1>
            <p className="text-caption text-text-muted">
              Tạo bộ lựa chọn sản phẩm gửi khách hoặc xuất thẻ báo giá cho đối tác
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => router.push("/gia")}
            className="flex items-center gap-1.5"
          >
            <SlidersHorizontal className="w-4 h-4 text-text-muted" aria-hidden="true" />
            <span>Cấu hình quy tắc giá</span>
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push("/")}
            className="flex items-center gap-1.5"
          >
            <ArrowLeft className="w-4 h-4" aria-hidden="true" />
            <span>Trang chủ</span>
          </Button>
        </div>
      </header>

      {/* Mode Selector Tabs */}
      <div className="border-b border-border bg-surface px-4 py-2 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setActiveTab("CUSTOMER")}
            className={`px-3.5 py-1.5 rounded-lg text-body-sm font-medium transition-colors cursor-pointer ${
              activeTab === "CUSTOMER"
                ? "bg-primary text-white font-semibold"
                : "bg-surface border border-border text-text hover:bg-surface-alt"
            }`}
          >
            Gửi khách mua
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("PARTNER")}
            className={`px-3.5 py-1.5 rounded-lg text-body-sm font-medium transition-colors cursor-pointer ${
              activeTab === "PARTNER"
                ? "bg-primary text-white font-semibold"
                : "bg-surface border border-border text-text hover:bg-surface-alt"
            }`}
          >
            Báo giá đối tác
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("LIST")}
            className={`px-3.5 py-1.5 rounded-lg text-body-sm font-medium transition-colors cursor-pointer ${
              activeTab === "LIST"
                ? "bg-primary text-white font-semibold"
                : "bg-surface border border-border text-text hover:bg-surface-alt"
            }`}
          >
            Danh sách báo giá
          </button>
        </div>

        <span className="text-caption text-text-muted hidden sm:inline-block">
          {activeTab === "CUSTOMER"
            ? `Tạo bảng báo giá theo yêu cầu gửi khách`
            : activeTab === "PARTNER"
            ? "Chế độ giao việc cho đối tác gia công"
            : "Lịch sử và trạng thái báo giá"}
        </span>
      </div>

      {/* Main Workspace */}
      <main className="flex-1 overflow-y-auto p-4 md:p-6 max-w-7xl mx-auto w-full">
        {loading ? (
          <SkeletonBlock lines={4} label="Đang tải dữ liệu sản phẩm..." />
        ) : activeTab === "CUSTOMER" ? (
          <CustomerQuoteBuilder
            products={products}
            sampleProductLabel={ti.sampleProduct}
            catalogTitle={ti.catalogTitle}
            loadError={loadError}
            onReload={napDuLieu}
          />
        ) : activeTab === "PARTNER" ? (
          <PartnerQuoteBuilder
            products={products}
            sampleProductLabel={ti.sampleProduct}
            makerAction={ti.makerAction}
          />
        ) : (
          <QuotationsListView />
        )}
      </main>
    </div>
  )
}
