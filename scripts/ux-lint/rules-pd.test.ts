import { describe, expect, it } from "vitest"
import ts from "typescript"
import { checkR13, checkR14, checkR15, checkR16 } from "./rules-pd"

function run(rule: typeof checkR13, code: string, file = "src/components/demo/demo.tsx") {
  const sourceFile = ts.createSourceFile("demo.tsx", code, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX)
  return rule(sourceFile, { filePath: `/repo/${file}`, relativeFilePath: file, sourceCode: code })
}

describe("UX Lint R13–R16 (03c §7)", () => {
  it("R13 bắt confirm() của trình duyệt, bỏ qua hàm cục bộ tên confirm và component dùng chung", () => {
    expect(run(checkR13, `if (!window.confirm("Xoá?")) return`)).toHaveLength(1)
    expect(run(checkR13, `if (!confirm("Xoá?")) return`)).toHaveLength(1)
    expect(run(checkR13, `async function confirm() {}\nvoid confirm()`)).toHaveLength(0)
    expect(run(checkR13, `const [confirm, dialog] = useConfirmDialog()\nawait confirm({})`)).toHaveLength(0)
    expect(run(checkR13, `window.confirm("x")`, "src/components/ui/confirm-dialog.tsx")).toHaveLength(0)
  })

  it("R14 bắt so sánh với trạng thái tác vụ tự đặt", () => {
    expect(run(checkR14, `if (s.status === "done") {}`)).toHaveLength(1)
    expect(run(checkR14, `if ("processing" !== step) {}`)).toHaveLength(1)
    expect(run(checkR14, `if (s.status === "COMPLETED") {}`)).toHaveLength(0)
    expect(run(checkR14, `if (state === "succeeded") {}`)).toHaveLength(0)
    expect(run(checkR14, `const label = "done"`)).toHaveLength(0)
  })

  it("R15 bắt <details> tự viết", () => {
    expect(run(checkR15, `const a = <details><summary>Khác</summary></details>`)).toHaveLength(1)
    expect(run(checkR15, `const a = <Disclosure label="Tùy chỉnh thêm">x</Disclosure>`)).toHaveLength(0)
  })

  it("R16 bắt từ cấm trên giao diện, bỏ qua đường dẫn và className", () => {
    expect(run(checkR16, `const a = <p>Worker đang dựng video...</p>`)).toHaveLength(1)
    expect(run(checkR16, `const a = <p>{ok ? "Đã render — chưa duyệt P4" : ""}</p>`)).toHaveLength(2)
    expect(run(checkR16, `const a = <button aria-label="Quay lại danh sách job" />`)).toHaveLength(1)
    expect(run(checkR16, `const a = <p>{items.map((v) => \`job \${v.id}\`)}</p>`)).toHaveLength(1)
    expect(run(checkR16, `const a = <a href="/job" onClick={() => router.push("/job")}>Tác vụ</a>`)).toHaveLength(0)
    expect(run(checkR16, `const a = <p className="render-box">Đang dựng video</p>`)).toHaveLength(0)
  })
})
