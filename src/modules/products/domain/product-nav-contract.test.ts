import { describe, it, expect } from "vitest"
import { PRODUCT_INVENTORY_4TIER_SSOT } from "./product-nav-contract"

describe("PRODUCT_INVENTORY_4TIER_SSOT Contract", () => {
  it("đủ 4 tầng phân cấp dữ liệu Sản phẩm & Kho từ 1 đến 4", () => {
    expect(PRODUCT_INVENTORY_4TIER_SSOT[1].level).toBe(1)
    expect(PRODUCT_INVENTORY_4TIER_SSOT[2].level).toBe(2)
    expect(PRODUCT_INVENTORY_4TIER_SSOT[3].level).toBe(3)
    expect(PRODUCT_INVENTORY_4TIER_SSOT[4].level).toBe(4)
  })

  it("mỗi tầng có mục tiêu chính xác theo thiết kế hệ thống", () => {
    // Tầng 1: Thu thập toàn diện dữ liệu sản phẩm & kho tầng 2-3-4
    expect(PRODUCT_INVENTORY_4TIER_SSOT[1].primaryObjective).toContain("tầng 2-3-4")
    // Tầng 2: Chuẩn hóa theo từng ngành
    expect(PRODUCT_INVENTORY_4TIER_SSOT[2].primaryObjective).toContain("chuẩn hóa")
    // Tầng 3: Quản lý chuỗi và chi nhánh
    expect(PRODUCT_INVENTORY_4TIER_SSOT[3].primaryObjective).toContain("chuỗi")
    // Tầng 4: Quản lý tại cửa hàng
    expect(PRODUCT_INVENTORY_4TIER_SSOT[4].primaryObjective).toContain("cửa hàng")
  })

  it("mỗi tầng khớp chính xác groupKey trong hệ thống điều hướng sidebar", () => {
    expect(PRODUCT_INVENTORY_4TIER_SSOT[1].productGroupKey).toBe("san-pham-kho-platform")
    expect(PRODUCT_INVENTORY_4TIER_SSOT[2].productGroupKey).toBe("san-pham-nganh")
    expect(PRODUCT_INVENTORY_4TIER_SSOT[3].productGroupKey).toBe("san-pham-kho-chuoi")
    expect(PRODUCT_INVENTORY_4TIER_SSOT[4].productGroupKey).toBe("san-pham")
  })
})
