"use client"

import React, { createContext, useContext, useEffect, useState, useMemo, useCallback } from "react"
import type {
  UiSystemConfig,
  UiPresetId,
  UiDensity,
  UiSystemContextValue,
} from "./types"
import { DEFAULT_UI_CONFIG, getUiPreset, UI_PRESETS } from "./presets"

const UI_DENSITY_STORAGE_KEY = "smeos_ui_density"

const UiSystemContext = createContext<UiSystemContextValue | null>(null)

/** Density người dùng đã chọn và lưu ở localStorage; `null` khi chưa chọn hoặc không đọc được. */
export function readStoredDensity(storage: Pick<Storage, "getItem"> | undefined = globalThis.localStorage): UiDensity | null {
  try {
    const value = storage?.getItem(UI_DENSITY_STORAGE_KEY)
    return value === "compact" || value === "comfortable" ? value : null
  } catch {
    return null
  }
}

/**
 * Giữ nguyên object config khi density đọc từ localStorage trùng giá trị đang dùng. Một object mới
 * làm context đổi ngay sau hydrate: React bỏ HTML máy chủ của segment trang còn chờ chunk JS và
 * dựng lại phía client, phần tử LCP bị vẽ lại muộn (trang chủ di động 1,7 s → 3,8 s).
 */
export function withStoredDensity(prev: UiSystemConfig, density: UiDensity): UiSystemConfig {
  return prev.density === density ? prev : { ...prev, density }
}

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

  // Density cá nhân (ADR-011 D-UI-03): đọc ngay khi gắn, trước khi effect bên dưới ghi density hiện
  // tại vào localStorage — đọc muộn hơn thì chỉ đọc lại giá trị vừa ghi và lựa chọn của người dùng mất.
  useEffect(() => {
    const storedDensity = readStoredDensity()
    if (!storedDensity) return
    void Promise.resolve().then(() => {
      setConfig((prev) => withStoredDensity(prev, storedDensity))
      document.documentElement.setAttribute("data-density", storedDensity)
    })
  }, [])

  // Sync DOM data-attributes when preset/density modified in dev / UI studio (no inline style injection)
  useEffect(() => {
    const root = document.documentElement
    root.setAttribute("data-theme", config.preset)
    root.setAttribute("data-density", config.density)
    try {
      localStorage.setItem(UI_DENSITY_STORAGE_KEY, config.density)
    } catch {
      // Ignore storage error
    }
  }, [config.preset, config.density])

  // Listen to external DOM changes on document.documentElement (e.g. editing data-theme / data-density in Chrome DevTools)
  // Chỉ phục vụ chỉnh tay thuộc tính trong DevTools — không theo dõi DOM ở production.
  useEffect(() => {
    if (process.env.NODE_ENV === "production") return
    const root = document.documentElement
    const handleMutation = () => {
      const domTheme = root.getAttribute("data-theme")
      const domDensity = root.getAttribute("data-density")

      const normalizedTheme: UiPresetId | null =
        domTheme === "clean-blue"
          ? "modern-slate"
          : domTheme && domTheme in UI_PRESETS
            ? (domTheme as UiPresetId)
            : null

      if (normalizedTheme) {
        setConfig((prev) => (prev.preset === normalizedTheme ? prev : { ...prev, preset: normalizedTheme }))
      }
      if (domDensity === "compact" || domDensity === "comfortable") {
        setConfig((prev) => (prev.density === domDensity ? prev : { ...prev, density: domDensity }))
      }
    }

    const observer = new MutationObserver(handleMutation)
    observer.observe(root, { attributes: true, attributeFilter: ["data-theme", "data-density"] })
    return () => observer.disconnect()
  }, [])

  const setPreset = useCallback((preset: UiPresetId) => {
    if (preset in UI_PRESETS) {
      setConfig((prev) => ({ ...prev, preset }))
    }
  }, [])

  const setDensity = useCallback((density: UiDensity) => {
    setConfig((prev) => ({ ...prev, density }))
  }, [])

  const resetToDefault = useCallback(() => {
    setConfig(DEFAULT_UI_CONFIG)
  }, [])

  const currentPreset = useMemo(() => getUiPreset(config.preset), [config.preset])
  const availablePresets = useMemo(() => Object.values(UI_PRESETS), [])

  const value = useMemo<UiSystemContextValue>(
    () => ({
      config,
      currentPreset,
      availablePresets,
      setPreset,
      setDensity,
      resetToDefault,
    }),
    [config, currentPreset, availablePresets, setPreset, setDensity, resetToDefault]
  )

  return <UiSystemContext.Provider value={value}>{children}</UiSystemContext.Provider>
}

export function useUiSystem() {
  const context = useContext(UiSystemContext)
  if (!context) {
    const defaultPreset = getUiPreset(DEFAULT_UI_CONFIG.preset)
    return {
      config: DEFAULT_UI_CONFIG,
      currentPreset: defaultPreset,
      availablePresets: [defaultPreset],
      setPreset: () => {},
      setDensity: () => {},
      resetToDefault: () => {},
    }
  }
  return context
}
