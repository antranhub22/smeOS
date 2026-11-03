import { randomUUID } from "node:crypto"
import { expect, test, type Page } from "@playwright/test"
import { approveAndLogin, testClientHeaders } from "./helpers"
import { grantPlatformOperator } from "./a11y-journeys.helpers"

/**
 * Ảnh mốc giao diện các màn chính của 12 hành trình (H4 — HANDOVER_READINESS_PLAN), khổ 390 và 1280.
 * Ổn định ảnh: tên tổ chức và người dùng cố định, đồng hồ trình duyệt cố định, tắt chuyển động.
 * Ảnh `*-linux.png` sinh trên môi trường render giống runner CI; `*-darwin.png` sinh trên máy Mac.
 */

const SCREENS: { name: string; path: string; auth: boolean }[] = [
  { name: "dang-nhap", path: "/dang-nhap", auth: false },
  { name: "trang-chu", path: "/", auth: true },
  { name: "san-pham", path: "/san-pham", auth: true },
  { name: "san-pham-tao-moi", path: "/san-pham/tao-moi", auth: true },
  { name: "don-hang", path: "/don-hang", auth: true },
  { name: "khach-hang", path: "/khach-hang", auth: true },
  { name: "dieu-phoi", path: "/dieu-phoi", auth: true },
  { name: "so-lieu", path: "/so-lieu", auth: true },
  { name: "cai-dat", path: "/cai-dat", auth: true },
  { name: "uu-dai", path: "/uu-dai", auth: true },
  { name: "van-hanh", path: "/van-hanh", auth: true },
]
const VIEWPORTS = [
  { label: "mobile", width: 390, height: 844 },
  { label: "desktop", width: 1280, height: 800 },
]
const FIXED_TIME = new Date("2026-11-04T09:00:00+07:00")

async function settle(page: Page, path: string) {
  await page.goto(path, { waitUntil: "networkidle", timeout: 90_000 })
  await page.evaluate(() => document.fonts.ready)
  // Máy CI chậm hơn: chờ hết khung chờ (SkeletonBlock, role="status" chứa animate-pulse) trước khi chụp.
  await page
    .waitForFunction(() => !document.querySelector('[role="status"] .animate-pulse, [aria-busy="true"]'), undefined, { timeout: 15_000 })
    .catch(() => undefined)
  await page.waitForTimeout(300)
}

test.describe("Ảnh mốc màn chính 12 hành trình", () => {
  test.describe.configure({ mode: "serial", timeout: 10 * 60_000 })
  let storage: string

  test.beforeAll(async ({ browser }) => {
    const context = await browser.newContext()
    const page = await context.newPage()
    const email = `e2e-visual-${randomUUID().slice(0, 8)}@floraos.test`
    const password = "MatKhau-E2E-2026!"
    const headers = testClientHeaders()
    const res = await page.request.post("/api/v1/auth/signup", {
      headers,
      data: { email, password, name: "Người kiểm giao diện", organization_name: "Tiệm Kiểm Giao Diện" },
    })
    if (!res.ok()) throw new Error(`Signup failed: ${res.status()}`)
    const body = (await res.json()) as { user_id: string }
    await approveAndLogin(page.request, email, password, "", headers)
    await grantPlatformOperator(body.user_id)
    storage = test.info().outputPath("visual-state.json")
    await context.storageState({ path: storage })
    await context.close()
  })

  for (const screen of SCREENS) {
    test(`${screen.name} (${screen.path})`, async ({ browser }) => {
      for (const vp of VIEWPORTS) {
        const context = await browser.newContext({
          viewport: { width: vp.width, height: vp.height },
          reducedMotion: "reduce",
          ...(screen.auth ? { storageState: storage } : {}),
        })
        const page = await context.newPage()
        await page.clock.setFixedTime(FIXED_TIME)
        await settle(page, screen.path)
        await expect(page).toHaveScreenshot(`${screen.name}-${vp.label}.png`, {
          maxDiffPixelRatio: 0.05,
          animations: "disabled",
        })
        await context.close()
      }
    })
  }
})
