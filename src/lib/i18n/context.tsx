"use client"

/**
 * context.tsx — React Context & Hook đa ngôn ngữ cho Client Components
 */

import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from "react"
import { getDictionary, translate, interpolate } from "./server"
import type { SupportedLocale, I18nContextValue, TranslationKey, InterpolationParams } from "./types"
import { DEFAULT_LOCALE, SUPPORTED_LOCALES } from "./types"

import { getIndustryTerminology } from "@/modules/organization/domain/industry-profile"

const STORAGE_KEY = "floraos_locale"

const I18nContext = createContext<I18nContextValue | null>(null)

export interface I18nProviderProps {
  children: React.ReactNode
  initialLocale?: SupportedLocale
  industryKey?: string
}

export function I18nProvider({ children, initialLocale = DEFAULT_LOCALE, industryKey }: I18nProviderProps) {
  const [locale, setLocaleState] = useState<SupportedLocale>(initialLocale)

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY) as SupportedLocale | null
      if (saved && SUPPORTED_LOCALES.includes(saved)) {
        // eslint-disable-next-line react-hooks/set-state-in-effect -- đọc ngôn ngữ đã lưu sau hydrate để tránh lệch SSR, chủ đích
        setLocaleState(saved)
      }
    } catch {
      // Bỏ qua lỗi nếu môi trường không có localStorage
    }
  }, [])

  const setLocale = useCallback((nextLocale: SupportedLocale) => {
    setLocaleState(nextLocale)
    try {
      localStorage.setItem(STORAGE_KEY, nextLocale)
    } catch {
      // Bỏ qua lỗi
    }
  }, [])

  const dict = useMemo(() => getDictionary(locale), [locale])

  const t = useCallback(
    (key: TranslationKey, params?: InterpolationParams): string => {
      return translate(locale, key, params)
    },
    [locale]
  )

  const industryTerms = useMemo(() => getIndustryTerminology(industryKey), [industryKey])

  const ti = useCallback(
    (termKey: "makerTitle" | "makerAction" | "productRecipe" | "sampleProduct" | "rawMaterialItem" | "completedProductPhoto" | "printablesTitle"): string => {
      return industryTerms[termKey] || ""
    },
    [industryTerms]
  )

  const value = useMemo<I18nContextValue>(
    () => ({
      locale,
      setLocale,
      t,
      dict,
      industryKey,
      ti,
    }),
    [locale, setLocale, t, dict, industryKey, ti]
  )

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>
}

/**
 * Hook đa ngôn ngữ dùng trong mọi React component:
 * const { t, ti } = useI18n()
 * <h1>{ti('makerTitle')}</h1>
 */
export function useI18n(): I18nContextValue {
  const context = useContext(I18nContext)
  if (!context) {
    const fallbackTerms = getIndustryTerminology()
    return {
      locale: DEFAULT_LOCALE,
      setLocale: () => {},
      t: (key: TranslationKey, params?: InterpolationParams) => translate(DEFAULT_LOCALE, key, params),
      dict: getDictionary(DEFAULT_LOCALE),
      industryKey: "FLORAL",
      ti: (termKey) => fallbackTerms[termKey] || "",
    }
  }
  return context
}

export { interpolate }
