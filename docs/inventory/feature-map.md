# T1.4 — Phân loại Tính năng theo Bốn Nhóm (Feature Map)

Dựa trên câu hỏi phân định trong `00-overview.md`:
1. **Store OS**: Tính năng mà một cửa hàng độc lập không có chuỗi vẫn bắt buộc phải có để bán hàng, giao hàng và quản lý kho.
2. **Chain OS**: Tính năng phục vụ điều phối giữa nhiều cửa hàng, cân đối quota, xếp hạng đối tác, chia sẻ đơn.
3. **Industry Pack (Flora, Fashion, FNB...)**: Tính năng chứa công thức, định mức, từ điển từ ngữ, mẫu in chuyên ngành.
4. **Platform (Mother)**: Tính năng vận hành hệ sinh thái, cấp phép giấy phép, Ingestion API, AI Gateway trung tâm.

## 1. Bảng Phân loại Tính năng Chính

| Tính năng / Màn hình / API | Thuộc Nhóm Đề xuất | Lý do Phân định | Điểm Lẫn Nghiệp vụ Cần Tách |
|---|---|---|---|
| **Quản lý Đơn hàng Tiệm** (`/orders`, `/api/v1/orders`) | **Store OS** | Đơn hàng gốc và trạng thái xử lý là tài sản của cửa hàng (REQ-BND-005). | Đang chứa cờ nhận diện đơn được điều phối từ chuỗi. |
| **Brochure & Thiệp Chúc Mừng** (`/b/*`, `greeting-card`) | **Store OS** | Kênh tương tác khách hàng - tiệm, nhận đặt cọc và thanh toán. | Đang gọi trực tiếp use-case của `coordinator` khi khách đặt đơn. |
| **Danh mục Sản phẩm & Tồn kho** (`/products`) | **Store OS** | Tồn kho thực tế và bảng giá thuộc quyền tiệm. | Chưa tách riêng định mức master của Industry Pack. |
| **Mạng lưới Điều phối Đơn** (`/dieu-phoi`, `coordinator`) | **Chain OS** | Chỉ chuỗi mới cần phân bổ đơn cho chi nhánh/đối tác ngoài (REQ-BND-006). | Đang ghi đè trạng thái đơn gốc trong bảng `orders`. |
| **Quản lý Quan hệ Đối tác** (`chain-partnership`) | **Chain OS** | Quản lý hợp đồng, mời tiệm đối tác, chia tỷ lệ doanh thu. | Sạch, đã tách biệt tốt. |
| **Chat Nội bộ Chuỗi** (`internal-chat`) | **Chain OS** | Kênh đàm thoại giữa điều phối viên chuỗi và thợ tiệm thực thi. | Sạch, đã độc lập. |
| **Industry Plugin SSOT** (`industries/*`) | **Industry Pack** | Chứa BOM, vai trò thành phần, đơn vị đo, mẫu in ấn A6 (REQ-BND-007). | Chuẩn mẫu, độc lập 100%. |
| **Console Vận hành** (`/van-hanh`, `platform`) | **Platform (Mother)** | Quản lý tenant toàn sàn, cấp phép quota, theo dõi hệ thống. | Đang đọc trực tiếp DB thay vì Ingestion API. |
| **AI Single-Call Gateway** (`src/core/ai`) | **Platform (Mother)** | Quản lý hạn mức model, kiểm soát quota và bảo mật dữ liệu. | Đã là Core Platform. |
| **Market Intelligence** (`market-intelligence`) | **Platform (Mother)** | Thu thập dữ liệu vĩ mô đa nguồn chia sẻ cho các tenant. | Sạch, có worker riêng. |

## 2. Các điểm Lẫn Nghiệp vụ Nghiêm trọng
1. **Điều phối chuỗi ghi đè Đơn cửa hàng**: `coordinator` hiện đang gọi `prisma.orders.update` thay vì gửi một đề nghị phân bổ (`order.allocated`).
2. **Thiệp chúc mừng kết nối cứng với Điều phối**: `greeting-card` gọi trực tiếp `dispatchSubcontractOrder` thay vì phát ra sự kiện `order.created`.