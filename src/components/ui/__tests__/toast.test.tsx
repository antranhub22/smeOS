import * as React from "react"
import { describe, it, expect } from "vitest"
import { renderToStaticMarkup } from "react-dom/server"
import { LiveRegionProvider } from "../live-region"
import { ToastProvider } from "../toast"

describe("Toast component and LiveRegion integration", () => {
  it("renders ToastProvider and accessible viewport", () => {
    const html = renderToStaticMarkup(
      <LiveRegionProvider>
        <ToastProvider>
          <div>Ứng dụng chính</div>
        </ToastProvider>
      </LiveRegionProvider>
    )

    expect(html).toContain("Ứng dụng chính")
    expect(html).toContain('aria-label="Thông báo nổi"')
    expect(html).toContain("fixed top-4 right-4")
    expect(html).toContain('role="status"') // Live region
  })
})
