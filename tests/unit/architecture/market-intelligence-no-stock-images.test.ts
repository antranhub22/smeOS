import { readdirSync, readFileSync, statSync } from "node:fs"
import path from "node:path"
import { describe, expect, it } from "vitest"

/** PO 06/11/2026: bỏ hẳn "thử nghiệm nhanh với mẫu" (ảnh kho) ở quét xu hướng theo ảnh — chỉ dùng ảnh của tiệm. */
const DIR = path.resolve(__dirname, "../../../src/components/market-intelligence")
const files = (d: string): string[] => readdirSync(d).flatMap((n) => (statSync(path.join(d, n)).isDirectory() ? files(path.join(d, n)) : [path.join(d, n)]))
/** Có URL nào trỏ tới máy chủ ảnh kho Unsplash không — so đúng tên máy chủ sau khi phân tích URL. */
const STOCK_HOST = "images.unsplash.com"
const hasStockImage = (src: string) =>
  (src.match(/https?:\/\/[^\s"'`)]+/g) ?? []).some((u) => {
    try {
      return new URL(u).hostname === STOCK_HOST
    } catch {
      return false
    }
  })
const CARD = path.resolve(__dirname, "../../../src/components/market-intelligence/product-upload-card.tsx")

describe("Quét xu hướng theo ảnh không có ảnh mẫu dùng thử", () => {
  it("bộ dò nhận ra ảnh kho, bỏ qua máy chủ khác", () => {
    expect(hasStockImage('url: "https://images.unsplash.com/photo-1?w=600"')).toBe(true)
    expect(hasStockImage('url: "https://cdn.example.com/images.unsplash.com.jpg"')).toBe(false)
  })

  it("ô tải ảnh không tham chiếu ảnh kho hay mục thử nghiệm nhanh", () => {
    const src = readFileSync(CARD, "utf8")
    expect(hasStockImage(src)).toBe(false)
    expect(src).not.toMatch(/thử nghiệm nhanh|handleSelectDemo/)
  })

  it("PO 06/11/2026: cả Xu hướng thị trường không còn ảnh kho minh hoạ", () => {
    expect(files(DIR).filter((f) => hasStockImage(readFileSync(f, "utf8")))).toEqual([])
  })
})
