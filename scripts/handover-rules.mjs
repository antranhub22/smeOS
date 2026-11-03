// Luật kiểm bản giao khách (`git archive`). Tách khỏi handover-check.mjs để test được.

/** Cấu hình agent nội bộ ở gốc repo. */
export const AGENT_CONFIG = [/^AGENTS\.md$/, /^CLAUDE\.md$/, /^\.agents\//, /^\.claude\//, /^\.agent-studio\//, /AGENTS_SECTION_[^/]*\.md$/]

/** Tài liệu hướng dẫn agent trong docs/ — PO quyết định không bàn giao. */
export const AGENT_DOCS = /(AGENTS|CLAUDE)\.md$|AGENT_(MASTER_PROMPT|EXECUTION_PROTOCOL)|CODING_AGENT_GUIDE/i

/** Tệp văn phòng mang tên khách hàng khác (tên theo quy ước `_<KHÁCH>`). */
export const CUSTOMER_FILES = /(^|[_\-/ ])(ALG|AVI[_ -]?FLORIST)[_\-. ][^/]*\.(xlsx|xls|docx|doc|pptx|ppt|pdf)$|(^|[_\-/ ])(ALG|AVI[_ -]?FLORIST)\.(xlsx|xls|docx|doc|pptx|ppt|pdf)$/i

/** Đường dẫn máy cá nhân trong nội dung tệp. */
export const LOCAL_PATH = ["file://", "/Users/"].join("")

/**
 * @param {string[]} entries danh sách mục trong bản giao
 * @param {string[]} filesWithLocalPath tệp (trong bản giao) có chứa LOCAL_PATH
 * @returns {{ rule: string, path: string }[]}
 */
export function findHandoverViolations(entries, filesWithLocalPath = []) {
  const out = []
  const inArchive = new Set(entries)
  for (const p of entries) {
    if (AGENT_CONFIG.some((re) => re.test(p))) out.push({ rule: "cấu hình agent", path: p })
    else if (AGENT_DOCS.test(p)) out.push({ rule: "tài liệu agent", path: p })
    else if (CUSTOMER_FILES.test(p)) out.push({ rule: "tệp của khách hàng khác", path: p })
  }
  for (const p of filesWithLocalPath) {
    if (inArchive.has(p)) out.push({ rule: "đường dẫn máy cá nhân", path: p })
  }
  return out
}
