/**
 * florist-chain-bundle.ts
 *
 * Gói Cấu hình & Nghiệp vụ Chuẩn cho Tổng đài / Công ty Điện hoa (Florist ChainOS).
 * Được đóng gói độc lập, thuần khiết (Pure TS), sẵn sàng copy ra Repo riêng `chainos-dienhoa`.
 */

import { FLORAL_INDUSTRY } from "@/modules/organization/domain/industries/floral"
import type { SubcontractOrderPayload } from "@/layers/contracts"

export interface FloristDispatchRule {
  /** Thời gian tối đa cho phép shop cơ sở bấm nhận đơn trước khi chuyển shop khác (Phút) */
  claimTimeoutMinutes: number
  /** Bắt buộc gửi ảnh QC thành phẩm trước giờ giao tối thiểu (Phút) */
  qcMandatoryMinutesBefore: number
  /** Phạt trễ giao hàng (% trên phí gia công) */
  latePenaltyPercent: number
  /** Tỷ lệ tiền công cắm hoa mặc định tính trên giá trị đơn (%) */
  defaultCraftFeePercent: number
}

export const DEFAULT_FLORIST_DISPATCH_RULE: FloristDispatchRule = {
  claimTimeoutMinutes: 15,
  qcMandatoryMinutesBefore: 45,
  latePenaltyPercent: 10,
  defaultCraftFeePercent: 20,
}

export class FloristChainEngine {
  readonly industry = FLORAL_INDUSTRY
  readonly rules: FloristDispatchRule

  constructor(customRules?: Partial<FloristDispatchRule>) {
    this.rules = {
      ...DEFAULT_FLORIST_DISPATCH_RULE,
      ...customRules,
    }
  }

  /**
   * Tính toán phí gia công cắm hoa gợi ý cho đơn hàng
   */
  calculateCraftFee(orderTotalVnd: number, isVipUrgent = false): number {
    const baseFee = Math.round((orderTotalVnd * this.rules.defaultCraftFeePercent) / 100)
    // Đơn hỏa tốc / lễ tăng 25% công thợ
    return isVipUrgent ? Math.round(baseFee * 1.25) : baseFee
  }

  /**
   * Định dạng tin nhắn gửi qua Telegram / Zalo Bot cho chủ tiệm hoa đối tác
   */
  formatDispatchInviteMessage(payload: SubcontractOrderPayload): string {
    const timeFormatted = new Intl.DateTimeFormat("vi-VN", {
      hour: "2-digit",
      minute: "2-digit",
      day: "2-digit",
      month: "2-digit",
    }).format(payload.deliveryDeadline)

    return [
      `🌸 [ĐIỆN HOA CHUỖI] — MỜI NHẬN GIA CÔNG HOA`,
      `━━━━━━━━━━━━━━━━━━━━━━━━━━`,
      `📦 Đơn hàng: #${payload.orderCode}`,
      `🌺 Loại hoa: ${payload.productName}`,
      `⏰ Giờ giao khách: ${timeFormatted}`,
      `📍 Khu vực giao: ${payload.deliveryAddress.district || ""}, ${payload.deliveryAddress.province || ""}`,
      `💰 Tiền công cắm: ${payload.craftFeeVnd.toLocaleString("vi-VN")} ₫`,
      payload.recipeDescription ? `📝 Ghi chú cắm: ${payload.recipeDescription}` : null,
      `━━━━━━━━━━━━━━━━━━━━━━━━━━`,
      `⚡ Vui lòng bấm "NHẬN ĐƠN" trong vòng ${this.rules.claimTimeoutMinutes} phút!`,
    ]
      .filter(Boolean)
      .join("\n")
  }
}
