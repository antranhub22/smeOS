// /market-intelligence (#49) — nạp 3 cơ hội mẫu, rồi xem: tất cả, 4 nhóm bản tin (quan trọng, bứt phá,
// chủ đề nên làm, mùa vụ), chi tiết một cơ hội, tab từ khoá, hộp cài đặt.
import { q } from "../lib.mjs"

const SAMPLES = [
  ["Hoa hồng đỏ tặng sinh nhật", 82, 74, 68, 80],
  ["Giỏ hoa khai trương rực rỡ", 71, 66, 77, 72],
  ["Hoa cưới tông pastel", 64, 58, 61, 63],
]

async function seed(org) {
  const stamp = Date.now()
  for (const [name, trend, viral, commercial, score] of SAMPLES) {
    const [{ id: topicId }] = await q(
      "INSERT INTO topics(id,canonical_name,industry,status) VALUES(gen_random_uuid(),$1,'florist','RISING') RETURNING id",
      [`${name} ${stamp}`],
    )
    await q(
      "INSERT INTO content_opportunities(id,organization_id,topic_id,audience,opportunity_summary,content_angles,recommended_formats,recommended_hooks,trend_score,viral_score,commercial_score,content_opportunity_score,created_at,updated_at) VALUES(gen_random_uuid(),$1,$2,'Khách tặng quà',$3,'[]','[]','[]',$4,$5,$6,$7,now(),now())",
      [org, topicId, `Nhu cầu ${name.toLowerCase()} đang tăng`, trend, viral, commercial, score],
    )
  }
}

export async function run({ org, open, shot }) {
  await seed(org)
  const start = (p) => open(p, "/market-intelligence")
  await shot("mi-tat-ca", start)
  for (const [slug, label] of [["quan-trong", /Cơ hội quan trọng/], ["but-pha", /Xu hướng bứt phá/], ["chu-de", /Chủ đề nên làm/], ["mua-vu", /Mùa vụ & Dịp tới/]]) {
    await shot(`mi-${slug}`, async (p) => { await start(p); await p.getByRole("button", { name: label }).first().click(); await p.waitForTimeout(1200) })
  }
  await shot("mi-xem-video", async (p) => {
    await start(p); await p.getByRole("button", { name: /^Xem video:/ }).first().click(); await p.waitForTimeout(1500)
  })
  await shot("mi-chi-tiet", async (p) => {
    await start(p); await p.getByRole("button", { name: /Cơ hội quan trọng/ }).first().click(); await p.waitForTimeout(1000)
    await p.getByRole("button", { name: /^Nhu cầu hoa hồng đỏ tặng sinh nhật/i }).last().click(); await p.waitForTimeout(1500)
  })
  await shot("mi-tu-khoa", async (p) => { await start(p); await p.getByRole("button", { name: /Quét Theo Từ Khóa/ }).click(); await p.waitForTimeout(1200) })
  await shot("mi-cai-dat", async (p) => { await start(p); await p.getByRole("button", { name: /Cài Đặt & Biểu Mẫu/ }).click(); await p.waitForTimeout(1200) })
}
