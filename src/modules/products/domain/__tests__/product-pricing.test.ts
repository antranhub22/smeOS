import { describe, expect, it } from "vitest"
import {
  combinations,
  isWeekend,
  optionId,
  parsePricing,
  priceLabel,
  sellableOptions,
  serializePricing,
  summarizePricing,
  unitPriceFor,
  validatePricing,
  type ProductPricing,
} from "../product-pricing"

const range = (rows: Array<[string[], number | null, number | null, boolean?]>): ProductPricing =>
  parsePricing({
    pricing: {
      mode: "RANGE",
      dimensions: [
        { key: "SIZE", label: "Kích cỡ", values: ["Nhỏ", "Lớn"] },
        { key: "COLOR", label: "Màu", values: ["Đỏ", "Trắng"] },
      ],
      rows: rows.map(([values, price_vnd, peak_price_vnd, active]) => ({ values, price_vnd, peak_price_vnd, active })),
    },
  })

describe("product-pricing", () => {
  it("sản phẩm cũ chỉ có attributes.price → giá xác định", () => {
    const p = parsePricing({ price: 350000 })
    expect(p.mode).toBe("FIXED")
    expect(priceLabel(summarizePricing(p))).toBe("350.000 ₫")
  })

  it("tạo đủ tổ hợp Kích cỡ × Màu", () => {
    expect(combinations([{ key: "A", label: "A", values: ["1", "2"] }, { key: "B", label: "B", values: ["x", "y", "z"] }])).toHaveLength(6)
    expect(range([]).rows).toHaveLength(4)
  })

  it("khoảng giá chỉ tính phiên bản đang bán, gồm cả giá cao điểm", () => {
    const p = range([
      [["Nhỏ", "Đỏ"], 300000, 350000],
      [["Nhỏ", "Trắng"], 320000, null],
      [["Lớn", "Đỏ"], 500000, 600000],
      [["Lớn", "Trắng"], 900000, null, false],
    ])
    const s = summarizePricing(p)
    expect([s.minVnd, s.maxVnd, s.hasPeak]).toEqual([300000, 600000, true])
    expect(sellableOptions(p).map((o) => o.name)).toEqual(["Nhỏ / Đỏ", "Nhỏ / Trắng", "Lớn / Đỏ"])
  })

  it("báo lỗi phiên bản đang bán chưa có giá", () => {
    const p = range([[["Nhỏ", "Đỏ"], 300000, null]])
    expect(validatePricing(p)).toContain("Vui lòng nhập giá cho phiên bản Nhỏ / Trắng")
  })

  it("liên hệ: không có giá, không đặt online", () => {
    const s = summarizePricing(parsePricing({ price: 100000, pricing: { mode: "CONTACT" } }))
    expect([s.orderable, priceLabel(s)]).toEqual([false, "Liên hệ"])
  })

  it("lưu lại đọc ra như cũ và price = giá thấp nhất", () => {
    const p = range([[["Lớn", "Đỏ"], 500000, null], [["Nhỏ", "Đỏ"], 300000, null]])
    const saved = serializePricing(p)
    expect(saved.price).toBe(300000)
    expect(parsePricing(saved).rows.find((r) => r.values.join() === "Lớn,Đỏ")?.priceVnd).toBe(500000)
    expect(optionId(["Lớn", "Đỏ"])).toBe(optionId(["lớn", "đỏ"]))
  })

  it("giá cao điểm chỉ áp ngày cao điểm", () => {
    expect(unitPriceFor(300000, 350000, true)).toBe(350000)
    expect(unitPriceFor(300000, 350000, false)).toBe(300000)
    expect(unitPriceFor(300000, null, true)).toBe(300000)
    expect([isWeekend("2026-10-24"), isWeekend("2026-10-22")]).toEqual([true, false])
  })
})
