/**
 * Công cụ mục tiêu chưa có trong danh mục 51 công cụ, theo tài liệu
 * "Nâng cấp Dashboard theo 10 module quy trình" (SMEOS Business Growth Platform).
 *
 * Chỉ ghi những hạng mục chưa có công cụ tương ứng trong `toolkit-catalog.ts`;
 * hạng mục đã có thì gắn mã công cụ ở `growth-modules.ts`, không lặp lại ở đây.
 * Mọi hạng mục ở đây đều ở trạng thái "Sẽ phát triển" và chỉ hiện ở môi trường dev.
 */

import type { GrowthModuleKey, GrowthPhase } from "./growth-modules"

export type RoadmapByPhase = Readonly<Record<GrowthPhase, readonly string[]>>

export const GROWTH_MODULE_ROADMAP: Readonly<Record<GrowthModuleKey, RoadmapByPhase>> = {
  brand: {
    1: ["Thông tin thương hiệu", "Quản lý logo", "Quản lý khẩu hiệu", "Danh thiếp cửa hàng"],
    2: ["Bộ nhận diện của tiệm", "Hướng dẫn dùng thương hiệu", "Mẫu thiết kế theo thương hiệu", "Tài nguyên nhận diện cho marketing"],
    3: ["Trợ lý thương hiệu AI", "Gợi ý nội dung theo thương hiệu", "Kiểm tra tính nhất quán thương hiệu"],
  },
  content: {
    1: ["Quản lý ảnh sản phẩm", "Xoá phông nền ảnh"],
    2: ["Tạo ảnh bằng AI", "Tạo bài đăng mạng xã hội", "Trình chiếu giới thiệu sản phẩm"],
    3: ["Trợ lý viết nội dung AI", "Lập kế hoạch nội dung bằng AI", "Chuyển thể nội dung cho nhiều kênh"],
  },
  promotion: {
    1: ["Bảng giá sản phẩm", "Tạo phiếu ưu đãi"],
    2: ["Tờ rơi", "Tập gấp giới thiệu", "Sách ảnh bộ sưu tập", "Chương trình khuyến mãi", "Đăng bài lên mạng xã hội", "Trang đích cho chiến dịch"],
    3: ["Tự động hoá chiến dịch", "Lập kế hoạch marketing bằng AI", "Lên lịch đăng bài", "Tự động phân phối nội dung", "Tối ưu chiến dịch"],
  },
  acquisition: {
    1: ["Website cửa hàng", "Trang đích cho từng sản phẩm", "Kết nối hồ sơ Google của cửa hàng"],
    2: ["Kết nối Facebook", "Kết nối Instagram", "Kết nối TikTok", "Kết nối Zalo OA", "Kết nối quảng cáo Facebook", "Kết nối quảng cáo Google", "Tối ưu tìm kiếm (SEO)"],
    3: ["Theo dõi khách tiềm năng", "Gom khách từ nhiều kênh", "Tìm khách tiềm năng bằng AI", "Đo lường chuyển đổi", "Chấm điểm khách tiềm năng"],
  },
  consultation: {
    1: ["Tra cứu catalog khi tư vấn", "Thông tin khách hàng", "Hộp thư trò chuyện", "Ghi chú khách hàng"],
    2: ["Quản lý quan hệ khách hàng", "Phân nhóm khách hàng", "Hộp thư đa kênh", "Lịch sử tương tác"],
    3: ["Trợ lý bán hàng AI", "Trợ lý trả lời tự động", "Gợi ý sản phẩm bằng AI", "Tự động nhắc theo dõi khách", "Nhận biết nhu cầu khách bằng AI"],
  },
  quotation: {
    1: ["Mẫu báo giá"],
    2: ["Tuỳ chỉnh sản phẩm theo yêu cầu", "Quản lý khuyến mãi và giảm giá", "Chia sẻ báo giá"],
    3: ["Trợ lý báo giá AI", "Giá linh hoạt theo thời điểm", "Cấu hình sản phẩm bằng AI", "Tự động nhắc báo giá", "Phân tích báo giá"],
  },
  order: {
    1: ["Đặt hàng qua mã QR", "Giỏ hàng", "Quản lý đơn hàng", "Xác nhận đơn hàng"],
    2: ["Thông báo trạng thái đơn"],
    3: ["Trợ lý đơn hàng AI", "Tự động xử lý đơn", "Gom đơn từ nhiều kênh", "Phát hiện đơn bất thường", "Điều phối đơn thông minh"],
  },
  payment: {
    1: ["Thanh toán qua mã QR", "Hướng dẫn thanh toán", "Quản lý trạng thái thanh toán", "Sổ ghi nhận thanh toán"],
    2: ["Kết nối cổng thanh toán", "Đặt cọc", "Thanh toán nhiều lần", "Xác nhận thanh toán", "Quản lý hoàn tiền"],
    3: ["Tự động đối soát ngân hàng", "Tự động nhắc thanh toán", "Hoàn tiền tự động", "Phân tích thanh toán", "Phát hiện giao dịch bất thường"],
  },
  care: {
    1: ["Danh bạ khách hàng", "Thiệp cảm ơn", "Phiếu góp ý của khách", "Thông tin hỗ trợ khách hàng"],
    2: ["Thu thập đánh giá", "Hộp thư hỗ trợ khách", "Quản lý thành viên", "Khảo sát mức hài lòng"],
    3: ["Chăm sóc khách tự động", "Hỗ trợ khách bằng AI", "Phân tích mức hài lòng", "Tự động giữ chân khách", "Phân loại khiếu nại"],
  },
  growth: {
    1: ["Lịch sử mua hàng", "Báo cáo khách hàng cơ bản"],
    2: ["Chiến dịch phiếu ưu đãi", "Marketing qua email", "Marketing qua SMS", "Marketing qua Zalo"],
    3: ["Phân tích khách hàng bằng AI", "Dự đoán nhu cầu mua lại", "Tự động mời khách quay lại", "Marketing cá nhân hoá", "Phân tích giá trị vòng đời khách", "Dự báo khách rời bỏ"],
  },
}
