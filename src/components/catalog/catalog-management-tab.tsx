"use client"

import React, { useState, useMemo } from "react"
import { Button } from "@/components/ui/button"
import type { CatalogLinkItem } from "./catalog-link-widgets"
import { CatalogWizardFlow } from "./catalog-wizard-flow"
import { CatalogJourneyEntry, type CatalogExecutionMode } from "./catalog-journey-entry"
import { DualModeHeader } from "./dual-mode-header"
import { SmartInputDropzone, type SmartInputData } from "./smart-input-dropzone"
import { JourneyProcessingState } from "./journey-processing-state"
import { CatalogWizardStep4Success } from "./catalog-wizard-step4-success"
import { CatalogExpertManager } from "./catalog-expert-manager"
import { CatalogAutoStylePicker } from "./catalog-auto-style-picker"
import { generateQRCodeDataUrl, triggerDownload } from "@/core/media/qr-engine"
import { useSession } from "@/lib/session"
import { useTenantProfile } from "@/lib/hooks/use-tenant-profile"
import { getIndustryTerminology } from "@/modules/organization/domain/industry-profile"
import { resolveAutoStyleSuggestions } from "@/modules/catalog-studio/domain/auto-style-resolver"
import type { StyleSuggestion } from "@/modules/catalog-studio/domain/auto-style-resolver"
import type {
  CatalogTemplateId,
  CatalogStyleId,
} from "@/modules/catalog-studio/domain/entities/catalog-studio.types"
import { useAutonomousCatalogGenerator } from "./use-autonomous-catalog-generator"

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
  const [journeyPhase, setJourneyPhase] = useState<"mode-selection" | "input" | "style-pick">("mode-selection")
  const [catalogMode, setCatalogMode] = useState<CatalogExecutionMode>("autonomous")
  const [downloadingQR, setDownloadingQR] = useState(false)

  // Style-pick state (luồng Tự động)
  const [styleSuggestions, setStyleSuggestions] = useState<StyleSuggestion[]>([])
  const [pickedTemplateId, setPickedTemplateId] = useState<CatalogTemplateId>("T01_SIGNATURE_COLLECTION")
  const [pickedStyleId, setPickedStyleId] = useState<CatalogStyleId>("S01_EDITORIAL_MAGAZINE")
  const [cachedSmartInput, setCachedSmartInput] = useState<SmartInputData | null>(null)

  const activeProducts = useMemo(() => products.filter((p) => p.status === "ACTIVE"), [products])

  const {
    isAiAnalyzing,
    autonomousResult,
    setAutonomousResult,
    catalogAiSteps,
    executeGeneration,
  } = useAutonomousCatalogGenerator({
    activeProducts,
    sampleProductTerm,
    currentShopName,
    organizationId: organization?.id,
    business,
    onRefresh,
  })

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
    const preferred =
      data.preferredStyle && data.preferredStyle !== "auto"
        ? data.preferredStyle
        : null

    const suggestions = resolveAutoStyleSuggestions(data.userDirectives, preferred)
    setStyleSuggestions(suggestions)
    if (suggestions[0]) {
      setPickedTemplateId(suggestions[0].templateId)
      setPickedStyleId(suggestions[0].styleId)
    }
    setCachedSmartInput(data)
    setJourneyPhase("style-pick")
  }

  const handleConfirmStyle = async () => {
    if (!cachedSmartInput) return
    await executeGeneration(cachedSmartInput, pickedTemplateId, pickedStyleId)
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
          ) : journeyPhase === "style-pick" ? (
            <CatalogAutoStylePicker
              suggestions={styleSuggestions}
              selectedTemplateId={pickedTemplateId}
              selectedStyleId={pickedStyleId}
              onSelect={(tplId, stId) => {
                setPickedTemplateId(tplId)
                setPickedStyleId(stId)
              }}
              onConfirm={handleConfirmStyle}
              onBack={() => setJourneyPhase("input")}
            />
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
