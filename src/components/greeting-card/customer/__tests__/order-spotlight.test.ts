import { describe, it, expect } from "vitest"
import {
  availableNoteKinds,
  defaultOpenNoteKinds,
  initialOpenNoteKinds,
} from "../order-spotlight/order-note-kinds"
import { spotlightClasses } from "../order-spotlight/spotlight-block"

describe("Khối Ghi chú dạng gọn — ô mở sẵn theo ngành", () => {
  it("ngành hoa và quà tặng mở sẵn lời nhắn trên thiệp", () => {
    for (const key of ["FLORAL", "CRAFT_GIFT", "RETAIL_GENERAL", "FASHION", "FNB", null, "UNKNOWN"]) {
      expect(defaultOpenNoteKinds(key)).toEqual(["cardMessage"])
    }
  })

  it("dịch vụ mở sẵn ghi chú yêu cầu, homestay mở sẵn yêu cầu đặc biệt", () => {
    expect(defaultOpenNoteKinds("SERVICES")).toEqual(["senderNote"])
    expect(defaultOpenNoteKinds("HOMESTAY")).toEqual(["specialRequests"])
  })

  it("homestay chỉ có yêu cầu đặc biệt; ngành khác có đủ 4 loại ghi chú", () => {
    expect(availableNoteKinds("HOMESTAY")).toEqual(["specialRequests"])
    expect(availableNoteKinds("FLORAL")).toEqual(["cardMessage", "senderNote", "deliveryNote", "mapUrl"])
  })

  it("ô đã có nội dung (khách quay lại sửa đơn) tự mở, theo thứ tự chuẩn", () => {
    expect(initialOpenNoteKinds("FLORAL", { mapUrl: "https://maps.app.goo.gl/x", deliveryNote: "  " })).toEqual([
      "cardMessage",
      "mapUrl",
    ])
    expect(initialOpenNoteKinds("SERVICES", { cardMessage: "Chúc mừng" })).toEqual(["cardMessage", "senderNote"])
  })
})

describe("Chuẩn Spotlight", () => {
  it("khối đang chọn nổi bật, khối khác chìm xuống và sáng lên khi rê chuột", () => {
    const on = spotlightClasses(true)
    expect(on.block).toContain("border-primary/50")
    expect(on.block).toContain("ring-2 ring-primary/20")
    expect(on.badge).toBe("bg-primary text-white")
    const off = spotlightClasses(false)
    expect(off.block).toContain("opacity-60")
    expect(off.block).toContain("hover:opacity-95")
  })
})
