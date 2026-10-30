// Kiểm bản giao khách (`git archive`) không chứa cấu hình agent nội bộ.
// Chặn: AGENTS.md, CLAUDE.md, .agents/, .claude/, .agent-studio/ ở gốc repo.
// Cảnh báo (không chặn): file trong docs/ có tên gợi ý tài liệu agent — PO xem xét.
import { execFileSync } from "node:child_process"

const ref = process.argv[2] ?? "HEAD"
const paths = execFileSync("git", ["archive", "--format=tar", ref], { maxBuffer: 1 << 30 })
const list = execFileSync("tar", ["-t"], { input: paths, maxBuffer: 1 << 30 }).toString().split("\n").filter(Boolean)

const BLOCKED = [/^AGENTS\.md$/, /^CLAUDE\.md$/, /^\.agents\//, /^\.claude\//, /^\.agent-studio\//, /AGENTS_SECTION_[^/]*\.md$/]
const WARN = /(AGENTS|CLAUDE)\.md$|AGENT_(MASTER_PROMPT|EXECUTION_PROTOCOL)|CODING_AGENT_GUIDE/i

const blocked = list.filter((p) => BLOCKED.some((re) => re.test(p)))
const warned = list.filter((p) => !blocked.includes(p) && WARN.test(p))

if (warned.length) {
  console.log(`⚠ ${warned.length} file trong bản giao có tên giống tài liệu agent (xem lại có phải IP nội bộ không):`)
  for (const p of warned) console.log(`  - ${p}`)
}
if (blocked.length) {
  console.error(`✗ Bản giao (${ref}) LỌT cấu hình agent — thêm export-ignore vào .gitattributes:`)
  for (const p of blocked) console.error(`  - ${p}`)
  process.exit(1)
}
console.log(`✓ Bản giao (${ref}) sạch: ${list.length} mục, không có cấu hình agent nội bộ.`)
