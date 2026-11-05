"use client"

import React, { useState } from "react"
import { X } from "@/components/ui/icon-set/x"
import { Sparkles } from "@/components/ui/icon-set/sparkles"
import { Check } from "@/components/ui/icon-set/check"
import { LayoutGrid } from "@/components/ui/icon-set/layout-grid"
import { ImageIcon } from "@/components/ui/icon-set/image-icon"
import { Dialog } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
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
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        if (!open) onClose()
      }}
      title={
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-white shadow-sm">
            <LayoutGrid className="h-4 w-4" />
          </div>
          <span>Kho Template Poster & Banner Quảng Cáo</span>
        </div>
      }
      description="Chọn mẫu bố cục chuẩn sàn theo mục đích chiến dịch để tự động tạo ấn phẩm"
      size="lg"
      footer={
        <div className="flex items-center justify-between w-full">
          <span className="text-caption text-text-muted">
            Hiển thị {filteredTemplates.length} mẫu thiết kế trong kho
          </span>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onClose}
          >
            Đóng
          </Button>
        </div>
      }
    >
      <div className="p-1 space-y-4">
        {/* Categories Bar */}
        <div className="flex items-center gap-1.5 pb-3 overflow-x-auto no-scrollbar border-b border-border">
          {BANNER_TEMPLATE_CATEGORIES.map((cat) => {
            const isActive = cat.id === activeCategory
            return (
              <button
                type="button"
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`px-3 py-1.5 rounded-lg text-caption font-semibold whitespace-nowrap transition-colors cursor-pointer ${
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
        <div className="max-h-[60vh] overflow-y-auto py-2 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
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

                  <h3 className="text-caption font-bold text-text truncate">
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
                  <Button
                    type="button"
                    variant={isSelected ? "primary" : "outline"}
                    size="sm"
                    onClick={() => {
                      onSelectTemplate(tpl)
                      onClose()
                    }}
                    className="w-full gap-1.5 text-caption font-semibold"
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
                  </Button>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </Dialog>
  )
}
