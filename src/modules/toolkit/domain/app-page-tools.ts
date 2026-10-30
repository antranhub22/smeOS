/**
 * Trang đã có trong app nhưng chưa nằm trong danh mục 51 công cụ gốc (PO 30/10/2026).
 *
 * Rà soát đồng bộ ở `docs/kien-truc/Nâng cấp tasks/SMEOS_Business_growth_Architecture/DONG_BO_51_CONG_CU.md`.
 * Mức hoàn thiện của từng trang CHƯA được đánh giá, nên tạm để IN_PROGRESS (production chưa hiện);
 * đổi sang DONE sau khi rà soát từng trang.
 */

import type { ToolDefinition } from "./toolkit-catalog"

const NOT_ASSESSED = "Trang đã có trong app — chưa đánh giá mức hoàn thiện"

function appPage(
  id: number, name: string, description: string, icon: string, href: string,
): ToolDefinition {
  return { id, name, description, icon, label: "STORE", status: "IN_PROGRESS", progress: 0, href, statusNote: NOT_ASSESSED }
}

export const APP_PAGE_TOOLS: readonly ToolDefinition[] = [
  appPage(51, "Hồ sơ cửa hàng và thương hiệu", "Tên, logo, liên hệ và thông tin thương hiệu dùng chung cho mọi công cụ", "Store", "/ho-so"),
  appPage(52, "Kho mẫu ấn phẩm", "Mẫu thiết kế có sẵn để tạo ấn phẩm theo thương hiệu", "LayoutTemplate", "/kho-templates"),
  appPage(53, "Quản lý sản phẩm và hình ảnh", "Danh sách sản phẩm, ảnh và nhập hàng loạt từ Excel", "Package", "/san-pham"),
  appPage(54, "Kết nối kênh bán hàng", "Kết nối trang mạng xã hội và kênh nhắn tin của cửa hàng", "Link", "/ket-noi"),
  appPage(55, "Quản lý khách hàng", "Thông tin, ghi chú và lịch sử của từng khách", "Users", "/khach-hang"),
  appPage(56, "Hộp thư khách hàng", "Đọc và trả lời tin nhắn của khách ở một nơi", "Inbox", "/tin-nhan"),
  appPage(57, "Trợ lý tư vấn bán hàng AI", "Trợ lý gợi ý câu trả lời và tư vấn sản phẩm cho khách", "Bot", "/hoi-thoai"),
  appPage(58, "Báo giá nhanh", "Lập báo giá từ sản phẩm có sẵn và gửi cho khách", "FileText", "/bao-gia"),
  appPage(59, "Quản lý đơn hàng", "Theo dõi đơn, xác nhận thanh toán và tạo đơn từ tin nhắn", "ShoppingBag", "/don-hang"),
  appPage(60, "Điều phối đơn hàng", "Chuyển đơn đến cửa hàng phù hợp để thực hiện", "Route", "/dieu-phoi"),
  appPage(61, "Ưu đãi và giảm giá", "Thiết lập các chương trình ưu đãi đang áp dụng", "Percent", "/cai-dat/ma-tran-uudai"),
  appPage(62, "Thanh toán và đặt cọc", "Cách thanh toán và mức đặt cọc áp dụng cho đơn hàng", "Wallet", "/cai-dat/ma-tran-thanhtoan-datco"),
  appPage(63, "Số liệu kinh doanh", "Báo cáo hiệu quả bán hàng và khách hàng", "BarChart3", "/so-lieu"),
]
