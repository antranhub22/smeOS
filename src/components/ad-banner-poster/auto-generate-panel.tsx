"use client"

import React, { useRef } from "react"
import { UploadCloud, Sparkles, Loader2, ImagePlus, LayoutGrid, CheckCircle2, Zap } from "lucide-react"
import { getIndustryPlugin } from "@/modules/organization/domain/industry-profile"

export type GenerationEngine = "TEMPLATE_ENGINE" | "AI_PROVIDER"

export interface AutoGeneratePanelProps {
  readonly industryKey: string
  readonly occasionKey: string
  readonly occasionLabel: string
  readonly onOccasionChange: (key: string, label: string) => void
  readonly productImageUrl?: string | undefined
  readonly onProductImageChange: (url: string) => void
  readonly generationEngine: GenerationEngine
  readonly onEngineChange: (engine: GenerationEngine) => void
  readonly onTriggerAutoGenerate: () => Promise<void>
  readonly isGenerating: boolean
  readonly onOpenTemplateGallery: () => void
}

const PURPOSE_QUICK_TAGS = [
  { key: "OPENING", label: "🎉 Khai trương hồng phát" },
  { key: "FLASH_SALE", label: "🔥 Flash Sale / Giảm sốc" },
  { key: "NEW_ARRIVAL", label: "✨ Mẫu mới ra mắt" },
  { key: "WOMEN_DAY", label: "💐 Ngày lễ 20/10 & 8/3" },
] as const

export function AutoGeneratePanel({
  industryKey,
  occasionKey,
  onOccasionChange,
  productImageUrl,
  onProductImageChange,
  generationEngine,
  onEngineChange,
  onTriggerAutoGenerate,
  isGenerating,
  onOpenTemplateGallery,
}: AutoGeneratePanelProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const plugin = getIndustryPlugin(industryKey)
  const occasions = plugin.taxonomy.occasions || []

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (event) => {
        if (event.target?.result) {
          onProductImageChange(String(event.target.result))
        }
      }
      reader.readAsDataURL(file)
    }
  }

  return (
    <div className="space-y-4">
      {/* ── 1. KHU VỰC TẢI ẢNH SẢN PHẨM (DROPZONE) ────────────────────── */}
      <div className="space-y-1.5">
        <label className="text-xs font-bold text-text flex items-center justify-between">
          <span>1. Tải ảnh sản phẩm của bạn</span>
          <span className="text-caption text-primary font-normal">
            Bắt buộc để tạo poster
          </span>
        </label>

        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className={`w-full relative border-2 border-dashed rounded-xl p-4 text-center cursor-pointer transition-all ${
            productImageUrl
              ? "border-primary/50 bg-primary/5"
              : "border-border hover:border-primary hover:bg-surface-alt"
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleFileUpload}
          />

          {productImageUrl ? (
            <div className="flex items-center justify-center gap-3">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={productImageUrl}
                alt="Product Preview"
                className="h-16 w-16 object-contain rounded-lg border border-border bg-white shadow-sm"
              />
              <div className="text-left">
                <span className="text-xs font-bold text-text flex items-center gap-1">
                  <CheckCircle2 className="h-3.5 w-3.5 text-success" /> Đã nạp ảnh thành công
                </span>
                <p className="text-caption text-text-muted mt-0.5">
                  Nhấp để chọn ảnh khác từ máy tính
                </p>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary mb-2">
                <UploadCloud className="h-5 w-5" />
              </div>
              <span className="text-xs font-bold text-text">
                Kéo thả hoặc nhấp để chọn ảnh sản phẩm từ máy
              </span>
              <p className="text-caption text-text-muted mt-0.5">
                Hỗ trợ PNG, JPG, WebP chất lượng cao
              </p>
            </div>
          )}
        </button>

        {/* Nút chọn ảnh mẫu nhanh nếu chưa có ảnh */}
        {!productImageUrl && (
          <div className="flex justify-end">
            <button
              type="button"
              onClick={() =>
                onProductImageChange(
                  "https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=600&auto=format&fit=crop&q=80"
                )
              }
              className="text-caption text-primary hover:underline inline-flex items-center gap-1"
            >
              <ImagePlus className="h-3 w-3" /> Dùng thử ảnh mẫu demo
            </button>
          </div>
        )}
      </div>

      {/* ── 2. CHỌN MỤC ĐÍCH / DỊP CHIẾN DỊCH ────────────────────────── */}
      <div className="space-y-2 pt-2 border-t border-border">
        <div className="flex items-center justify-between">
          <label className="text-xs font-bold text-text">
            2. Chọn mục đích & dịp quảng cáo
          </label>
          <button
            type="button"
            onClick={onOpenTemplateGallery}
            className="inline-flex items-center gap-1 text-caption font-semibold text-primary hover:underline"
          >
            <LayoutGrid className="h-3 w-3" /> Xem Kho Template
          </button>
        </div>

        {/* Quick Purpose Tags */}
        <div className="grid grid-cols-2 gap-1.5">
          {PURPOSE_QUICK_TAGS.map((tag) => {
            const isSelected = occasionKey === tag.key
            return (
              <button
                key={tag.key}
                type="button"
                onClick={() => onOccasionChange(tag.key, tag.label.replace(/^[^\s]+\s/, ""))}
                className={`py-1.5 px-2.5 rounded-lg text-xs font-medium text-left border transition-all truncate ${
                  isSelected
                    ? "border-primary bg-primary/10 text-primary font-bold shadow-sm"
                    : "border-border bg-surface hover:bg-surface-alt text-text"
                }`}
              >
                {tag.label}
              </button>
            )
          })}
        </div>

        {/* Dropdown dịp chi tiết */}
        <div className="mt-1.5">
          <select
            value={occasionKey}
            onChange={(e) => {
              const selected = e.target.value
              const found = occasions.find((o) => o.key === selected)
              onOccasionChange(selected, found ? found.label : selected)
            }}
            className="w-full text-xs rounded-lg border border-border bg-background px-3 py-2 text-text focus:outline-none focus:ring-1 focus:ring-primary"
          >
            {occasions.map((o) => (
              <option key={o.key} value={o.key}>
                {o.label} {o.suggestedPromotion ? `(${o.suggestedPromotion})` : ""}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* ── 3. CHỌN PHƯƠNG THỨC TẠO (ENGINE) ─────────────────────────── */}
      <div className="space-y-2 pt-2 border-t border-border">
        <label className="text-xs font-bold text-text block">
          3. Chọn phương án thực hiện
        </label>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {/* Option A: Template Engine */}
          <button
            type="button"
            onClick={() => onEngineChange("TEMPLATE_ENGINE")}
            className={`p-2.5 rounded-xl border text-left flex flex-col justify-between transition-all ${
              generationEngine === "TEMPLATE_ENGINE"
                ? "border-primary bg-primary/5 ring-1 ring-primary shadow-sm"
                : "border-border bg-surface hover:bg-surface-alt"
            }`}
          >
            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-bold text-text flex items-center gap-1">
                  <Zap className="h-3.5 w-3.5 text-warning" /> Bố cục Template
                </span>
                <span className="text-caption px-1.5 py-0.2 rounded bg-success-bg text-success font-bold">
                  Khuyên dùng
                </span>
              </div>
              <p className="text-caption text-text-muted leading-relaxed">
                Tự động ghép ảnh thật + chữ tiếng Việt sắc nét chuẩn in & mạng xã hội, sửa được từng từ.
              </p>
            </div>
          </button>

          {/* Option B: Single-Call AI */}
          <button
            type="button"
            onClick={() => onEngineChange("AI_PROVIDER")}
            className={`p-2.5 rounded-xl border text-left flex flex-col justify-between transition-all ${
              generationEngine === "AI_PROVIDER"
                ? "border-primary bg-primary/5 ring-1 ring-primary shadow-sm"
                : "border-border bg-surface hover:bg-surface-alt"
            }`}
          >
            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-bold text-text flex items-center gap-1">
                  <Sparkles className="h-3.5 w-3.5 text-primary" /> AI Provider Single-Call
                </span>
                <span className="text-caption px-1.5 py-0.2 rounded bg-primary/10 text-primary font-bold">
                  Sáng tạo AI
                </span>
              </div>
              <p className="text-caption text-text-muted leading-relaxed">
                Gửi ảnh + prompt qua AI Provider trong 1 lần gọi, tự động kiểm định chất lượng QC.
              </p>
            </div>
          </button>
        </div>
      </div>

      {/* ── 4. NÚT KÍCH HOẠT TẠO TỰ ĐỘNG (1-CLICK) ───────────────────── */}
      <div className="pt-2">
        <button
          type="button"
          disabled={isGenerating || !productImageUrl}
          onClick={onTriggerAutoGenerate}
          className="w-full py-3 px-4 rounded-xl bg-primary text-primary-foreground font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg shadow-primary/20 hover:opacity-95 disabled:opacity-50 transition-all cursor-pointer"
        >
          {isGenerating ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>Đang tự động viết nội dung & dàn 5 kích thước...</span>
            </>
          ) : (
            <>
              <Zap className="h-4 w-4 text-warning" />
              <span>⚡ TỰ ĐỘNG TẠO BỘ POSTER & BANNER (1-CHẠM)</span>
            </>
          )}
        </button>
        {!productImageUrl && (
          <p className="text-caption text-warning text-center mt-1.5">
            ⚠️ Hãy tải ảnh sản phẩm lên trước để kích hoạt tạo tự động
          </p>
        )}
      </div>
    </div>
  )
}
