"use client"

import React, { useRef } from "react"
import { X } from "@/components/ui/icon-set/x"
import { Download } from "@/components/ui/icon-set/download"
import { Eye } from "@/components/ui/icon-set/eye"
import { Dialog } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
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
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        if (!open) onClose()
      }}
      title={
        <div className="flex items-center gap-2">
          <Eye className="h-4 w-4 text-primary" />
          <span>
            Xem chi tiết: {spec?.name} ({spec?.recommendedPx})
          </span>
        </div>
      }
      size="lg"
      footer={
        <div className="flex items-center justify-between w-full">
          <span className="text-caption text-text-muted">
            {spec?.description}
          </span>

          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onClose}
            >
              Đóng
            </Button>

            <Button
              type="button"
              variant="primary"
              size="sm"
              disabled={isDownloading}
              onClick={() => onDownload(format, modalCardRef.current)}
              className="gap-1.5"
            >
              <Download className="h-4 w-4" />
              <span>{isDownloading ? "Đang xuất file..." : "Tải ấn phẩm này"}</span>
            </Button>
          </div>
        </div>
      }
    >
      <div className="flex-1 overflow-y-auto py-4 flex items-center justify-center p-1">
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
    </Dialog>
  )
}
