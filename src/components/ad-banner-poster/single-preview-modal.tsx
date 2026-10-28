"use client"

import React, { useRef } from "react"
import { X, Download, Eye } from "lucide-react"
import {
  BANNER_FORMATS,
  type BannerAspectRatio,
  type BannerCopyPayload,
  type BannerBrandInfo,
} from "@/modules/ad-banner-poster/domain/banner-types"
import type { BannerStylePreset } from "@/modules/ad-banner-poster/domain/banner-presets"
import { BannerPreviewCard } from "./banner-preview-card"

export interface SinglePreviewModalProps {
  readonly isOpen: boolean
  readonly format: BannerAspectRatio | null
  readonly copy: BannerCopyPayload
  readonly brandInfo: BannerBrandInfo
  readonly preset: BannerStylePreset
  readonly productImageUrl?: string | undefined
  readonly onClose: () => void
  readonly onDownload: (format: BannerAspectRatio, customRef?: HTMLElement | null | undefined) => void
  readonly isDownloading: boolean
}

export function SinglePreviewModal({
  isOpen,
  format,
  copy,
  brandInfo,
  preset,
  productImageUrl,
  onClose,
  onDownload,
  isDownloading,
}: SinglePreviewModalProps) {
  const modalCardRef = useRef<HTMLDivElement>(null)

  if (!isOpen || !format) return null

  const spec = BANNER_FORMATS.find((f) => f.id === format)

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in-50 duration-200"
    >
      <div className="relative w-full max-w-2xl rounded-2xl bg-surface border border-border p-5 shadow-2xl flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-border">
          <div className="flex items-center gap-2">
            <Eye className="h-4 w-4 text-primary" />
            <span className="text-sm font-bold text-text">
              Xem chi tiết: {spec?.name} ({spec?.recommendedPx})
            </span>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Đóng cửa sổ"
            className="rounded-lg p-1 text-text-muted hover:text-text hover:bg-surface-alt transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content Preview */}
        <div className="flex-1 overflow-y-auto py-4 flex items-center justify-center">
          <div className="w-full max-w-[420px]">
            <BannerPreviewCard
              ref={modalCardRef}
              format={format}
              copy={copy}
              brandInfo={brandInfo}
              preset={preset}
              productImageUrl={productImageUrl}
              className="shadow-xl"
            />
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between pt-3 border-t border-border">
          <span className="text-xs text-text-muted">
            {spec?.description}
          </span>

          <div className="flex gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-1.5 rounded-lg border border-border text-xs font-medium text-text hover:bg-surface-alt transition-colors"
            >
              Đóng
            </button>

            <button
              type="button"
              disabled={isDownloading}
              onClick={() => onDownload(format, modalCardRef.current)}
              className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-primary text-primary-foreground text-xs font-semibold shadow-sm hover:opacity-90 disabled:opacity-50 transition-opacity"
            >
              <Download className="h-4 w-4" />
              <span>{isDownloading ? "Đang xuất file..." : "Tải ấn phẩm này"}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
