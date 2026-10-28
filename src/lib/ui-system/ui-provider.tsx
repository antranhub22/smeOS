"use client"

import React, { createContext, useContext, useEffect, useState, useMemo, useCallback } from "react"
import type {
  UiSystemConfig,
  UiPresetId,
  UiDensity,
  UiLayoutMode,
  UiColorMode,
  UiSystemContextValue,
  UiPresetScope,
} from "./types"
import { DEFAULT_UI_CONFIG, getUiPreset, UI_PRESETS } from "./presets"

const UI_CONFIG_STORAGE_KEY = "smeos_ui_config"

const UiSystemContext = createContext<UiSystemContextValue | null>(null)

export function UiSystemProvider({
  children,
  initialConfig,
}: {
  children: React.ReactNode
  initialConfig?: Partial<UiSystemConfig>
}) {
  const [config, setConfig] = useState<UiSystemConfig>(() => ({
    ...DEFAULT_UI_CONFIG,
    ...initialConfig,
  }))

  // Hydrate from localStorage once mounted
  useEffect(() => {
    try {
      const stored = localStorage.getItem(UI_CONFIG_STORAGE_KEY)
      if (stored) {
        const parsed = JSON.parse(stored) as Partial<UiSystemConfig>
        if (parsed.preset && parsed.preset in UI_PRESETS) {
          setConfig((prev) => ({
            ...prev,
            ...parsed,
          }))
        }
      }
    } catch {
      // Fallback silently if storage unavailable
    }
  }, [])

  // Sync DOM data-attributes whenever config changes
  useEffect(() => {
    const root = document.documentElement
    root.setAttribute("data-theme", config.preset)
    root.setAttribute("data-density", config.density)
    root.setAttribute("data-layout-mode", config.layoutMode)

    try {
      localStorage.setItem(UI_CONFIG_STORAGE_KEY, JSON.stringify(config))
    } catch {
      // Ignore storage error
    }
  }, [config])

  const setPreset = useCallback((preset: UiPresetId) => {
    if (preset in UI_PRESETS) {
      setConfig((prev) => ({ ...prev, preset }))
    }
  }, [])

  const setDensity = useCallback((density: UiDensity) => {
    setConfig((prev) => ({ ...prev, density }))
  }, [])

  const setLayoutMode = useCallback((layoutMode: UiLayoutMode) => {
    setConfig((prev) => ({ ...prev, layoutMode }))
  }, [])

  const setColorMode = useCallback((colorMode: UiColorMode) => {
    setConfig((prev) => ({ ...prev, colorMode }))
  }, [])

  const resetToDefault = useCallback(() => {
    setConfig(DEFAULT_UI_CONFIG)
  }, [])

  const currentPreset = useMemo(() => getUiPreset(config.preset), [config.preset])

  // Detect platform scope từ URL path (dùng cho badge "Gợi ý cho")
  const platformScope = useMemo<UiPresetScope>(() => {
    if (typeof window === "undefined") return "all"
    const path = window.location.pathname
    if (path.startsWith("/chain") || path.startsWith("/store")) return "chain-store"
    return "saas-mother"
  }, [])

  // Hiển thị TẤT CẢ presets — scope chỉ là gợi ý, không ẩn preset
  // Preset có scope trùng với platform hiện tại được đánh dấu "Gợi ý"
  const availablePresets = useMemo(
    () => Object.values(UI_PRESETS),
    []
  )

  const value = useMemo<UiSystemContextValue>(
    () => ({
      config,
      currentPreset,
      availablePresets,
      setPreset,
      setDensity,
      setLayoutMode,
      setColorMode,
      resetToDefault,
    }),
    [config, currentPreset, availablePresets, setPreset, setDensity, setLayoutMode, setColorMode, resetToDefault]
  )

  return <UiSystemContext.Provider value={value}>{children}</UiSystemContext.Provider>
}

export function useUiSystem() {
  const context = useContext(UiSystemContext)
  if (!context) {
    // Graceful fallback for components outside of UiSystemProvider
    const defaultPreset = getUiPreset(DEFAULT_UI_CONFIG.preset)
    return {
      config: DEFAULT_UI_CONFIG,
      currentPreset: defaultPreset,
      availablePresets: [defaultPreset],
      setPreset: () => {},
      setDensity: () => {},
      setLayoutMode: () => {},
      setColorMode: () => {},
      resetToDefault: () => {},
    }
  }
  return context
}
