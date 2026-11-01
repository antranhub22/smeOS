# 04 — Phân tích khoảng trống kiến trúc

Mỗi mục trỏ về mã phát hiện ở `08_ARCHITECTURE_RISK_REGISTER.md`. "Tài liệu" = điều được mô tả; "Mã" = điều kiểm được trong repo ở `c27f39e1`.

## 1. Thiếu hẳn (Not Found sau khi tìm)

| Hạng mục | Đã tìm ở đâu | Phát hiện |
|---|---|---|
| Môi trường staging / preview có kiểm soát | `render.yaml`, `.github/workflows`, `.env.example`, docs vận hành | ARC-005 |
| Cổng chặn deploy khi CI đỏ | `render.yaml` (`autoDeploy: true`, `branch: main`), không có deploy hook trong CI | ARC-001 |
| Chính sách sao lưu/PITR và biên bản diễn tập khôi phục | runbook §4, `VAN_HANH_SU_CO_VA_SAO_LUU.md` | ARC-005 (NV) |
| ERD (sơ đồ) | `docs/` (grep `erDiagram`, `ERD`) | ARC-027 |
| Đặc tả API máy đọc được (OpenAPI) | toàn repo (`*openapi*`, `*swagger*`) | ARC-024 |
| Tầng Ngành trong dữ liệu (tổ chức `INDUSTRY`, vai `industry_admin`) | `prisma/schema.prisma` enum `organization_type`, `system-roles.ts` | ARC-008 |
| Đầu nối thật trong Integration Hub | `integration-hub/adapters/connectors/index.ts` (chỉ `test_echo`, `test_shop`) | ARC-007 |
| Cổng thanh toán trực tuyến | grep `vnpay|momo|payos|stripe` | ARC-007 |
| Cơ chế đồng ý/hạn lưu/xoá PII khách cuối (Nghị định 13) | TRANG_THAI §5 D13, HO_SO_BAN_GIAO §6 | ARC-011 |
| `CONTEXT.md` | gốc repo | ARC-014 (thông tin — vai trò được `CLAUDE.md` + `TRANG_THAI.md` đảm nhận) |
| Công cụ metrics/tracing | `core/observability`, runbook §10 ("chưa có công cụ metrics") | ARC-023 |
| Kiểm thử tải, kiểm thử xâm nhập | runbook §7, HO_SO_BAN_GIAO §6 | ARC-032, ARC-022 |
| Hướng dẫn quản trị hệ thống, SLA, quy trình nâng cấp cho khách | `docs/handover/`, runbook §8 trống | ARC-028 |
| Khoá phân tán cho lịch nền | `background-sweep-scheduler.ts`, `lead-recovery-scheduler.ts`, `orders-sweep-scheduler.ts` | ARC-010 |

## 2. Chưa hoàn thiện (Implemented một phần)

| Hạng mục | Đã có | Còn thiếu | ID |
|---|---|---|---|
| Ma trận quản trị 4 tầng | 6 hệ thống lưu + khoá; 3 hệ thống áp vào luồng thật | Thanh toán, Phí gia công, Mẫu chỉ lưu (nợ #185) | ARC-008 |
| Thông báo đa kênh | In-app, email, Telegram; SSE | SMS, Zalo, Web Push là stub trả `NOT_CONFIGURED`; sự kiện chuỗi/nền tảng chưa nối; sự kiện ngành gửi tới vai không tồn tại | ARC-007, ARC-008 |
| Integration Hub | Khung đủ (manifest, vault, sự kiện, retry, governance) | Không đầu nối thật; kênh cũ chưa chuyển vào | ARC-007 |
| Cổng AI | `callCapability` cho TS (18 tệp) | Worker Python gọi thẳng nhà cung cấp | ARC-009 |
| Screen Contract | 47 tệp, mẫu, QA matrix | ~60 trang chưa có hợp đồng; không kiểm tự động | ARC-020 |
| i18n | Hạ tầng vi/en | 74% tệp TSX chưa dùng | ARC-021 |
| CSP | Report-Only + endpoint nhận báo cáo | Chưa chuyển sang chặn | ARC-022 |
| Quan trắc | Log JSON, request-id, Sentry tuỳ chọn | `SENTRY_DSN` không khai ở `render.yaml`; 62 `console.*`, 59 `print()` | ARC-023 |
| Gói bàn giao | Hồ sơ + runbook bản nháp | SLA, quyền truy cập, sao lưu [CẦN XÁC NHẬN] | ARC-028 |
| Gác năng lực route | Test bắt route mới | 1 route nợ #170 (`content-engine/rewrite`) chưa có mã năng lực | ARC-025 |

## 3. Triển khai sai / rủi ro thiết kế

| Phát hiện | Bằng chứng | ID |
|---|---|---|
| Mã chưa qua cổng tenant vẫn tự deploy | CI run #292: bước ratchet đỏ → `test:tenant`, `test:platform`, `npm test`, `build` SKIP; `render.yaml` autoDeploy | ARC-001 |
| Build production bỏ qua lỗi TypeScript | `next.config.ts` `typescript.ignoreBuildErrors: true` (chú thích: "Render builder typecheck fails on pending migrations") | ARC-004 |
| Console nền tảng mở theo đuôi email/cookie ở môi trường không-production | `src/modules/platform/use-cases/resolve-platform-session.ts` dòng 41–63 | ARC-003 |
| Kho tệp lùi về đĩa cục bộ khi thiếu cấu hình | `src/modules/assets/adapters/storage-provider-factory.ts`; `src/lib/env.ts` để `STORAGE_*` optional | ARC-006 |
| Migration + seed chạy trong lệnh build vào CSDL production | `render.yaml` `buildCommand` | ARC-005 |
| Danh mục Hub khai "MANAGED" cho kênh không có đầu nối trong Hub | `integration-hub/domain/connector-catalog.ts` vs `connectors/index.ts` | ARC-007 |

## 4. Trùng lặp

| Trùng | Vị trí | ID |
|---|---|---|
| Telegram Bot API | `integration-hub/adapters/connectors/telegram/telegram-bot-api.ts` và `greeting-card/adapters/staff-channels/telegram-photo-upload.ts` (+ adapter Telegram của notification) | ARC-007 |
| Kênh Zalo | `greeting-card/adapters/zalo-zns-adapter.ts`, `staff-channels/zalo-oa-*.ts`, webhook `chat/webhooks/zalo`, stub `notification/.../zalo-adapter.ts` | ARC-007 |
| SMS | `greeting-card/adapters/esms-adapter.ts`, `staff-channels/sms-staff-adapter.ts`, stub `notification/.../sms-adapter.ts` | ARC-007 |
| Động cơ trạng thái đơn | `orders/domain/order-rules.ts`, `coordinator/domain/stage-transitions.ts` + `state-mapper.ts`, `greeting-card/domain/greeting-card-rules.ts` | ARC-017 |
| Ghi sổ AI | `core/ai/infra/ai-request-repository.ts` (TS) và `workers/media_ai/providers/chung.py::ghi_ai_request` | ARC-009 |
| Vai CSKH | `crm` và `customer_service` cùng nhãn "Chăm sóc khách hàng" | ARC-016 |
| Cấu hình cron | `render.yaml` (Render cron), `vercel.json` (Vercel cron), `cron-job-entry.txt` (crontab máy dev) | ARC-026 |
| Thư mục audit | `docs/Audit/` và `docs/audit/` | ARC-015 |

## 5. Không nhất quán

| Điểm lệch | Bên A | Bên B | ID |
|---|---|---|---|
| Từ vựng vai | `SYSTEM_ROLES`: `dieu_hanh`, `dieu_phoi`, `sale`… | UI/tier: `store_admin`, `chain_admin`, `industry_admin`, `flower_network_admin`, `platform_admin` | ARC-016 |
| Trạng thái đơn | enum `order_status` (6 giá trị, có `DELIVERED`) | `business-reporting.ts` (có `PENDING`, không `DELIVERED`) | ARC-017 |
| Kiểu cột trạng thái | enum Postgres ở bảng cũ | `String` ở `chain_partnerships.status`, `notification_hard_locks.tier`, `internal_chat_messages.message_type` | ARC-019 |
| Cổng dev | `CLAUDE.md`, `AGENT_RULES` §9: 3100 | `package.json`, README: 3200 | ARC-014 |
| Số trần cứng | `src/core/rbac/README.md`: 31 | `capability-catalog.ts`: 49 | ARC-014 |
| Số mã năng lực | TRANG_THAI D-N6: 146 | catalog: 163 | ARC-014 |
| Lỗi ESLint cũ | `CLAUDE.md`: 78 | `scripts/eslint-baseline.json`: 58 | ARC-014 |
| Tệp > 350 dòng | runbook §7: 95 | đo được: 105 | ARC-013 |
| Đường dẫn tài liệu | README: `docs/kien-truc/HARVEST_MANIFEST.md` | thực tế: `docs/archive/historical/HARVEST_MANIFEST.md` | ARC-014 |
| Trạng thái hệ thống | TRANG_THAI §3/§6: repo `floraos-core`, việc P5 tháng 9, "anh Tony chạy db push" | mã thực tế: repo `smeOS`, `migrate deploy`, đã có P25, đơn hàng đa nguồn… | ARC-014 |
| Biến kho tệp | HO_SO_BAN_GIAO §3: `STORAGE_*` "bắt buộc ở production" | `env.ts`: optional | ARC-006 |
| Cổng AI | `CLAUDE.md` #5, HO_SO_BAN_GIAO §4: "Mọi lời gọi qua `callCapability`" | worker Python gọi thẳng | ARC-009 |

## 6. Nợ kỹ thuật (đã ghi nhận + mới)

- `docs/dac-ta/TECHNICAL_DEBT.md` (582 dòng) là sổ nợ chính; nợ đang ảnh hưởng kiến trúc: #170 (route thiếu mã năng lực), #172 (ESLint cũ), #185 (ma trận chưa áp), #195 (tầng Ngành), #151 (chi phí thật), #72 (ngưỡng AI tạm).
- Nợ mới do audit này nêu (chưa có trong sổ): ARC-001, 003, 004, 006, 009, 010, 015, 016, 017, 019, 020, 026.
- Mã chết/tàn dư: `chat-assistant/adapters/dify-chat-provider.ts` không được import ở đâu (`src/`, `tests/`) (ARC-026). Ngược lại, việc "dọn sau P24" mà TRANG_THAI §6 mục 0 còn ghi là chưa làm thì **đã làm** (hai tệp và tệp probe đã không còn; `media/background-removal/route.ts` giữ lại có chủ đích, luôn trả 409) — thêm một ví dụ tài liệu trạng thái lỗi thời (ARC-014).
