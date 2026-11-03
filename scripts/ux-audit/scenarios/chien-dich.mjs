// /quang-ba/chien-dich — danh sách chiến dịch, modal tạo mới, chi tiết chiến dịch và các thẻ chỉ số KPI thật.
export async function run({ open, shot }) {
  const start = (p) => open(p, "/quang-ba/chien-dich")
  await shot("chien-dich-danh-sach", start)
  await shot("chien-dich-modal-tao", async (p) => {
    await start(p)
    await p.getByRole("button", { name: "Tạo chiến dịch mới" }).click()
  })
}
