"use client"

import React, { useState } from "react"
import { ChevronDown, Sliders, Sparkles } from "lucide-react"
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
    <div className="border border-slate-200/90 rounded-2xl bg-white shadow-xs overflow-hidden transition-all">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-5 py-3.5 flex items-center justify-between text-left hover:bg-slate-50/80 transition-colors"
      >
        <div className="flex items-center gap-2.5">
          <Sliders className="w-4 h-4 text-slate-500" />
          <span className="text-sm font-semibold text-slate-800">
            Tùy chọn phông nền & tỉ lệ khung hình
          </span>
          <span className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full font-medium">
            Mặc định: Tự động ✨
          </span>
        </div>
        <ChevronDown
          className={`w-4 h-4 text-slate-400 transition-transform ${isOpen ? "rotate-180" : ""}`}
        />
      </button>

      {isOpen && (
        <div className="p-5 border-t border-slate-100 space-y-5 bg-slate-50/30">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
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
                    className={`p-3 rounded-xl border text-left transition-all flex items-start gap-3 ${
                      isSelected
                        ? "border-amber-500 bg-amber-50/60 ring-2 ring-amber-500/10 shadow-xs"
                        : "border-slate-200 bg-white hover:border-slate-300"
                    }`}
                  >
                    <div
                      className="w-5 h-5 rounded-full border border-slate-300 shrink-0 mt-0.5"
                      style={{ backgroundColor: p.colorHex ?? "#f8fafc" }}
                    />
                    <div className="min-w-0">
                      <div className="text-xs font-semibold text-slate-900">{p.name}</div>
                      <div className="text-[11px] text-slate-500 line-clamp-1">{p.description}</div>
                    </div>
                  </button>
                )
              })}
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
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
                    className={`py-2 px-3 rounded-xl border text-center transition-all ${
                      isSelected
                        ? "border-amber-500 bg-amber-50/70 font-semibold text-amber-900 ring-2 ring-amber-500/10"
                        : "border-slate-200 bg-white text-slate-700 hover:border-slate-300 text-xs"
                    }`}
                  >
                    <div className="text-xs font-semibold">{r.label}</div>
                  </button>
                )
              })}
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Ghi chú bổ sung cho trợ lý AI (Tùy chọn)
            </label>
            <input
              type="text"
              value={customNote}
              onChange={(e) => onCustomNoteChange(e.target.value)}
              placeholder="Ví dụ: làm sáng hơn ở bên phải, nền ánh kem nhẹ ấm áp..."
              className="w-full text-xs rounded-xl border border-slate-200 px-3.5 py-2.5 bg-white focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 text-slate-800"
            />
          </div>
        </div>
      )}
    </div>
  )
}
