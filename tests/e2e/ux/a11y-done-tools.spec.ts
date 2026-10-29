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
 * Công cụ Hoàn thiện đã áp chuẩn Progressive Disclosure (03c): không lỗi trợ năng critical/serious ở khổ 390px,
 * ở trạng thái đầu và sau khi chọn ảnh. Thêm công cụ vào DONE_TOOLS khi đợt rollout của nó xong.
 */
const DONE_TOOLS: Array<{ name: string; path: string; flag?: string; upload: boolean }> = [
  { name: "Tạo ảnh sản phẩm", path: "/cong-cu/anh-san-pham", flag: "ux_pd_anh_san_pham", upload: true },
  { name: "Tạo bộ ảnh sản phẩm", path: "/cong-cu/bo-anh-san-pham", flag: "ux_pd_bo_anh_san_pham", upload: true },
  { name: "Poster và banner", path: "/cong-cu/poster-banner", upload: false },
]

async function enableFlag(flag: string, orgId: string) {
  const client = new Client({ connectionString: dbUrl })
  await client.connect()
  try {
    // Ghi đè cả khoá: mỗi ca chỉ cần cờ của mình bật cho tổ chức vừa tạo.
    const value = JSON.stringify({ [flag]: { mode: "allowlist", organizationIds: [orgId] } })
    await client.query(
      "INSERT INTO platform_settings(key, value, updated_at) VALUES ('ux_rollout_flags', $1, now()) ON CONFLICT (key) DO UPDATE SET value = $1, updated_at = now()",
      [value],
    )
  } finally {
    await client.end()
  }
}

test.describe("Công cụ Hoàn thiện theo chuẩn 03c — trợ năng ở khổ 390px", () => {
  test.use({ viewport: { width: 390, height: 844 } })

  for (const tool of DONE_TOOLS) {
    test(`${tool.name} (${tool.path}) không có lỗi trợ năng critical hoặc serious`, async ({ page }) => {
      const { orgId } = await createTestUserAndLogin(page)
      if (tool.flag) await enableFlag(tool.flag, orgId)

      // Máy chủ giữ cờ trong bộ nhớ đệm tối đa 30 giây (ux-rollout-flag-store.ts).
      await expect(async () => {
        await page.goto(tool.path)
        await expect(page.getByRole("heading", { level: 1 })).toHaveCount(1)
        await expect(page.getByText(/Công cụ 0\d/)).toHaveCount(0)
      }).toPass({ timeout: 45_000, intervals: [5_000] })

      const axe = () => new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"]).analyze()
      const severe = (r: Awaited<ReturnType<typeof axe>>) =>
        r.violations.filter((v) => v.impact === "critical" || v.impact === "serious").map((v) => v.id)

      expect(severe(await axe())).toEqual([])
      if (tool.upload) {
        await page.setInputFiles("input[type=file]", tinyPng())
        await expect(page.getByText(/credit/)).toBeVisible()
        expect(severe(await axe())).toEqual([])
      }
    })
  }
})
