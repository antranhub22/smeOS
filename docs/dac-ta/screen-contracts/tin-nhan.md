---
id: SCR-STORE-tin-nhan
tier: STORE
module: internal-chat
route: /tin-nhan
archetype: B
snapshots:
  - 390x844
  - 1280x800
acceptance:
  - Hệ thống trao đổi thông tin nội bộ giữa cửa hàng, chuỗi và thợ gia công
  - Tích hợp thẻ hành động gắn liền với đơn hàng (ActionCardOrder)
  - Danh sách hội thoại theo đối tác / chi nhánh kèm tìm kiếm
  - Đầy đủ 6 trạng thái UI và chuẩn WCAG 2.2 AA
---

# Screen Contract — Tin Nhắn Trao Đổi Nội Bộ & Đơn Chế Tác

**Mã màn:** `SCR-STORE-tin-nhan` · **Tuyến:** `/tin-nhan` · **Tầng:** `STORE` · **Bố cục (Archetype):** `B` (Hội thoại / Danh sách tin)

## 1. Vai & Mục đích
- **Vai chính (03b):** `store_manager`, `florist`, `coordinator`.
- **Phạm vi dữ liệu:** `organization` (Hội thoại nội bộ và đơn điều phối).
- **Mục tiêu chính:** Trao đổi trực tiếp về yêu cầu kỹ thuật của đơn hàng, gửi ảnh thành phẩm và báo phát sinh sự cố.
- **Câu hỏi cốt lõi:** "Có tin nhắn mới nào từ xưởng gia công hoặc điều phối viên không?"
- **Mật độ thông tin (Density):** `comfortable`

## 2. Cấu trúc Bố cục & Thứ bậc (Visual Hierarchy)
- **Header:** `PageHeader` tiêu đề "Tin Nhắn Nội Bộ", ô tìm kiếm người nhận.
- **Vùng làm việc:** Bố cục 2 cột (Danh sách hội thoại bên trái, Khung chat bên phải).
- **Khối chức năng chính:**
  1. L0 (Thiết yếu): Danh sách cuộc trò chuyện, tin nhắn mới nhất, số tin chưa đọc.
  2. L1 (Hành động): Khung nhập tin nhắn, đính kèm thẻ đơn hàng (`ActionCardOrder`).
  3. L2 (Bổ trợ): Thông tin đối tác đang chat, trạng thái trực tuyến.

## 3. Hành động cấp trang (Actions)
- **Hành động chính (Primary CTA):** Nút "Gửi tin nhắn" (Enter).
- **Hành động phụ (Secondary):** "Đính kèm đơn hàng", "Tìm kiếm lịch sử chat".

## 4. Đặc tả 6 Trạng thái Giao diện (States)
1. **Đang tải (Loading):** Skeleton danh sách hội thoại và khung tin nhắn.
2. **Rỗng (Empty):** `EmptyState kind="none"` báo: "Chưa có cuộc trò chuyện nào".
3. **Lỗi (Error):** Lỗi kết nối WebSocket / API tin nhắn.
4. **Không có quyền (Forbidden):** Yêu cầu quyền trao đổi nội bộ.
5. **Dữ liệu một phần (Partial):** Hiển thị tin nhắn đã lưu trong bộ nhớ đệm khi mạng ngắt.
6. **Thành công (Success):** Tin nhắn gửi tức thời, cuộn mượt xuống đáy.

## 5. Quy chuẩn Trợ năng & Responsive (A11y & Responsive)
- Hỗ trợ phím tắt gửi tin nhắn và điều hướng danh sách hội thoại.
- Trên di động, tự động thu gọn thành 1 cột (chuyển đổi danh sách ➔ khung chat).
