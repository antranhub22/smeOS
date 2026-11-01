import * as React from "react"
import { describe, it, expect } from "vitest"
import { renderToStaticMarkup } from "react-dom/server"
import { KpiTile } from "../kpi-tile"

describe("KpiTile component", () => {
  it("renders label, formatted KPI value, and text-display font styling", () => {
    const html = renderToStaticMarkup(
      <KpiTile
        label="Doanh thu hôm nay"
        value="12.500.000 đ"
        trend={{ value: "+18.4%", direction: "up" }}
      />
    )

    expect(html).toContain("Doanh thu hôm nay")
    expect(html).toContain("12.500.000 đ")
    expect(html).toContain("+18.4%")
    expect(html).toContain("text-display")
    expect(html).toContain("font-extrabold")
    expect(html).toContain("bg-success-bg")
  })

  it("masks sensitive value by default when sensitive=true", () => {
    const html = renderToStaticMarkup(
      <KpiTile
        label="Lợi nhuận ròng"
        value="45.000.000 đ"
        sensitive={true}
      />
    )

    expect(html).toContain("••••••••")
    expect(html).not.toContain("45.000.000 đ")
    expect(html).toContain('aria-label="Hiện số liệu"')
  })
})
