import AxeBuilder from "@axe-core/playwright"
import type { APIRequestContext, Page } from "@playwright/test"
import { Client } from "pg"

/**
 * Phép kiểm trợ năng cho bộ 12 hành trình (docs/design-system/accessibility-audit-12-journeys.md).
 * Mỗi hàm trả về danh sách lỗi dạng chuỗi; rỗng = đạt.
 */

export const PRESETS = ["moc-lan", "modern-slate", "pure-swiss"] as const
const WCAG_TAGS = ["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"]
const MAX_TABS = 40

const dbUrl = process.env.DATABASE_URL || "postgresql://floraos:floraos@localhost:5432/floraos"

export async function withDb<T>(fn: (db: Client) => Promise<T>): Promise<T> {
  const db = new Client({ connectionString: dbUrl })
  await db.connect()
  try {
    return await fn(db)
  } finally {
    await db.end()
  }
}

/** axe WCAG 2.2 AA: vi phạm critical/serious. `only` giới hạn luật (vd chỉ color-contrast). */
export async function axeSevere(page: Page, only?: string[]): Promise<string[]> {
  let builder = new AxeBuilder({ page }).withTags(WCAG_TAGS)
  if (only) builder = builder.withRules(only)
  const { violations } = await builder.analyze()
  return violations
    .filter((v) => v.impact === "critical" || v.impact === "serious")
    .map((v) => `${v.id} (${v.impact}) × ${v.nodes.length}: ${v.nodes[0]?.target.join(" ") ?? ""}`)
}

/**
 * Chỉ bàn phím: Tab qua tối đa 40 phần tử. Mỗi phần tử nhận tiêu điểm phải có vòng tiêu điểm
 * nhìn thấy (2.4.7) và không bị phần tử khác (header dính, thanh đáy) che hoàn toàn (2.4.11).
 */
export async function keyboardIssues(page: Page): Promise<{ stops: number; issues: string[] }> {
  const issues: string[] = []
  const seen = new Set<string>()
  let stops = 0
  for (let i = 0; i < MAX_TABS; i++) {
    await page.keyboard.press("Tab")
    const info = await page.evaluate(() => {
      const el = document.activeElement as HTMLElement | null
      if (!el || el === document.body) return null
      const cs = getComputedStyle(el)
      const outline = cs.outlineStyle !== "none" && parseFloat(cs.outlineWidth) > 0
      const ring = cs.boxShadow !== "none"
      const r = el.getBoundingClientRect()
      const pts: [number, number][] = [
        [r.left + r.width / 2, r.top + r.height / 2],
        [r.left + 2, r.top + 2],
        [r.right - 2, r.bottom - 2],
      ]
      const visiblePart = pts.some(([x, y]) => {
        if (x < 0 || y < 0 || x > innerWidth || y > innerHeight) return false
        const hit = document.elementFromPoint(x, y)
        return !!hit && (hit === el || el.contains(hit) || hit.contains(el))
      })
      const label = (el.getAttribute("aria-label") || el.textContent || el.tagName).trim().replace(/\s+/g, " ").slice(0, 40)
      const key = `${el.tagName}|${label}|${Math.round(r.top + scrollY)}|${Math.round(r.left)}`
      return { key, label: `<${el.tagName.toLowerCase()}> "${label}"`, focusVisible: outline || ring, visiblePart, size: r.width * r.height }
    })
    if (!info) continue
    if (seen.has(info.key)) break // đã quay vòng
    seen.add(info.key)
    stops++
    if (info.size === 0) continue
    if (!info.focusVisible) issues.push(`2.4.7 không thấy vòng tiêu điểm: ${info.label}`)
    if (!info.visiblePart) issues.push(`2.4.11 tiêu điểm bị che: ${info.label}`)
  }
  return { stops, issues }
}

/** Phóng 200% (1280×800 → khung 640×400 CSS px): không cuộn ngang (1.4.4, 1.4.10). */
export async function zoomIssues(page: Page): Promise<string[]> {
  const { sw, cw } = await page.evaluate(() => ({
    sw: document.scrollingElement?.scrollWidth ?? 0,
    cw: document.scrollingElement?.clientWidth ?? 0,
  }))
  return sw > cw + 1 ? [`cuộn ngang ${sw - cw}px ở khung 640px`] : []
}

/** Giảm chuyển động (2.3.3): không còn animation chạy lặp hoặc dài hơn 0,1 s. */
export async function motionIssues(page: Page): Promise<string[]> {
  return page.evaluate(() =>
    document
      .getAnimations()
      .filter((a) => {
        if (a.playState !== "running") return false
        const t = a.effect?.getComputedTiming()
        const dur = typeof t?.duration === "number" ? t.duration : 0
        return t?.iterations === Infinity || dur > 100
      })
      .map((a) => {
        const target = (a.effect as KeyframeEffect | null)?.target as Element | null
        return `animation chạy: ${target?.tagName.toLowerCase() ?? "?"}.${(target?.getAttribute("class") ?? "").split(" ").slice(0, 3).join(".")}`
      }),
  )
}

/** Áp preset giao diện trên trang đang mở. */
export async function applyPreset(page: Page, preset: string): Promise<void> {
  await page.evaluate((p) => document.documentElement.setAttribute("data-theme", p), preset)
  await page.waitForTimeout(150)
}

/** Dữ liệu cho tuyến cần mã: một sản phẩm và một trang catalog công khai của tổ chức đo. */
export async function seedJourneyData(request: APIRequestContext): Promise<{ productId: string | null; catalogSlug: string | null }> {
  const code = `A11Y-${Date.now().toString(36).toUpperCase()}`
  const prod = await request.post("/api/v1/products", { data: { code, name: "Bó hoa kiểm trợ năng" } })
  const prodBody = prod.ok() ? ((await prod.json()) as { data?: { id?: string }; id?: string }) : null
  const link = await request.post("/api/v1/catalog-links", { data: { name: "Bộ sưu tập kiểm trợ năng" } })
  const linkBody = link.ok() ? ((await link.json()) as { data?: { slug?: string }; slug?: string }) : null
  return { productId: prodBody?.data?.id ?? prodBody?.id ?? null, catalogSlug: linkBody?.data?.slug ?? linkBody?.slug ?? null }
}

/** Cấp quyền vận hành nền tảng (N1, N4, N5) cho tài khoản kiểm để mở /van-hanh. */
export async function grantPlatformOperator(userId: string): Promise<void> {
  await withDb(async (db) => {
    const op = await db.query<{ id: string }>(
      `INSERT INTO platform_operators (id, user_id, created_at) VALUES (gen_random_uuid()::text, $1, now())
       ON CONFLICT (user_id) DO UPDATE SET revoked_at = NULL RETURNING id`,
      [userId],
    )
    for (const code of ["N1", "N4", "N5"]) {
      await db.query(
        `INSERT INTO platform_role_capabilities (id, operator_id, capability_code) VALUES (gen_random_uuid()::text, $1, $2)
         ON CONFLICT (operator_id, capability_code) DO NOTHING`,
        [op.rows[0]!.id, code],
      )
    }
  })
}
