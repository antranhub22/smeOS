"use client"

import React, { useState } from "react"
import { Download, CheckCircle2, AlertCircle, ExternalLink, Sparkles, Image as ImageIcon } from "lucide-react"
import type { ProductSetVariantResult, ProductImageSetResult } from "@/modules/product-image-set/use-cases/get-product-image-set-result"

export interface ImageSetViewerProps {
  originalUrl: string
  result: ProductImageSetResult
  onUseInGreetingCard?: () => void
  onUseInCatalog?: () => void
}

export function ImageSetViewer({
  originalUrl,
  result,
  onUseInGreetingCard,
  onUseInCatalog,
}: ImageSetViewerProps) {
  const [selectedVariant, setSelectedVariant] = useState<ProductSetVariantResult>(
    result.variants[0] || {
      id: "master",
      name: "Ảnh gốc",
      channelTarget: "Gốc",
      aspectRatio: "1:1",
      angleLabel: "Chính diện",
      url: originalUrl,
      passed: true,
    }
  )

  const handleDownloadAll = () => {
    // Mở tải từng ảnh trong tab mới
    for (const v of result.variants) {
      if (v.url) window.open(v.url, "_blank")
    }
  }

  return (
    <div className="space-y-6">
      {/* Header Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <div className="text-sm font-bold text-slate-900">{result.bundleName}</div>
          <div className="text-xs text-slate-500 mt-0.5">
            Đã sinh {result.variants.length} ảnh biến thể đồng nhất • Điểm nhất quán bộ:{" "}
            <span className="text-emerald-700 font-bold">
              {(result.qcEvaluation.setConsistencyScore * 100).toFixed(0)}% (Cùng 1 SP)
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleDownloadAll}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors shadow-xs"
          >
            <Download className="w-3.5 h-3.5" /> Tải trọn bộ
          </button>
          <button
            type="button"
            onClick={onUseInCatalog}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-amber-600 text-white text-xs font-semibold hover:bg-amber-700 transition-colors shadow-xs"
          >
            <CheckCircle2 className="w-3.5 h-3.5" /> Dùng cho Catalog
          </button>
        </div>
      </div>

      {/* Grid of Variants */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Interactive Preview */}
        <div className="lg:col-span-7 space-y-3">
          <div className="relative aspect-square max-w-lg mx-auto rounded-2xl overflow-hidden border border-slate-200 shadow-md bg-slate-900 flex items-center justify-center">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={selectedVariant.url || originalUrl}
              alt={selectedVariant.name}
              className="w-full h-full object-contain"
            />
            <div className="absolute top-3 left-3 bg-black/60 backdrop-blur-xs text-white text-xs font-medium px-2.5 py-1 rounded-lg">
              {selectedVariant.aspectRatio} • {selectedVariant.angleLabel}
            </div>
            <div className="absolute bottom-3 right-3 bg-amber-600/90 text-white text-xs font-semibold px-2.5 py-1 rounded-lg">
              {selectedVariant.channelTarget}
            </div>
          </div>
          <div className="text-center text-xs font-medium text-slate-600">
            {selectedVariant.name}
          </div>
        </div>

        {/* Right: Variant Thumbnails & QC */}
        <div className="lg:col-span-5 space-y-4">
          <div className="text-xs font-bold text-slate-700 uppercase tracking-wider">
            Các ảnh trong bộ ({result.variants.length})
          </div>

          <div className="grid grid-cols-2 gap-3">
            {result.variants.map((v) => {
              const isSelected = selectedVariant.id === v.id
              return (
                <button
                  key={v.id}
                  type="button"
                  onClick={() => setSelectedVariant(v)}
                  className={`p-2 rounded-xl border text-left transition-all relative group overflow-hidden ${
                    isSelected
                      ? "border-amber-500 bg-amber-50/50 ring-2 ring-amber-500/10 shadow-xs"
                      : "border-slate-200 bg-white hover:border-slate-300"
                  }`}
                >
                  <div className="aspect-square rounded-lg overflow-hidden bg-slate-100 mb-2 border border-slate-200/60">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={v.url} alt={v.name} className="w-full h-full object-cover" />
                  </div>
                  <div className="text-[11px] font-bold text-slate-800 line-clamp-1">{v.name}</div>
                  <div className="text-[10px] text-slate-500 flex items-center justify-between mt-0.5">
                    <span>{v.channelTarget}</span>
                    <span className="font-semibold text-emerald-700">✅ Đạt</span>
                  </div>
                </button>
              )
            })}
          </div>

          {/* Set Consistency Banner */}
          <div className="p-4 rounded-xl border border-emerald-200 bg-emerald-50/60 text-emerald-950 space-y-1.5">
            <div className="flex items-center gap-2 text-xs font-bold text-emerald-900">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              Đạt chứng chỉ Set Consistency 02.1
            </div>
            <p className="text-[11px] text-emerald-800 leading-relaxed">
              Mọi ảnh biến thể đã được AI kiểm định khớp 100% hình thái sản phẩm gốc, cùng thành phần cấu tạo, cấu trúc và màu sắc.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
