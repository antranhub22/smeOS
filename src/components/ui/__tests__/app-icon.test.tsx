import { describe, expect, it } from "vitest"
import { renderToStaticMarkup } from "react-dom/server"
import { getAllTools } from "@/modules/toolkit/domain/toolkit-catalog"
import { getAllGrowthModules } from "@/modules/toolkit/domain/growth-modules"
import { IconTile, hasAppIcon } from "../app-icon"

describe("AppIcon / IconTile", () => {
  it("mọi icon trong danh mục công cụ và 10 bước đều có icon Phosphor", () => {
    const names = [...getAllTools().map((t) => t.icon), ...getAllGrowthModules().map((m) => m.icon)]
    expect(names.filter((n) => !hasAppIcon(n))).toEqual([])
  })

  it("ô đặc dùng icon trắng, ô nhạt dùng màu nhóm; icon trang trí ẩn khỏi trình đọc màn hình", () => {
    const solid = renderToStaticMarkup(<IconTile name="Camera" tone="blue" variant="solid" />)
    expect(solid).toContain("text-surface")
    expect(solid).toContain('aria-hidden="true"')
    const soft = renderToStaticMarkup(<IconTile name="Camera" tone="blue" />)
    expect(soft).toContain("text-tone-blue")
  })
})
