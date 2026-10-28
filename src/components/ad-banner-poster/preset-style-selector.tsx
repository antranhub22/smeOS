"use client"

import React from "react"
import { Check } from "lucide-react"
import {
  BANNER_PRESETS,
  type BannerStylePreset,
} from "@/modules/ad-banner-poster/domain/banner-presets"
import type { BannerStylePresetId } from "@/modules/ad-banner-poster/domain/banner-types"

interface PresetStyleSelectorProps {
  readonly selectedPresetId: BannerStylePresetId
  readonly onSelectPreset: (presetId: BannerStylePresetId) => void
}

export function PresetStyleSelector({
  selectedPresetId,
  onSelectPreset,
}: PresetStyleSelectorProps) {
  const presetsList = Object.values(BANNER_PRESETS) as BannerStylePreset[]

  return (
    <div className="space-y-2">
      <label className="text-xs font-semibold text-text flex items-center justify-between">
        <span>Phong cách thiết kế</span>
        <span className="text-caption font-normal text-text-muted">
          5 phong cách chuẩn sàn
        </span>
      </label>

      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
        {presetsList.map((preset) => {
          const isSelected = preset.id === selectedPresetId
          return (
            <button
              key={preset.id}
              type="button"
              onClick={() => onSelectPreset(preset.id)}
              className={`relative flex flex-col items-start p-2.5 rounded-lg border text-left transition-all ${
                isSelected
                  ? "border-primary bg-primary/5 ring-1 ring-primary shadow-sm"
                  : "border-border bg-surface hover:border-border-strong hover:bg-surface-alt"
              }`}
            >
              {isSelected && (
                <span className="absolute top-1.5 right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-white">
                  <Check className="h-2.5 w-2.5" />
                </span>
              )}

              {/* Visual color dot */}
              <div
                className={`h-3 w-8 rounded-full mb-1.5 bg-gradient-to-r ${preset.decorativeAccent}`}
              />

              <div className="text-xs font-bold text-text truncate w-full">
                {preset.name}
              </div>
              <div className="text-caption text-text-muted truncate w-full mt-0.5">
                {preset.tag}
              </div>
            </button>
          )
        })}
      </div>
    </div>
  )
}
