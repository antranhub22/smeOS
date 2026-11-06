import { readFileSync } from "node:fs"
import path from "node:path"
import { describe, expect, it } from "vitest"

/** PO 06/11/2026: bỏ hẳn "thử nghiệm nhanh với mẫu" (ảnh kho) ở quét xu hướng theo ảnh — chỉ dùng ảnh của tiệm. */
const CARD = path.resolve(__dirname, "../../../src/components/market-intelligence/product-upload-card.tsx")

describe("Quét xu hướng theo ảnh không có ảnh mẫu dùng thử", () => {
  it("ô tải ảnh không tham chiếu ảnh kho hay mục thử nghiệm nhanh", () => {
    const src = readFileSync(CARD, "utf8")
    expect(src).not.toContain("images.unsplash.com")
    expect(src).not.toMatch(/thử nghiệm nhanh|handleSelectDemo/)
  })
})
