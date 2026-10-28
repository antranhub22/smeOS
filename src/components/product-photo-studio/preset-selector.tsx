"use client"

import React, { useState } from "react"
import { ChevronDown, Sliders } from "lucide-react"
import { BACKGROUND_PRESETS, ASPECT_RATIO_OPTIONS } from "@/modules/product-photo-studio/domain/preset-catalog"

export interface PresetSelectorProps {
  selectedPreset: string
  selectedRatio: string
  customNote: string
  onPresetChange: (presetId: string) => void
  onRatioChange: (ratioId: string) => void
  onCustomNoteChange: (note: string) => void
}

export function PresetSelector({
  selectedPreset,
  selectedRatio,
  customNote,
  onPresetChange,
  onRatioChange,
  onCustomNoteChange,
}: PresetSelectorProps) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <div className="border border-border rounded-2xl bg-surface shadow-xs overflow-hidden transition-all">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-5 py-3.5 flex items-center justify-between text-left hover:bg-surface-alt/60 transition-colors cursor-pointer"
      >
        <div className="flex items-center gap-2.5">
          <Sliders className="w-4 h-4 text-text-muted" />
          <span className="text-body-sm font-semibold text-text">
            Tùy chọn phông nền & tỉ lệ khung hình
          </span>
          <span className="text-caption bg-surface-alt text-text-muted px-2 py-0.5 rounded-full font-medium border border-border">
            Mặc định: Tự động ✨
          </span>
        </div>
        <ChevronDown
          className={`w-4 h-4 text-text-muted transition-transform ${isOpen ? "rotate-180" : ""}`}
        />
      </button>

      {isOpen && (
        <div className="p-5 border-t border-border space-y-5 bg-surface-alt/20">
          <div>
            <label className="block text-caption font-bold text-text uppercase tracking-wider mb-2">
              Phong cách phông nền Studio
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {BACKGROUND_PRESETS.map((p) => {
                const isSelected = selectedPreset === p.id
                return (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => onPresetChange(p.id)}
                    className={`p-3 rounded-xl border text-left transition-all flex items-start gap-3 cursor-pointer ${
                      isSelected
                        ? "border-primary bg-primary-subtle ring-1 ring-primary shadow-xs"
                        : "border-border bg-surface hover:border-primary/40"
                    }`}
                  >
                    <div
                      className="w-5 h-5 rounded-full border border-border shrink-0 mt-0.5"
                      style={{ backgroundColor: p.colorHex ?? "#f8fafc" }}
                    />
                    <div className="min-w-0">
                      <div className="text-body-sm font-semibold text-text">{p.name}</div>
                      <div className="text-caption text-text-muted line-clamp-1">{p.description}</div>
                    </div>
                  </button>
                )
              })}
            </div>
          </div>

          <div>
            <label className="block text-caption font-bold text-text uppercase tracking-wider mb-2">
              Tỉ lệ khung hình xuất xưởng
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {ASPECT_RATIO_OPTIONS.map((r) => {
                const isSelected = selectedRatio === r.id
                return (
                  <button
                    key={r.id}
                    type="button"
                    onClick={() => onRatioChange(r.id)}
                    className={`py-2 px-3 rounded-xl border text-center transition-all cursor-pointer ${
                      isSelected
                        ? "border-primary bg-primary-subtle font-semibold text-primary ring-1 ring-primary"
                        : "border-border bg-surface text-text hover:border-primary/40 text-caption"
                    }`}
                  >
                    <div className="text-caption font-semibold">{r.label}</div>
                  </button>
                )
              })}
            </div>
          </div>

          <div>
            <label className="block text-caption font-bold text-text uppercase tracking-wider mb-1.5">
              Ghi chú bổ sung cho trợ lý AI (Tùy chọn)
            </label>
            <input
              type="text"
              value={customNote}
              onChange={(e) => onCustomNoteChange(e.target.value)}
              placeholder="Ví dụ: làm sáng hơn ở bên phải, nền ánh kem nhẹ ấm áp..."
              className="w-full text-caption rounded-xl border border-border px-3.5 py-2.5 bg-surface focus:outline-hidden focus:ring-1 focus:ring-primary focus:border-primary text-text"
            />
          </div>
        </div>
      )}
    </div>
  )
}
