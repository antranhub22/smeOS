"use client"

import React, { useState } from "react"
import {
  Palette,
  X,
  Check,
  RotateCcw,
  Sparkles,
  Minimize2,
  Maximize2,
  Eye,
} from "lucide-react"
import { useUiSystem } from "@/lib/ui-system/ui-provider"
import { UI_PRESETS } from "@/lib/ui-system/presets"
import type { UiPresetId, UiDensity, UiLayoutMode } from "@/lib/ui-system/types"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"

export function UiStudioDrawer() {
  const [isOpen, setIsOpen] = useState(false)
  const {
    config,
    currentPreset,
    availablePresets,
    setPreset,
    setDensity,
    setLayoutMode,
    resetToDefault,
  } = useUiSystem()

  React.useEffect(() => {
    const handleOpen = () => setIsOpen(true)
    window.addEventListener("open-ui-studio", handleOpen)
    return () => window.removeEventListener("open-ui-studio", handleOpen)
  }, [])

  return (
    <>
      {/* Floating Toggle Button */}
      <div className="fixed bottom-24 right-6 z-40">
        <button
          type="button"
          onClick={() => setIsOpen((prev) => !prev)}
          className="group relative flex items-center gap-2 px-3 py-2.5 rounded-full bg-surface border border-border shadow-md hover:shadow-lg transition-all duration-200 hover:scale-105 text-text"
          title="Tùy biến Giao diện & UI Presets"
          aria-label="Mở bảng điều khiển giao diện"
        >
          <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center text-primary-fg shadow-xs">
            <Palette className="w-3.5 h-3.5" />
          </div>
          <span className="text-caption font-semibold pr-1 hidden sm:inline-block">
            UI Studio
          </span>
          <span className="text-caption uppercase font-mono px-1.5 py-0.5 rounded-full bg-primary-subtle text-primary border border-primary/20">
            {currentPreset.name.split(" ")[0]}
          </span>
        </button>
      </div>

      {/* Drawer Overlay */}
      {isOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden bg-black/30 backdrop-blur-xs transition-opacity animate-in fade-in">
          <div className="fixed inset-y-0 right-0 flex max-w-full pl-10">
            <div className="w-screen max-w-md bg-surface border-l border-border shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-right duration-200">
              {/* Drawer Header */}
              <div className="p-5 border-b border-border flex items-center justify-between bg-surface">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-primary flex items-center justify-center text-primary-fg">
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <div>
                    <h2 className="text-body-sm font-bold text-text leading-tight">
                      smeOS UI Studio
                    </h2>
                    <p className="text-caption text-text-muted mt-0.5">
                      Chuyển đổi phong cách & mật độ hiển thị tức thì
                    </p>
                  </div>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-sm"
                  aria-label="Đóng bảng điều khiển"
                  onClick={() => setIsOpen(false)}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>

              {/* Drawer Content */}
              <div className="flex-1 overflow-y-auto p-5 space-y-6">
                {/* 1. Chọn UI Preset Phong cách */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="text-caption font-bold text-text uppercase tracking-wider">
                      Phong cách giao diện
                    </label>
                    <span className="text-caption text-text-muted">
                      {availablePresets.length} Phong cách
                    </span>
                  </div>

                  <div className="space-y-3">
                    {availablePresets.map((preset) => {
                      const isSelected = config.preset === preset.id
                      const scopeLabel =
                        preset.scope === "saas-mother"
                          ? "SaaS Mother"
                          : preset.scope === "chain-store"
                          ? "ChainOS / StoreOS"
                          : null
                      return (
                        <button
                          key={preset.id}
                          type="button"
                          onClick={() => setPreset(preset.id as UiPresetId)}
                          className={`w-full text-left p-3.5 rounded-2xl cursor-pointer transition-all border ${
                            isSelected
                              ? "border-primary ring-1 ring-primary bg-primary-subtle/30"
                              : "border-border bg-surface hover:border-border-strong hover:bg-surface-muted/40"
                          }`}
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 flex-wrap">
                                <h3 className="text-meta font-bold text-text">
                                  {preset.name}
                                </h3>
                                {preset.isDefault && (
                                  <span className="text-caption font-semibold px-2 py-0.5 rounded-full bg-primary text-primary-fg">
                                    Mặc định
                                  </span>
                                )}
                                {scopeLabel && (
                                  <span className="text-caption font-medium px-2 py-0.5 rounded-full bg-surface-alt border border-border text-text-muted">
                                    {scopeLabel}
                                  </span>
                                )}
                              </div>
                              <p className="text-caption text-text-muted mt-0.5 font-medium">
                                {preset.tagline}
                              </p>
                            </div>
                            <div
                              className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${
                                isSelected
                                  ? "bg-primary text-primary-fg"
                                  : "border border-border bg-surface"
                              }`}
                            >
                              {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                            </div>
                          </div>

                          {/* Preview Color Swatches */}
                          <div className="flex items-center gap-1.5 mt-3 pt-2.5 border-t border-border">
                            <div
                              className="w-5 h-5 rounded-md shadow-2xs border border-black/10"
                              style={{ backgroundColor: preset.tokens.primary }}
                              title="Primary color"
                            />
                            <div
                              className="w-5 h-5 rounded-md shadow-2xs border border-black/10"
                              style={{ backgroundColor: preset.tokens.accent }}
                              title="Accent color"
                            />
                            <div
                              className="w-5 h-5 rounded-md shadow-2xs border border-black/10"
                              style={{ backgroundColor: preset.tokens.bg }}
                              title="Background"
                            />
                            <div
                              className="w-5 h-5 rounded-md shadow-2xs border border-black/10"
                              style={{ backgroundColor: preset.tokens.surface }}
                              title="Surface"
                            />
                            <div
                              className="w-5 h-5 rounded-md shadow-2xs border border-black/10"
                              style={{ backgroundColor: preset.tokens.text }}
                              title="Text"
                            />
                            <span className="text-caption font-mono text-text-muted ml-auto">
                              Radius: {preset.radius.button}
                            </span>
                          </div>
                        </button>
                      )
                    })}
                  </div>
                </div>

                {/* 2. Mật độ hiển thị (Density) */}
                <div className="space-y-3">
                  <label className="text-caption font-bold text-text uppercase tracking-wider block">
                    Mật độ khoảng cách (Density)
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      {
                        id: "compact" as UiDensity,
                        label: "Nhỏ gọn",
                        desc: "Cao độ dữ liệu",
                        icon: Minimize2,
                      },
                      {
                        id: "comfortable" as UiDensity,
                        label: "Tiêu chuẩn",
                        desc: "Cân bằng",
                        icon: Eye,
                      },
                      {
                        id: "spacious" as UiDensity,
                        label: "Rộng rãi",
                        desc: "Thoáng đãng",
                        icon: Maximize2,
                      },
                    ].map((item) => {
                      const isSelected = config.density === item.id
                      const Icon = item.icon
                      return (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() => setDensity(item.id)}
                          className={`p-3 rounded-xl border text-center transition-all flex flex-col items-center gap-1.5 ${
                            isSelected
                              ? "border-primary bg-primary-subtle text-primary font-bold shadow-xs"
                              : "border-border bg-surface text-text-muted hover:border-border-strong hover:text-text"
                          }`}
                        >
                          <Icon className="w-4 h-4" />
                          <span className="text-caption font-semibold leading-tight">
                            {item.label}
                          </span>
                          <span className="text-caption text-text-muted font-normal leading-tight">
                            {item.desc}
                          </span>
                        </button>
                      )
                    })}
                  </div>
                </div>

                {/* 3. Bố cục điều hướng (Layout Mode) */}
                <div className="space-y-3">
                  <label className="text-caption font-bold text-text uppercase tracking-wider block">
                    Kiểu điều hướng (Navigation Mode)
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      {
                        id: "sidebar" as UiLayoutMode,
                        label: "Thanh bên (Sidebar)",
                        desc: "Tiêu chuẩn cho Desktop",
                      },
                      {
                        id: "top-bar" as UiLayoutMode,
                        label: "Thanh trên (Top-bar)",
                        desc: "Mở rộng không gian làm việc",
                      },
                    ].map((item) => {
                      const isSelected = config.layoutMode === item.id
                      return (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() => setLayoutMode(item.id)}
                          className={`p-3 rounded-xl border text-left transition-all ${
                            isSelected
                              ? "border-primary bg-primary-subtle text-primary font-bold shadow-xs"
                              : "border-border bg-surface text-text-muted hover:border-border-strong hover:text-text"
                          }`}
                        >
                          <div className="text-caption font-semibold leading-tight">
                            {item.label}
                          </div>
                          <div className="text-caption text-text-muted font-normal mt-0.5">
                            {item.desc}
                          </div>
                        </button>
                      )
                    })}
                  </div>
                </div>

                {/* Live Preview Specs */}
                <Card className="p-3.5 space-y-2 bg-surface-muted/50" variant="default">
                  <div className="text-caption font-bold text-text uppercase tracking-wider">
                    Thông số hiển thị thực tế
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-caption font-mono text-text-muted">
                    <div>Theme: <span className="text-text font-bold">{config.preset}</span></div>
                    <div>Density: <span className="text-text font-bold">{config.density}</span></div>
                    <div>Font: <span className="text-text font-bold">Be Vietnam Pro</span></div>
                    <div>Layout: <span className="text-text font-bold">{config.layoutMode}</span></div>
                  </div>
                </Card>
              </div>

              {/* Drawer Footer */}
              <div className="p-4 border-t border-border flex items-center justify-between bg-surface">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={resetToDefault}
                >
                  <RotateCcw className="w-3.5 h-3.5 mr-1.5" />
                  Đặt lại mặc định
                </Button>
                <Button
                  type="button"
                  size="sm"
                  onClick={() => setIsOpen(false)}
                >
                  Xong
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
