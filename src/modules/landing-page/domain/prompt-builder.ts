/**
 * Prompt Builder cho Công cụ 08 — Tạo Landing Page chuẩn Provider Single-Call.
 * Tuân thủ nguyên tắc Trung lập thương phẩm đa ngành (Multi-Industry First).
 */

import type { LandingPageType, LandingArchetype } from "./preset-catalog"

export interface LandingPromptContext {
  readonly pageType: LandingPageType
  readonly archetype: LandingArchetype
  readonly shopName: string
  readonly tagline?: string
  readonly industryKey?: string
  readonly address?: string
  readonly hotline?: string
  readonly userDirectives?: string
  readonly selectedProducts?: readonly {
    readonly name: string
    readonly price?: number | null
    readonly category?: string
  }[]
}

export function buildLandingPagePrompt(context: LandingPromptContext): string {
  const {
    pageType,
    archetype,
    shopName,
    tagline,
    industryKey = "GENERAL_RETAIL",
    address,
    hotline,
    userDirectives,
    selectedProducts = [],
  } = context

  const productListStr = selectedProducts.length > 0
    ? selectedProducts.map((p, idx) => `${idx + 1}. ${p.name}${p.price ? ` (${p.price.toLocaleString("vi-VN")}đ)` : ""}${p.category ? ` - [${p.category}]` : ""}`).join("\n")
    : "Chưa chọn sản phẩm cụ thể (hãy đề xuất các sản phẩm/dịch vụ mẫu phù hợp)"

  return `Bạn là Giám đốc Sáng tạo và Chuyên gia Tiếp thị trực tuyến hàng đầu cho doanh nghiệp vừa và nhỏ (SME).
Nhiệm vụ của bạn là soạn thảo trọn gói nội dung một trang Landing Page chuyên nghiệp, giàu cảm xúc và đạt tỉ lệ chuyển đổi cao theo phong cách "${archetype.name}".

=== THÔNG TIN DOANH NGHIỆP / CỬA HÀNG ===
- Tên thương hiệu: ${shopName}
${tagline ? `- Khẩu hiệu / Định vị: ${tagline}` : ""}
- Ngành nghề kinh doanh: ${industryKey}
- Hotline liên hệ: ${hotline || "Hotline cửa hàng"}
- Địa chỉ: ${address || "Tại cửa hàng"}
- Loại trang yêu cầu: ${pageType}

=== DANH SÁCH SẢN PHẨM / DỊCH VỤ TRỌNG TÂM ===
${productListStr}

${userDirectives ? `=== CHỈ ĐẠO ĐẶC BIỆT TỪ NGƯỜI DÙNG ===\n"${userDirectives}"\n` : ""}

=== YÊU CẦU ĐẦU RA (JSON FORMAT) ===
Hãy sinh nội dung hoàn chỉnh cho các phần theo cấu trúc JSON:
{
  "hero": {
    "badge": "Chuỗi ngắn gọn làm nổi bật (VD: Tuyển chọn thủ công, Thương hiệu hàng đầu...)",
    "headline": "Tiêu đề lớn gây ấn tượng mạnh (dưới 12 từ)",
    "subHeadline": "Mô tả phụ giải thích giá trị độc bản (1-2 câu súc tích)",
    "ctaLabel": "Nhãn nút kêu gọi hành động (VD: Khám phá ngay, Nhận tư vấn...)"
  },
  "story": {
    "title": "Tiêu đề câu chuyện thương hiệu",
    "paragraphs": ["Đoạn văn 1 kể về niềm đam mê hoặc tay nghề", "Đoạn văn 2 cam kết mang lại trải nghiệm xuất sắc"],
    "quote": "Một câu châm ngôn ngắn gọn đầy cảm hứng"
  },
  "perks": [
    {"title": "Điểm mạnh 1", "description": "Mô tả ngắn"},
    {"title": "Điểm mạnh 2", "description": "Mô tả ngắn"},
    {"title": "Điểm mạnh 3", "description": "Mô tả ngắn"},
    {"title": "Điểm mạnh 4", "description": "Mô tả ngắn"}
  ],
  "faq": [
    {"question": "Câu hỏi phổ biến 1", "answer": "Trả lời súc tích"},
    {"question": "Câu hỏi phổ biến 2", "answer": "Trả lời súc tích"},
    {"question": "Câu hỏi phổ biến 3", "answer": "Trả lời súc tích"}
  ],
  "lead": {
    "title": "Tiêu đề phần liên hệ / đặt hẹn",
    "description": "Lời nhắn ấm áp mời khách liên hệ",
    "buttonLabel": "Nhãn nút gửi thông tin"
  }
}

Chú ý:
- Giữ giọng văn tự nhiên, ấm áp, văn phong thương mại cao cấp.
- Tuyệt đối trung thực với sản phẩm và cam kết của cửa hàng.
- Trả về duy nhất khối JSON hợp lệ, không kèm văn bản giải thích phụ bên ngoài.
`
}
