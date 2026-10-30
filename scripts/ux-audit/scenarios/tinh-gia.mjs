// /tinh-gia — 5 tab + chọn mẫu để xem bản nháp công thức từ ảnh.
export async function run({ open, shot }) {
  for (const t of ["", "nguyen-lieu", "cong-thuc", "gia-von", "gia-ban", "du-toan"]) {
    await shot(`tinh-gia-${t || "tong-quan"}`, (p) => open(p, `/tinh-gia/${t}`))
  }
  await shot("tinh-gia-ban-nhap-cong-thuc", async (p) => {
    await open(p, "/tinh-gia/cong-thuc")
    await p.locator("select").first().selectOption({ index: 1 })
    await p.waitForTimeout(2000)
  })
}
