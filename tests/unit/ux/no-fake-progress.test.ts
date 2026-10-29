import { readFileSync } from "node:fs"
import path from "node:path"
import { describe, expect, it } from "vitest"

const read = (rel: string) => readFileSync(path.resolve(__dirname, "../../..", rel), "utf-8")

/**
 * 03c UX-016: không giả lập tiến độ, không báo thành công khi backend chưa xác nhận.
 * Rollout công cụ #08 Landing page và #09 Catalog (29/10/2026).
 */
describe("Không tiến độ giả / link giả ở công cụ Landing page & Catalog", () => {
  it("tạo catalog tự động không tự chờ giả lập và không bịa link khi xuất bản lỗi", () => {
    const src = read("src/components/catalog/use-autonomous-catalog-generator.ts")
    expect(src).not.toMatch(/setTimeout\(r,\s*\d+\)/)
    expect(src).not.toMatch(/\|\|\s*"catalog"/)
    expect(src).toContain("setPublishError(")
  })

  it("tạo landing page không còn bước thị giác/chất lượng ảnh tự xong theo giờ và báo khi dùng nội dung mẫu", () => {
    const src = read("src/components/catalog/landing-campaign-tab.tsx")
    expect(src).not.toMatch(/setTimeout\(r,\s*\d+\)/)
    expect(src).not.toMatch(/id: "vision"/)
    expect(src).toContain("setUsedFallbackContent(true)")
  })
})

describe("Thẻ báo giá /bao-gia — không dữ liệu giả, không AI giả (PO 29/10/2026)", () => {
  it("đọc đúng `{ data }` của /api/v1/products, không sản phẩm mẫu cài cứng, không giả lập phân tích ảnh", () => {
    const src = read("src/app/(app)/bao-gia/page.tsx")
    expect(src).toContain("body.data")
    expect(src).not.toContain("SAMPLE_PRODUCTS")
    expect(src).not.toContain("unsplash.com")
    expect(src).not.toMatch(/setTimeout\(\(\) => \{\s*setAnalyzing/)
  })
})
