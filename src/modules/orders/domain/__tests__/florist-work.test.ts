import { describe, expect, it } from "vitest"

import { floristNextStatus, toFloristItem } from "../florist-work"

describe("việc chế tác của thợ (checklist ALG 4.13)", () => {
  it("nhận việc từ ASSIGNED, báo xong từ ARRANGING/QUALITY_CHECK; sai bước → null", () => {
    expect(floristNextStatus("ASSIGNED", "START")).toBe("ARRANGING")
    expect(floristNextStatus("ARRANGING", "FINISH")).toBe("READY")
    expect(floristNextStatus("QUALITY_CHECK", "FINISH")).toBe("READY")
    expect(floristNextStatus("ASSIGNED", "FINISH")).toBeNull()
    expect(floristNextStatus("READY", "START")).toBeNull()
  })

  it("đọc phiên bản khách chọn và số cành của phiên bản (checklist ALG 2.4)", () => {
    const item = toFloristItem({ description: "Bó hồng — Lớn", quantity: 1, metadata: { variant: { id: "opt:1", name: "Lớn", stemCount: 50 } } })
    expect(item).toMatchObject({ variantName: "Lớn", stemCount: 50 })
  })

  it("chỉ giữ công thức và ảnh mẫu, bỏ mọi trường khác trong metadata", () => {
    const item = toFloristItem({
      description: "Bó hồng", quantity: 1,
      metadata: { flowers: [{ flowerName: "Hồng", quantity: 12, unit: "cành", color: "đỏ", role: "Chủ đạo", costVnd: 9000 }, { quantity: 3 }], sampleImageUrl: "https://x/y.png", costVnd: 1 },
    })
    expect(item).toEqual({
      description: "Bó hồng", quantity: 1, sampleImageUrl: "https://x/y.png", variantName: null, stemCount: null,
      recipe: [{ flowerName: "Hồng", quantity: 12, unit: "cành", color: "đỏ", role: "Chủ đạo" }],
    })
  })
})
