# T1.5 — Điểm Gắn Chặt Kiến Trúc (Coupling Hotspots)

Tổng hợp từ T1.2, T1.3 và T1.4, đây là danh sách **Top 5 Hotspots** cản trở việc tách module và đóng gói Edition, xếp theo mức độ nghiêm trọng:

### 🔴 Hotspot 1: Đọc và Ghi chéo Bảng `orders` và `order_coordinations`
- **Vị trí**: `src/modules/orders`, `src/modules/coordinator`, `src/modules/greeting-card`.
- **Nguyên nhân**: Module chuỗi `coordinator` sửa trực tiếp trạng thái đơn của `orders`, vi phạm quy tắc **REQ-BND-009**: *'Chain OS không sửa trực tiếp bản ghi đơn gốc; Chain đề nghị, Store quyết định'*. Đồng thời `greeting-card` ghi chéo vào `order_coordinations`.
- **Hướng xử lý**: Tách thành Port Interface `IOrderDispatchPort` hoặc giao tiếp qua Transactional Outbox với sự kiện `order.allocated`.

### 🔴 Hotspot 2: Bảng `organizations` và `profiles` bị biến thành 'Bảng Chứa Rác'
- **Vị trí**: Bị 13 callers đọc và 9 callers ghi chéo khắp hệ thống.
- **Nguyên nhân**: Bất kỳ thông tin cấu hình nào (từ telegram chat ID, chain connection, booking rule đến logo tiệm) đều được nhét chung vào cột JSON của `organizations` hoặc `business_profiles`.
- **Hướng xử lý**: Chuẩn hóa thành các config table riêng biệt cho từng module (VD: `chain_profiles`, `store_profiles`).

### 🔴 Hotspot 3: 12 Chu trình Phụ thuộc Vòng (Circular Imports)
- **Cặp tiêu biểu**: `organization <-> profiles`, `coordinator <-> field-platform`, `creative-production <-> video-studio`.
- **Nguyên nhân**: Tầng Domain gọi lẫn nhau thay vì phụ thuộc một chiều xuống Core hoặc dùng Event.
- **Hướng xử lý**: Đưa các kiểu dữ liệu chung xuống `src/core/types` hoặc dùng DTO.

### 🟡 Hotspot 4: Logic Bán lẻ gắn cứng trong `greeting-card`
- **Vị trí**: `src/modules/greeting-card` đang kiêm nhiệm: tạo brochure, tính voucher, đặt cọc, gửi thiệp, claim đơn đối tác.
- **Hướng xử lý**: Bóc tách phần 'Brochure đặt hàng' về đúng `orders`, giữ `greeting-card` thuần túy là trải nghiệm thiệp.

### 🟡 Hotspot 5: Thiếu Transactional Outbox cho Tích hợp Kênh Ngoài
- **Vị trí**: Gửi tin nhắn Telegram/Zalo đang gọi HTTP trực tiếp trong use-case. Khi mạng chập chờn, giao dịch CSDL có thể thành công nhưng thông báo bị mất hoặc gửi lặp.
- **Hướng xử lý**: Lưu sự kiện vào bảng `outbox` trong cùng transaction CSDL, worker nền phụ trách retry có idempotency.