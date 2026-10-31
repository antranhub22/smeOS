import { createHash } from "node:crypto"
import { existsSync, readdirSync, readFileSync, statSync, writeFileSync } from "node:fs"
import path from "node:path"

import { describe, expect, it } from "vitest"

import { CAPABILITIES } from "@/core/rbac/capability-catalog"
import { GREETING_CARD_CAPABILITY } from "@/modules/greeting-card/domain/greeting-card-capabilities"

/**
 * Khoá Thẻ chào (PO 31/10/2026 — `docs/kien-truc/KIEN_TRUC_SSOT_DON_HANG_DA_NGUON.md` §0, B1–B5):
 * quy trình Thẻ chào đang đúng, tuyệt đối không đổi khi gom đơn đa nguồn.
 *
 * Test băm từng tệp của Thẻ chào + định nghĩa các mã năng lực Thẻ chào dùng (vai mặc định, trần cứng)
 * và so với tệp mốc. Đỏ = có thay đổi chạm Thẻ chào → dừng, hỏi PO.
 *
 * Chỉ khi PO đã duyệt thay đổi Thẻ chào mới cập nhật mốc:
 *   UPDATE_THE_CHAO_FREEZE=1 npm test -- tests/unit/architecture/the-chao-freeze.test.ts
 */
const ROOT = path.resolve(__dirname, "../../..")
const MANIFEST = path.join(__dirname, "the-chao-freeze.manifest.txt")

/** Mọi đường mã chỉ thuộc Thẻ chào (miền, giao diện, trang khách, API riêng, webhook SePay). */
export const FROZEN_ROOTS = [
  "src/modules/greeting-card",
  "src/components/greeting-card",
  "src/app/(app)/the-chao",
  "src/app/b",
  "src/app/g",
  "src/app/bst",
  "src/app/s",
  "src/app/subcontract",
  "src/app/api/v1/greeting-card",
  "src/app/api/v1/public/brochure",
  "src/app/api/v1/public/greeting-catalog",
  "src/app/api/v1/public/subcontract",
  "src/app/api/v1/public/payments",
] as const

function listFiles(dir: string): string[] {
  return readdirSync(dir)
    .sort()
    .flatMap((name) => {
      const full = path.join(dir, name)
      return statSync(full).isDirectory() ? listFiles(full) : [full]
    })
}

/** Băm theo nội dung, bỏ khác biệt CRLF/LF giữa máy. */
function sha(text: string): string {
  return createHash("sha256").update(text.replace(/\r\n/g, "\n")).digest("hex")
}

function currentEntries(): Map<string, string> {
  const out = new Map<string, string>()
  for (const root of FROZEN_ROOTS) {
    const abs = path.join(ROOT, root)
    if (!existsSync(abs)) continue
    for (const file of listFiles(abs)) out.set(path.relative(ROOT, file).split(path.sep).join("/"), sha(readFileSync(file, "utf8")))
  }
  for (const [key, code] of Object.entries(GREETING_CARD_CAPABILITY).sort(([a], [b]) => a.localeCompare(b))) {
    const def = CAPABILITIES[code]
    out.set(`capability:${key}=${code}`, sha(JSON.stringify({ name: def?.name, defaultRoles: def?.defaultRoles, hardCap: def?.hardCap ?? null })))
  }
  return out
}

function readManifest(): Map<string, string> {
  const out = new Map<string, string>()
  if (!existsSync(MANIFEST)) return out
  for (const line of readFileSync(MANIFEST, "utf8").split("\n")) {
    const m = line.match(/^([0-9a-f]{64}) {2}(.+)$/)
    if (m?.[1] && m[2]) out.set(m[2], m[1])
  }
  return out
}

describe("Thẻ chào đóng băng (PO 31/10/2026)", () => {
  it("mọi tệp và quyền Thẻ chào khớp mốc đã duyệt", () => {
    const current = currentEntries()
    if (process.env.UPDATE_THE_CHAO_FREEZE === "1") {
      const body = [...current].map(([k, v]) => `${v}  ${k}`).join("\n")
      writeFileSync(MANIFEST, `${body}\n`)
    }
    const baseline = readManifest()
    expect(baseline.size, "thiếu tệp mốc the-chao-freeze.manifest.txt").toBeGreaterThan(0)

    const changed = [...current].filter(([k, v]) => baseline.has(k) && baseline.get(k) !== v).map(([k]) => `đã sửa: ${k}`)
    const added = [...current.keys()].filter((k) => !baseline.has(k)).map((k) => `thêm mới: ${k}`)
    const removed = [...baseline.keys()].filter((k) => !current.has(k)).map((k) => `đã xoá: ${k}`)
    expect([...changed, ...added, ...removed], "Thẻ chào bị thay đổi — cần PO duyệt trước (xem đầu tệp test)").toEqual([])
  })
})
