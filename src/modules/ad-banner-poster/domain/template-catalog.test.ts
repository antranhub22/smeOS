import { describe, it, expect } from "vitest"
import {
  BANNER_TEMPLATE_CATALOG,
  BANNER_TEMPLATE_CATEGORIES,
  getTemplatesByCategory,
  findTemplateById,
} from "./template-catalog"

describe("template-catalog", () => {
  it("kho template chứa đầy đủ các mẫu phân loại theo mục đích", () => {
    expect(BANNER_TEMPLATE_CATALOG.length).toBeGreaterThanOrEqual(5)
    expect(BANNER_TEMPLATE_CATEGORIES.length).toBe(6)
  })

  it("lọc template theo mục đích PROMOTION_SALE thành công", () => {
    const saleTemplates = getTemplatesByCategory("PROMOTION_SALE")
    expect(saleTemplates.length).toBeGreaterThanOrEqual(1)
    expect(saleTemplates.every((t) => t.category === "PROMOTION_SALE")).toBe(true)
  })

  it("tìm template theo id chính xác", () => {
    const tpl = findTemplateById("tpl-sale-flash")
    expect(tpl).toBeDefined()
    expect(tpl?.name).toBe("Flash Sale Bùng Nổ")
    expect(tpl?.stylePresetId).toBe("VIBRANT_SALE")
  })
})
