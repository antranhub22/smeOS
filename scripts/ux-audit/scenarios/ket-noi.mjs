// /ket-noi (công cụ 54) — dịch vụ đăng bài không phản hồi (môi trường audit) → lỗi tải có "Tải lại";
// hộp nhập tài khoản mở.
export async function run({ open, shot }) {
  await shot("ket-noi-mo-trang", (p) => open(p, "/ket-noi"))
  await shot("ket-noi-hop-ket-noi", async (p) => {
    await open(p, "/ket-noi")
    await p.getByRole("button", { name: /Thêm tài khoản/ }).first().click()
    await p.getByRole("dialog").waitFor()
  })
}
