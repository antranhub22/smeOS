"use client"

import React from "react"
import { Eye, Download, Printer, Loader2, Sparkles } from "@/components/ui/icons"
import {
  BANNER_FORMATS,
  type BannerAspectRatio,
  type BannerFormatSpec,
  type BannerCopyPayload,
  type BannerBrandInfo,
} from "@/modules/ad-banner-poster/domain/banner-types"
import type { BannerStylePreset } from "@/modules/ad-banner-poster/domain/banner-presets"
import { BannerPreviewCard } from "./banner-preview-card"
import { ScaledFrame, designWidthOf } from "./scaled-frame"

export interface MultiSizeGridProps {
  readonly copy: BannerCopyPayload
  readonly brandInfo: BannerBrandInfo
  readonly preset: BannerStylePreset
  readonly productImageUrl?: string | undefined
  readonly activeFormatTab: string
  readonly onFormatTabChange: (tab: string) => void
  readonly onOpenSingleModal: (format: BannerAspectRatio) => void
  readonly onDownloadFormat: (format: BannerAspectRatio) => void
  readonly isExportingFormat?: string | null | undefined
  readonly isGenerating?: boolean | undefined
  readonly registerCardRef: (format: BannerAspectRatio, el: HTMLDivElement | null) => void
}

export function MultiSizeGrid({
  copy,
  brandInfo,
  preset,
  productImageUrl,
  activeFormatTab,
  onOpenSingleModal,
  onDownloadFormat,
  isExportingFormat,
  isGenerating = false,
  registerCardRef,
}: MultiSizeGridProps) {
  const visibleFormats: readonly BannerFormatSpec[] =
    activeFormatTab === "ALL"
      ? BANNER_FORMATS
      : BANNER_FORMATS.filter((f) => f.id === activeFormatTab)

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        {visibleFormats.map((spec) => {
          const isDownloading = isExportingFormat === spec.id

          return (
            <div
              key={spec.id}
              className={`${spec.id === "16:9" ? "sm:col-span-2 " : ""}flex flex-col rounded-xl border border-border bg-surface p-4 shadow-sm transition-shadow hover:shadow-md`}
            >
              <div className="flex items-center justify-between pb-3 border-b border-border">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-text">
                    {spec.name}
                  </span>
                  {spec.isPrintable && (
                    <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-caption font-semibold bg-success-bg text-success-text border border-success/20">
                      <Printer className="h-2.5 w-2.5" /> Chuẩn in
                    </span>
                  )}
                </div>
                <span className="text-caption text-text-muted font-medium">
                  {spec.recommendedPx}
                </span>
              </div>

              <p className="text-caption text-text-muted mt-1.5 mb-3 line-clamp-1">
                {spec.description}
              </p>

              <div className="relative flex-1 flex items-center justify-center p-3 bg-surface-alt rounded-xl overflow-hidden min-h-[300px]">
                <div className={`w-full ${spec.id === "16:9" ? "max-w-[560px]" : "max-w-[340px]"}`}>
                  <ScaledFrame designWidth={designWidthOf(spec.id)} ratio={spec.ratioValue}>
                  <BannerPreviewCard
                    ref={(el) => registerCardRef(spec.id, el)}
                    format={spec.id}
                    copy={copy}
                    brandInfo={brandInfo}
                    preset={preset}
                    productImageUrl={productImageUrl}
                  />
                  </ScaledFrame>
                </div>

                {isGenerating && (
                  <div className="absolute inset-0 bg-background/80 backdrop-blur-sm flex flex-col items-center justify-center gap-2 z-20 animate-in fade-in-50">
                    <Loader2 className="h-6 w-6 text-primary animate-spin" />
                    <span className="text-xs font-bold text-text flex items-center gap-1">
                      <Sparkles className="h-3.5 w-3.5 text-primary" /> Đang cập nhật {spec.name}...
                    </span>
                  </div>
                )}
              </div>

              <div className="flex items-center justify-between pt-3 mt-3 border-t border-border gap-2">
                <button
                  type="button"
                  onClick={() => onOpenSingleModal(spec.id)}
                  className="inline-flex items-center gap-1 text-xs font-medium text-text-muted hover:text-text px-2.5 py-1 rounded-lg border border-border hover:bg-surface-alt transition-colors"
                >
                  <Eye className="h-3.5 w-3.5" />
                  <span>Phóng to</span>
                </button>

                <button
                  type="button"
                  disabled={isDownloading || isGenerating}
                  onClick={() => onDownloadFormat(spec.id)}
                  className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1 rounded-lg bg-primary text-primary-foreground hover:opacity-90 disabled:opacity-50 transition-opacity"
                >
                  <Download className="h-3.5 w-3.5" />
                  <span>{isDownloading ? "Đang xuất..." : "Tải ảnh"}</span>
                </button>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
