"use client"

import React, { useState } from "react"
import { X, Sparkles, Check, LayoutGrid, ImageIcon } from "lucide-react"
import {
  BANNER_TEMPLATE_CATEGORIES,
  BANNER_TEMPLATE_CATALOG,
  getTemplatesByCategory,
  type BannerPurposeCategory,
  type BannerTemplateItem,
} from "@/modules/ad-banner-poster/domain/template-catalog"

export interface TemplateGalleryModalProps {
  readonly isOpen: boolean
  readonly onClose: () => void
  readonly onSelectTemplate: (template: BannerTemplateItem) => void
  readonly selectedTemplateId?: string | undefined
  /** Ảnh sản phẩm tiệm đã chọn — ô xem trước dùng ảnh thật thay ảnh kho */
  readonly previewImageUrl?: string | undefined
}

export function TemplateGalleryModal({
  isOpen,
  onClose,
  onSelectTemplate,
  selectedTemplateId,
  previewImageUrl,
}: TemplateGalleryModalProps) {
  const [activeCategory, setActiveCategory] = useState<BannerPurposeCategory>("ALL")

  if (!isOpen) return null

  const filteredTemplates = getTemplatesByCategory(activeCategory)

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in-50 duration-200"
    >
      <div className="relative w-full max-w-4xl rounded-2xl bg-surface border border-border p-5 shadow-2xl flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-border">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-white shadow-sm">
              <LayoutGrid className="h-4 w-4" />
            </div>
            <div>
              <h2 className="text-sm sm:text-base font-bold text-text">
                Kho Template Poster & Banner Quảng Cáo
              </h2>
              <p className="text-xs text-text-muted mt-0.5">
                Chọn mẫu bố cục chuẩn sàn theo mục đích chiến dịch để tự động tạo ấn phẩm
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Đóng cửa sổ"
            className="rounded-lg p-1.5 text-text-muted hover:text-text hover:bg-surface-alt transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Categories Bar */}
        <div className="flex items-center gap-1.5 py-3 overflow-x-auto no-scrollbar border-b border-border">
          {BANNER_TEMPLATE_CATEGORIES.map((cat) => {
            const isActive = cat.id === activeCategory
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => setActiveCategory(cat.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
                  isActive
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "bg-surface-alt text-text-muted hover:text-text hover:bg-border/60"
                }`}
              >
                {cat.label}
              </button>
            )
          })}
        </div>

        {/* Template Cards Grid */}
        <div className="flex-1 overflow-y-auto py-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {filteredTemplates.map((tpl) => {
            const isSelected = tpl.id === selectedTemplateId

            return (
              <div
                key={tpl.id}
                className={`flex flex-col justify-between rounded-xl border p-3.5 transition-all ${
                  isSelected
                    ? "border-primary bg-primary/5 ring-1 ring-primary shadow-md"
                    : "border-border bg-surface hover:border-border-strong hover:shadow-sm"
                }`}
              >
                {/* Card Header */}
                <div>
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-caption font-bold bg-primary/10 text-primary">
                      {tpl.categoryLabel}
                    </span>
                    {tpl.isChainReady && (
                      <span className="text-caption font-semibold text-text-muted">
                        🏢 Chuỗi sẵn sàng
                      </span>
                    )}
                  </div>

                  <h3 className="text-xs font-bold text-text truncate">
                    {tpl.name}
                  </h3>

                  {/* Visual Preview Box */}
                  <div className="relative mt-2 aspect-[4/3] rounded-lg overflow-hidden border border-border bg-gradient-to-br from-surface-alt to-surface flex flex-col justify-between p-2.5">
                    <div className="flex justify-between items-center text-caption font-extrabold uppercase">
                      <span className="px-1.5 py-0.5 rounded bg-black/70 text-white truncate max-w-[70%]">
                        {tpl.defaultCopy.headline}
                      </span>
                    </div>

                    <div className="flex items-center justify-center my-auto">
                      {previewImageUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={previewImageUrl} alt="" className="h-16 w-16 object-cover rounded-md shadow-sm border border-white/60" />
                      ) : (
                        <ImageIcon aria-hidden className="h-8 w-8 text-text-muted" />
                      )}
                    </div>

                    <div className="flex justify-between items-center text-caption text-text-muted">
                      <span className="px-1 rounded bg-white/80 font-bold">
                        {tpl.defaultCopy.ctaText}
                      </span>
                    </div>
                  </div>

                  {/* Tags */}
                  <div className="flex flex-wrap gap-1 mt-2.5">
                    {tpl.tags.map((tag) => (
                      <span
                        key={tag}
                        className="text-caption text-text-muted bg-surface-alt px-1.5 py-0.5 rounded"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Apply Button */}
                <div className="mt-3.5 pt-2 border-t border-border">
                  <button
                    type="button"
                    onClick={() => {
                      onSelectTemplate(tpl)
                      onClose()
                    }}
                    className={`w-full py-1.5 px-3 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors ${
                      isSelected
                        ? "bg-primary text-white"
                        : "bg-surface-alt hover:bg-primary hover:text-white text-text border border-border"
                    }`}
                  >
                    {isSelected ? (
                      <>
                        <Check className="h-3.5 w-3.5" />
                        <span>Đang sử dụng</span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="h-3.5 w-3.5" />
                        <span>Áp dụng mẫu này</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            )
          })}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-3 border-t border-border">
          <span className="text-xs text-text-muted">
            Hiển thị {filteredTemplates.length} mẫu thiết kế trong kho
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg border border-border text-xs font-medium text-text hover:bg-surface-alt"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  )
}
