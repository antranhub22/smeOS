"use client"

import React, { useState } from "react"
import { Zap, SlidersHorizontal } from "lucide-react"
import type {
  BannerCopyPayload,
  BannerBrandInfo,
} from "@/modules/ad-banner-poster/domain/banner-types"
import { AutoGeneratePanel, type GenerationEngine } from "./auto-generate-panel"
import { ManualEditPanel } from "./manual-edit-panel"

export interface BannerFormPanelProps {
  readonly industryKey: string
  readonly occasionKey: string
  readonly occasionLabel: string
  readonly onOccasionChange: (key: string, label: string) => void
  readonly copy: BannerCopyPayload
  readonly onCopyChange: (field: keyof BannerCopyPayload, value: string) => void
  readonly brandInfo: BannerBrandInfo
  readonly onBrandInfoChange: (field: keyof BannerBrandInfo, value: string) => void
  readonly productImageUrl?: string | undefined
  readonly onProductImageChange: (url: string) => void
  readonly onTriggerAiCopy: () => Promise<void>
  readonly onTriggerAutoGenerate: () => Promise<void>
  readonly isGenerating: boolean
  readonly generationEngine: GenerationEngine
  readonly onEngineChange: (engine: GenerationEngine) => void
  readonly onOpenTemplateGallery: () => void
}

type FormMode = "AUTO" | "MANUAL"

export function BannerFormPanel({
  industryKey,
  occasionKey,
  occasionLabel,
  onOccasionChange,
  copy,
  onCopyChange,
  brandInfo,
  onBrandInfoChange,
  productImageUrl,
  onProductImageChange,
  onTriggerAiCopy,
  onTriggerAutoGenerate,
  isGenerating,
  generationEngine,
  onEngineChange,
  onOpenTemplateGallery,
}: BannerFormPanelProps) {
  const [formMode, setFormMode] = useState<FormMode>("AUTO")

  return (
    <div className="rounded-xl border border-border bg-surface p-4 sm:p-5 shadow-sm space-y-4">
      {/* ── Mode Switcher Tabs ───────────────────────────────────────── */}
      <div className="flex items-center p-1 rounded-xl bg-surface-alt border border-border">
        <button
          type="button"
          onClick={() => setFormMode("AUTO")}
          className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
            formMode === "AUTO"
              ? "bg-primary text-primary-foreground shadow-sm"
              : "text-text-muted hover:text-text"
          }`}
        >
          <Zap className="h-3.5 w-3.5" />
          <span>Tạo tự động</span>
        </button>

        <button
          type="button"
          onClick={() => setFormMode("MANUAL")}
          className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
            formMode === "MANUAL"
              ? "bg-primary text-primary-foreground shadow-sm"
              : "text-text-muted hover:text-text"
          }`}
        >
          <SlidersHorizontal className="h-3.5 w-3.5" />
          <span>Tùy biến chi tiết</span>
        </button>
      </div>

      {/* ── Active Panel Render ──────────────────────────────────────── */}
      {formMode === "AUTO" ? (
        <AutoGeneratePanel
          industryKey={industryKey}
          occasionKey={occasionKey}
          occasionLabel={occasionLabel}
          onOccasionChange={onOccasionChange}
          productImageUrl={productImageUrl}
          onProductImageChange={onProductImageChange}
          generationEngine={generationEngine}
          onEngineChange={onEngineChange}
          onTriggerAutoGenerate={onTriggerAutoGenerate}
          isGenerating={isGenerating}
          onOpenTemplateGallery={onOpenTemplateGallery}
        />
      ) : (
        <ManualEditPanel
          copy={copy}
          onCopyChange={onCopyChange}
          brandInfo={brandInfo}
          onBrandInfoChange={onBrandInfoChange}
          onTriggerAiCopy={onTriggerAiCopy}
          isAiLoading={isGenerating}
        />
      )}
    </div>
  )
}
