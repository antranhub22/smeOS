"use client"

import { useCallback, useEffect, useState } from "react"
import { Skeleton } from "@/components/ui/skeleton"
import { InlineError } from "@/components/ui/inline-error"
import { acquisitionApi, type ShortLinkStats } from "./acquisition-api"

const DEVICE_LABELS: Record<string, string> = { MOBILE: "Điện thoại", TABLET: "Máy tính bảng", DESKTOP: "Máy tính", UNKNOWN: "Không rõ" }
const RANGES = [7, 30, 90] as const

/** Lượt quét theo ngày + thiết bị + khách riêng + số khách để lại thông tin từ mã này. */
export function ShortLinkStatsPanel({ linkId }: { linkId: string }) {
  const [days, setDays] = useState<number>(30)
  const [stats, setStats] = useState<ShortLinkStats | null>(null)
  const [error, setError] = useState<string | null>(null)

  const fetchStats = useCallback(
    () =>
      acquisitionApi
        .linkStats(linkId, days)
        .then((s) => {
          setStats(s)
          setError(null)
        })
        .catch((e: Error) => setError(e.message)),
    [linkId, days],
  )

  useEffect(() => {
    void fetchStats()
  }, [fetchStats])

  const load = () => {
    setError(null)
    setStats(null)
    void fetchStats()
  }

  const selectRange = (r: number) => {
    setStats(null)
    setDays(r)
  }

  const dayEntries = stats ? Object.entries(stats.byDay) : []
  const max = Math.max(1, ...dayEntries.map(([, n]) => n))

  return (
    <div className="space-y-3 rounded-xl bg-surface-alt p-3 sm:p-4">
      <div role="group" aria-label="Khoảng thời gian" className="flex flex-wrap gap-1.5">
        {RANGES.map((r) => (
          <button
            key={r}
            type="button"
            aria-pressed={days === r}
            onClick={() => selectRange(r)}
            className={`h-8 rounded-lg px-3 text-caption font-medium ${days === r ? "bg-primary text-white" : "bg-surface text-text border border-border"}`}
          >
            {r} ngày
          </button>
        ))}
      </div>
      {error && <InlineError message={error} onRetry={load} />}
      {!stats && !error && <Skeleton className="h-24 w-full" />}
      {stats && (
        <>
          <dl className="grid grid-cols-3 gap-2 text-center">
            {[
              ["Lượt quét", stats.totalScans],
              ["Khách riêng", stats.uniqueVisitors],
              ["Để lại thông tin", stats.leads],
            ].map(([label, value]) => (
              <div key={label} className="rounded-lg bg-surface p-2">
                <dt className="text-caption text-text-muted">{label}</dt>
                <dd className="text-title-sm font-semibold text-text">{value}</dd>
              </div>
            ))}
          </dl>
          {dayEntries.length === 0 ? (
            <p className="text-caption text-text-muted">Chưa có lượt quét nào trong {days} ngày qua.</p>
          ) : (
            <ul aria-label="Lượt quét theo ngày" className="space-y-1">
              {dayEntries.slice(-14).map(([day, n]) => (
                <li key={day} className="flex items-center gap-2 text-caption text-text">
                  <span className="w-20 shrink-0 tabular-nums">{day.slice(8, 10)}/{day.slice(5, 7)}</span>
                  <span className="h-2 rounded-full bg-primary" style={{ width: `${Math.max(4, (n / max) * 100)}%` }} aria-hidden="true" />
                  <span className="tabular-nums">{n}</span>
                </li>
              ))}
            </ul>
          )}
          <p className="text-caption text-text-muted">
            {Object.entries(stats.byDevice).map(([d, n]) => `${DEVICE_LABELS[d] ?? d}: ${n}`).join(" · ") || "Chưa có dữ liệu thiết bị"}
          </p>
        </>
      )}
    </div>
  )
}
