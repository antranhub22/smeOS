/**
 * Care Cards Domain SSOT (Chăm sóc & Giữ chân khách hàng).
 * Độc lập 100% với module greeting-card (PO QĐ5 Freeze).
 * Hỗ trợ các ấn phẩm: #48, #49, #50, #51, #52, #55.
 */

export type CareCardAssetCode = "48" | "49" | "50" | "51" | "52" | "55"
export type CareCardColorTheme = "gold" | "rose" | "emerald" | "indigo" | "slate"

export interface CareCardTemplate {
  assetCode: CareCardAssetCode
  name: string
  purpose: string
  defaultHeadline: string
  defaultMessage: string
  suggestedTheme: CareCardColorTheme
  defaultInstructions?: string[] | undefined
}

export interface CareCardContent {
  assetCode: CareCardAssetCode
  recipientName: string
  headline: string
  messageBody: string
  signature: string
  voucherCode?: string | undefined
  voucherValue?: string | undefined
  careInstructions?: string[] | undefined
  accentColor: CareCardColorTheme
  productImageUrl?: string | undefined
}

export const CARE_CARD_TEMPLATES: Record<CareCardAssetCode, CareCardTemplate> = {
  "48": {
    assetCode: "48",
    name: "Thiệp chúc mừng",
    purpose: "Tấm thiệp gửi kèm đơn hàng mang thông điệp ấm áp",
    defaultHeadline: "Chúc Mừng Ngày Đặc Biệt",
    defaultMessage:
      "Thương chúc bạn một ngày ngập tràn niềm vui, nụ cười rạng rỡ và mọi điều tốt đẹp nhất như ý nguyện!",
    suggestedTheme: "gold",
  },
  "49": {
    assetCode: "49",
    name: "Thiệp cảm ơn mua hàng",
    purpose: "Lời tri ân chân thành gửi đến khách sau mỗi lần ủng hộ",
    defaultHeadline: "Cảm Ơn Bạn Đã Tin Chọn",
    defaultMessage:
      "Mỗi món đồ gửi đi đều gói trọn sự tỉ mỉ và tình cảm của tiệm. Mong bạn sẽ cảm thấy thật vui và ấm lòng khi đón nhận!",
    suggestedTheme: "rose",
  },
  "50": {
    assetCode: "50",
    name: "Thiệp mừng sinh nhật",
    purpose: "Lời chúc kèm món quà bất ngờ gửi đúng ngày sinh nhật",
    defaultHeadline: "Mừng Sinh Nhật Ngọt Ngào",
    defaultMessage:
      "Chúc bạn bước sang tuổi mới rạng ngời hạnh phúc, gặt hái thêm nhiều thành công và luôn tìm thấy niềm vui trong từng khoảnh khắc giản đơn!",
    suggestedTheme: "rose",
  },
  "51": {
    assetCode: "51",
    name: "Thiệp mừng ngày kỷ niệm",
    purpose: "Ghi dấu ngày khách gắn bó cùng cửa hàng qua từng năm",
    defaultHeadline: "Kỷ Niệm Ngày Đáng Nhớ",
    defaultMessage:
      "Cảm ơn bạn đã luôn tin yêu và đồng hành cùng tiệm trong suốt thời gian qua. Kính chúc bạn và những người thân yêu luôn đong đầy yêu thương và gắn kết!",
    suggestedTheme: "indigo",
  },
  "52": {
    assetCode: "52",
    name: "Thẻ quà tặng điện tử",
    purpose: "Phiếu quà tặng có mệnh giá dành tặng người thân bạn bè",
    defaultHeadline: "Thẻ Quà Tặng Tri Ân",
    defaultMessage:
      "Món quà đặc biệt thay lời cảm ơn chân thành gửi đến bạn. Thẻ có thể sử dụng cho mọi dịch vụ và sản phẩm tại tiệm.",
    suggestedTheme: "emerald",
  },
  "55": {
    assetCode: "55",
    name: "Thẻ hướng dẫn bảo quản",
    purpose: "Chỉ dẫn cách giữ sản phẩm bền đẹp dài lâu sau khi nhận",
    defaultHeadline: "Bí Quyết Giữ Sản Phẩm Bền Đẹp",
    defaultMessage:
      "Để sản phẩm luôn giữ được độ tươi mới và vẻ đẹp rạng rỡ dài lâu, tiệm xin gửi đến bạn vài mẹo nhỏ chăm sóc:",
    suggestedTheme: "emerald",
    defaultInstructions: [
      "Đặt ở nơi thoáng mát, tránh ánh nắng mặt trời trực tiếp và luồng gió mạnh",
      "Bổ sung nước sạch hoặc tưới ẩm nhẹ nhàng vào mỗi buổi sáng",
      "Cắt vát gốc 45 độ sau mỗi 1-2 ngày để tăng khả năng hút nước",
      "Liên hệ ngay với tiệm nếu bạn cần hỗ trợ thêm thông tin chăm sóc",
    ],
  },
}

export function getCareCardTemplate(code: CareCardAssetCode): CareCardTemplate {
  return CARE_CARD_TEMPLATES[code] ?? CARE_CARD_TEMPLATES["49"]
}

export function buildCareCardShareText(content: CareCardContent, storeName: string): string {
  const parts: string[] = []
  if (content.recipientName) {
    parts.push(`Kính gửi: ${content.recipientName}`)
  }
  parts.push(content.headline)
  parts.push("")
  parts.push(content.messageBody)

  if (content.voucherCode) {
    parts.push("")
    parts.push(`🎁 Mã ưu đãi: ${content.voucherCode} ${content.voucherValue ? `(Trị giá: ${content.voucherValue})` : ""}`)
  }

  if (content.careInstructions && content.careInstructions.length > 0) {
    parts.push("")
    parts.push("📌 Hướng dẫn bảo quản:")
    for (const inst of content.careInstructions) {
      parts.push(`• ${inst}`)
    }
  }

  parts.push("")
  parts.push(`Thương mến,`)
  parts.push(content.signature || storeName)

  return parts.join("\n")
}

