# Câu hỏi Kiến trúc Cần Con người Quyết định (docs/plan/questions.md)

Dựa trên kết quả kiểm kê Phase 1, dưới đây là các câu hỏi kiến trúc đang chờ bạn phê duyệt trước khi bước vào Giai đoạn 2:

### ❓ Câu hỏi 1 (ADR-D1): Cơ chế Đồng bộ Dữ liệu từ Cửa hàng lên Mother Platform
- **Lựa chọn A (Khuyến nghị)**: **Relay qua Chain OS**. Cửa hàng thuộc chuỗi chỉ gửi sự kiện cho Chain OS; Chain OS tổng hợp và chịu trách nhiệm gửi lên Mother Platform. Cửa hàng độc lập (không thuộc chuỗi) gửi trực tiếp lên Mother.
- **Lựa chọn B**: **Song song (Parallel)**. Cửa hàng gửi đồng thời 2 bản tin: 1 bản tin vận hành cho Chain và 1 bản tin chỉ số cho Mother.

### ❓ Câu hỏi 2 (ADR-D3): Mô hình Lưu trữ Đa Tenant (Tenancy Architecture)
- **Lựa chọn A (Khuyến nghị)**: **Shared Database + `organization_id`** làm mặc định (hiện trạng đang hoạt động rất tốt với bộ test cách ly). Chuẩn bị sẵn cơ chế cấu hình Database URL riêng để tách DB cho khách hàng VIP / Enterprise khi cần.
- **Lựa chọn B**: Chuyển đổi toàn bộ sang Multi-Schema (mỗi tenant 1 PostgreSQL schema riêng biệt). *Lưu ý: Tăng độ phức tạp quản lý migration lên gấp nhiều lần.*

### ❓ Câu hỏi 3: Phạm vi Nâng cấp Repositories trong Nhánh `Nangcap_kientrucREPOSITORIES`
- **Lựa chọn A (Khuyến nghị)**: Tập trung chuẩn hóa Repositories & Port Interfaces cho **Core Business Modules** (`orders`, `coordinator`, `chain-partnership`, `organization`), loại bỏ triệt để việc query Prisma chéo giữa 4 module này.
- **Lựa chọn B**: Refactor toàn diện tất cả 38 modules cùng một lúc. *(Khối lượng rất lớn)*.