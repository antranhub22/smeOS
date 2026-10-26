"use client"

import React, { useState, useMemo } from "react"
import { Button } from "@/components/ui/button"
import type { CatalogLinkItem } from "./catalog-link-widgets"
import { CatalogWizardFlow } from "./catalog-wizard-flow"
import { CatalogJourneyEntry, type CatalogExecutionMode } from "./catalog-journey-entry"
import { DualModeHeader } from "./dual-mode-header"
import { SmartInputDropzone, type SmartInputData } from "./smart-input-dropzone"
import { JourneyProcessingState, type ProcessingStep } from "./journey-processing-state"
import { CatalogWizardStep4Success } from "./catalog-wizard-step4-success"
import { CatalogExpertManager } from "./catalog-expert-manager"
import { generateQRCodeDataUrl, triggerDownload } from "@/core/media/qr-engine"
import { useSession } from "@/lib/session"
import { useTenantProfile } from "@/lib/hooks/use-tenant-profile"
import { getIndustryTerminology } from "@/modules/organization/domain/industry-profile"
import type {
  CatalogProductItem,
  CatalogPageModel,
  StyleDefinition,
  BrandProfile,
} from "@/modules/catalog-studio/domain/entities/catalog-studio.types"
import { resolveCatalogBrief } from "@/modules/catalog-studio/use-cases/resolve-catalog-brief"

export interface CatalogProduct {
  id: string
  name: string
  code: string
  category?: string | null
  status: "DRAFT" | "ACTIVE" | "ARCHIVED"
  occasion_code?: string | null
  color?: string | null
  collection?: string | null
  price?: number | null
  imageUrl?: string | null
  driveLink?: string | null
  attributes?: Record<string, unknown> | null
}

export type { CatalogLinkItem }

interface CatalogManagementTabProps {
  products: CatalogProduct[]
  catalogLinks: CatalogLinkItem[]
  onRefresh: () => void
}

export function CatalogManagementTab({
  products,
  catalogLinks,
  onRefresh,
}: CatalogManagementTabProps) {
  const { organization } = useSession()
  const { business } = useTenantProfile()
  const ti = getIndustryTerminology(organization?.industry)
  const sampleProductTerm = ti.sampleProduct || "sản phẩm"
  const currentShopName = business?.display_name || "Cửa hàng của bạn"

  const [viewMode, setViewMode] = useState<"wizard" | "manage">("wizard")
  const [journeyPhase, setJourneyPhase] = useState<"mode-selection" | "input">("mode-selection")
  const [catalogMode, setCatalogMode] = useState<CatalogExecutionMode>("autonomous")
  const [isAiAnalyzing, setIsAiAnalyzing] = useState(false)
  const [downloadingQR, setDownloadingQR] = useState(false)

  // Kết quả sau khi AI tự động thiết lập và xuất bản thành công
  const [autonomousResult, setAutonomousResult] = useState<{
    publishedUrl: string
    publishedSlug: string
    name: string
    pages: CatalogPageModel[]
    style: StyleDefinition
    brand: BrandProfile
    products: CatalogProductItem[]
  } | null>(null)

  const activeProducts = useMemo(() => products.filter((p) => p.status === "ACTIVE"), [products])

  const [catalogAiSteps, setCatalogAiSteps] = useState<ProcessingStep[]>([
    { id: "analyze", label: "Phân tích yêu cầu & sự kiện", status: "pending" },
    { id: "select", label: `Tuyển chọn các ${sampleProductTerm} phù hợp nhất`, status: "pending" },
    { id: "intro", label: "Sinh lời chào & tiêu đề Catalog bằng AI", status: "pending" },
    { id: "layout", label: "Hoàn thiện cấu hình & Xuất bản Catalog tự động", status: "pending" },
  ])

  const handleDownloadQR = async () => {
    if (!autonomousResult?.publishedUrl || !autonomousResult?.publishedSlug) return
    setDownloadingQR(true)
    try {
      const dataUrl = await generateQRCodeDataUrl(autonomousResult.publishedUrl, { width: 500, margin: 3 })
      triggerDownload(dataUrl, `QR-Catalog-${autonomousResult.publishedSlug}.png`)
    } finally {
      setDownloadingQR(false)
    }
  }

  const handleSmartAnalyze = async (data: SmartInputData) => {
    setIsAiAnalyzing(true)
    setAutonomousResult(null)
    setCatalogAiSteps([
      { id: "analyze", label: "Phân tích yêu cầu & sự kiện", status: "running" },
      { id: "select", label: `Tuyển chọn các ${sampleProductTerm} phù hợp nhất`, status: "pending" },
      { id: "intro", label: "Sinh lời chào & tiêu đề Catalog bằng AI", status: "pending" },
      { id: "layout", label: "Hoàn thiện cấu hình & Xuất bản Catalog tự động", status: "pending" },
    ])

    try {
      const lower = data.userDirectives.toLowerCase()
      let matchedOccasion = ""
      if (lower.includes("20/10") || lower.includes("phụ nữ")) matchedOccasion = "20-10"
      else if (lower.includes("valentine") || lower.includes("14/2")) matchedOccasion = "valentine"
      else if (lower.includes("8/3")) matchedOccasion = "8-3"
      else if (lower.includes("khai trương")) matchedOccasion = "grand-opening"
      else if (lower.includes("sinh nhật")) matchedOccasion = "birthday"

      // Step 1 done
      await new Promise((r) => setTimeout(r, 600))
      setCatalogAiSteps((prev) =>
        prev.map((s) =>
          s.id === "analyze" ? { ...s, status: "done" } : s.id === "select" ? { ...s, status: "running" } : s
        )
      )

      // Ưu tiên các sản phẩm người dùng đã chủ động chọn từ kho ở Step trước (data.selectedProducts)
      let chosenProducts: CatalogProduct[] = []
      if (data.selectedProducts && data.selectedProducts.length > 0) {
        chosenProducts = data.selectedProducts
      } else if (matchedOccasion) {
        chosenProducts = activeProducts.filter((p) => p.occasion_code === matchedOccasion)
      }
      if (chosenProducts.length === 0) {
        chosenProducts = activeProducts.slice(0, 6)
      }
      const chosenIds = chosenProducts.map((p) => p.id)

      // Step 2 done
      await new Promise((r) => setTimeout(r, 600))
      setCatalogAiSteps((prev) =>
        prev.map((s) =>
          s.id === "select" ? { ...s, status: "done" } : s.id === "intro" ? { ...s, status: "running" } : s
        )
      )

      let generatedName = `Bộ sưu tập ${sampleProductTerm} Tinh Tuyển`
      if (matchedOccasion) {
        const occName = matchedOccasion === "20-10" ? "Ngày Phụ Nữ 20/10" : matchedOccasion
        generatedName = `Bộ sưu tập ${sampleProductTerm} ${occName}`
      } else if (data.userDirectives) {
        generatedName = `Bộ sưu tập: ${data.userDirectives.slice(0, 30)}...`
      }

      let generatedDesc = `Tuyển chọn ${chosenIds.length} ${sampleProductTerm} nghệ thuật được thiết kế tinh tế nhất từ ${currentShopName}.`
      try {
        const res = await fetch("/api/v1/content-engine/catalog-generate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            collectionName: generatedName,
            productCount: chosenIds.length,
            styleVariant: "EDITORIAL_LOOKBOOK",
          }),
        })
        if (res.ok) {
          const json = await res.json()
          if (json.data?.description) generatedDesc = json.data.description
        }
      } catch {
        // Fallback
      }

      // Step 3 done
      await new Promise((r) => setTimeout(r, 600))
      setCatalogAiSteps((prev) =>
        prev.map((s) =>
          s.id === "intro" ? { ...s, status: "done" } : s.id === "layout" ? { ...s, status: "running" } : s
        )
      )

      // Step 4: Tự động xuất bản tạo liên kết Catalog luôn trong luồng Autonomous
      let createdSlug = "catalog"
      try {
        const createRes = await fetch("/api/v1/catalog-links", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: generatedName,
            description: generatedDesc,
            filters: {
              product_ids: chosenIds,
              style_variant: "EDITORIAL_LOOKBOOK",
              template_id: "T01_SIGNATURE_COLLECTION",
              style_id: "S01_EDITORIAL_MAGAZINE",
            },
          }),
        })
        if (createRes.ok) {
          const json = await createRes.json()
          createdSlug = json.data?.slug || json.slug || "catalog"
        }
      } catch {
        // Fallback
      }

      const publishedUrl = `${window.location.origin}/c/${createdSlug}`

      const studioProducts: CatalogProductItem[] = chosenProducts.map((p, idx) => ({
        productId: p.id,
        name: p.name,
        code: p.code || p.id,
        category: p.category ?? null,
        primaryImage: p.imageUrl || null,
        price: p.price ?? null,
        currency: "VND",
        sortOrder: idx + 1,
        status: p.status,
      }))

      const brandProfile: BrandProfile = {
        brandId: organization?.id || "brand",
        name: currentShopName,
        slogan: "Bộ Sưu Tập Tuyển Chọn • smeOS 2026",
        brandColors: { primary: "#9A3412" },
        contacts: {
          phone: business?.phone || null,
          hotline: business?.phone || null,
          zalo: business?.phone || null,
          address: business?.address || null,
        },
      }

      const resolved = resolveCatalogBrief(
        {
          catalogId: createdSlug,
          title: generatedName,
          purpose: "COLLECTION",
          audience: "CONSUMER",
          language: "vi-VN",
          styleId: "S01_EDITORIAL_MAGAZINE",
          templateId: "T01_SIGNATURE_COLLECTION",
          pageSize: "A4_PORTRAIT",
          outputProfile: "DIGITAL_PDF",
          brandId: brandProfile.brandId,
          productIds: studioProducts.map((p) => p.productId),
        },
        brandProfile,
        studioProducts
      )

      await new Promise((r) => setTimeout(r, 500))
      setCatalogAiSteps((prev) => prev.map((s) => (s.id === "layout" ? { ...s, status: "done" } : s)))

      // Cập nhật kết quả tự động hoàn tất — KHÔNG chuyển sang chế độ tự chọn guided!
      setAutonomousResult({
        publishedUrl,
        publishedSlug: createdSlug,
        name: generatedName,
        pages: resolved.pages,
        style: resolved.style,
        brand: resolved.brand,
        products: studioProducts,
      })
      onRefresh()
    } finally {
      setIsAiAnalyzing(false)
    }
  }

  // Chế độ 1: Hành trình tạo Catalog mới
  if (viewMode === "wizard") {
    if (journeyPhase === "mode-selection") {
      return (
        <CatalogJourneyEntry
          onSelectMode={(mode) => {
            setCatalogMode(mode)
            setAutonomousResult(null)
            setJourneyPhase("input")
          }}
        />
      )
    }

    return (
      <div className="space-y-6">
        <DualModeHeader
          mode={catalogMode === "autonomous" ? "auto" : "manual"}
          onModeChange={(m) => {
            setCatalogMode(m === "auto" ? "autonomous" : "guided")
            setAutonomousResult(null)
          }}
          title="Phương thức tạo Catalog số"
          description="Lựa chọn linh hoạt giữa Tự động bằng AI hoặc Tự thiết kế từng bước. Bạn có thể đổi bất cứ lúc nào."
        />

        {catalogMode === "autonomous" ? (
          isAiAnalyzing ? (
            <JourneyProcessingState
              title={`AI đang phân tích & tuyển chọn ${sampleProductTerm} cho Catalog`}
              steps={catalogAiSteps}
            />
          ) : autonomousResult ? (
            <div className="rounded-2xl border border-border bg-surface p-6 shadow-xs space-y-6">
              <CatalogWizardStep4Success
                publishedUrl={autonomousResult.publishedUrl}
                publishedSlug={autonomousResult.publishedSlug}
                onDownloadQR={handleDownloadQR}
                downloadingQR={downloadingQR}
                imageExportProps={{
                  products: autonomousResult.products,
                  style: autonomousResult.style,
                  brand: autonomousResult.brand,
                  catalogTitle: autonomousResult.name,
                }}
                pdfExportProps={{
                  pages: autonomousResult.pages,
                  style: autonomousResult.style,
                  brand: autonomousResult.brand,
                  catalogTitle: autonomousResult.name,
                }}
              />
              <div className="pt-4 border-t border-border flex items-center justify-between">
                <Button
                  variant="outline"
                  onClick={() => {
                    setAutonomousResult(null)
                    onRefresh()
                  }}
                  className="text-body-sm font-semibold"
                >
                  ← Tạo Catalog tự động khác
                </Button>
                <Button
                  onClick={() => {
                    setViewMode("manage")
                    setAutonomousResult(null)
                    onRefresh()
                  }}
                  className="bg-primary text-surface font-semibold"
                >
                  Quản lý danh sách Catalog →
                </Button>
              </div>
            </div>
          ) : (
            <SmartInputDropzone
              onAnalyze={handleSmartAnalyze}
              isAnalyzing={isAiAnalyzing}
              availableProducts={activeProducts}
              onSwitchToManual={() => setCatalogMode("guided")}
            />
          )
        ) : (
          <CatalogWizardFlow
            products={products}
            onBackToModeSelection={() => {
              setJourneyPhase("mode-selection")
              setAutonomousResult(null)
            }}
            onCreated={() => {
              setJourneyPhase("mode-selection")
              onRefresh()
            }}
            onCancelToManage={() => {
              setViewMode("manage")
              setJourneyPhase("mode-selection")
            }}
          />
        )}
      </div>
    )
  }

  // Chế độ 2: Quản lý Catalog đã phát hành & Kho sản phẩm
  return (
    <CatalogExpertManager
      products={products}
      catalogLinks={catalogLinks}
      onRefresh={onRefresh}
      onOpenCreateWizard={() => {
        setViewMode("wizard")
        setJourneyPhase("mode-selection")
        setAutonomousResult(null)
      }}
      sampleProductTerm={sampleProductTerm}
    />
  )
}
