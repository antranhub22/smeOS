# SMEOS — UX WRITING STANDARD & MASTER GLOSSARY
> **Mã định danh:** `DOC-ARCH-UX-WRITING-001`  
> **Cấp thẩm quyền:** Level 2 — Architectural SSOT  
> **Áp dụng cho:** Tất cả các màn hình, thông báo, dialog và tương tác người dùng trên toàn hệ sinh thái SMEOS.

---

## 1. TIÊU CHUẨN GIỌNG ĐIỆU (VOICE & TONE)

| Tiêu chí | Nguyên tắc | Diễn giải |
|---|---|---|
| **Chính xác (Accurate)** | Trực diện, đúng bản chất nghiệp vụ | Gọi đúng tên đối tượng và hành động, không dùng từ ngữ trừu tượng. |
| **Súc tích (Concise)** | Ngắn gọn nhưng trọn nghĩa | Loại bỏ từ nối rườm rà. Tập trung vào lợi ích hoặc kết quả của thao tác. |
| **Đồng cảm & Hỗ trợ (Supportive)** | Tận tình, luôn có lối thoát khi gặp sự cố | Không đổ lỗi cho người dùng; luôn chỉ dẫn bước tiếp theo rõ ràng. |
| **Không Jargon Kỹ thuật (Zero Tech Jargon)** | Thuần túy ngôn ngữ kinh doanh | Tuyệt đối không để lộ các thuật ngữ lập trình vào mắt người dùng cuối. |

---

## 2. BẢNG KHỬ TỪ LÓNG KỸ THUẬT (TECH JARGON ELIMINATION)

| Thuật ngữ Kỹ thuật Bị Cấm | Thay thế Chuẩn Hóa trên UI | Ngữ cảnh sử dụng |
|---|---|---|
| `BOM` / `Bill of Materials` | **Định lượng nguyên vật liệu** hoặc **Công thức chế tác** | Quản lý sản phẩm, tồn kho |
| `Master Index` | **Danh mục tổng hợp** hoặc **Thư viện chuẩn** | Phân hệ ngành, template |
| `PII` / `Personally Identifiable Information` | **Thông tin cá nhân khách hàng** | Quyền riêng tư, bảo mật |
| `M0..M5` / `M-Phases` | **Tiến độ xử lý** (Nhận đơn → Chế tác → Giao hàng) | Tháp điều phối, trạng thái đơn |
| `Control Tower` | **Tháp điều phối đơn** | Điều phối mạng lưới chi nhánh |
| `Payload` / `Request body` | **Dữ liệu gửi lên** hoặc **Thông tin nhập liệu** | Form, thông báo lỗi |
| `Tenant` | **Cửa hàng** (Tầng 4) hoặc **Doanh nghiệp / Tổ chức** (Tầng 1) | Quản trị tổ chức |
| `Job` / `Background Task` | **Tiến trình xử lý** (ví dụ: "Đang tạo ảnh sản phẩm") | Hàng đợi AI, xử lý media |

---

## 3. MASTER GLOSSARY (THUẬT NGỮ CHUẨN TOÀN HỆ THỐNG)

### 3.1. Động từ Thao tác (Action Verbs)
- **Tạo mới**: `Tạo {đối tượng}` (Tạo đơn hàng, Tạo sản phẩm, Tạo mã giảm giá). Tránh dùng `"Khởi tạo"`, `"Thêm mới"` tùy tiện.
- **Lưu**: `Lưu thay đổi` (trong trang cài đặt, hồ sơ) hoặc `Lưu bản nháp`. Tránh dùng `"Cập nhật"` khi người dùng chỉ bấm lưu form.
- **Xác nhận**: `Xác nhận {hành động}` (Xác nhận đặt cọc, Xác nhận hoàn thành).
- **Hủy bỏ**: `Hủy bỏ` (đối với modal) hoặc `Hủy đơn hàng` (đối với quy trình kinh doanh).
- **Xóa**: `Xóa {đối tượng}` (luôn kèm modal cảnh báo xác nhận rõ ràng).
- **Gửi duyệt**: `Gửi duyệt` (đối với bài viết, ảnh, mẫu thiệp).
- **Tải lại**: `Làm mới` (cho nút Refresh dữ liệu).

### 3.2. Trạng thái Đơn hàng & Nghiệp vụ (Business States)
- `DRAFT`: **Bản nháp**
- `PENDING`: **Chờ xác nhận**
- `PROCESSING` / `PREPARING`: **Đang chế tác** (hoặc Đang chuẩn bị)
- `READY_FOR_DELIVERY`: **Sẵn sàng giao hàng**
- `DELIVERING`: **Đang giao hàng**
- `COMPLETED`: **Hoàn thành**
- `CANCELLED`: **Đã hủy**
- `REFUNDED`: **Đã hoàn tiền**

---

## 4. QUY TẮC SOẠN THẢO THÔNG BÁO & TRẠNG THÁI (MESSAGING BLUEPRINTS)

### 4.1. Thông báo Thành công (Success Messages)
- **Cấu trúc**: `Đã {hành động} {đối tượng} thành công.`
- *Nên*: "Đã tạo đơn hàng thành công."
- *Không nên*: "Thực thể đơn hàng đã được khởi tạo thành công." hoặc "Thành công!"

### 4.2. Thông báo Lỗi & Khắc phục (Error Messages)
- **Cấu trúc 3 thành phần**:
  1. Điều gì vừa xảy ra (Nguyên nhân trực tiếp nếu biết).
  2. Lý do ngắn gọn (nếu có).
  3. Hành động khắc phục ngay lập tức.
- *Nên*: "Không thể lưu đơn hàng do mất kết nối mạng. Vui lòng kiểm tra lại đường truyền và thử lại."
- *Không nên*: "Lỗi xử lý yêu cầu (Error 500)." hoặc "Đã có lỗi xảy ra."

### 4.3. Trạng thái Trống (Empty States)
- **Cấu trúc 3 thành phần**:
  1. Tiêu đề: `Chưa có {đối tượng} nào`
  2. Mô tả: Giải thích ngắn gọn cách tạo ra đối tượng đó.
  3. Nút hành động kêu gọi (CTA): `Tạo {đối tượng} đầu tiên`
- *Nên*: 
  - Tiêu đề: "Chưa có đơn hàng nào"
  - Mô tả: "Các đơn hàng từ khách hoặc mạng lưới sẽ xuất hiện tại đây khi phát sinh giao dịch."
  - CTA: "Tạo đơn hàng mới"
- *Không nên*: "Không có dữ liệu." hoặc "Danh sách trống."

### 4.4. Hộp thoại Xác nhận Nguy hiểm (Confirmation Dialogs)
- **Tiêu đề**: Nêu rõ hành động nguy hiểm: `Xóa sản phẩm này?`
- **Nội dung**: Nêu rõ hậu quả không thể phục hồi: `Hành động này không thể hoàn tác. Sản phẩm sẽ bị gỡ khỏi toàn bộ danh mục bán.`
- **Nhãn nút**:
  - Hủy: `Giữ lại` hoặc `Hủy bỏ`
  - Chấp nhận: `Xóa vĩnh viễn` (nút màu đỏ `danger`)

