/**
 * Bộ thu Web Vitals chạy trong trang (Chromium), nạp bằng `page.addInitScript` trước khi trang tải.
 * Chỉ dùng API chuẩn của trình duyệt (PerformanceObserver, Event Timing) — không thêm thư viện.
 *
 * - LCP: mục `largest-contentful-paint` cuối cùng trước tương tác đầu tiên.
 * - CLS: cửa sổ phiên lớn nhất (khoảng cách ≤ 1 s, độ dài ≤ 5 s), bỏ dịch chuyển do tương tác.
 * - TBT: tổng (thời lượng − 50 ms) của long task sau FCP.
 * - INP: thời lượng lớn nhất trong các tương tác có `interactionId` (một tương tác chuẩn mỗi tuyến).
 */

export type PageVitals = {
  ttfbMs: number | null
  fcpMs: number | null
  lcpMs: number | null
  cls: number
  tbtMs: number
  inpMs: number | null
  scriptKb: number
  totalKb: number
}

declare global {
  interface Window {
    __vitals?: { lcp: number | null; cls: number; longTasks: { start: number; duration: number }[]; inp: number | null }
  }
}

/** Hàm chạy trong trang. Không được dùng biến ngoài phạm vi (Playwright tuần tự hoá thân hàm). */
export function installCollector(): void {
  const state = { lcp: null as number | null, cls: 0, longTasks: [] as { start: number; duration: number }[], inp: null as number | null }
  window.__vitals = state
  let interacted = false
  let sessionValue = 0
  let sessionStart = 0
  let sessionLast = 0

  const observe = (type: string, cb: (entries: PerformanceEntry[]) => void, extra: Record<string, unknown> = {}) => {
    try {
      new PerformanceObserver((list) => cb(list.getEntries())).observe({ type, buffered: true, ...extra } as PerformanceObserverInit)
    } catch {
      // Loại mục không được hỗ trợ trên trình duyệt này — bỏ qua.
    }
  }

  observe("largest-contentful-paint", (entries) => {
    if (interacted) return
    const last = entries[entries.length - 1]
    if (last) state.lcp = last.startTime
  })
  observe("layout-shift", (entries) => {
    for (const e of entries as (PerformanceEntry & { value: number; hadRecentInput: boolean })[]) {
      if (e.hadRecentInput) continue
      if (sessionValue > 0 && (e.startTime - sessionLast > 1000 || e.startTime - sessionStart > 5000)) {
        sessionValue = 0
      }
      if (sessionValue === 0) sessionStart = e.startTime
      sessionValue += e.value
      sessionLast = e.startTime
      state.cls = Math.max(state.cls, sessionValue)
    }
  })
  observe("longtask", (entries) => {
    for (const e of entries) state.longTasks.push({ start: e.startTime, duration: e.duration })
  })
  observe(
    "event",
    (entries) => {
      for (const e of entries as (PerformanceEntry & { interactionId?: number })[]) {
        if (!e.interactionId) continue
        state.inp = Math.max(state.inp ?? 0, e.duration)
      }
    },
    { durationThreshold: 16 },
  )
  for (const type of ["pointerdown", "keydown"]) {
    addEventListener(type, () => (interacted = true), { capture: true, once: true })
  }
}

/** Hàm chạy trong trang: tổng hợp số đo sau khi trang tải xong và đã có tương tác chuẩn. */
export function readVitals(): PageVitals {
  const state = window.__vitals ?? { lcp: null, cls: 0, longTasks: [], inp: null }
  const nav = performance.getEntriesByType("navigation")[0] as PerformanceNavigationTiming | undefined
  const fcp = performance.getEntriesByName("first-contentful-paint")[0]?.startTime ?? null
  const tbt = state.longTasks
    .filter((t) => fcp === null || t.start >= fcp)
    .reduce((sum, t) => sum + Math.max(0, t.duration - 50), 0)
  const resources = performance.getEntriesByType("resource") as PerformanceResourceTiming[]
  const scriptBytes = resources.filter((r) => r.initiatorType === "script").reduce((s, r) => s + r.transferSize, 0)
  const totalBytes = resources.reduce((s, r) => s + r.transferSize, 0) + (nav?.transferSize ?? 0)
  const round = (n: number | null) => (n === null ? null : Math.round(n))
  return {
    ttfbMs: round(nav ? nav.responseStart : null),
    fcpMs: round(fcp),
    lcpMs: round(state.lcp),
    cls: Math.round(state.cls * 1000) / 1000,
    tbtMs: Math.round(tbt),
    inpMs: round(state.inp),
    scriptKb: Math.round(scriptBytes / 1024),
    totalKb: Math.round(totalBytes / 1024),
  }
}
