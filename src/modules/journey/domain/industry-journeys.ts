/**
 * industry-journeys.ts — Sinh danh mục Journey thích ứng theo ngành SSOT
 *
 * Cho phép các ngành Thời trang, F&B, Quà tặng, Bán lẻ tổng hợp, Dịch vụ...
 * tự động hiển thị đúng thuật ngữ chuyên môn trên Trang chủ.
 *
 * Không import React, không import Prisma (Clean Architecture Domain).
 */

import type { JourneyDefinition } from "./journey-model"
import { STORE_JOURNEYS } from "./journey-catalog"
import { getIndustryTerminology } from "@/modules/organization/domain/industry-profile"

export function getStoreJourneys(industryKey?: string | null): JourneyDefinition[] {
  if (!industryKey || industryKey === "FLORAL") {
    return STORE_JOURNEYS
  }
  const terms = getIndustryTerminology(industryKey)
  return STORE_JOURNEYS.map((j) => {
    switch (j.id) {
      case "greeting-card-hub":
        return {
          ...j,
          goal: `Thẻ chào & ${terms.catalogTitle}`,
          description: `Gửi ${terms.catalogTitle.toLowerCase()} cho khách chọn mẫu, đặt hàng và thanh toán ngay trên điện thoại.`,
        }
      case "market-intelligence-explore":
        return {
          ...j,
          goal: `Xem ${terms.sampleProduct.toLowerCase()} được ưa chuộng`,
          description: `Biết khách thích kiểu dáng, màu sắc và mức giá nào để chuẩn bị hàng.`,
        }
      case "analyze-product-photo":
        return {
          ...j,
          goal: `Tạo ${terms.sampleProduct.toLowerCase()} từ ảnh chụp`,
          description: `Chụp ảnh sản phẩm, AI nhận diện các chi tiết, ${terms.rawMaterialItem.toLowerCase()} và tạo sẵn mẫu để bán.`,
          steps: j.steps.map((s, idx) =>
            idx === 0
              ? { ...s, description: `Chọn ảnh ${terms.sampleProduct.toLowerCase()} cần phân tích` }
              : idx === 1
              ? { ...s, description: `Kiểm tra danh mục thành phần ${terms.rawMaterialItem.toLowerCase()} và thông số định giá` }
              : s
          ),
        }
      case "create-product-quote":
        return {
          ...j,
          description: `Soạn báo giá ${terms.sampleProduct.toLowerCase()} cho khách mua hoặc cho đối tác của cửa hàng.`,
        }
      case "create-audio-voiceover":
        return {
          ...j,
          description: `Chuyển bài viết thành giọng đọc để ghép vào video giới thiệu ${terms.sampleProduct.toLowerCase()}.`,
        }
      case "create-marketing-image":
        return {
          ...j,
          description: `Tách nền và đặt sản phẩm vào không gian studio hoặc sự kiện để có ảnh quảng cáo đẹp hơn.`,
        }
      case "create-product-video":
        return {
          ...j,
          goal: `Tạo video từ ảnh ${terms.sampleProduct.toLowerCase()}`,
          description: `Biến ảnh ${terms.sampleProduct.toLowerCase()} thành video ngắn để đăng Story, Reels, TikTok.`,
        }
      case "create-catalog-collection":
        return {
          ...j,
          goal: `Tạo trang giới thiệu & ${terms.catalogTitle.toLowerCase()}`,
          description: `Tạo trang web ${terms.catalogTitle.toLowerCase()} kèm mã QR để in ấn hoặc gửi khách.`,
          steps: j.steps.map((s, idx) =>
            idx === 0 ? { ...s, label: `Tuyển chọn danh sách ${terms.sampleProduct.toLowerCase()}` } : s
          ),
        }
      case "create-order":
        return {
          ...j,
          description: `Theo dõi đơn từ lúc chốt, giao việc cho ${terms.makerTitle.toLowerCase()} đến khi sản phẩm tới tay người nhận.`,
        }
      case "manage-customers":
        return {
          ...j,
          description: `Lưu sở thích, ngày sinh nhật, ngày kỷ niệm và lịch sử mua sắm của khách quen.`,
        }
      case "launch-product-combo":
        return {
          ...j,
          goal: `Ra mắt ${terms.sampleProduct.toLowerCase()} mới`,
          description: `Từ một ảnh chụp: nhận diện chi tiết, tạo ${terms.sampleProduct.toLowerCase()}, viết bài và làm ảnh quảng cáo.`,
        }
      case "customer-service-chatbot":
        return {
          ...j,
          goal: "Hỏi trợ lý smeOS",
          description: "Trợ lý AI giải đáp thắc mắc và hướng dẫn bạn dùng smeOS.",
        }
      default:
        return j
    }
  })
}
