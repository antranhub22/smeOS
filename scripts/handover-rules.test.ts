import { describe, expect, it } from "vitest"
import { findHandoverViolations, LOCAL_PATH } from "./handover-rules.mjs"

type Violation = { rule: string; path: string }
const check = (entries: string[], withLocalPath: string[] = []) =>
  (findHandoverViolations(entries, withLocalPath) as Violation[]).map((v) => `${v.rule}: ${v.path}`)

describe("handover-rules — luật kiểm bản giao khách", () => {
  it("chặn cấu hình agent ở gốc repo", () => {
    expect(check(["CLAUDE.md", "AGENTS.md", ".claude/settings.json", ".agents/AGENT_RULES.md", "README.md"])).toEqual([
      "cấu hình agent: CLAUDE.md",
      "cấu hình agent: AGENTS.md",
      "cấu hình agent: .claude/settings.json",
      "cấu hình agent: .agents/AGENT_RULES.md",
    ])
  })

  it("chặn tài liệu hướng dẫn agent trong docs/", () => {
    expect(
      check([
        "docs/governance/sdagf/AI_AGENT_MASTER_PROMPT.md",
        "docs/archive/historical/kit/08_AGENT_EXECUTION_PROTOCOL.md",
        "docs/archive/guides/M01_VISION_CODING_AGENT_GUIDE.md",
        "docs/agent-overview.md",
      ]),
    ).toHaveLength(3)
  })

  it("chặn tệp văn phòng mang tên khách hàng khác, không chặn mẫu chung", () => {
    expect(
      check([
        "docs/Nhập liệu/BST_Basic_NhuCauDN_Chuan_ALG.xlsx",
        "docs/Nhập liệu/Kho_San_Pham_ALG_Template.xlsx",
        "docs/khach/Bao_gia_Avi_Florist.docx",
        "docs/Nhập liệu/FloraOS_Template_Master_Kho_San_Pham.xlsx",
        "public/templates/smeOS_Template_Master_Kho_San_Pham.xlsx",
        "src/modules/catalog/algorithm.ts",
      ]),
    ).toEqual([
      "tệp của khách hàng khác: docs/Nhập liệu/BST_Basic_NhuCauDN_Chuan_ALG.xlsx",
      "tệp của khách hàng khác: docs/Nhập liệu/Kho_San_Pham_ALG_Template.xlsx",
      "tệp của khách hàng khác: docs/khach/Bao_gia_Avi_Florist.docx",
    ])
  })

  it("chặn tệp có đường dẫn máy cá nhân chỉ khi tệp nằm trong bản giao", () => {
    expect(LOCAL_PATH.startsWith("file://")).toBe(true)
    expect(check(["docs/a.md"], ["docs/a.md", "CLAUDE.md"])).toEqual(["đường dẫn máy cá nhân: docs/a.md"])
  })

  it("bản giao sạch thì không có vi phạm", () => {
    expect(check(["README.md", "LICENSE", "src/app/page.tsx"])).toEqual([])
  })
})
