"use client"

import React, { useState } from "react"
import { Layers, ChevronDown, Check } from "lucide-react"
import { IMAGE_SET_BUNDLES } from "@/modules/product-image-set/domain/bundle-catalog"

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
    <div className="border border-border rounded-2xl bg-surface shadow-xs overflow-hidden transition-all">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-5 py-3.5 flex items-center justify-between text-left hover:bg-surface-alt/60 transition-colors cursor-pointer"
      >
        <div className="flex items-center gap-2.5">
          <Layers className="w-4 h-4 text-text-muted" />
          <span className="text-body-sm font-semibold text-text">
            Gói bộ ảnh thương mại:{" "}
            <span className="text-primary font-bold">{currentBundle?.name}</span>
          </span>
          <span className="text-caption bg-primary-subtle text-primary border border-primary/20 px-2 py-0.5 rounded-full font-medium">
            {currentBundle?.variants.length ?? 0} ảnh biến thể
          </span>
        </div>
        <ChevronDown
          className={`w-4 h-4 text-text-muted transition-transform ${isOpen ? "rotate-180" : ""}`}
        />
      </button>

      {isOpen && (
        <div className="p-5 border-t border-border space-y-4 bg-surface-alt/20">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {IMAGE_SET_BUNDLES.map((b) => {
              const isSelected = selectedBundleId === b.id
              return (
                <button
                  key={b.id}
                  type="button"
                  onClick={() => onBundleChange(b.id)}
                  className={`p-3.5 rounded-xl border text-left transition-all relative cursor-pointer ${
                    isSelected
                      ? "border-primary bg-primary-subtle ring-1 ring-primary shadow-xs"
                      : "border-border bg-surface hover:border-primary/40"
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <div className="text-body-sm font-bold text-text">{b.name}</div>
                    {isSelected && <Check className="w-4 h-4 text-primary" />}
                  </div>
                  <div className="text-caption text-text-muted mb-2">{b.description}</div>
                  <div className="flex flex-wrap gap-1.5">
                    {b.variants.map((v) => (
                      <span
                        key={v.id}
                        className="text-caption bg-surface-alt text-text-muted px-2 py-0.5 rounded-md font-medium border border-border"
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
            <label className="block text-caption font-bold text-text mb-1.5 uppercase tracking-wider">
              Ghi chú yêu cầu cho AI (Tùy chọn)
            </label>
            <input
              type="text"
              value={customNote}
              onChange={(e) => onCustomNoteChange(e.target.value)}
              placeholder="Ví dụ: Giữ nguyên ánh sáng tự nhiên, góc nghiêng nhẹ làm nổi bật ruy băng..."
              className="w-full text-caption rounded-xl border border-border px-3.5 py-2.5 bg-surface focus:outline-hidden focus:ring-1 focus:ring-primary text-text"
            />
          </div>
        </div>
      )}
    </div>
  )
}
