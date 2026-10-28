/**
 * florist-chain-bundle.test.ts
 *
 * Kiểm chứng tính độc lập, thuần khiết và khả năng chạy độc lập của FloristChainEngine.
 */

import { describe, it, expect } from "vitest"
import { FloristChainEngine } from "./florist-chain-bundle"
import type { SubcontractOrderPayload } from "@/layers/contracts"
import { FLORAL_INDUSTRY } from "@/modules/organization/domain/industries/floral"

describe("FloristChainEngine — ChainOS Bundle Test", () => {
  const engine = new FloristChainEngine()

  it("sử dụng đúng đặc tả ngành FLORAL", () => {
    expect(engine.industry.identity.key).toBe("FLORAL")
    // Thuật ngữ lấy từ SSOT ngành (chuẩn hoá đa ngành 26/10/2026), không viết cứng ở đây
    expect(engine.industry.terminology.makerTitle).toBe(FLORAL_INDUSTRY.terminology.makerTitle)
  })

  it("tính phí gia công cắm hoa chuẩn xác", () => {
    // 1.000.000đ * 20% = 200.000đ
    const feeNormal = engine.calculateCraftFee(1000000, false)
    expect(feeNormal).toBe(200000)

    // Đơn hỏa tốc cộng thêm 25% = 250.000đ
    const feeUrgent = engine.calculateCraftFee(1000000, true)
    expect(feeUrgent).toBe(250000)
  })

  it("định dạng đúng tin nhắn điều phối cho shop hoa", () => {
    const payload: SubcontractOrderPayload = {
      orderId: "ord_123",
      orderCode: "DH-8888",
      chainId: "chain_dienhoa_sg",
      productName: "Kệ hoa khai trương Đại Phát",
      deliveryDeadline: new Date("2026-11-20T10:00:00Z"),
      deliveryAddress: {
        recipientName: "Nguyễn Văn A",
        recipientPhone: "0901234567",
        fullAddress: "123 Lê Lợi, P. Bến Nghé, Quận 1",
        district: "Quận 1",
        province: "TP. Hồ Chí Minh",
      },
      craftFeeVnd: 250000,
      recipeDescription: "Tone đỏ vàng chủ đạo, hoa đồng tiền và hướng dương",
    }

    const msg = engine.formatDispatchInviteMessage(payload)
    expect(msg).toContain("🌸 [ĐIỆN HOA CHUỖI] — MỜI NHẬN GIA CÔNG HOA")
    expect(msg).toContain("DH-8888")
    expect(msg).toContain("Kệ hoa khai trương Đại Phát")
    expect(msg).toContain("250.000 ₫")
    expect(msg).toContain("Quận 1")
  })
})
