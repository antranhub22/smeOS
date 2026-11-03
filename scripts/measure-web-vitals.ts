/**
 * Đo Web Vitals (số đo lab) cho các tuyến đại diện trên bản build production đang chạy.
 * Phương pháp: docs/audit/ui-architecture-audit/12_PERFORMANCE_REPORT.md §3.
 *
 *   npm run build && npm run start          # cổng 3200, database đã seed
 *   npx tsx scripts/measure-web-vitals.ts --out docs/audit/ui-architecture-audit/perf/<ngày>
 *
 * Tuỳ chọn: --base <url> (mặc định http://localhost:3200) · --runs <n> (mặc định 3)
 *   · --grant-platform: cấp quyền vận hành nền tảng cho tài khoản đo để đo /van-hanh (ghi vào database).
 * Tài khoản: PERF_EMAIL + PERF_PASSWORD (tài khoản có dữ liệu); không có thì đăng ký tài khoản mới.
 * Database (DATABASE_URL) dùng để duyệt tài khoản mới, cấp quyền nền tảng và lấy một mã gửi `/b/[sendCode]`.
 */
import { execFileSync } from "node:child_process"
import { mkdirSync, writeFileSync } from "node:fs"
import { join } from "node:path"
import { chromium, type Browser, type BrowserContextOptions } from "@playwright/test"
import { Client } from "pg"
import { installCollector, readVitals, type PageVitals } from "./web-vitals/collector"
import { loginStorageState, pickSendCode, type StorageState } from "./web-vitals/session"

type Profile = { name: "mobile" | "desktop"; context: BrowserContextOptions; cpuRate: number; network: boolean }

/** Di động: tương đương preset mobile của Lighthouse (CPU chậm 4×, RTT 150 ms, 1,6 Mbps xuống / 750 kbps lên). */
const PROFILES: Profile[] = [
  { name: "mobile", context: { viewport: { width: 390, height: 844 }, deviceScaleFactor: 3, isMobile: true, hasTouch: true }, cpuRate: 4, network: true },
  { name: "desktop", context: { viewport: { width: 1280, height: 800 } }, cpuRate: 1, network: false },
]
const SLOW_4G = { offline: false, latency: 150, downloadThroughput: (1.6 * 1024 * 1024) / 8, uploadThroughput: (750 * 1024) / 8 }
const THRESHOLDS = { lcpMs: 2500, cls: 0.1, inpMs: 200 }

function arg(name: string): string | undefined {
  const i = process.argv.indexOf(`--${name}`)
  return i >= 0 ? process.argv[i + 1] : undefined
}

function median(values: (number | null)[]): number | null {
  const v = values.filter((x): x is number => x !== null).sort((a, b) => a - b)
  if (!v.length) return null
  const mid = Math.floor(v.length / 2)
  return v.length % 2 ? v[mid]! : Math.round(((v[mid - 1]! + v[mid]!) / 2) * 1000) / 1000
}

type Sample = PageVitals & { status: number | null; finalPath: string }

async function measureOnce(browser: Browser, base: string, path: string, profile: Profile, storageState: StorageState): Promise<Sample> {
  const context = await browser.newContext({ ...profile.context, storageState, locale: "vi-VN" })
  const page = await context.newPage()
  const cdp = await context.newCDPSession(page)
  await cdp.send("Network.enable")
  await cdp.send("Network.setCacheDisabled", { cacheDisabled: true })
  if (profile.network) await cdp.send("Network.emulateNetworkConditions", SLOW_4G)
  if (profile.cpuRate > 1) await cdp.send("Emulation.setCPUThrottlingRate", { rate: profile.cpuRate })
  // tsx/esbuild có thể chèn `__name(...)` vào thân hàm; trình duyệt không có hàm này.
  await page.addInitScript({ content: "window.__name = (f) => f;" })
  await page.addInitScript(installCollector)

  const response = await page.goto(base + path, { waitUntil: "load", timeout: 120_000 })
  await page.waitForLoadState("networkidle", { timeout: 30_000 }).catch(() => undefined)
  await page.waitForTimeout(2_000)
  const finalPath = new URL(page.url()).pathname

  // Tương tác chuẩn: nhấp vào tiêu đề trang (không điều hướng, không mở lớp nổi).
  const heading = page.locator("h1").first()
  if (await heading.isVisible().catch(() => false)) {
    await heading.click({ timeout: 5_000 }).catch(() => undefined)
    await page.waitForTimeout(1_000)
  }
  const vitals: PageVitals = await page.evaluate(readVitals)
  await context.close()
  return { status: response?.status() ?? null, finalPath, ...vitals }
}

async function main() {
  const base = arg("base") ?? "http://localhost:3200"
  const runs = Number(arg("runs") ?? 3)
  const out = arg("out")
  if (!out) throw new Error("Thiếu --out <thư mục kết quả>")
  const db = new Client({ connectionString: process.env.DATABASE_URL })
  await db.connect()

  const browser = await chromium.launch(process.env.PW_CHROMIUM_PATH ? { executablePath: process.env.PW_CHROMIUM_PATH } : {})
  const { storageState, account } = await loginStorageState(browser, base, db, process.argv.includes("--grant-platform"))
  const sendCode = await pickSendCode(db)
  await db.end()

  const routes: { route: string; path: string | null; note?: string | undefined }[] = [
    { route: "/", path: "/" },
    { route: "/san-pham", path: "/san-pham" },
    { route: "/dieu-phoi", path: "/dieu-phoi" },
    { route: "/so-lieu", path: "/so-lieu" },
    { route: "/b/[sendCode]", path: sendCode ? `/b/${encodeURIComponent(sendCode)}` : null, note: sendCode ? undefined : "Database không có phiên gửi đang mở" },
    { route: "/van-hanh", path: "/van-hanh" },
  ]

  const results = []
  for (const r of routes) {
    for (const profile of PROFILES) {
      if (!r.path) {
        results.push({ route: r.route, profile: profile.name, skipped: r.note })
        continue
      }
      const samples: Sample[] = []
      for (let i = 0; i < runs; i++) samples.push(await measureOnce(browser, base, r.path, profile, storageState))
      const keys = ["ttfbMs", "fcpMs", "lcpMs", "cls", "tbtMs", "inpMs", "scriptKb", "totalKb"] as const
      const med = Object.fromEntries(keys.map((k) => [k, median(samples.map((s) => s[k]))]))
      results.push({ route: r.route, profile: profile.name, finalPath: samples[0]?.finalPath, median: med, samples })
      console.log(`${r.route.padEnd(14)} ${profile.name.padEnd(7)} LCP ${med.lcpMs} ms · CLS ${med.cls} · TBT ${med.tbtMs} ms · INP ${med.inpMs} ms · JS ${med.scriptKb} KB`)
    }
  }
  await browser.close()

  let commit = "unknown"
  try {
    commit = execFileSync("git", ["rev-parse", "--short", "HEAD"]).toString().trim()
  } catch {
    // ngoài repo git
  }
  mkdirSync(out, { recursive: true })
  const report = {
    measuredAt: new Date().toISOString(),
    commit,
    base,
    runsPerRoute: runs,
    account,
    method: "Playwright + Chromium PerformanceObserver (lab); bộ đệm tắt; trung vị các lần đo",
    profiles: PROFILES.map((p) => ({ name: p.name, ...p.context, cpuThrottle: p.cpuRate, network: p.network ? SLOW_4G : "không giới hạn" })),
    thresholds: THRESHOLDS,
    interaction: "Nhấp vào <h1> đầu tiên sau khi trang tải xong",
    results,
  }
  writeFileSync(join(out, "web-vitals.json"), JSON.stringify(report, null, 2) + "\n")
  console.log(`Đã ghi ${join(out, "web-vitals.json")}`)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
