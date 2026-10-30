// Module Thương hiệu — /ho-so (công cụ 51 + thẻ chia sẻ 11), /ho-so/danh-thiep, trang khách /ch/<slug>.
// Trạng thái: hồ sơ trống, hồ sơ đủ chưa có link, hộp xác nhận tạo link, đã có link,
// trang khách, danh thiếp, link đã ngừng, link sai.
import { q } from "../lib.mjs"

async function clearProfile(org) {
  await q("DELETE FROM store_share_links WHERE organization_id=$1", [org])
  await q("DELETE FROM business_profiles WHERE organization_id=$1", [org])
  await q("DELETE FROM brand_profiles WHERE organization_id=$1", [org])
}

async function fillProfile(org) {
  await q(
    `INSERT INTO business_profiles (id, organization_id, display_name, phone, email, address, website, description, social_links, operating_hours, updated_at)
     VALUES (gen_random_uuid(), $1, 'Cửa hàng Kiểm thử', '0283 821 4479', 'lienhe@kiem-thu.test', '12 Đường Kiểm Thử, Phường 1', 'kiem-thu.test',
             'Mô tả kiểm thử của cửa hàng.', '{"facebook":"https://facebook.com/kiem-thu"}', '{"default":"8:00–21:00"}', now())
     ON CONFLICT (organization_id) DO UPDATE SET display_name=EXCLUDED.display_name, phone=EXCLUDED.phone, address=EXCLUDED.address`,
    [org]
  )
  await q(
    `INSERT INTO brand_profiles (id, organization_id, primary_color, logo_asset_id, updated_at)
     VALUES (gen_random_uuid(), $1, '#2f6f4e', '/images/sample-flower.jpg', now())
     ON CONFLICT (organization_id) DO UPDATE SET primary_color=EXCLUDED.primary_color, logo_asset_id=EXCLUDED.logo_asset_id`,
    [org]
  )
}

export async function run({ open, shot, org }) {
  await clearProfile(org)
  await shot("thuong-hieu-ho-so-trong", (p) => open(p, "/ho-so"))
  await shot("thuong-hieu-danh-thiep-chua-du", (p) => open(p, "/ho-so/danh-thiep"))

  await fillProfile(org)
  await shot("thuong-hieu-ho-so-du", (p) => open(p, "/ho-so"))
  await shot("thuong-hieu-xac-nhan-tao-link", async (p) => {
    await open(p, "/ho-so")
    await p.getByRole("button", { name: "Tạo link chia sẻ" }).click()
    await p.getByRole("dialog").waitFor()
  })

  // Tạo link một lần, các trạng thái sau dùng lại
  await shot("thuong-hieu-da-co-link", async (p) => {
    await open(p, "/ho-so")
    const create = p.getByRole("button", { name: "Tạo link chia sẻ" })
    if (await create.count()) {
      await create.click()
      await p.getByRole("dialog").getByRole("button", { name: "Tạo link" }).click()
    }
    await p.getByLabel("Link của cửa hàng").waitFor()
  })

  const [{ slug }] = await q("SELECT slug FROM store_share_links WHERE organization_id=$1 AND is_revoked=false", [org])
  await shot("thuong-hieu-trang-khach", (p) => open(p, `/ch/${slug}`))
  await shot("thuong-hieu-danh-thiep", async (p) => {
    await open(p, "/ho-so/danh-thiep")
    await p.getByRole("button", { name: "Tải bản in PDF" }).waitFor()
  })
  // Tải thật từng tệp: không có sự kiện tải hoặc tệp rỗng → trạng thái hỏng
  await shot("thuong-hieu-danh-thiep-tai-tep", async (p) => {
    await open(p, "/ho-so/danh-thiep")
    for (const [label, ext] of [["Tải bản in PDF", ".pdf"], ["Ảnh mặt trước", ".png"], ["Ảnh mặt sau", ".png"], ["Danh bạ điện tử (.vcf)", ".vcf"]]) {
      const [dl] = await Promise.all([p.waitForEvent("download", { timeout: 30000 }), p.getByRole("button", { name: label }).click()])
      const name = dl.suggestedFilename()
      const { size } = await import("node:fs").then((fs) => dl.path().then((f) => fs.statSync(f)))
      if (!name.endsWith(ext) || size < 200) throw new Error(`tệp ${label} không hợp lệ: ${name} (${size} byte)`)
      console.log(`  tải ${name}: ${size} byte`)
    }
  })
  await shot("thuong-hieu-xac-nhan-ngung", async (p) => {
    await open(p, "/ho-so")
    await p.getByRole("button", { name: "Ngừng chia sẻ" }).click()
    await p.getByRole("dialog").waitFor()
  })

  await q("UPDATE store_share_links SET is_revoked=true, revoked_at=now() WHERE organization_id=$1", [org])
  await shot("thuong-hieu-link-da-ngung", (p) => open(p, `/ch/${slug}`))
  await shot("thuong-hieu-link-sai", (p) => open(p, "/ch/khong-ton-tai"))
}
