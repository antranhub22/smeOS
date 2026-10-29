import { describe, expect, it } from "vitest"
import { createElement } from "react"
import { renderToStaticMarkup } from "react-dom/server"
import { readFileSync } from "node:fs"
import { join } from "node:path"
import { VideoRenderingProgress } from "../video-rendering-progress"

describe("VideoRenderingProgress — không giả lập tiến độ (03c UX-016, audit A01)", () => {
  it("lúc đầu chỉ báo đang chờ, không có phần trăm hay thời gian còn lại ước đoán", () => {
    const html = renderToStaticMarkup(
      createElement(VideoRenderingProgress, { videoJobId: "v1", onCompleted: () => {}, onFailed: () => {} }),
    )
    expect(html).toContain("Dựng video · Đang chờ xử lý")
    expect(html).not.toMatch(/\d+%/)
    expect(html).not.toContain("Ước tính còn")
  })

  it("mã nguồn không còn tự tăng phần trăm", () => {
    const src = readFileSync(join(__dirname, "../video-rendering-progress.tsx"), "utf-8")
    expect(src).not.toMatch(/setProgress\(\s*\(prev/)
  })
})
