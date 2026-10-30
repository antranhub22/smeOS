/**
 * Công cụ mục tiêu thật sự mới theo tài liệu "Nâng cấp Dashboard theo 10 module quy trình"
 * (SMEOS Business Growth Platform).
 *
 * Hạng mục nào trong tài liệu đã có công cụ hoặc trang tương ứng thì KHÔNG ghi ở đây mà gắn
 * mã công cụ ở `growth-modules.ts` — bảng đối chiếu đầy đủ ở
 * `docs/kien-truc/Nâng cấp tasks/SMEOS_Business_growth_Architecture/DONG_BO_51_CONG_CU.md`.
 * Mọi hạng mục ở đây đều ở trạng thái "Sẽ phát triển" và chỉ hiện ở môi trường dev.
 */

import type { GrowthModuleKey, GrowthPhase } from "./growth-modules"

export type RoadmapByPhase = Readonly<Record<GrowthPhase, readonly string[]>>

export const GROWTH_MODULE_ROADMAP: Readonly<Record<GrowthModuleKey, RoadmapByPhase>> = {
  brand: {
    1: [],
    2: [],
    3: ["Trợ lý thương hiệu AI", "Gợi ý nội dung theo thương hiệu", "Kiểm tra tính nhất quán thương hiệu"],
  },
  content: { 1: [], 2: [], 3: [] },
  promotion: {
    1: [],
    2: [],
    3: ["Tự động hoá chiến dịch", "Tự động phân phối nội dung", "Tối ưu chiến dịch"],
  },
  acquisition: {
    1: ["Kết nối hồ sơ Google của cửa hàng"],
    2: ["Kết nối quảng cáo Facebook", "Kết nối quảng cáo Google", "Tối ưu tìm kiếm (SEO)"],
    3: ["Tìm khách tiềm năng bằng AI", "Chấm điểm khách tiềm năng"],
  },
  consultation: {
    1: [],
    2: [],
    3: ["Nhận biết nhu cầu khách bằng AI"],
  },
  quotation: {
    1: [],
    2: ["Tuỳ chỉnh sản phẩm theo yêu cầu"],
    3: ["Trợ lý báo giá AI", "Cấu hình sản phẩm bằng AI", "Tự động nhắc báo giá", "Phân tích báo giá"],
  },
  order: {
    1: ["Giỏ hàng"],
    2: [],
    3: ["Tự động xử lý đơn", "Gom đơn từ nhiều kênh"],
  },
  payment: {
    1: [],
    2: ["Kết nối cổng thanh toán", "Quản lý hoàn tiền"],
    3: ["Tự động đối soát ngân hàng", "Tự động nhắc thanh toán", "Hoàn tiền tự động", "Phân tích thanh toán"],
  },
  care: {
    1: [],
    2: ["Thu thập đánh giá"],
    3: ["Phân tích mức hài lòng", "Phân loại khiếu nại"],
  },
  growth: {
    1: [],
    2: [],
    3: ["Dự đoán nhu cầu mua lại", "Marketing cá nhân hoá", "Phân tích giá trị vòng đời khách", "Dự báo khách rời bỏ"],
  },
}
