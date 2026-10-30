# Đặc tả — Trung tâm Tích hợp (Integration Hub)

> **Trạng thái:** `CANONICAL`
> **Ngày duyệt:** 30/10/2026 (PO duyệt hướng kiến trúc và D1, D5)
> **Mã module:** `src/modules/integration-hub/` · giao diện `src/components/integrations/`
> **Nguồn:** đề xuất `docs/archive/drafts/DE_XUAT_KIEN_TRUC_TRUNG_TAM_TICH_HOP.md` · kế hoạch `docs/kien-truc/KE_HOACH_TRUNG_TAM_TICH_HOP.md`
> **Phạm vi so với đặc tả 08:** đặc tả 08 giữ ranh giới máy-với-máy Core ↔ LocalBudd/SocialFlow. Đặc tả này giữ mọi kết nối của **tổ chức** tới dịch vụ ngoài (kênh bán hàng, nhắn tin, thanh toán, thông báo, vận chuyển, hoá đơn).

## 1. Luật bất biến

1. **Một khung, nhiều đầu nối.** Thêm nhà cung cấp = một manifest trong `domain/connector-catalog.ts` + một connector trong `adapters/connectors/`. Không sửa giao diện hay lõi.
2. **Bí mật** chỉ nằm trong `integration_connections.credential_encrypted` (secret-box, purpose `integration:<connector_key>`). Không route, log, lỗi hay DTO nào trả bí mật; giao diện chỉ thấy 4 ký tự cuối.
3. **Tenancy:** `organization_id` từ `requireTenantContext`; kết nối/sự kiện của tổ chức khác trả 404. Webhook công khai xác định kết nối qua `connection_ref` ngẫu nhiên, không qua id tổ chức.
4. **Webhook:** giới hạn tần suất → xác thực chữ ký của đầu nối → ghi `integration_events` (chống trùng theo `external_event_id`) → 200. Xử lý ở lượt cron, tối đa 6 lần (30s → 6h), hết lượt `DEAD` + thông báo `INTEGRATION_EVENT_DEAD`.
5. **Mọi vòng lặp có giới hạn:** 50 sự kiện mỗi lần gửi, 100 sự kiện và 50 lượt kiểm sức khoẻ mỗi lượt cron, thân webhook 256 KB.
6. **Không báo thành công giả.** Đầu nối chưa có cài đặt thật hiện `Sắp ra mắt`, không nút kết nối.
7. **Ba trục tách rời:** RBAC (`W1`–`W5`), gói dịch vụ (`integrations.sales_channels`, `integrations.api` — gói PRO trở lên), governance theo tầng (`integration_governance`, GĐ3).

## 2. Quyền

| Mã | Việc | Trần cứng |
|---|---|---|
| `W1` | Xem danh mục, kết nối, nhật ký | — |
| `W2` | Kết nối, ngắt kết nối | Điều hành |
| `W3` | Đổi khoá, kiểm tra kết nối | Điều hành |
| `W4` | Khoá/cấp sẵn cho tầng dưới (GĐ3) | Điều hành |
| `W5` | Thử lại sự kiện lỗi | — |

## 3. Vòng đời kết nối

`DRAFT → CONNECTING → ACTIVE ⇄ DEGRADED`; `ACTIVE/DEGRADED → EXPIRED | ERROR → CONNECTING`; `* → DISCONNECTED`; `* ⇄ DISABLED_BY_UPPER`. Luật ở `domain/connection-lifecycle.ts`. Chuyển sang `EXPIRED`/`ERROR` ở lượt kiểm sức khoẻ gửi `INTEGRATION_CONNECTION_DEGRADED` một lần.

## 4. Vai theo tầng

Mỗi manifest khai vai của 4 tầng: `PROVIDE` (sở hữu app/khoá nền tảng) · `ENABLE` (bật/tắt cho tầng dưới) · `CONNECT` (tự kết nối) · `INHERIT` (dùng kết nối của chuỗi) · `NONE`. Ma trận đầy đủ ở đề xuất mục 5 và hiện chỉ-đọc tại `/van-hanh/tich-hop`.

## 5. Bề mặt

- Sidebar: mục "Tích hợp" chèn ngay sau mục cài đặt của tầng (`components/layout/nav/nav-integrations.ts`) — `/tich-hop` (Cửa hàng, Chuỗi, Ngành, cần `W1`), `/van-hanh/tich-hop` (Nền tảng).
- API: đặc tả 06 mục 29. Lược đồ: đặc tả 07 mục 36.
- Cron: `POST /api/v1/internal/integrations-sweep` (chưa có lịch trong `render.yaml` — chờ PO).

## 6. Trạng thái triển khai

| Giai đoạn | Trạng thái |
|---|---|
| GĐ0 — mã hoá token kênh chat, bỏ "thành công" giả | Xong 30/10/2026 |
| GĐ1 — nền móng Hub | Xong 30/10/2026 (đầu nối thật đầu tiên đến ở GĐ2) |
| GĐ2 — chuyển tích hợp hiện có | Chưa làm |
| GĐ3 — governance 4 tầng | Chưa làm |
| GĐ4 — kênh bán hàng | Chưa làm |
| GĐ5 — mở rộng | Chưa làm |
