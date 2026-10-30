# Đề xuất kiến trúc — Trung tâm Tích hợp SMEOS (Integration Hub)

> **Trạng thái:** `DRAFT` — PO đã duyệt hướng ngày 30/10/2026; kế hoạch chi tiết: `docs/kien-truc/KE_HOACH_TRUNG_TAM_TICH_HOP.md`.
> **Ngày:** 2026-10-30 · **Phạm vi:** 4 tầng (SaaS Mẹ → SaaS Ngành → ChainOS → StoreOS)
> **Khi được duyệt:** chuyển thành spec `docs/dac-ta/2x-integration-hub-spec.md` (CANONICAL) và đăng ký trong registry. Phần kênh ngoài của `08-integration-specification.md` sẽ trỏ sang spec đó.

---

## 1. Mục tiêu

Gom mọi kết nối với dịch vụ bên ngoài về **một mục "Tích hợp" trong sidebar của cả 4 tầng**. Tại đó người dùng làm được trọn vòng: **khám phá → chọn → kết nối → cấu hình → theo dõi → ngắt kết nối**.

Mỗi tầng chỉ thấy những tích hợp phù hợp với vai trò của mình. Tầng trên có thể **cấp sẵn** cấu hình cho tầng dưới hoặc **khoá** không cho tầng dưới tự đổi.

Tiêu chuẩn: production / commercial ready, enterprise grade, gồm:
- an toàn credential;
- webhook đã xác thực và không xử lý trùng;
- retry có giới hạn;
- kiểm toán (audit);
- quan sát được sức khoẻ kết nối;
- cách ly tenant;
- gắn với gói dịch vụ.

## 2. Hiện trạng (đã đối chiếu code)

### 2.1 Kiểm kê tích hợp

| Nhóm | Tích hợp | Mức độ thật | Nơi cấu hình / credential | Vấn đề |
|---|---|---|---|---|
| Nhắn tin – chat | Facebook Messenger | Thật: webhook kiểm `X-Hub-Signature-256`, có idempotency (`src/app/api/v1/chat/webhooks/facebook/route.ts`) | `chat_channel_integrations.config` (Json) | **Token lưu dạng rõ** |
| | Zalo OA (chat) | Thật: kiểm `X-ZEvent-Signature` và chống replay (`.../webhooks/zalo/route.ts`) | như trên | **Secret lưu dạng rõ** |
| | Zalo OA cấp nền tảng (liên kết chi nhánh) | Thật (`api/v1/public/zalo-oa/webhook`) | Biến môi trường và `ZaloOaTokenVault` | — |
| Thông báo | Telegram | Thật (`notification/infra/channel-adapters/telegram-adapter.ts`, `greeting-card/adapters/staff-channels/telegram-*`) | `greeting_integrations.*_encrypted` | Có 2 bản adapter trùng nhau |
| | Messenger, WhatsApp, Zalo OA cho nhân viên | Thật (`staff-channels/*`) | Đã mã hoá | Chỉ dùng trong luồng thiệp |
| | Zalo ZNS, eSMS | Thật, ZNS có circuit breaker | Đã mã hoá (secret-box) | Chỉ dùng trong luồng thiệp |
| | SMS, Zalo, Web Push (hệ thông báo chung) | **Stub**: chỉ ghi log rồi trả `success:true` | — | Báo thành công giả |
| Thanh toán | SePay | Thật: header `Apikey`, chỉ lưu hash, chống trùng theo `external_id` (`public/payments/sepay`) | `payment_webhook_key_hash` | Gắn chặt module greeting-card |
| | VietQR | Chỉ sinh mã QR, không gọi API | — | — |
| | VNPay / MoMo / PayOS | **Chưa có** | — | — |
| Kênh bán hàng | Shopee, TikTok Shop, Meta Catalog, Google Merchant, Zalo OA catalog | **Mới có port** `src/core/ports/sales-channel-catalog-provider.ts`; adapter duy nhất là `NotConfiguredChannelAdapter`, luôn trả `NOT_CONFIGURED` | — | **Chưa có đầu nối thật nào** |
| | Lazada, Haravan, Sapo, KiotViet, Shopify, WooCommerce, GrabMart | **Chưa có**, cũng chưa có trong port | — | — |
| Nội bộ | Chuỗi ↔ cửa hàng | Thật (`chain_partnerships`, mở khoá công cụ `unlockedTools`) | `organizations.settings` | Không nằm trong khái niệm "tích hợp" |
| | API máy-với-máy (SocialFlow, LocalBudd) | Thật (`src/modules/integration`, token lưu HMAC, có xoay khoá) | `integration_tokens` | — |
| Dữ liệu ngoài | Google Trends, SerpAPI | Thật, khoá cấp nền tảng đặt trong biến môi trường | env | — |

**Trả lời câu hỏi "kênh bán hàng đã có đầu nối sẵn sàng chưa": Chưa.** Hiện chỉ có hợp đồng `upsertListings` / `removeListings` (tối đa 100 listing mỗi lần đẩy). Chưa có OAuth, chưa có bảng lưu credential kênh, chưa đồng bộ đơn hàng, tồn kho hay giá, và chưa có webhook từ sàn.

### 2.2 Giao diện hiện tại bị phân mảnh

- `/ket-noi`: tài khoản mạng xã hội.
- `/hoi-thoai/kenh-tich-hop`: kênh chat.
- `/noi-bo/ket-noi`: định danh và đối tác chuỗi.
- Cấu hình thiệp nằm trong `api/v1/greeting-card/integrations/*`.
- Kênh thông báo nằm ở `/cai-dat/thong-bao`.

Không tầng nào có mục "Tích hợp" trong sidebar (`src/components/layout/nav/nav-*.ts`).

### 2.3 Nền móng có thể tái dùng

- `src/core/security/secret-box.ts`: AES-256-GCM, mỗi `purpose` dùng một khoá con dẫn xuất bằng HKDF.
- `src/core/http/{webhook-signature,rate-limit,circuit-breaker}.ts`.
- `src/core/idempotency`.
- Hàng đợi job Postgres (`src/modules/jobs`), workers dùng LISTEN/NOTIFY.
- Audit log (`src/modules/audit`).
- `src/core/governance/layered-resolver.ts`: quy tắc khoá tầng trên → ghi đè → mặc định. Hệ thông báo đã dùng nó.
- `src/core/entitlements`, `src/core/rbac/capability-catalog.ts`.

## 3. Nguyên tắc thiết kế

1. **Một khung, nhiều đầu nối.** Muốn thêm nhà cung cấp chỉ cần viết thêm một connector có manifest. Không phải sửa UI hay lõi.
2. **Tách 3 trục, không trộn lẫn** (theo skill tier-governance):
   - RBAC: ai được thao tác;
   - Entitlement: gói dịch vụ có tích hợp này không;
   - Governance: tầng trên khoá hoặc cấp sẵn.
3. **Mọi credential của tenant đều mã hoá** bằng secret-box, mỗi provider một `purpose` riêng. Không bao giờ trả secret về client; client chỉ thấy gợi ý 4 ký tự cuối.
4. **Webhook vào phải qua cổng chung:** xác thực chữ ký → chống trùng → ghi sự kiện thô → xử lý bất đồng bộ.
5. **Không báo thành công giả.** Adapter stub phải trả `NOT_CONFIGURED`, không được trả `success:true`.
6. Quy tắc tenancy theo CLAUDE.md: `organization_id` chỉ lấy từ context; truy cập chéo tenant trả 404.

## 4. Kiến trúc đề xuất

### 4.1 Phân lớp (module mới `src/modules/integration-hub`)

```
domain/      connector-manifest, connection lifecycle (state machine), scope & governance rules
use-cases/   list-catalog, start-connect, complete-oauth, test-connection, disconnect,
             rotate-credential, handle-inbound-event, run-sync, get-health
infra/       connection-repository, credential-vault (secret-box), event-log-repository
adapters/    connectors/<provider>/  (facebook, zalo-oa, zalo-zns, telegram, sepay,
             shopee, tiktok-shop, lazada, haravan, sapo, kiotviet, ...)
```

- Mỗi connector cài đặt những **port nghiệp vụ** mà nó có năng lực tương ứng: `MessagingChannel`, `NotificationChannel`, `PaymentProvider`, `SalesChannelCatalogProvider` (đã có), `OrderSyncProvider`, `InventorySyncProvider`.
- Các module nghiệp vụ (chat, notification, orders, products, greeting-card) **chỉ gọi qua port**. Hub chịu trách nhiệm chọn connection đang hiệu lực cho từng org.

### 4.2 Connector Manifest (khai báo, lưu trong code)

```ts
{ key: "shopee", category: "SALES_CHANNEL", label: "Shopee",
  capabilities: ["CATALOG_PUSH","ORDER_PULL","INVENTORY_PUSH","WEBHOOK_IN"],
  auth: "OAUTH2" | "API_KEY" | "BOT_TOKEN" | "WEBHOOK_KEY",
  tiers: { MOTHER: "PROVIDE", INDUSTRY: "ENABLE", CHAIN: "CONNECT", STORE: "CONNECT" },
  plan: "PRO", multiAccount: true, status: "GA" | "BETA" | "COMING_SOON",
  configSchema: zod, docsHref }
```

Catalog trên UI được sinh hoàn toàn từ manifest. Tích hợp ở trạng thái `COMING_SOON` vẫn hiện trong catalog nhưng không bấm kết nối được, để người dùng thấy lộ trình.

### 4.3 Mô hình dữ liệu (**cần PO duyệt thay đổi schema**)

| Bảng | Nội dung chính |
|---|---|
| `integration_connections` | `organization_id`, `connector_key`, `scope_tier`, `external_account_id`, `display_name`, `status` (DRAFT/CONNECTING/ACTIVE/DEGRADED/EXPIRED/ERROR/DISCONNECTED), `config Json` (không chứa bí mật), `credential_encrypted`, `credential_hint`, `expires_at`, `last_health_at`, `inherited_from_org_id`. Unique trên (org, connector, external_account_id). Có `@@index([organization_id])` |
| `integration_events` | Nhật ký webhook vào và lệnh gọi ra: `direction`, `external_event_id` (unique theo connection, dùng để chống trùng), `status`, `attempts`, `next_retry_at`, `error_code`. Payload đã che dữ liệu cá nhân; hết hạn sau 30–90 ngày |
| `integration_sync_cursors` | Con trỏ đồng bộ đơn hàng / tồn kho theo connection |
| `integration_governance` | Khoá / cấp sẵn theo `(connector_key, tier, scope_id)`. Theo đúng tiền lệ bảng `notification_*` |

**Di trú dữ liệu:**
- `chat_channel_integrations` được mã hoá lại và chuyển sang `integration_connections`.
- `greeting_integrations` giữ nguyên ở giai đoạn đầu và được đọc qua adapter tương thích.
- SePay giữ cơ chế hash API key, chỉ chuyển nơi lưu.

### 4.4 Vòng đời kết nối

```
DRAFT → CONNECTING (OAuth/nhập khoá) → ACTIVE ⇄ DEGRADED (lỗi tạm, circuit open)
ACTIVE → EXPIRED (token hết hạn, tự refresh thất bại) → cần kết nối lại
* → DISCONNECTED (thu hồi token phía nhà cung cấp nếu được, xoá credential, giữ log)
```

- Job `integration.health` chạy định kỳ: làm mới token, ping tài khoản, cập nhật trạng thái.
- Khi trạng thái chuyển sang EXPIRED hoặc ERROR, gửi thông báo qua hệ thông báo 4 tầng.

### 4.5 Cổng webhook chung

- **URL** dạng `POST /api/v1/public/integrations/{connector}/{connectionRef}`. `connectionRef` là mã ngẫu nhiên khó đoán, không phải `organization_id`.
- **Luồng xử lý:**
  1. Giới hạn tần suất.
  2. Xác thực bằng phương thức của manifest (HMAC / chữ ký / API key hash / timestamp chống replay).
  3. Ghi vào `integration_events`, chống trùng theo `external_event_id`.
  4. Trả 200 thật nhanh.
  5. Job xử lý bất đồng bộ, retry tối đa N lần với backoff.
  6. Hết số lần retry thì chuyển sang dead-letter, hiện trên UI để người dùng xử lý thủ công (giống `UNMATCHED` của SePay hiện nay).
- **Gọi ra ngoài:** mọi lệnh gọi đi qua circuit breaker, timeout và retry có giới hạn, đồng thời tôn trọng rate limit của nhà cung cấp.

### 4.6 Bảo mật và tuân thủ

- **Secret:** mã hoá bằng secret-box, một `purpose` cho mỗi connector, có job xoay khoá.
- **OAuth:** `state` ký HMAC, gắn với org và user, sống 10 phút, dùng PKCE khi nhà cung cấp hỗ trợ.
- **RBAC:** mỗi hành động có capability mới (xem mục 6). Kết nối / ngắt là hành động R3, bắt buộc qua `ConfirmDialog`.
- **Audit:** ghi mọi lần kết nối, ngắt, xoay khoá, đổi cấu hình và đổi khoá governance.
- **Dữ liệu cá nhân:** payload log được che SĐT và email; hạn lưu theo chính sách.
- **Điều khoản nền tảng:** tuân thủ app review của Meta, xét duyệt OA và mẫu ZNS của Zalo, Open Platform của Shopee / TikTok Shop. **Mỗi app nhà cung cấp do SaaS Mẹ sở hữu** (một app chung). Tenant chỉ cấp quyền cho tài khoản của mình.

## 5. Tích hợp theo tầng

Ký hiệu:
- **P** = Cung cấp: tầng này sở hữu app, khoá API nền tảng, hoặc cấu hình dùng chung cho tầng dưới.
- **E** = Bật/tắt: quyết định tầng dưới có được dùng hay không, có thể khoá.
- **C** = Kết nối tài khoản riêng.
- **I** = Kế thừa: dùng kết nối của tầng trên, chỉ xem.
- **—** = Không áp dụng.

| Nhóm / Tích hợp | SaaS Mẹ | SaaS Ngành | ChainOS | StoreOS |
|---|---|---|---|---|
| Facebook Page / Messenger | P (Meta App) | E | C | C hoặc I (dùng Page của chuỗi) |
| Zalo OA (chat, quan tâm) | P (app, OA nền tảng) | E | C | C hoặc I |
| Zalo ZNS | P (app) | E (duyệt mẫu theo ngành) | C (OA của chuỗi) | I hoặc C |
| Telegram bot | P (bot nền tảng) | E | C (nhóm điều phối) | C (nhóm cửa hàng) |
| Email / SMS brandname | P (nhà cung cấp mặc định) | E | C (brandname riêng) | I |
| SePay / thanh toán chuyển khoản | — | E (bật theo ngành) | C (tài khoản chuỗi, chính sách đặt cọc) | C hoặc I (theo `PAYMENTS` governance) |
| VNPay / MoMo / PayOS | P (hợp đồng đối tác) | E | C | C hoặc I |
| Sàn TMĐT: Shopee, TikTok Shop, Lazada | P (Partner App) | E (theo ngành, ví dụ ngành hoa cần giao nhanh) | C (gian hàng chuỗi) | C (gian hàng riêng) |
| Catalog quảng cáo: Meta Catalog, Google Merchant | P | E | C | I |
| Website / POS: Haravan, Sapo, KiotViet, Shopify, WooCommerce | P | E | C | C |
| App giao hàng / đặt món (GrabMart, ShopeeFood…) | P | E (chỉ một số ngành, ví dụ F&B) | C | C |
| Vận chuyển (GHN, GHTK, Ahamove) — đề xuất thêm | P | E | C | C hoặc I |
| Hoá đơn điện tử — đề xuất thêm | P | E | C (MST chuỗi) | I hoặc C |
| Liên kết chuỗi ↔ cửa hàng | Xem toàn cục | Xem theo ngành | C (mời / duyệt đối tác, mở công cụ) | C (chấp nhận lời mời, xem chuỗi đã liên kết) |
| API & Webhook (token máy-với-máy) | P (quản lý toàn cục, quota) | — | C | C |
| Nguồn dữ liệu (Google Trends, SerpAPI), AI provider | P (đã có ở `/cai-dat-ai`) | — | — | — |

**Quy tắc kế thừa:** dùng `resolveLayered`.

- Thứ tự ưu tiên khi xác định kết nối hiệu lực của một cửa hàng:
  1. Khoá từ tầng trên (Mẹ → Ngành → Chuỗi qua `chain_partnerships` ACTIVE).
  2. Kết nối riêng của cửa hàng, nếu được phép.
  3. Kết nối kế thừa từ chuỗi.
  4. Không có.
- Có 3 chế độ khoá cho mỗi `(connector, tier)`: `FORBID` (cấm), `INHERIT_ONLY` (bắt buộc dùng kết nối tầng trên), `ALLOW_OWN` (được tự kết nối).

**Hai lưu ý cấu trúc:**
- Tầng Mẹ và tầng Ngành **không phải tenant org**. Mẹ cấu hình toàn cục; Ngành là plugin trong code. Vì vậy với 2 tầng này, quyền E được lưu bằng `scope_id` dạng `GLOBAL` hoặc `industry:<key>`, giống bảng `notification_*`.
- Đưa tầng Ngành vào dữ liệu là quyết định riêng cần PO duyệt (theo skill tier-governance).

## 6. Trải nghiệm người dùng (Progressive Disclosure)

### Sidebar

Mỗi tầng có mục **"Tích hợp"**:
- Route `/tich-hop` cho Chain, Store, Ngành;
- `/van-hanh/tich-hop` cho Mẹ.

Đăng ký navKey `integrations` trong `ALL_NAV_KEYS` và gắn capability. Các trang cũ (`/ket-noi`, `/hoi-thoai/kenh-tich-hop`) được chuyển hướng (redirect) về tab tương ứng.

### Cấu trúc trang

1. **Tổng quan (L0):**
   - Thẻ trạng thái: số kết nối đang hoạt động, số kết nối cần xử lý (hết hạn / lỗi), sự kiện thất bại trong 24 giờ.
   - Không ẩn lỗi.
2. **Danh mục (L1)**, nhóm theo: *Kênh bán hàng · Nhắn tin & mạng xã hội · Thanh toán · Thông báo · Vận chuyển & hoá đơn · Chuỗi & cửa hàng · API & Webhook*.
   - Mỗi thẻ có logo, mô tả một dòng và nhãn trạng thái (Đã kết nối / Kế thừa từ chuỗi / Bị khoá bởi tầng trên / Cần nâng gói / Sắp ra mắt).
3. **Luồng kết nối từng bước (L2):**
   1. Giải thích quyền sẽ cấp.
   2. Đăng nhập nhà cung cấp hoặc nhập khoá.
   3. Chọn tài khoản / gian hàng / OA.
   4. Cấu hình tối thiểu.
   5. Kiểm tra kết nối.
   6. Xong.
4. **Chi tiết kết nối (L3):** trạng thái và sức khoẻ, cấu hình, nhật ký sự kiện (lọc theo trạng thái, xử lý lại sự kiện lỗi), xoay khoá, ngắt kết nối.
5. **Quản trị tầng dưới (chỉ Mẹ / Ngành / Chuỗi):** ma trận "Cho phép / Bắt buộc kế thừa / Cấm" theo connector. Dùng lại mẫu UI `components/governance`.

### Capability mới

Cần bổ sung vào `capability-catalog.ts`, đồng thời cập nhật `02-function-catalog.md`:
- `integration.view`
- `integration.connect` (R3)
- `integration.configure`
- `integration.govern` (khoá tầng dưới)
- `integration.events.replay`

## 7. Tiêu chuẩn production / enterprise (Definition of Ready cho mỗi connector)

- [ ] Manifest đầy đủ, `configSchema` dùng zod, có contract test với mock server của nhà cung cấp.
- [ ] Credential mã hoá; có kiểm thử "không bao giờ rò secret" (log, response, lỗi).
- [ ] Webhook: có test xác thực chữ ký, chống replay và chống trùng.
- [ ] Retry có giới hạn và dead-letter; circuit breaker; timeout.
- [ ] Tenant isolation test (`test:tenant`): connection của org A không đọc / ghi được từ org B, trả 404.
- [ ] Health check và cảnh báo khi trạng thái EXPIRED / ERROR.
- [ ] Audit log cho mọi thay đổi.
- [ ] Metrics theo connector: tỉ lệ thành công, độ trễ, số lần retry. Có runbook xử lý sự cố.
- [ ] Toàn bộ chữ tiếng Việt, không mã kỹ thuật; kiểm tra ở bề rộng 390px và 1280px; có E2E UX cho luồng kết nối.
- [ ] Được gắn với gói dịch vụ trong `PLAN_FEATURES`.

## 8. Lộ trình đề xuất

| Giai đoạn | Nội dung | Kết quả |
|---|---|---|
| **0 – Vá rủi ro** | Mã hoá token trong `chat_channel_integrations`. Đổi các stub SMS / Zalo / Push sang trả `NOT_CONFIGURED`. Gộp 2 bản Telegram adapter | Đóng các lỗ hổng hiện tại |
| **1 – Nền móng Hub** | Schema, module `integration-hub`, credential vault, cổng webhook, vòng đời, health job, capability, mục sidebar ở 4 tầng với catalog lấy từ manifest | Khung chạy được, chưa thêm nhà cung cấp mới |
| **2 – Chuyển tích hợp sẵn có** | Facebook, Zalo OA, ZNS, Telegram, eSMS, SePay, token máy-với-máy, liên kết chuỗi đưa vào Hub. Redirect các trang cũ | Một nơi quản lý duy nhất |
| **3 – Governance 4 tầng** | Ma trận khoá / kế thừa, kế thừa kết nối từ chuỗi xuống cửa hàng | Chuỗi cấp sẵn cho cửa hàng |
| **4 – Kênh bán hàng** | Shopee → TikTok Shop → Lazada (catalog, sau đó đồng bộ đơn hàng, sau đó tồn kho); Meta Catalog / Google Merchant; Haravan / Sapo / KiotViet | Đầu nối thương mại thật |
| **5 – Mở rộng** | VNPay / MoMo / PayOS, vận chuyển, hoá đơn điện tử, app giao đồ ăn; webhook ra ngoài cho khách hàng doanh nghiệp | Hoàn thiện danh mục |

## 9. Quyết định cần PO duyệt

1. Thay đổi schema (mục 4.3) và kế hoạch di trú `chat_channel_integrations`.
2. SaaS Mẹ sở hữu app của nhà cung cấp (Meta, Zalo, Shopee, TikTok Shop…). Việc này cần đăng ký đối tác và có thể phát sinh chi phí.
3. Nhà cung cấp mới và API trả phí (VNPay / MoMo / PayOS, GHN / GHTK, hoá đơn điện tử, SMS brandname).
4. Biểu diễn tầng Ngành bằng `scope_id` thay vì đưa thành org trong DB.
5. Gắn nhóm tích hợp nào với gói dịch vụ nào.
6. Thứ tự ưu tiên trong giai đoạn 4 (sàn nào làm trước).
7. Các route cũ chuyển hướng về `/tich-hop`; thay đổi navKey `channels`.
