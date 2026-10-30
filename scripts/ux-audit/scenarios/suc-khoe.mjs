// /van-hanh/suc-khoe — Sức khoẻ hệ thống (N5, ROADMAP E1.6): hàng đợi rỗng, rồi có việc chờ + lỗi.
import { q } from "../lib.mjs"

export async function run({ open, shot, uid, org }) {
  // Người dùng audit là chủ tiệm — cấp thêm quyền vận hành N5 trên database *_test.
  const [{ id: op }] = await q(
    "INSERT INTO platform_operators(id,user_id) VALUES(gen_random_uuid(),$1) ON CONFLICT (user_id) DO UPDATE SET revoked_at=NULL RETURNING id",
    [uid]
  )
  await q("INSERT INTO platform_role_capabilities(id,operator_id,capability_code) VALUES(gen_random_uuid(),$1,'N5') ON CONFLICT DO NOTHING", [op])
  await q("DELETE FROM generation_jobs WHERE status IN ('PENDING','FAILED')")

  await shot("suc-khoe-rong", (p) => open(p, "/van-hanh/suc-khoe"))

  const [{ workspace_id: ws }] = await q("SELECT id AS workspace_id FROM workspaces WHERE organization_id=$1 LIMIT 1", [org])
  for (const [feature, status, minutesAgo] of [
    ["vision.analyze", "PENDING", 42],
    ["vision.analyze", "PENDING", 3],
    ["media.variant.cloud", "PENDING", 7],
    ["video.render", "FAILED", 90],
  ]) {
    await q(
      "INSERT INTO generation_jobs(id,organization_id,workspace_id,user_id,feature,status,payload,created_at) VALUES(gen_random_uuid(),$1,$2,$3,$4,$5::job_status,'{}',now() - make_interval(mins => $6))",
      [org, ws, uid, feature, status, minutesAgo]
    )
  }
  await shot("suc-khoe-co-hang-doi", (p) => open(p, "/van-hanh/suc-khoe"))
}
