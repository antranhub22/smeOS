// /catalog (#09) — chế độ AI (nhập → phong cách → sẵn sàng → xuất bản có xác nhận), trang khách /c/<slug>,
// chế độ tự chọn 4 bước, màn quản lý.
import { BASE } from "../lib.mjs"

export async function run({ page, open, shot }) {
  const start = (p) => open(p, "/catalog")
  const pickAi = async (p) => {
    await start(p); await p.getByRole("button", { name: /AI làm cho tôi/ }).click()
    await p.getByText("Bó hồng đỏ Ohara").first().click()
    await p.getByRole("button", { name: /Phân tích và thiết lập/ }).click(); await p.waitForTimeout(3000)
  }
  const aiReady = async (p) => {
    await pickAi(p)
    await p.getByRole("button", { name: /Xác nhận & Tạo Catalog/ }).click(); await p.waitForTimeout(8000)
  }
  await shot("catalog-ai-nhap", async (p) => { await start(p); await p.getByRole("button", { name: /AI làm cho tôi/ }).click() })
  await shot("catalog-ai-phong-cach", pickAi)
  await shot("catalog-ai-san-sang", aiReady)
  await shot("catalog-ai-da-xuat-ban", async (p) => {
    await aiReady(p); await p.getByRole("button", { name: "Xuất bản catalog" }).click()
    await p.getByRole("dialog").getByRole("button", { name: "Xuất bản" }).click(); await p.waitForTimeout(3000)
  })
  const url = await page.locator("input[readonly]").first().inputValue().catch(() => null)
  if (url) await shot("catalog-trang-khach", (p) => p.goto(BASE + new URL(url).pathname, { waitUntil: "networkidle", timeout: 240000 }))
  const guided = async (p, step) => {
    await start(p); await p.getByRole("button", { name: /Tôi muốn tự chọn từng bước/ }).click(); await p.waitForTimeout(800)
    if (step >= 2) {
      await p.getByText("Bó hồng đỏ Ohara").first().click(); await p.getByText("Giỏ hoa cúc pastel").first().click()
      await p.getByRole("button", { name: /^Tiếp tục/ }).click(); await p.waitForTimeout(600)
    }
    if (step >= 3) { await p.getByRole("button", { name: /^Tiếp tục/ }).click(); await p.waitForTimeout(600) }
    if (step >= 4) {
      await p.getByRole("button", { name: /Xuất bản Catalog ngay/ }).click()
      await p.getByRole("dialog").getByRole("button", { name: "Xuất bản" }).click(); await p.waitForTimeout(3000)
    }
  }
  for (const s of [1, 2, 3, 4]) await shot(`catalog-tu-chon-buoc-${s}`, (p) => guided(p, s))
  await shot("catalog-quan-ly", start)
}
