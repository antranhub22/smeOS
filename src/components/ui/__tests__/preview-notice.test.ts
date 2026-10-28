import { describe, it, expect } from "vitest"
import { createElement } from "react"
import { renderToStaticMarkup } from "react-dom/server"
import { PreviewNotice } from "../preview-notice"

describe("PreviewNotice (AUD-005/006/007)", () => {
  it("ghi rõ là bản xem trước, kèm lời giải thích, dạng ghi chú cho trình đọc màn hình", () => {
    const html = renderToStaticMarkup(createElement(PreviewNotice, null, "Thay đổi chưa được lưu."))
    expect(html).toContain('role="note"')
    expect(html).toContain("Bản xem trước.")
    expect(html).toContain("Thay đổi chưa được lưu.")
  })
})
