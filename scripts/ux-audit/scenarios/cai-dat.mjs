// Nhóm Cài đặt — 10 tab hồ sơ tiệm (/cai-dat?tab=…), thành viên, thông báo, 5 ma trận quản trị, cài đặt AI, tích hợp.
const TABS = ["INFO", "BRANDING", "PAYMENT", "DEPOSIT", "PROMOTIONS", "COMMITMENTS", "AGREEMENTS", "BROCHURE_FLOW", "AI_CHANNELS", "COLLECTION_PROFILE"]
const PAGES = [
  "/cai-dat/thanh-vien",
  "/cai-dat/thong-bao",
  "/cai-dat/ma-tran-uudai",
  "/cai-dat/ma-tran-camket",
  "/cai-dat/ma-tran-chinhsach",
  "/cai-dat/ma-tran-phigiacong",
  "/cai-dat/ma-tran-thanhtoan-datco",
  "/cai-dat-ai",
  "/tich-hop",
]

export async function run({ open, shot }) {
  for (const tab of TABS) await shot(`cai-dat-${tab.toLowerCase()}`, (p) => open(p, `/cai-dat?tab=${tab}`))
  for (const path of PAGES) await shot(path.slice(1).replaceAll("/", "-"), (p) => open(p, path))
}
