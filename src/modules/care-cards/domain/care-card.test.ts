import { describe, it, expect } from "vitest"
import {
  CARE_CARD_TEMPLATES,
  getCareCardTemplate,
  buildCareCardShareText,
  type CareCardContent,
} from "./care-card"

describe("CareCard domain logic", () => {
  it("provides templates for all 6 target care card assets", () => {
    const requiredCodes = ["48", "49", "50", "51", "52", "55"] as const
    for (const code of requiredCodes) {
      const tpl = getCareCardTemplate(code)
      expect(tpl).toBeDefined()
      expect(tpl.assetCode).toBe(code)
      expect(tpl.name).toBeTruthy()
      expect(tpl.defaultHeadline).toBeTruthy()
      expect(tpl.defaultMessage).toBeTruthy()
    }
  })

  it("builds friendly share text correctly with voucher", () => {
    const content: CareCardContent = {
      assetCode: "50",
      recipientName: "Chị Thảo",
      headline: "Mừng Sinh Nhật Ngọt Ngào",
      messageBody: "Chúc chị sinh nhật rực rỡ niềm vui!",
      signature: "Tiệm Hoa Xinh",
      voucherCode: "SINHNHAT10",
      voucherValue: "Giảm 10%",
      accentColor: "rose",
    }

    const text = buildCareCardShareText(content, "Tiệm Hoa Xinh")
    expect(text).toContain("Kính gửi: Chị Thảo")
    expect(text).toContain("Mừng Sinh Nhật Ngọt Ngào")
    expect(text).toContain("Chúc chị sinh nhật rực rỡ niềm vui!")
    expect(text).toContain("🎁 Mã ưu đãi: SINHNHAT10 (Trị giá: Giảm 10%)")
    expect(text).toContain("Tiệm Hoa Xinh")
  })

  it("builds care guide text with bullet points", () => {
    const content: CareCardContent = {
      assetCode: "55",
      recipientName: "Anh Hoàng",
      headline: "Bí Quyết Giữ Sản Phẩm Bền Đẹp",
      messageBody: "Một vài lưu ý nhỏ:",
      signature: "Tiệm Cây Xanh",
      careInstructions: ["Tưới nước sáng sớm", "Tránh ánh nắng gắt"],
      accentColor: "emerald",
    }

    const text = buildCareCardShareText(content, "Tiệm Cây Xanh")
    expect(text).toContain("📌 Hướng dẫn bảo quản:")
    expect(text).toContain("• Tưới nước sáng sớm")
    expect(text).toContain("• Tránh ánh nắng gắt")
  })
})

