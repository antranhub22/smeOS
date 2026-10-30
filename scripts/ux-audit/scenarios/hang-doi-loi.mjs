// /van-hanh/hang-doi-loi — Hàng đợi lỗi (ROADMAP E5.2): rỗng, có job lỗi, hộp xác nhận chạy lại.
import { q } from "../lib.mjs"

export async function run({ open, shot, uid, org }) {
  const [{ id: op }] = await q(
    "INSERT INTO platform_operators(id,user_id) VALUES(gen_random_uuid(),$1) ON CONFLICT (user_id) DO UPDATE SET revoked_at=NULL RETURNING id",
    [uid]
  )
  for (const code of ["N5", "N15"]) {
    await q("INSERT INTO platform_role_capabilities(id,operator_id,capability_code) VALUES(gen_random_uuid(),$1,$2) ON CONFLICT DO NOTHING", [op, code])
  }
  await q("DELETE FROM generation_jobs WHERE status = 'FAILED'")
  await shot("hang-doi-loi-rong", (p) => open(p, "/van-hanh/hang-doi-loi"))

  const [{ id: ws }] = await q("SELECT id FROM workspaces WHERE organization_id=$1 LIMIT 1", [org])
  for (const [feature, kind, error] of [
    ["vision.analyze", "RETRYABLE", "Nhà cung cấp không trả lời sau 60 giây"],
    ["media.variant.cloud", "NEEDS_ACTION", "Ảnh gốc không đọc được (định dạng không hỗ trợ)"],
  ]) {
    await q(
      "INSERT INTO generation_jobs(id,organization_id,workspace_id,user_id,feature,status,payload,error,failure_kind,attempts,completed_at) VALUES(gen_random_uuid(),$1,$2,$3,$4,'FAILED','{}',$5,$6,3,now())",
      [org, ws, uid, feature, error, kind]
    )
  }
  await shot("hang-doi-loi-co-viec", (p) => open(p, "/van-hanh/hang-doi-loi"))
  await shot("hang-doi-loi-xac-nhan", async (p) => {
    await open(p, "/van-hanh/hang-doi-loi")
    await p.getByRole("button", { name: "Chạy lại" }).first().click()
    await p.getByRole("dialog").waitFor()
  })
}
