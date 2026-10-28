"use client"

import React, { useState } from "react"
import {
  Palette,
  X,
  RotateCcw,
  Sparkles,
  Minimize2,
  Maximize2,
  Eye,
  SlidersHorizontal,
} from "lucide-react"
import { useUiSystem } from "@/lib/ui-system/ui-provider"
import type { UiPresetId, UiDensity, UiLayoutMode } from "@/lib/ui-system/types"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { UiStudioPresetList } from "./ui-studio-preset-list"
import { UiStudioFineTuneSection } from "./ui-studio-fine-tune-section"

export function UiStudioDrawer() {
  const [isOpen, setIsOpen] = useState(false)
  const [activeTab, setActiveTab] = useState<"presets" | "finetune">("presets")

  const {
    config,
    currentPreset,
    availablePresets,
    setPreset,
    setDensity,
    setLayoutMode,
    setColorMode,
    setFontPairing,
    setSurfaceEffect,
    setBorderWidth,
    setMotionSpeed,
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
                      Chuyển đổi phong cách & tinh chỉnh thông số giao diện
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

              {/* Navigation Tabs */}
              <div className="flex border-b border-border bg-surface-muted/30 p-1 mx-4 mt-3 rounded-xl gap-1">
                <button
                  type="button"
                  onClick={() => setActiveTab("presets")}
                  className={`flex-1 py-1.5 text-caption font-semibold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                    activeTab === "presets"
                      ? "bg-surface text-primary shadow-xs font-bold"
                      : "text-text-muted hover:text-text"
                  }`}
                >
                  <Palette className="w-3.5 h-3.5" />
                  <span>Bộ phong cách ({availablePresets.length})</span>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab("finetune")}
                  className={`flex-1 py-1.5 text-caption font-semibold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                    activeTab === "finetune"
                      ? "bg-surface text-primary shadow-xs font-bold"
                      : "text-text-muted hover:text-text"
                  }`}
                >
                  <SlidersHorizontal className="w-3.5 h-3.5" />
                  <span>Tinh chỉnh thông số</span>
                </button>
              </div>

              {/* Drawer Scrollable Content */}
              <div className="flex-1 overflow-y-auto p-5 space-y-6">
                {activeTab === "presets" ? (
                  <>
                    <UiStudioPresetList
                      availablePresets={availablePresets}
                      selectedPresetId={config.preset}
                      onSelectPreset={(id: UiPresetId) => setPreset(id)}
                    />

                    {/* Density Control */}
                    <div className="space-y-3 pt-2 border-t border-border">
                      <label className="text-caption font-bold text-text uppercase tracking-wider block">
                        Mật độ khoảng cách (Density)
                      </label>
                      <div className="grid grid-cols-3 gap-2">
                        {[
                          { id: "compact" as UiDensity, label: "Nhỏ gọn", desc: "Cao độ", icon: Minimize2 },
                          { id: "comfortable" as UiDensity, label: "Tiêu chuẩn", desc: "Cân bằng", icon: Eye },
                          { id: "spacious" as UiDensity, label: "Rộng rãi", desc: "Thoáng đãng", icon: Maximize2 },
                        ].map((item) => {
                          const isSelected = config.density === item.id
                          const Icon = item.icon
                          return (
                            <button
                              key={item.id}
                              type="button"
                              onClick={() => setDensity(item.id)}
                              className={`p-2.5 rounded-xl border text-center transition-all flex flex-col items-center gap-1 ${
                                isSelected
                                  ? "border-primary bg-primary-subtle text-primary font-bold shadow-xs"
                                  : "border-border bg-surface text-text-muted hover:border-border-strong hover:text-text"
                              }`}
                            >
                              <Icon className="w-3.5 h-3.5" />
                              <span className="text-caption font-semibold leading-tight">{item.label}</span>
                              <span className="text-caption text-text-muted text-[10px] leading-tight">{item.desc}</span>
                            </button>
                          )
                        })}
                      </div>
                    </div>

                    {/* Navigation Mode */}
                    <div className="space-y-3">
                      <label className="text-caption font-bold text-text uppercase tracking-wider block">
                        Kiểu điều hướng (Navigation Mode)
                      </label>
                      <div className="grid grid-cols-2 gap-2">
                        {[
                          { id: "sidebar" as UiLayoutMode, label: "Thanh bên (Sidebar)", desc: "Tiêu chuẩn Desktop" },
                          { id: "top-nav" as UiLayoutMode, label: "Thanh trên (Top-bar)", desc: "Không gian rộng" },
                        ].map((item) => {
                          const isSelected = config.layoutMode === item.id
                          return (
                            <button
                              key={item.id}
                              type="button"
                              onClick={() => setLayoutMode(item.id)}
                              className={`p-2.5 rounded-xl border text-left transition-all ${
                                isSelected
                                  ? "border-primary bg-primary-subtle text-primary font-bold shadow-xs"
                                  : "border-border bg-surface text-text-muted hover:border-border-strong hover:text-text"
                              }`}
                            >
                              <div className="text-caption font-semibold leading-tight">{item.label}</div>
                              <div className="text-caption text-text-muted text-[11px] mt-0.5">{item.desc}</div>
                            </button>
                          )
                        })}
                      </div>
                    </div>
                  </>
                ) : (
                  <UiStudioFineTuneSection
                    fontPairing={config.fontPairing}
                    surfaceEffect={config.surfaceEffect}
                    borderWidth={config.borderWidth}
                    motionSpeed={config.motionSpeed}
                    colorMode={config.colorMode}
                    onChangeFont={setFontPairing}
                    onChangeSurface={setSurfaceEffect}
                    onChangeBorder={setBorderWidth}
                    onChangeMotion={setMotionSpeed}
                    onChangeColorMode={setColorMode}
                  />
                )}

                {/* Live Preview Specs */}
                <Card className="p-3.5 space-y-2 bg-surface-muted/50" variant="default">
                  <div className="text-caption font-bold text-text uppercase tracking-wider">
                    Thông số hiển thị thực tế
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-caption font-mono text-text-muted text-[11px]">
                    <div>Preset: <span className="text-text font-bold">{config.preset}</span></div>
                    <div>Density: <span className="text-text font-bold">{config.density}</span></div>
                    <div>Font: <span className="text-text font-bold">{config.fontPairing || "sans-clean"}</span></div>
                    <div>Border: <span className="text-text font-bold">{config.borderWidth || "thin"}</span></div>
                    <div>Material: <span className="text-text font-bold">{config.surfaceEffect || "flat"}</span></div>
                    <div>Motion: <span className="text-text font-bold">{config.motionSpeed || "snappy"}</span></div>
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
