import { readFileSync } from "node:fs"
import path from "node:path"
import { describe, expect, it } from "vitest"

/**
 * Audit A15 (axe, 29/10/2026): chữ "Xem hướng dẫn"/"Thu gọn" dùng `text-guidance/60` chỉ đạt 2,98:1.
 * PO duyệt bỏ độ mờ — giữ nguyên cấu trúc, vị trí, hành vi của khối hướng dẫn (K1).
 */
describe("FeatureGuidanceCard — tương phản chữ (WCAG 1.4.3)", () => {
  it("không làm mờ màu chữ hướng dẫn", () => {
    const src = readFileSync(
      path.resolve(__dirname, "../../../src/components/templates/shared/feature-guidance-card.tsx"),
      "utf-8",
    )
    expect(src).not.toMatch(/text-guidance\/[1-8]\d\b/) // /90 vẫn đạt AA trên nền guidance-bg
  })
})

describe("Token màu chữ trên nền primary (audit A16)", () => {
  it("globals.css khai báo --color-primary-foreground cho lớp text-primary-foreground", () => {
    const css = readFileSync(path.resolve(__dirname, "../../../src/app/globals.css"), "utf-8")
    expect(css).toMatch(/--color-primary-foreground:\s*#FFFFFF/i)
  })
})
