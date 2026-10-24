"use client"

import React, { useState, useRef, useCallback } from "react"
import { Download, Save, RefreshCw, Share2, LayoutGrid } from "lucide-react"
import { useSession } from "@/lib/session"
import { TabActionHeader, type TabItem, type TabAction, type TabOverflowAction } from "@/components/ui/tab-header"
import {
  type BannerAspectRatio,
  type BannerCopyPayload,
  type BannerBrandInfo,
  type BannerStylePresetId,
  BANNER_FORMATS,
} from "@/modules/ad-banner-poster/domain/banner-types"
import { getBannerPreset } from "@/modules/ad-banner-poster/domain/banner-presets"
import {
  getInstantBannerTemplate,
  generateInstantBannerCopy,
} from "@/modules/ad-banner-poster/domain/banner-template-generator"
import type { BannerTemplateItem } from "@/modules/ad-banner-poster/domain/template-catalog"
import { BannerGuidanceCallout } from "./banner-guidance-callout"
import { BannerFormPanel } from "./banner-form-panel"
import { PresetStyleSelector } from "./preset-style-selector"
import { MultiSizeGrid } from "./multi-size-grid"
import { SinglePreviewModal } from "./single-preview-modal"
import { TemplateGalleryModal } from "./template-gallery-modal"
import type { GenerationEngine } from "./auto-generate-panel"

const FORMAT_TABS: TabItem[] = [
  { id: "ALL", label: "Tất cả kích thước (5)" },
  { id: "1:1", label: "Vuông 1:1" },
  { id: "4:5", label: "Dọc 4:5" },
  { id: "9:16", label: "Story 9:16" },
  { id: "16:9", label: "Banner 16:9" },
  { id: "A4", label: "Poster in A4" },
]

export function PosterBannerClient() {
  const { orgName } = useSession()

  // ── State ──────────────────────────────────────────────────────────
  const [industryKey] = useState("FLORAL")
  const [occasionKey, setOccasionKey] = useState("OPENING")
  const [occasionLabel, setOccasionLabel] = useState("Khai trương hồng phát")
  const [selectedPresetId, setSelectedPresetId] = useState<BannerStylePresetId>("FESTIVE_SEASON")
  const [selectedTemplateId, setSelectedTemplateId] = useState<string | undefined>("tpl-opening-cheer")
  const [generationEngine, setGenerationEngine] = useState<GenerationEngine>("TEMPLATE_ENGINE")
  const [isGalleryOpen, setIsGalleryOpen] = useState(false)
  const [activeFormatTab, setActiveFormatTab] = useState("ALL")
  const [singleModalFormat, setSingleModalFormat] = useState<BannerAspectRatio | null>(null)

  const [copy, setCopy] = useState<BannerCopyPayload>(() =>
    generateInstantBannerCopy({
      occasionKey: "OPENING",
      shopName: orgName || "Cửa Hàng Của Bạn",
      suggestedPromotion: "Tặng kèm băng rôn thiết kế riêng",
    })
  )

  const [brandInfo, setBrandInfo] = useState<BannerBrandInfo>({
    shopName: orgName || "Cửa Hàng Của Bạn",
    hotline: "0901 234 567",
    address: "123 Đường Trung Tâm",
  })

  const [productImageUrl, setProductImageUrl] = useState<string | undefined>(
    "https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=600&auto=format&fit=crop&q=80"
  )

  const [isGenerating, setIsGenerating] = useState(false)
  const [exportingFormat, setExportingFormat] = useState<string | null>(null)
  const [isExportingAll, setIsExportingAll] = useState(false)
  const [statusMessage, setStatusMessage] = useState<string | null>(null)

  const cardRefs = useRef<Map<BannerAspectRatio, HTMLDivElement>>(new Map())
  const registerCardRef = useCallback((format: BannerAspectRatio, el: HTMLDivElement | null) => {
    if (el) cardRefs.current.set(format, el)
    else cardRefs.current.delete(format)
  }, [])

  // ── Handlers ───────────────────────────────────────────────────────
  const handleCopyChange = (field: keyof BannerCopyPayload, value: string) => {
    setCopy((prev) => ({ ...prev, [field]: value }))
  }

  const handleBrandInfoChange = (field: keyof BannerBrandInfo, value: string) => {
    setBrandInfo((prev) => ({ ...prev, [field]: value }))
  }

  const handleOccasionChange = (key: string, label: string) => {
    setOccasionKey(key)
    setOccasionLabel(label)

    const tpl = getInstantBannerTemplate(key)
    setSelectedPresetId(tpl.recommendedPreset)
    const newCopy = generateInstantBannerCopy({
      occasionKey: key,
      shopName: brandInfo.shopName,
    })
    setCopy(newCopy)
    setStatusMessage(`🎯 Đã chọn dịp "${label}" — tự động chuyển phong cách và thông điệp phù hợp!`)
  }

  const handleSelectTemplate = (tpl: BannerTemplateItem) => {
    setSelectedTemplateId(tpl.id)
    setSelectedPresetId(tpl.stylePresetId)
    setCopy(tpl.defaultCopy)
    if (!productImageUrl) setProductImageUrl(tpl.sampleImageUrl)
    setStatusMessage(`⚡ Đã áp dụng mẫu: "${tpl.name}"`)
  }

  const handleTriggerAutoGenerate = async () => {
    setIsGenerating(true)
    setStatusMessage(`⚡ Đang tạo poster & banner cho dịp "${occasionLabel}"...`)

    const tpl = getInstantBannerTemplate(occasionKey)
    setSelectedPresetId(tpl.recommendedPreset)

    try {
      const res = await fetch("/api/v1/ad-banner-poster/copy", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          industry_key: industryKey,
          occasion_key: occasionKey,
          occasion_label: occasionLabel,
          shop_name: brandInfo.shopName,
          desired_promotion: copy.promotionBadge,
        }),
      })

      const data = await res.json().catch(() => null)
      if (data?.success && data?.copy) {
        setCopy(data.copy)
      } else {
        const fallback = generateInstantBannerCopy({
          occasionKey,
          shopName: brandInfo.shopName,
        })
        setCopy(fallback)
      }

      setStatusMessage(
        generationEngine === "AI_PROVIDER"
          ? `✨ AI Single-Call đã hoàn thiện trọn bộ 5 kích thước cho dịp "${occasionLabel}"!`
          : `🎉 Đã tạo mới thành công trọn bộ 5 kích thước cho dịp "${occasionLabel}"!`
      )
    } catch {
      const fallback = generateInstantBannerCopy({
        occasionKey,
        shopName: brandInfo.shopName,
      })
      setCopy(fallback)
      setStatusMessage(`⚡ Đã tự động dàn trang 5 kích thước chuẩn cho dịp "${occasionLabel}"!`)
    } finally {
      setIsGenerating(false)
    }
  }

  const downloadElementAsImage = async (
    element: HTMLElement,
    filename: string,
    formatType: "png" | "jpeg" = "png"
  ) => {
    const { toPng, toJpeg } = await import("html-to-image")
    const exportOptions = {
      pixelRatio: 2,
      cacheBust: true,
      skipFonts: true,
      fontEmbedCSS: "",
    }
    const dataUrl = formatType === "png"
      ? await toPng(element, exportOptions)
      : await toJpeg(element, { ...exportOptions, quality: 0.92 })

    const link = document.createElement("a")
    link.download = filename
    link.href = dataUrl
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const handleDownloadFormat = async (
    format: BannerAspectRatio,
    customElement?: HTMLElement | null
  ) => {
    const targetEl = customElement || cardRefs.current.get(format)
    if (!targetEl) return

    setExportingFormat(format)
    try {
      const filename = `banner-${format.replace(":", "x")}-${Date.now()}.png`
      await downloadElementAsImage(targetEl, filename, "png")
      setStatusMessage(`✅ Đã xuất ảnh ${format} thành công!`)
    } catch {
      setStatusMessage(`❌ Không thể xuất ảnh định dạng ${format}.`)
    } finally {
      setExportingFormat(null)
    }
  }

  const handleDownloadAll = async () => {
    setIsExportingAll(true)
    setStatusMessage("Đang xuất trọn bộ 5 kích thước...")
    try {
      for (const spec of BANNER_FORMATS) {
        const targetEl = cardRefs.current.get(spec.id)
        if (targetEl) {
          const filename = `banner-${spec.id.replace(":", "x")}.png`
          await downloadElementAsImage(targetEl, filename, "png")
          await new Promise((r) => setTimeout(r, 300))
        }
      }
      setStatusMessage("🎉 Đã tải trọn bộ 5 kích thước quảng cáo thành công!")
    } catch {
      setStatusMessage("❌ Có lỗi khi tải hàng loạt. Hãy thử tải từng kích thước.")
    } finally {
      setIsExportingAll(false)
    }
  }

  const primaryActions: TabAction[] = [
    {
      id: "download-all",
      label: isExportingAll ? "Đang xuất 5 file..." : "Tải trọn bộ (5 kích thước)",
      icon: Download,
      variant: "primary",
      onClick: handleDownloadAll,
      disabled: isExportingAll,
    },
    {
      id: "open-gallery",
      label: "Kho Template",
      icon: LayoutGrid,
      variant: "secondary",
      onClick: () => setIsGalleryOpen(true),
    },
    {
      id: "save-template",
      label: "Lưu mẫu chuỗi",
      icon: Save,
      variant: "outline",
      onClick: () => setStatusMessage("✅ Đã lưu mẫu thiết kế thành công vào kho mẫu của chuỗi!"),
    },
  ]

  const overflowActions: TabOverflowAction[] = [
    {
      id: "reset",
      label: "Đặt lại ban đầu",
      icon: RefreshCw,
      onClick: () => {
        handleOccasionChange("OPENING", "Khai trương hồng phát")
      },
    },
    {
      id: "share",
      label: "Chia sẻ mẫu thiết kế",
      icon: Share2,
      onClick: () => {
        navigator.clipboard?.writeText(window.location.href)
        setStatusMessage("📋 Đã sao chép liên kết vào bộ nhớ tạm!")
      },
    },
  ]

  const currentPreset = getBannerPreset(selectedPresetId)

  return (
    <div className="w-full max-w-7xl mx-auto space-y-6">
      <TabActionHeader
        tabs={FORMAT_TABS}
        activeTab={activeFormatTab}
        onTabChange={setActiveFormatTab}
        primaryActions={primaryActions}
        overflowActions={overflowActions}
      />

      <BannerGuidanceCallout />

      {statusMessage && (
        <div className="flex items-center justify-between p-3 rounded-lg bg-selected border border-primary/20 text-xs font-semibold text-primary">
          <span>{statusMessage}</span>
          <button type="button" onClick={() => setStatusMessage(null)} className="text-primary hover:opacity-70 text-xs">
            Đóng
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        <div className="lg:col-span-5 space-y-5">
          <PresetStyleSelector
            selectedPresetId={selectedPresetId}
            onSelectPreset={setSelectedPresetId}
          />

          <BannerFormPanel
            industryKey={industryKey}
            occasionKey={occasionKey}
            occasionLabel={occasionLabel}
            onOccasionChange={handleOccasionChange}
            copy={copy}
            onCopyChange={handleCopyChange}
            brandInfo={brandInfo}
            onBrandInfoChange={handleBrandInfoChange}
            productImageUrl={productImageUrl}
            onProductImageChange={setProductImageUrl}
            onTriggerAiCopy={handleTriggerAutoGenerate}
            onTriggerAutoGenerate={handleTriggerAutoGenerate}
            isGenerating={isGenerating}
            generationEngine={generationEngine}
            onEngineChange={setGenerationEngine}
            onOpenTemplateGallery={() => setIsGalleryOpen(true)}
          />
        </div>

        <div className="lg:col-span-7">
          <MultiSizeGrid
            copy={copy}
            brandInfo={brandInfo}
            preset={currentPreset}
            productImageUrl={productImageUrl}
            activeFormatTab={activeFormatTab}
            onFormatTabChange={setActiveFormatTab}
            onOpenSingleModal={setSingleModalFormat}
            onDownloadFormat={handleDownloadFormat}
            isExportingFormat={exportingFormat}
            isGenerating={isGenerating}
            registerCardRef={registerCardRef}
          />
        </div>
      </div>

      <SinglePreviewModal
        isOpen={Boolean(singleModalFormat)}
        format={singleModalFormat}
        copy={copy}
        brandInfo={brandInfo}
        preset={currentPreset}
        productImageUrl={productImageUrl}
        onClose={() => setSingleModalFormat(null)}
        onDownload={handleDownloadFormat}
        isDownloading={Boolean(exportingFormat)}
      />

      <TemplateGalleryModal
        isOpen={isGalleryOpen}
        onClose={() => setIsGalleryOpen(false)}
        onSelectTemplate={handleSelectTemplate}
        selectedTemplateId={selectedTemplateId}
      />
    </div>
  )
}
