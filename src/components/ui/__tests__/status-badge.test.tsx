import * as React from "react"
import { describe, it, expect } from "vitest"
import { renderToStaticMarkup } from "react-dom/server"
import { Badge } from "../badge"
import { StatusBadge, STATUS_REGISTRY } from "../status-badge"

describe("Badge & StatusBadge components", () => {
  it("renders Badge without hex colors and with semantic tokens", () => {
    const successHtml = renderToStaticMarkup(<Badge tone="success">Thành công</Badge>)
    expect(successHtml).toContain("bg-success-bg")
    expect(successHtml).toContain("text-success-text")
    expect(successHtml).not.toContain("#")

    const accentHtml = renderToStaticMarkup(<Badge tone="accent">Nổi bật</Badge>)
    expect(accentHtml).toContain("bg-selected")
    expect(accentHtml).toContain("text-selected-text")
    expect(accentHtml).not.toContain("#FBEAEC")
  })

  it("renders StatusBadge with normalized key, localized Vietnamese label, and tone", () => {
    const html = renderToStaticMarkup(<StatusBadge status="completed" />)
    expect(html).toContain("Hoàn tất")
    expect(html).toContain("bg-success-bg")
    expect(html).toContain("text-success-text")

    const failedHtml = renderToStaticMarkup(<StatusBadge status="FAILED" />)
    expect(failedHtml).toContain("Thất bại")
    expect(failedHtml).toContain("bg-danger-bg")

    const pendingHtml = renderToStaticMarkup(<StatusBadge status="PENDING" />)
    expect(pendingHtml).toContain("Chờ xử lý")
    expect(pendingHtml).toContain("bg-warning-bg")
  })

  it("renders StatusBadge with custom label override", () => {
    const html = renderToStaticMarkup(
      <StatusBadge status="ACTIVE" label="Đang nhận đơn" />
    )
    expect(html).toContain("Đang nhận đơn")
  })
})
