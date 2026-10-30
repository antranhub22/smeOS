// /the-chao — catalog nhanh: mở, lọc giá, tạo link (hộp thoại), sau khi đóng, trang thẻ chào.
export async function run({ page, open, shot }) {
  const pick = async (p) => {
    await open(p, "/the-chao?quick=true")
    const d = p.getByRole("dialog")
    await d.getByRole("button", { name: /500k - 800k/ }).click()
    await d.getByRole("button", { name: /Trên 1.5tr/ }).click()
    await p.waitForTimeout(1500)
  }
  const create = async (p) => { await pick(p); await p.getByRole("dialog").getByRole("button", { name: /Tạo link gửi khách/ }).click(); await p.waitForTimeout(4000) }
  await shot("the-chao-mo", (p) => open(p, "/the-chao?quick=true"))
  await shot("the-chao-loc", pick)
  await shot("the-chao-da-tao-link", create)
  await shot("the-chao-sau-khi-dong", async (p) => { await create(p); await p.getByRole("button", { name: "Xong" }).click(); await p.waitForTimeout(800) })
  await shot("the-chao-trang", (p) => open(p, "/the-chao"))
}
