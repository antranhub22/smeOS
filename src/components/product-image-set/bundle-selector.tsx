"use client"

import React, { useState } from "react"
import { Layers, ChevronDown, Check } from "lucide-react"
import { IMAGE_SET_BUNDLES, type ImageSetBundle } from "@/modules/product-image-set/domain/bundle-catalog"

export interface BundleSelectorProps {
  selectedBundleId: string
  customNote: string
  onBundleChange: (bundleId: string) => void
  onCustomNoteChange: (note: string) => void
}

export function BundleSelector({
  selectedBundleId,
  customNote,
  onBundleChange,
  onCustomNoteChange,
}: BundleSelectorProps) {
  const [isOpen, setIsOpen] = useState(false)
  const currentBundle =
    IMAGE_SET_BUNDLES.find((b) => b.id === selectedBundleId) ?? IMAGE_SET_BUNDLES[0]!

  return (
    <div className="border border-slate-200/90 rounded-2xl bg-white shadow-xs overflow-hidden transition-all">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-5 py-3.5 flex items-center justify-between text-left hover:bg-slate-50/80 transition-colors"
      >
        <div className="flex items-center gap-2.5">
          <Layers className="w-4 h-4 text-slate-500" />
          <span className="text-sm font-semibold text-slate-800">
            Gói bộ ảnh thương mại:{" "}
            <span className="text-amber-700 font-bold">{currentBundle?.name}</span>
          </span>
          <span className="text-xs bg-amber-50 text-amber-800 border border-amber-200/60 px-2 py-0.5 rounded-full font-medium">
            {currentBundle?.variants.length ?? 0} ảnh biến thể
          </span>
        </div>
        <ChevronDown
          className={`w-4 h-4 text-slate-400 transition-transform ${isOpen ? "rotate-180" : ""}`}
        />
      </button>

      {isOpen && (
        <div className="p-5 border-t border-slate-100 space-y-4 bg-slate-50/30">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {IMAGE_SET_BUNDLES.map((b) => {
              const isSelected = selectedBundleId === b.id
              return (
                <button
                  key={b.id}
                  type="button"
                  onClick={() => onBundleChange(b.id)}
                  className={`p-3.5 rounded-xl border text-left transition-all relative ${
                    isSelected
                      ? "border-amber-500 bg-amber-50/60 ring-2 ring-amber-500/10 shadow-xs"
                      : "border-slate-200 bg-white hover:border-slate-300"
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <div className="text-xs font-bold text-slate-900">{b.name}</div>
                    {isSelected && <Check className="w-4 h-4 text-amber-600" />}
                  </div>
                  <div className="text-[11px] text-slate-500 mb-2">{b.description}</div>
                  <div className="flex flex-wrap gap-1.5">
                    {b.variants.map((v) => (
                      <span
                        key={v.id}
                        className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded-md font-medium"
                      >
                        {v.aspectRatio} • {v.channelTarget}
                      </span>
                    ))}
                  </div>
                </button>
              )
            })}
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">
              Ghi chú yêu cầu cho AI (Tùy chọn)
            </label>
            <input
              type="text"
              value={customNote}
              onChange={(e) => onCustomNoteChange(e.target.value)}
              placeholder="Ví dụ: Giữ nguyên ánh sáng tự nhiên, góc nghiêng nhẹ làm nổi bật ruy băng..."
              className="w-full text-xs rounded-xl border border-slate-200 px-3.5 py-2.5 bg-white focus:outline-none focus:ring-2 focus:ring-amber-500/20 text-slate-800"
            />
          </div>
        </div>
      )}
    </div>
  )
}
