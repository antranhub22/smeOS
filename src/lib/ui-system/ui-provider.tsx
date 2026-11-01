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

  // Hydrate density from localStorage if user customized personal density preference (ADR-011 D-UI-03)
  useEffect(() => {
    void Promise.resolve().then(() => {
      try {
        const storedDensity = localStorage.getItem(UI_DENSITY_STORAGE_KEY)
        if (storedDensity === "compact" || storedDensity === "comfortable") {
          setConfig((prev) => ({ ...prev, density: storedDensity }))
          document.documentElement.setAttribute("data-density", storedDensity)
        }
      } catch {
        // Fallback silently if storage unavailable
      }
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
