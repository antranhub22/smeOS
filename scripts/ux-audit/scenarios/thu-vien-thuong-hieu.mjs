// /ho-so/thu-vien-thuong-hieu (công cụ 45) — trống, hộp thêm, có tài nguyên + lưu trữ,
// hộp phiên bản mới, chế độ chuỗi (nút chia sẻ, hộp xác nhận, nhãn "Đang chia sẻ").
import { q } from "../lib.mjs"

const PATH = "/ho-so/thu-vien-thuong-hieu"

async function addText(p, category, title, text) {
  await p.getByRole("button", { name: "Thêm tài nguyên" }).click()
  const dlg = p.getByRole("dialog")
  await dlg.getByLabel("Loại tài nguyên").selectOption(category)
  await dlg.getByLabel("Tên", { exact: true }).fill(title)
  await dlg.getByLabel("Nội dung").fill(text)
  await dlg.getByRole("button", { name: "Thêm vào thư viện" }).click()
  await dlg.waitFor({ state: "detached" })
}

export async function run({ open, shot, org }) {
  await q("DELETE FROM brand_library_items WHERE organization_id=$1", [org])
  await shot("thu-vien-trong", (p) => open(p, PATH))
  await shot("thu-vien-hop-them", async (p) => {
    await open(p, PATH)
    await p.getByRole("button", { name: "Thêm tài nguyên" }).click()
    await p.getByRole("dialog").waitFor()
  })

  await shot("thu-vien-co-tai-nguyen", async (p) => {
    await open(p, PATH)
    if (!(await p.getByText("Màu chuẩn").count())) {
      await addText(p, "COLOR", "Màu chuẩn", "#2F6F4E, #F4EDE4, #1A1A1A")
      await addText(p, "COPY", "Khẩu hiệu", "Câu khẩu hiệu kiểm thử của cửa hàng.")
      await addText(p, "FONT", "Phông chữ cũ", "Phông kiểm thử")
      await p.getByRole("article").filter({ hasText: "Phông chữ cũ" }).getByRole("button", { name: "Lưu trữ" }).click()
      await p.getByRole("dialog").getByRole("button", { name: "Lưu trữ" }).click()
      await p.getByText("Đã lưu trữ (1)").waitFor()
    }
  })
  await shot("thu-vien-hop-phien-ban", async (p) => {
    await open(p, PATH)
    await p.getByRole("article").filter({ hasText: "Khẩu hiệu" }).getByRole("button", { name: "Phiên bản mới" }).click()
    await p.getByRole("dialog").waitFor()
  })

  await q("UPDATE organizations SET type='CHAIN' WHERE id=$1", [org])
  await shot("thu-vien-chuoi-xac-nhan-chia-se", async (p) => {
    await open(p, PATH)
    await p.getByRole("article").filter({ hasText: "Màu chuẩn" }).getByRole("button", { name: /Chia sẻ cho cửa hàng|Ngừng chia sẻ/ }).click()
    await p.getByRole("dialog").waitFor()
  })
  await shot("thu-vien-chuoi-dang-chia-se", async (p) => {
    await q("UPDATE brand_library_items SET share_with_members=true WHERE organization_id=$1 AND title='Màu chuẩn'", [org])
    await open(p, PATH)
    await p.getByText("Đang chia sẻ").first().waitFor()
  })
}
