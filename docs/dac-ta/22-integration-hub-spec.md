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
6. **Không mở lối tắt vào tính năng đang khoá.** Đầu nối có `featureRoute` bị khoá trên production (`src/lib/feature-lock.ts`) hiện "Sắp ra mắt" và không mở panel.
7. **Không báo thành công giả.** Đầu nối chưa có cài đặt thật hiện `Sắp ra mắt`, không nút kết nối.
8. **Ba trục tách rời:** RBAC (`W1`–`W5`), gói dịch vụ (`integrations.sales_channels`, `integrations.api` — gói PRO trở lên), governance theo tầng (`integration_governance`, GĐ3).

## 2. Quyền

| Mã | Việc | Trần cứng |
|---|---|---|
| `W1` | Xem danh mục, kết nối, nhật ký | — |
| `W2` | Kết nối, ngắt kết nối | Điều hành |
| `W3` | Đổi khoá, kiểm tra kết nối | Điều hành |
| `W4` | Chuỗi khoá/cấp sẵn cho cửa hàng thành viên | Điều hành |
| `N16` *(vận hành)* | Khoá/cấp sẵn cho toàn nền tảng hoặc một ngành | — |
| `W5` | Thử lại sự kiện lỗi | — |

## 2b. Bốn loại đầu nối

| Loại (`status`) | Cách chạy | Ở Trung tâm Tích hợp |
|---|---|---|
| `GA` / `BETA` | Khung Hub (bảng `integration_*`, cổng webhook chung) | Kết nối bằng khoá, chi tiết, nhật ký |
| `MANAGED` | Phân hệ sẵn có (chat, thẻ chào, token máy-với-máy) | Trạng thái đọc từ bảng gốc (`infra/legacy-connection-status.ts`, chỉ đọc, không bí mật); quản lý bằng panel nhúng (`components/integrations/managed-panel.tsx`) |
| `LEGACY` | Phân hệ sẵn có | Thẻ dẫn tới màn hình cũ |
| `COMING_SOON` | Chưa có cài đặt | Hiện để người dùng biết lộ trình |

**Nhật ký webhook MANAGED** (`use-cases/record-managed-webhook.ts`): route webhook riêng gọi sau khi xử lý mỗi tin; ghi thẳng `DONE`/`DEAD` (không vào hàng chờ, không "Thử lại" — tin lỗi do nhân viên trả lời ở Hội thoại); lỗi chuyển dòng theo dõi sang `DEGRADED` và báo `INTEGRATION_CONNECTION_DEGRADED` một lần; không bao giờ ném lỗi về route. Dòng theo dõi không ngắt/đổi khoá/kiểm tra được từ Hub.

## 3. Vòng đời kết nối

`DRAFT → CONNECTING → ACTIVE ⇄ DEGRADED`; `ACTIVE/DEGRADED → EXPIRED | ERROR → CONNECTING`; `* → DISCONNECTED`; `* ⇄ DISABLED_BY_UPPER`. Luật ở `domain/connection-lifecycle.ts`. Chuyển sang `EXPIRED`/`ERROR` ở lượt kiểm sức khoẻ gửi `INTEGRATION_CONNECTION_DEGRADED` một lần.

## 3b. Khoá theo tầng (GĐ3, PO 31/10/2026 — D4)

- Dòng `integration_governance (connector_key, tier, scope_id, mode)` do tầng `tier` đặt, áp cho mọi tầng dưới trong phạm vi: Mẹ `GLOBAL` · Ngành `industry:<key>` (ngành là mã trong `organizations.settings.industry`, **không** phải tổ chức) · Chuỗi = id tổ chức chuỗi (cửa hàng thuộc chuỗi qua `chain_partnerships` ACTIVE).
- Chế độ: `ALLOW_OWN` (mặc định — không lưu dòng) · `INHERIT_ONLY` (cửa hàng dùng kết nối của chuỗi, chỉ thấy tên, không đọc khoá) · `FORBID`.
- Khoá tầng cao nhất thắng (`resolveLayered`); tầng dưới không đặt lại được khi tầng trên đã khoá; cửa hàng không khoá được.
- **Chỉ đầu nối `governable`** (đường dùng thật có kiểm khoá) mới khoá được: kênh bán hàng, đầu nối khung Hub (cổng webhook từ chối), Facebook Messenger và Zalo OA (webhook riêng không trả lời, nhật ký ghi `LOCKED_BY_UPPER`). SePay, ZNS, eSMS, Telegram, token API chưa có điểm thực thi → không cho đặt khoá (422 `NOT_GOVERNABLE`).
- Không đổi trạng thái kết nối đã lưu: khoá được tính lúc dùng, gỡ khoá là kết nối chạy lại ngay.

## 4. Vai theo tầng

Mỗi manifest khai vai của 4 tầng: `PROVIDE` (sở hữu app/khoá nền tảng) · `ENABLE` (bật/tắt cho tầng dưới) · `CONNECT` (tự kết nối) · `INHERIT` (dùng kết nối của chuỗi) · `NONE`. Ma trận đầy đủ ở đề xuất mục 5 và hiện chỉ-đọc tại `/van-hanh/tich-hop`.

## 5. Bề mặt

- Sidebar: mục "Tích hợp" chèn ngay sau mục cài đặt của tầng (`components/layout/nav/nav-integrations.ts`) — `/tich-hop` (Cửa hàng, Chuỗi, Ngành, cần `W1`), `/van-hanh/tich-hop` (Nền tảng).
- API: đặc tả 06 mục 29. Lược đồ: đặc tả 07 mục 36.
- Cron: `POST /api/v1/internal/integrations-sweep`, gắn vào cron `smeos-cron-dispatch-sweep` 5 phút/lần (PO 31/10/2026); mỗi kết nối chỉ kiểm sức khoẻ tối đa 30 phút/lần.
- `/hoi-thoai/kenh-tich-hop` chuyển hướng về `/tich-hop?connector=facebook_messenger`.

## 6. Trạng thái triển khai

| Giai đoạn | Trạng thái |
|---|---|
| GĐ0 — mã hoá token kênh chat, bỏ "thành công" giả | Xong 30/10/2026 |
| GĐ1 — nền móng Hub | Xong 30/10/2026 (đầu nối thật đầu tiên đến ở GĐ2) |
| GĐ2 — chuyển tích hợp hiện có | Xong 31/10/2026. GĐ2a: quản lý tại Hub. GĐ2b (PO chọn hướng A): webhook Facebook/Zalo **giữ route riêng** (trả lời tức thì, giữ dữ liệu chốt đơn) và ghi nhật ký vào Hub qua dòng theo dõi `config.source = "managed"` (không giữ khoá, không lưu nội dung tin); một client Telegram dùng chung |
| GĐ3 — governance 4 tầng | Xong 31/10/2026 (mục 3b): chuỗi tại `/tich-hop`, nền tảng/ngành tại `/van-hanh/tich-hop` |
| GĐ4 — kênh bán hàng | Chưa làm |
| GĐ5 — mở rộng | Chưa làm |
