// /cong-cu/poster-banner — tải ảnh, tạo bộ 5 kích thước, tùy biến (ô ưu đãi của tiệm), kho mẫu, phóng to, menu.
const IMG = "public/mock-data/floral/p1.jpg"
export async function run({ open, shot }) {
  const start = (p) => open(p, "/cong-cu/poster-banner")
  const upload = async (p) => { await start(p); await p.locator("input[type=file]").first().setInputFiles(IMG); await p.waitForTimeout(1500) }
  await shot("poster-da-tai-anh", upload)
  await shot("poster-da-tao", async (p) => { await upload(p); await p.getByRole("button", { name: /Tạo bộ poster và banner/ }).click(); await p.waitForTimeout(6000) })
  await shot("poster-tuy-bien", async (p) => { await upload(p); await p.getByRole("button", { name: /Tùy biến chi tiết/ }).click() })
  await shot("poster-kho-mau", async (p) => { await start(p); await p.getByRole("button", { name: /Xem Kho Template/ }).click(); await p.waitForTimeout(800) })
  await shot("poster-phong-to", async (p) => { await upload(p); await p.getByRole("button", { name: /Phóng to/ }).first().click(); await p.waitForTimeout(800) })
  await shot("poster-menu", async (p) => { await start(p); await p.getByRole("button", { name: /Thao tác khác/ }).click() })
}
