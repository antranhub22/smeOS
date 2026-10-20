"use client"

import { useEffect, useState } from "react"
import {
  calculateCountdownState,
  type CountdownState,
} from "@/modules/greeting-card/domain/subcontract-countdown"

/**
 * Hook đếm ngược thời gian thực (realtime tick mỗi giây) cho một mốc đích (targetMs).
 */
export function useStepCountdown(targetMs: number | null | undefined): CountdownState | null {
  const [state, setState] = useState<CountdownState | null>(() =>
    calculateCountdownState(targetMs)
  )

  useEffect(() => {
    setState(calculateCountdownState(targetMs))
    if (!targetMs) return

    const interval = setInterval(() => {
      setState(calculateCountdownState(targetMs))
    }, 1000)

    return () => clearInterval(interval)
  }, [targetMs])

  return state
}
