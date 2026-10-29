"use client"

import { useApi } from "@/components/greeting-card/greeting-api"

const EMPTY: readonly string[] = []

/** Ưu đãi tiệm đang bật (Hồ sơ tiệm) — nguồn duy nhất cho nhãn ưu đãi trên poster. */
export function useShopPromotions(): readonly string[] {
  const { data } = useApi<{ promotions: string[] }>("/api/v1/ad-banner-poster/copy")
  return data?.promotions ?? EMPTY
}
