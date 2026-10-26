# T1.6 — Hiện trạng Tích hợp và Đồng bộ Dữ liệu Ra Ngoài (Sync Current)

## 1. Các kênh gửi dữ liệu ra ngoài hiện tại

| Kênh / Hệ thống ngoài | Module phụ trách | Cơ chế gửi | Dữ liệu truyền tải | Phân loại L0–L3 | Rủi ro Bảo vệ Dữ liệu |
|---|---|---|---|---|---|
| **Telegram Bot API** | `greeting-card/adapters` | HTTP POST (Trực tiếp) | Mã đơn, sản phẩm, địa chỉ giao hàng, số điện thoại khách | **L2 + L3 (Nhạy cảm)** | 🔴 Có số điện thoại và địa chỉ khách hàng |
| **Zalo OA API** | `chat-assistant/adapters` | HTTP POST (Trực tiếp) | Tin nhắn chăm sóc khách hàng, thông báo đơn | **L3 (Nhạy cảm)** | 🔴 Có nội dung chat và PII khách |
| **OpenAI / Gemini / Anthropic** | `src/core/ai` | HTTP POST qua AI Gateway | Prompt, ảnh sản phẩm, mô tả tiếp thị | **L1 / L2** | 🟢 Đã có sàn quyền riêng tư (D18) lọc PII |
| **Google Drive Proxy** | `src/modules/proxy` | HTTP GET Proxy Stream | Ảnh sản phẩm từ Drive của tiệm | **L2** | 🟢 Dữ liệu thương phẩm |
| **SocialFlow API** | `workers/socialflow` | FastAPI REST (Port 8000) | Bài viết tiếp thị, lịch đăng Facebook/Instagram | **L1** | 🟢 Dữ liệu tiếp thị công khai |

## 2. Phân loại Lớp Dữ liệu (L0 – L3) theo Chuẩn Spec Pack
- **L0 (Định danh & Kết nối)**: `org_id`, `branch_id`, `instance_id`, `connector_version` — *Luôn đồng bộ*.
- **L1 (Chỉ số tổng hợp)**: Doanh thu ngày, số lượng đơn hoàn thành, tỷ lệ huỷ đơn — *Đồng bộ khi có hợp đồng*.
- **L2 (Bản ghi vận hành)**: Chi tiết sản phẩm, công thức, mã đơn, tiến độ làm hoa — *Đồng bộ theo whitelist trường*.
- **L3 (Dữ liệu cá nhân & nhạy cảm)**: Tên khách hàng, số điện thoại, địa chỉ nhà, nội dung thiệp chúc mừng riêng tư — **Mặc định KHÔNG ĐỒNG BỘ lên Mother Platform** (REQ-DAT-002, ADR-009).