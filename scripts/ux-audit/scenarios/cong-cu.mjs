// /cong-cu — Kịch bản kiểm thử UX Audit cho Trung tâm Tiếp thị & Bán hàng.
// Kiểm tra: Lưới 6 module + Khu vận hành, chi tiết module với khu L0 Bạn muốn tạo gì + L1 Công cụ, tìm kiếm.

export async function run({ open, shot }) {
  const start = (p) => open(p, "/cong-cu")

  // 1. Lưới tổng quan 6 module + Khu Vận hành cửa hàng
  await shot("cong-cu-luoi-module", async (p) => {
    await start(p)
    await p.waitForTimeout(1000)
  })

  // 2. Mở chi tiết module mục tiêu (Tạo nội dung)
  await shot("cong-cu-chi-tiet-module", async (p) => {
    await start(p)
    await p.getByRole("button", { name: "Tạo nội dung" }).first().click()
    await p.waitForTimeout(800)
  })

  // 3. Mở khu Vận hành cửa hàng
  await shot("cong-cu-khu-van-hanh", async (p) => {
    await start(p)
    await p.getByRole("button", { name: "Vận hành cửa hàng" }).first().click()
    await p.waitForTimeout(800)
  })

  // 4. Tìm kiếm ấn phẩm / công cụ
  await shot("cong-cu-tim-kiem", async (p) => {
    await start(p)
    const searchInput = p.locator('input[placeholder*="Tìm kiếm"]')
    await searchInput.fill("poster")
    await p.waitForTimeout(600)
  })
}
