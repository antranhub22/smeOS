"use client"

import React from "react"
import { Type, Sparkles, Square, Zap, Sun, Moon } from "lucide-react"
import type {
  UiFontPairing,
  UiSurfaceEffect,
  UiBorderWidth,
  UiMotionSpeed,
  UiColorMode,
} from "@/lib/ui-system/types"

interface UiStudioFineTuneSectionProps {
  fontPairing?: UiFontPairing | undefined
  surfaceEffect?: UiSurfaceEffect | undefined
  borderWidth?: UiBorderWidth | undefined
  motionSpeed?: UiMotionSpeed | undefined
  colorMode: UiColorMode
  onChangeFont: (font: UiFontPairing) => void
  onChangeSurface: (surface: UiSurfaceEffect) => void
  onChangeBorder: (border: UiBorderWidth) => void
  onChangeMotion: (motion: UiMotionSpeed) => void
  onChangeColorMode: (mode: UiColorMode) => void
}

export function UiStudioFineTuneSection({
  fontPairing = "sans-clean",
  surfaceEffect = "flat",
  borderWidth = "thin",
  motionSpeed = "snappy",
  colorMode,
  onChangeFont,
  onChangeSurface,
  onChangeBorder,
  onChangeMotion,
  onChangeColorMode,
}: UiStudioFineTuneSectionProps) {
  return (
    <div className="space-y-5">
      {/* 1. Typography Pairing */}
      <div className="space-y-2.5">
        <div className="flex items-center gap-1.5 text-caption font-bold text-text uppercase tracking-wider">
          <Type className="w-3.5 h-3.5 text-primary" />
          <span>Bộ phông chữ (Typography)</span>
        </div>
        <div className="grid grid-cols-3 gap-2">
          {[
            { id: "sans-clean" as UiFontPairing, label: "Sans Clean", desc: "Be Vietnam Pro" },
            { id: "editorial-serif" as UiFontPairing, label: "Editorial", desc: "Serif Playfair" },
            { id: "tech-mono" as UiFontPairing, label: "Tech Mono", desc: "Space Grotesk" },
          ].map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => onChangeFont(item.id)}
              className={`p-2.5 rounded-xl border text-left transition-all ${
                fontPairing === item.id
                  ? "border-primary bg-primary-subtle text-primary font-bold shadow-xs"
                  : "border-border bg-surface text-text-muted hover:border-border-strong hover:text-text"
              }`}
            >
              <div className="text-caption font-semibold">{item.label}</div>
              <div className="text-caption text-text-muted text-[11px] truncate">{item.desc}</div>
            </button>
          ))}
        </div>
      </div>

      {/* 2. Surface & Material */}
      <div className="space-y-2.5">
        <div className="flex items-center gap-1.5 text-caption font-bold text-text uppercase tracking-wider">
          <Sparkles className="w-3.5 h-3.5 text-primary" />
          <span>Chất liệu bề mặt (Material)</span>
        </div>
        <div className="grid grid-cols-3 gap-2">
          {[
            { id: "flat" as UiSurfaceEffect, label: "Phẳng (Solid)", desc: "Tối giản, nhẹ" },
            { id: "glass" as UiSurfaceEffect, label: "Kính mờ", desc: "Backdrop blur" },
            { id: "aurora" as UiSurfaceEffect, label: "Cực quang", desc: "Mesh glow" },
          ].map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => onChangeSurface(item.id)}
              className={`p-2.5 rounded-xl border text-left transition-all ${
                surfaceEffect === item.id
                  ? "border-primary bg-primary-subtle text-primary font-bold shadow-xs"
                  : "border-border bg-surface text-text-muted hover:border-border-strong hover:text-text"
              }`}
            >
              <div className="text-caption font-semibold">{item.label}</div>
              <div className="text-caption text-text-muted text-[11px] truncate">{item.desc}</div>
            </button>
          ))}
        </div>
      </div>

      {/* 3. Border Stroke */}
      <div className="space-y-2.5">
        <div className="flex items-center gap-1.5 text-caption font-bold text-text uppercase tracking-wider">
          <Square className="w-3.5 h-3.5 text-primary" />
          <span>Độ đậm đường viền (Border)</span>
        </div>
        <div className="grid grid-cols-3 gap-2">
          {[
            { id: "none" as UiBorderWidth, label: "Không viền", desc: "0px viền" },
            { id: "thin" as UiBorderWidth, label: "Mảnh chuẩn", desc: "1px viền" },
            { id: "bold" as UiBorderWidth, label: "Đậm nét", desc: "2px viền" },
          ].map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => onChangeBorder(item.id)}
              className={`p-2.5 rounded-xl border text-left transition-all ${
                borderWidth === item.id
                  ? "border-primary bg-primary-subtle text-primary font-bold shadow-xs"
                  : "border-border bg-surface text-text-muted hover:border-border-strong hover:text-text"
              }`}
            >
              <div className="text-caption font-semibold">{item.label}</div>
              <div className="text-caption text-text-muted text-[11px] truncate">{item.desc}</div>
            </button>
          ))}
        </div>
      </div>

      {/* 4. Motion Speed */}
      <div className="space-y-2.5">
        <div className="flex items-center gap-1.5 text-caption font-bold text-text uppercase tracking-wider">
          <Zap className="w-3.5 h-3.5 text-primary" />
          <span>Tốc độ chuyển cảnh (Motion)</span>
        </div>
        <div className="grid grid-cols-3 gap-2">
          {[
            { id: "reduced" as UiMotionSpeed, label: "Tắt động", desc: "0ms tĩnh" },
            { id: "snappy" as UiMotionSpeed, label: "Nhanh nhạy", desc: "150ms tức thì" },
            { id: "smooth" as UiMotionSpeed, label: "Mượt mà", desc: "350ms cinematic" },
          ].map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => onChangeMotion(item.id)}
              className={`p-2.5 rounded-xl border text-left transition-all ${
                motionSpeed === item.id
                  ? "border-primary bg-primary-subtle text-primary font-bold shadow-xs"
                  : "border-border bg-surface text-text-muted hover:border-border-strong hover:text-text"
              }`}
            >
              <div className="text-caption font-semibold">{item.label}</div>
              <div className="text-caption text-text-muted text-[11px] truncate">{item.desc}</div>
            </button>
          ))}
        </div>
      </div>

      {/* 5. Color Mode Light / Dark */}
      <div className="space-y-2.5">
        <div className="flex items-center gap-1.5 text-caption font-bold text-text uppercase tracking-wider">
          <Sun className="w-3.5 h-3.5 text-primary" />
          <span>Chế độ Sáng / Tối</span>
        </div>
        <div className="grid grid-cols-3 gap-2">
          {[
            { id: "light" as UiColorMode, label: "Sáng", icon: Sun },
            { id: "dark" as UiColorMode, label: "Tối", icon: Moon },
            { id: "system" as UiColorMode, label: "Hệ thống", icon: Sun },
          ].map((item) => {
            const Icon = item.icon
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => onChangeColorMode(item.id)}
                className={`p-2.5 rounded-xl border flex items-center justify-center gap-2 transition-all ${
                  colorMode === item.id
                    ? "border-primary bg-primary-subtle text-primary font-bold shadow-xs"
                    : "border-border bg-surface text-text-muted hover:border-border-strong hover:text-text"
                }`}
              >
                <Icon className="w-4 h-4" />
                <span className="text-caption font-semibold">{item.label}</span>
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}
