import { readdirSync, readFileSync, statSync } from "node:fs"
import path from "node:path"
import { describe, expect, it } from "vitest"

/** PO 06/11/2026: bỏ hẳn "thử nghiệm nhanh với mẫu" (ảnh kho) ở quét xu hướng theo ảnh — chỉ dùng ảnh của tiệm. */
const DIR = path.resolve(__dirname, "../../../src/components/market-intelligence")
const files = (d: string): string[] => readdirSync(d).flatMap((n) => (statSync(path.join(d, n)).isDirectory() ? files(path.join(d, n)) : [path.join(d, n)]))
/** Ảnh kho Unsplash: tìm theo địa chỉ đầy đủ (có giao thức) trong mã nguồn. */
const STOCK_IMAGE = /https?:\/\/images\.unsplash\.com\//
const CARD = path.resolve(__dirname, "../../../src/components/market-intelligence/product-upload-card.tsx")

describe("Quét xu hướng theo ảnh không có ảnh mẫu dùng thử", () => {
  it("ô tải ảnh không tham chiếu ảnh kho hay mục thử nghiệm nhanh", () => {
    const src = readFileSync(CARD, "utf8")
    expect(src).not.toMatch(STOCK_IMAGE)
    expect(src).not.toMatch(/thử nghiệm nhanh|handleSelectDemo/)
  })

  it("PO 06/11/2026: cả Xu hướng thị trường không còn ảnh kho minh hoạ", () => {
    expect(files(DIR).filter((f) => STOCK_IMAGE.test(readFileSync(f, "utf8")))).toEqual([])
  })
})
