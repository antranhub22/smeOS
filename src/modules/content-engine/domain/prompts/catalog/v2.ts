/**
 * Catalog Writer v2 (AIC-23 content_generation — variant: catalog_page).
 *
 * Khác v1: chữ cụ thể theo bộ sưu tập, cấm cụm sáo rỗng và lời hứa chưa khai (v1 không cấm).
 * Hình dạng JSON GIỮ NGUYÊN như v1 (dùng chung jsonSchema + normalize).
 * Quay về v1: đổi một dòng ở `prompts/active.ts`.
 *
 * Pure domain — không import Prisma, không gọi mạng.
 */

import { LANDING_CLICHE_PHRASES } from "../../landing-copy-guard"
import { CATALOG_WRITER_PROMPT_V1, type CatalogWriterInput } from "./v1"

const STYLE_VOICE: Record<CatalogWriterInput["styleVariant"], string> = {
  EDITORIAL_LOOKBOOK: "như lời dẫn tạp chí: câu ngắn, giàu hình ảnh (màu, chất liệu, ánh sáng), không khoa trương",
  MODERN_SHOWROOM: "tươi sáng, rõ ràng, nói thẳng khách nhận được gì",
  COMPACT_LIST: "cô đọng, chuyên nghiệp cho khách doanh nghiệp/sự kiện",
}

function buildPrompt(input: CatalogWriterInput): string {
  return `Bạn viết lời giới thiệu cho catalog hoa trực tuyến của tiệm hoa Việt Nam. Mục tiêu: khách lướt trên điện thoại thấy muốn xem tiếp và nhắn tiệm đặt hoa.

TIỆM: ${input.shopName}
BỘ SƯU TẬP: ${input.collectionName}
${input.occasion ? `DỊP: ${input.occasion}` : "DỊP: dùng quanh năm"}
SỐ MẪU THẬT: ${input.productCount}
GIỌNG VĂN: ${STYLE_VOICE[input.styleVariant]}${input.userDirectives ? `\nCHỈ ĐẠO CỦA CHỦ TIỆM:\n${input.userDirectives}` : ""}

YÊU CẦU:
1. badge (≤ 5 từ): nêu dịp hoặc tên bộ sưu tập.
2. description (≤ 200 ký tự): nói cụ thể bộ sưu tập dành cho ai/dịp gì, có ${input.productCount} mẫu.
3. curatorNote (≤ 150 ký tự): một câu của người cắm hoa về cách chọn mẫu — KHÔNG hứa thời gian giao, độ tươi, "miễn phí", "100%".
4. ctaText (≤ 30 ký tự): động từ rõ ràng, vd. "Chọn mẫu và nhắn tiệm".

LUẬT: tiếng Việt tự nhiên, không emoji, không viết hoa toàn bộ, không bịa số mẫu khác ${input.productCount}, không dùng các cụm sáo: ${LANDING_CLICHE_PHRASES.join(", ")}.

Trả về JSON (không thêm lời dẫn):
{ "badge": string, "description": string, "curatorNote": string, "ctaText": string }`
}

export const CATALOG_WRITER_PROMPT_V2 = {
  id: "catalog_writer",
  version: "v2",
  build: buildPrompt,
  jsonSchema: CATALOG_WRITER_PROMPT_V1.jsonSchema,
  normalize: CATALOG_WRITER_PROMPT_V1.normalize,
} as const
