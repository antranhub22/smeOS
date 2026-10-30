// /landing-page — chế độ AI (nhập → kết quả), chế độ tự chọn 4 bước, xuất bản (có xác nhận), trang khách.
export async function run({ page, open, shot }) {
  const start = (p) => open(p, "/landing-page")
  await shot("landing-ai-nhap", async (p) => { await start(p); await p.getByRole("button", { name: /AI làm cho tôi/ }).click() })
  await shot("landing-ai-ket-qua", async (p) => {
    await start(p); await p.getByRole("button", { name: /AI làm cho tôi/ }).click()
    await p.getByText("Bó hồng đỏ Ohara").first().click()
    await p.getByRole("button", { name: /Phân tích và thiết lập/ }).click(); await p.waitForTimeout(9000)
  })
  for (const step of [1, 2, 3, 4, 5]) {
    await shot(`landing-tu-chon-buoc-${step}`, async (p) => {
      await start(p); await p.getByRole("button", { name: /Tôi muốn tự chọn từng bước/ }).click()
      for (let i = 1; i < Math.min(step, 4); i++) { await p.getByRole("button", { name: /Tiếp tục sang Bước/ }).click(); await p.waitForTimeout(500) }
      if (step === 5) {
        await p.getByRole("button", { name: /Xuất bản ngay/ }).click()
        await p.getByRole("dialog").getByRole("button", { name: "Xuất bản" }).click(); await p.waitForTimeout(3000)
      }
    })
  }
  const url = await page.getByLabel("Đường dẫn công khai của trang").inputValue().catch(() => null)
  if (url) await shot("landing-trang-khach", (p) => p.goto(new URL(new URL(url).pathname, page.url()).href, { waitUntil: "networkidle", timeout: 240000 }))
}
