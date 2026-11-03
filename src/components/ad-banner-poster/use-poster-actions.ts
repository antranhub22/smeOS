"use client"

import { useState } from "react"
import { POSTER_EXPORT_WIDTH } from "./scaled-frame"
import {
  type BannerAspectRatio,
  type BannerCopyPayload,
  BANNER_FORMATS,
} from "@/modules/ad-banner-poster/domain/banner-types"

export interface UsePosterActionsParams {
  cardRefs: React.RefObject<Map<BannerAspectRatio, HTMLDivElement>>
  copy: BannerCopyPayload
  occasionKey: string
  occasionLabel: string
  selectedPresetId: string
  activeFormatTab: string
  setStatusMessage: (msg: string | null) => void
}

export function usePosterActions({
  cardRefs,
  copy,
  occasionKey,
  occasionLabel,
  selectedPresetId,
  activeFormatTab,
  setStatusMessage,
}: UsePosterActionsParams) {
  const [exportingFormat, setExportingFormat] = useState<string | null>(null)
  const [isExportingAll, setIsExportingAll] = useState(false)
  const [isSavingToLibrary, setIsSavingToLibrary] = useState(false)

  const downloadElementAsImage = async (element: HTMLElement, filename: string, format: string) => {
    const { toPng } = await import("html-to-image")
    const pixelRatio = (POSTER_EXPORT_WIDTH[format] ?? 1080) / Math.max(1, element.offsetWidth)
    const dataUrl = await toPng(element, { pixelRatio, cacheBust: true, skipFonts: true, fontEmbedCSS: "" })

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
    const targetEl = customElement || cardRefs.current?.get(format)
    if (!targetEl) return

    setExportingFormat(format)
    try {
      const filename = `banner-${format.replace(":", "x")}-${Date.now()}.png`
      await downloadElementAsImage(targetEl, filename, format)
      setStatusMessage(`Đã xuất ảnh ${format} thành công!`)
    } catch {
      setStatusMessage(`Không thể xuất ảnh định dạng ${format}.`)
    } finally {
      setExportingFormat(null)
    }
  }

  const handleDownloadAll = async () => {
    setIsExportingAll(true)
    setStatusMessage("Đang xuất trọn bộ 5 kích thước...")
    try {
      for (const spec of BANNER_FORMATS) {
        const targetEl = cardRefs.current?.get(spec.id)
        if (targetEl) {
          const filename = `banner-${spec.id.replace(":", "x")}.png`
          await downloadElementAsImage(targetEl, filename, spec.id)
          await new Promise((r) => setTimeout(r, 300))
        }
      }
      setStatusMessage("Đã tải trọn bộ 5 kích thước quảng cáo thành công!")
    } catch {
      setStatusMessage("Có lỗi khi tải hàng loạt. Hãy thử tải từng kích thước.")
    } finally {
      setIsExportingAll(false)
    }
  }

  const handleSaveToLibrary = async () => {
    const targetFormat: BannerAspectRatio = activeFormatTab === "ALL" ? "1:1" : (activeFormatTab as BannerAspectRatio)
    const targetEl = cardRefs.current?.get(targetFormat) ?? cardRefs.current?.get("1:1") ?? cardRefs.current?.get("A4")
    if (!targetEl) {
      setStatusMessage("Chưa có khung xem trước để lưu.")
      return
    }

    setIsSavingToLibrary(true)
    setStatusMessage("Đang lưu bản thiết kế vào Kho dữ liệu...")
    try {
      const { toPng } = await import("html-to-image")
      const pixelRatio = 2
      const dataUrl = await toPng(targetEl, { pixelRatio, cacheBust: true, skipFonts: true, fontEmbedCSS: "" })
      const assetCode = copy.promotionBadge ? "9" : "8"
      const res = await fetch("/api/v1/ad-banner-poster/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: `Poster ${copy.headline || occasionLabel}`,
          asset_type_code: assetCode,
          image_data: dataUrl,
          metadata: {
            occasion_key: occasionKey,
            occasion_label: occasionLabel,
            style_preset_id: selectedPresetId,
            format: targetFormat,
          },
        }),
      })
      if (!res.ok) throw new Error("Lỗi khi lưu")
      setStatusMessage("Đã lưu vào Kho dữ liệu thành công với trạng thái Chờ duyệt!")
    } catch {
      setStatusMessage("Không thể lưu vào Kho dữ liệu. Vui lòng thử lại.")
    } finally {
      setIsSavingToLibrary(false)
    }
  }

  return {
    exportingFormat,
    isExportingAll,
    isSavingToLibrary,
    handleDownloadFormat,
    handleDownloadAll,
    handleSaveToLibrary,
  }
}

