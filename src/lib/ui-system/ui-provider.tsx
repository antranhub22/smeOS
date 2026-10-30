"use client"

import React, { createContext, useContext, useEffect, useState, useMemo, useCallback } from "react"
import type {
  UiSystemConfig,
  UiPresetId,
  UiDensity,
  UiLayoutMode,
  UiColorMode,
  UiFontPairing,
  UiSurfaceEffect,
  UiBorderWidth,
  UiMotionSpeed,
  UiShadowStyle,
  UiBackgroundTexture,
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
    // Đọc storage sau lượt render đầu (tránh lệch hydrate), không setState đồng bộ trong effect
    void Promise.resolve().then(() => {
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
    })
  }, [])

  // Sync DOM data-attributes & CSS Variables whenever config changes
  useEffect(() => {
    const root = document.documentElement
    root.setAttribute("data-theme", config.preset)
    root.setAttribute("data-density", config.density)
    root.setAttribute("data-layout-mode", config.layoutMode)
    root.setAttribute("data-color-mode", config.colorMode)
    root.setAttribute("data-font-pairing", config.fontPairing || "sans-clean")
    root.setAttribute("data-surface-effect", config.surfaceEffect || "flat")
    root.setAttribute("data-border-width", config.borderWidth || "thin")
    root.setAttribute("data-motion-speed", config.motionSpeed || "snappy")
    root.setAttribute("data-shadow-style", config.shadowStyle || "soft")
    root.setAttribute("data-bg-texture", config.backgroundTexture || "none")

    // 1. Dynamic Injection 100% Token Colors từ Preset
    const activePreset = getUiPreset(config.preset)
    if (activePreset) {
      const t = activePreset.tokens
      root.style.setProperty("--color-primary", t.primary)
      root.style.setProperty("--color-primary-dark", t.primaryDark)
      root.style.setProperty("--color-primary-muted", t.primaryMuted)
      root.style.setProperty("--color-primary-border", t.primaryBorder)
      root.style.setProperty("--color-secondary", t.secondary)
      root.style.setProperty("--color-secondary-text", t.secondaryText)
      root.style.setProperty("--color-accent", t.accent)
      root.style.setProperty("--color-accent-bg", t.accentBg)
      root.style.setProperty("--color-bg", t.bg)
      root.style.setProperty("--color-surface", t.surface)
      root.style.setProperty("--color-surface-alt", t.surfaceAlt)
      root.style.setProperty("--color-border", t.border)
      root.style.setProperty("--color-text", t.text)
      root.style.setProperty("--color-text-muted", t.textMuted)
      root.style.setProperty("--color-selected", t.selected)
      root.style.setProperty("--color-selected-text", t.selectedText)

      // Radius
      root.style.setProperty("--radius-sm", activePreset.radius.sm)
      root.style.setProperty("--radius-md", activePreset.radius.md)
      root.style.setProperty("--radius-lg", activePreset.radius.lg)
      root.style.setProperty("--radius-card", activePreset.radius.card)
      root.style.setProperty("--radius-button", activePreset.radius.button)
      root.style.setProperty("--radius-dialog", activePreset.radius.dialog)

      // Shadows
      root.style.setProperty("--shadow-subtle", activePreset.shadows.subtle)
      root.style.setProperty("--shadow-card", activePreset.shadows.card)
      root.style.setProperty("--shadow-dialog", activePreset.shadows.dialog)
    }

    // Dynamic Border Width CSS Var
    if (config.borderWidth === "none") {
      root.style.setProperty("--ui-border-width", "0px")
    } else if (config.borderWidth === "bold") {
      root.style.setProperty("--ui-border-width", "2px")
    } else {
      root.style.setProperty("--ui-border-width", "1px")
    }

    // Dynamic Motion Speed CSS Var
    if (config.motionSpeed === "reduced") {
      root.style.setProperty("--ui-transition-duration", "0ms")
    } else if (config.motionSpeed === "smooth") {
      root.style.setProperty("--ui-transition-duration", "350ms")
    } else {
      root.style.setProperty("--ui-transition-duration", "150ms")
    }

    // Dynamic Shadow Style Override (nếu người dùng tùy chỉnh riêng)
    if (config.shadowStyle === "none") {
      root.style.setProperty("--shadow-subtle", "none")
      root.style.setProperty("--shadow-card", "none")
      root.style.setProperty("--shadow-dialog", "none")
    } else if (config.shadowStyle === "hard-block") {
      root.style.setProperty("--shadow-subtle", "2px 2px 0px 0px #000000")
      root.style.setProperty("--shadow-card", "4px 4px 0px 0px #000000")
      root.style.setProperty("--shadow-dialog", "8px 8px 0px 0px #000000")
    } else if (config.shadowStyle === "neumorphic") {
      root.style.setProperty("--shadow-subtle", "3px 3px 6px #d1d9e2, -3px -3px 6px #ffffff")
      root.style.setProperty("--shadow-card", "6px 6px 14px #d1d9e2, -6px -6px 14px #ffffff")
      root.style.setProperty("--shadow-dialog", "10px 10px 24px #d1d9e2, -10px -10px 24px #ffffff")
    }

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

  const setFontPairing = useCallback((fontPairing: UiFontPairing) => {
    setConfig((prev) => ({ ...prev, fontPairing }))
  }, [])

  const setSurfaceEffect = useCallback((surfaceEffect: UiSurfaceEffect) => {
    setConfig((prev) => ({ ...prev, surfaceEffect }))
  }, [])

  const setBorderWidth = useCallback((borderWidth: UiBorderWidth) => {
    setConfig((prev) => ({ ...prev, borderWidth }))
  }, [])

  const setMotionSpeed = useCallback((motionSpeed: UiMotionSpeed) => {
    setConfig((prev) => ({ ...prev, motionSpeed }))
  }, [])

  const setShadowStyle = useCallback((shadowStyle: UiShadowStyle) => {
    setConfig((prev) => ({ ...prev, shadowStyle }))
  }, [])

  const setBackgroundTexture = useCallback((backgroundTexture: UiBackgroundTexture) => {
    setConfig((prev) => ({ ...prev, backgroundTexture }))
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
      setFontPairing,
      setSurfaceEffect,
      setBorderWidth,
      setMotionSpeed,
      setShadowStyle,
      setBackgroundTexture,
      resetToDefault,
    }),
    [
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
      setShadowStyle,
      setBackgroundTexture,
      resetToDefault,
    ]
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
      setFontPairing: () => {},
      setSurfaceEffect: () => {},
      setBorderWidth: () => {},
      setMotionSpeed: () => {},
      setShadowStyle: () => {},
      setBackgroundTexture: () => {},
      resetToDefault: () => {},
    }
  }
  return context
}
