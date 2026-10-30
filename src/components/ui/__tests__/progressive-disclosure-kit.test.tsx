import { describe, expect, it } from "vitest"
import { createElement } from "react"
import { renderToStaticMarkup } from "react-dom/server"
import { TaskStatus } from "../task-status"
import { Disclosure } from "../disclosure"
import { ResultPanel } from "../result-panel"
import { CostPreview, isCostAffordable } from "../cost-preview"
import { EntitlementGate } from "../entitlement-gate"

describe("TaskStatus (03c UX-016)", () => {
  it("không vẽ phần trăm khi backend không báo tiến độ", () => {
    const html = renderToStaticMarkup(createElement(TaskStatus, { state: "running", title: "Dựng video" }))
    expect(html).toContain("Dựng video · Đang xử lý")
    expect(html).toContain('role="status"')
    expect(html).not.toContain("%")
  })

  it("chỉ hiện phần trăm có thật khi đang chạy", () => {
    const running = renderToStaticMarkup(createElement(TaskStatus, { state: "running", progress: 40 }))
    expect(running).toContain("40%")
    const done = renderToStaticMarkup(createElement(TaskStatus, { state: "succeeded", progress: 40 }))
    expect(done).not.toContain("40%")
  })

  it("lỗi thử lại được có nút thử lại và mã hỗ trợ; lỗi cần làm việc khác thì không", () => {
    const retry = () => {}
    const html = renderToStaticMarkup(
      createElement(TaskStatus, { state: "failed", detail: "Ảnh quá mờ", supportCode: "HT-1234", onRetry: retry }),
    )
    expect(html).toContain('role="alert"')
    expect(html).toContain("Chưa xong được")
    expect(html).toContain("Thử lại")
    expect(html).toContain("Mã hỗ trợ: HT-1234")
    const needsAction = renderToStaticMarkup(
      createElement(TaskStatus, { state: "failed", failureKind: "needs_action", onRetry: retry }),
    )
    expect(needsAction).not.toContain("Thử lại")
  })

  it("kết quả chờ duyệt có nhãn riêng", () => {
    const html = renderToStaticMarkup(createElement(TaskStatus, { state: "succeeded", needsReview: true }))
    expect(html).toContain("Đã xong — chờ duyệt")
  })
})

describe("Disclosure (03c UX-017)", () => {
  it("đóng mặc định nhưng vẫn giữ nội dung trong DOM, có aria-expanded", () => {
    const html = renderToStaticMarkup(
      <Disclosure label="Tùy chỉnh thêm" appliedSummary="Đã tùy chỉnh 2 mục">NOI_DUNG</Disclosure>,
    )
    expect(html).toContain('aria-expanded="false"')
    expect(html).toMatch(/\shidden=""/)
    expect(html).toContain("NOI_DUNG")
    expect(html).toContain("Đã tùy chỉnh 2 mục")
  })

  it("mở sẵn thì không có hidden và không hiện tóm tắt", () => {
    const html = renderToStaticMarkup(
      <Disclosure label="Tùy chỉnh thêm" appliedSummary="X" defaultOpen>NOI_DUNG</Disclosure>,
    )
    expect(html).toContain('aria-expanded="true"')
    expect(html).not.toMatch(/\shidden=""/)
    expect(html).not.toContain("· X")
  })
})

describe("ResultPanel (UX-P05)", () => {
  it("ghi rõ trạng thái bản nháp và phần còn thiếu", () => {
    const html = renderToStaticMarkup(
      <ResultPanel title="Ảnh sản phẩm" stage="draft" missing={["Giá bán"]}>ANH</ResultPanel>,
    )
    expect(html).toContain("Bản nháp")
    expect(html).toContain("Còn thiếu")
    expect(html).toContain("Giá bán")
  })
})

describe("CostPreview (03c UX-019)", () => {
  it("hiện chi phí và số còn lại", () => {
    const html = renderToStaticMarkup(createElement(CostPreview, { cost: 2, remaining: 26 }))
    expect(html).toContain("dùng 2 credit · còn 26")
  })

  it("báo không đủ credit và chặn trước khi gửi", () => {
    expect(isCostAffordable(5, 3)).toBe(false)
    expect(isCostAffordable(5, null)).toBe(true)
    const html = renderToStaticMarkup(createElement(CostPreview, { cost: 5, remaining: 3 }))
    expect(html).toContain("chưa đủ credit")
  })

  it("miễn phí", () => {
    expect(renderToStaticMarkup(createElement(CostPreview, { cost: 0 }))).toContain("Miễn phí")
  })
})

describe("EntitlementGate (03c UX-018)", () => {
  it("không đủ quyền thì hiện lý do thay vì ẩn mất", () => {
    const html = renderToStaticMarkup(
      <EntitlementGate allowed={false} reason="Cần quyền quản lý đơn hàng">NUT</EntitlementGate>,
    )
    expect(html).toContain("Cần quyền quản lý đơn hàng")
    expect(html).not.toContain("NUT")
  })

  it("đủ quyền thì hiện nội dung", () => {
    const html = renderToStaticMarkup(<EntitlementGate allowed reason="x">NUT</EntitlementGate>)
    expect(html).toBe("NUT")
  })
})
