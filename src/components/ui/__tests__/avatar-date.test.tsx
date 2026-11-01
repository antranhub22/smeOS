import * as React from "react"
import { describe, it, expect } from "vitest"
import { renderToStaticMarkup } from "react-dom/server"
import { Avatar } from "../avatar"
import { DateField } from "../date-field"
import { Separator } from "../separator"

describe("Avatar, DateField & Separator primitives", () => {
  it("renders Avatar with fallback text initials and rounded styling", () => {
    const html = renderToStaticMarkup(<Avatar fallback="TL" size="lg" shape="circle" />)
    expect(html).toContain("TL")
    expect(html).toContain("h-12 w-12")
    expect(html).toContain("rounded-full")
  })

  it("renders DateField with date type and calendar icon indicator", () => {
    const html = renderToStaticMarkup(<DateField defaultValue="2026-11-01" aria-label="Ngày đặt hàng" />)
    expect(html).toContain('type="date"')
    expect(html).toContain('value="2026-11-01"')
    expect(html).toContain("h-12")
    expect(html).toContain("border-border")
  })

  it("renders Separator with horizontal orientation and bg-border", () => {
    const html = renderToStaticMarkup(<Separator />)
    expect(html).toContain("h-[1px]")
    expect(html).toContain("w-full")
    expect(html).toContain("bg-border")
  })
})
