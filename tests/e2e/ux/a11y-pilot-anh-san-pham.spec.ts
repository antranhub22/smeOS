import { writeFileSync } from "node:fs"
import { tmpdir } from "node:os"
import { join } from "node:path"
import { expect, test } from "@playwright/test"
import AxeBuilder from "@axe-core/playwright"
import { Client } from "pg"
import { createTestUserAndLogin } from "./helpers"

const dbUrl = process.env.DATABASE_URL || "postgresql://floraos:floraos@localhost:5432/floraos"

/** Ảnh PNG 2×2 hợp lệ để chọn file — không cần tệp mẫu trong repo. */
function tinyPng(): string {
  const path = join(tmpdir(), "e2e-anh-san-pham.png")
  const b64 = "iVBORw0KGgoAAAANSUhEUgAAAAIAAAACCAIAAAD91JpzAAAAFklEQVR4nGP8z8DAwMDAxMDAwMDAAAANHQEDK+mmyAAAAABJRU5ErkJggg=="
  writeFileSync(path, Buffer.from(b64, "base64"))
  return path
}

/**
 * Pilot chuẩn Progressive Disclosure (03c, Giai đoạn 3): công cụ Tạo ảnh sản phẩm khi cờ
 * `ux_pd_anh_san_pham` bật cho tổ chức — không lỗi trợ năng nặng ở trạng thái đầu và sau khi gửi.
 */
test.describe("Pilot Tạo ảnh sản phẩm — trợ năng ở khổ 390px", () => {
  test.use({ viewport: { width: 390, height: 844 } })

  test("luồng chuẩn mới không có lỗi trợ năng critical hoặc serious", async ({ page }) => {
    const { orgId } = await createTestUserAndLogin(page)
    const client = new Client({ connectionString: dbUrl })
    await client.connect()
    try {
      const value = JSON.stringify({ ux_pd_anh_san_pham: { mode: "allowlist", organizationIds: [orgId] } })
      await client.query(
        "INSERT INTO platform_settings(key, value, updated_at) VALUES ('ux_rollout_flags', $1, now()) ON CONFLICT (key) DO UPDATE SET value = $1, updated_at = now()",
        [value],
      )
    } finally {
      await client.end()
    }

    // Máy chủ giữ cờ trong bộ nhớ đệm tối đa 30 giây (ux-rollout-flag-store.ts).
    await expect(async () => {
      await page.goto("/cong-cu/anh-san-pham")
      await expect(page.getByRole("heading", { name: "Tạo ảnh sản phẩm chuyên nghiệp" })).toBeVisible()
      await expect(page.getByText("Công cụ 01")).toHaveCount(0)
    }).toPass({ timeout: 45_000, intervals: [5_000] })

    const axe = () => new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"]).analyze()
    const severe = (r: Awaited<ReturnType<typeof axe>>) =>
      r.violations.filter((v) => v.impact === "critical" || v.impact === "serious").map((v) => v.id)

    expect(severe(await axe())).toEqual([])

    await page.setInputFiles("input[type=file]", tinyPng())
    await expect(page.getByText(/credit/)).toBeVisible()
    expect(severe(await axe())).toEqual([])
  })
})
