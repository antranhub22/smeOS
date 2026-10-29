"use client"

import { useEffect, useState } from "react"
import type { UxRolloutFlagKey } from "@/modules/platform/domain/ux-rollout-flags"

let pending: Promise<Set<string>> | null = null

function loadEnabledFlags(): Promise<Set<string>> {
  if (!pending) {
    pending = fetch("/api/v1/ux-rollout-flags", { cache: "no-store" })
      .then((res) => (res.ok ? res.json() : { data: { enabled: [] } }))
      .then((body: { data?: { enabled?: string[] } }) => new Set(body.data?.enabled ?? []))
      .catch(() => new Set<string>())
  }
  return pending
}

/** Gọi khi đổi tổ chức để đọc lại cờ của tổ chức mới (03c UX-022). */
export function resetUxRolloutFlagCache(): void {
  pending = null
}

/**
 * `null` khi chưa biết — màn nên giữ giao diện cũ cho tới khi cờ trả về `true`.
 * Lỗi mạng ⇒ coi như tắt (an toàn mặc định).
 */
export function useUxRolloutFlag(key: UxRolloutFlagKey): boolean | null {
  const [enabled, setEnabled] = useState<boolean | null>(null)
  useEffect(() => {
    let alive = true
    void loadEnabledFlags().then((set) => alive && setEnabled(set.has(key)))
    return () => {
      alive = false
    }
  }, [key])
  return enabled
}
