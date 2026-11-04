// Kiểm bản giao khách (`git archive <ref>`): không có cấu hình/tài liệu agent nội bộ,
// tệp của khách hàng khác hay đường dẫn máy cá nhân. Luật: scripts/handover-rules.mjs.
// Loại tệp khỏi bản giao bằng `export-ignore` trong .gitattributes.
import { execFileSync } from "node:child_process"
import { LOCAL_PATH, findHandoverViolations } from "./handover-rules.mjs"

const ref = process.argv[2] ?? "HEAD"
const tar = execFileSync("git", ["archive", "--format=tar", ref], { maxBuffer: 1 << 30 })
const entries = execFileSync("tar", ["-t"], { input: tar, maxBuffer: 1 << 30 }).toString().split("\n").filter(Boolean)

let withLocalPath = []
try {
  withLocalPath = execFileSync("git", ["-c", "core.quotePath=false", "grep", "-lF", LOCAL_PATH, ref, "--"], { maxBuffer: 1 << 26 })
    .toString()
    .split("\n")
    .filter(Boolean)
    .map((line) => line.slice(ref.length + 1))
} catch (err) {
  if (err.status !== 1) throw err // 1 = không có kết quả
}

const violations = findHandoverViolations(entries, withLocalPath.map((p) => p.normalize("NFC")).concat(withLocalPath))
if (violations.length) {
  console.error(`✗ Bản giao (${ref}) có ${violations.length} mục không được bàn giao — thêm export-ignore vào .gitattributes hoặc sửa nội dung:`)
  for (const v of violations) console.error(`  - [${v.rule}] ${v.path}`)
  process.exit(1)
}
console.log(`✓ Bản giao (${ref}) sạch: ${entries.length} mục.`)
