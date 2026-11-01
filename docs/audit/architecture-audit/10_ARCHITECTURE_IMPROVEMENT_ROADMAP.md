# 10 — Lộ trình cải tiến kiến trúc

> Đề xuất trình tự; **không** tự động triển khai. Mục có nhãn **[PO]** cần PO duyệt trước theo `CLAUDE.md` (schema, CI/`render.yaml`, tenancy/RBAC, nhà cung cấp, UX khoá).

## Giai đoạn 0 — Chặn rủi ro ngay (1–3 ngày)

| # | Hành động | ID | Phụ thuộc | Tiêu chí nghiệm thu | Cổng kiểm |
|---|---|---|---|---|---|
| 0.1 | Sửa ratchet thuật ngữ ngành để `main` xanh | ARC-001 | — | Run CI trên `main` xanh cả 4 job; `test:tenant`, `test:platform` thực sự chạy | CI `web` |
| 0.2 | **[PO]** Chặn deploy khi CI đỏ: tắt `autoDeploy` hoặc deploy hook cuối CI; ruleset `main` bắt buộc `web`, `worker`, `e2e-ux`, `security`, chặn force-push | ARC-001 | 0.1 | Thử một PR đỏ: không merge được, Render không deploy | Cấu hình GitHub/Render (chụp màn hình lưu hồ sơ) |
| 0.3 | Xoay mật khẩu tài khoản seed + mật khẩu CSDL; rà nhật ký đăng nhập | ARC-002 | — | Văn bản xác nhận của PO; đăng nhập bằng mật khẩu seed thất bại | Thử tay |
| 0.4 | **[PO]** Gỡ cửa hậu `@dev.com`/cookie ở `requirePlatformContext` (hoặc cờ tường minh mặc định tắt) | ARC-003 | 0.1 | Test platform: user `@dev.com` không phải operator → 403; cookie `smeos_dev_role` không cấp mã N | `npm run test:platform` |
| 0.5 | Fail-fast khi thiếu `STORAGE_*` ở production | ARC-006 | — | Khởi động production thiếu biến → lỗi rõ; `/api/health/ready` báo | unit test `env` |

## Giai đoạn 1 — Nền production (1–3 tuần)

| # | Hành động | ID | Phụ thuộc | Tiêu chí nghiệm thu | Cổng |
|---|---|---|---|---|---|
| 1.1 | Bỏ `ignoreBuildErrors` | ARC-004 | 0.2 | `npm run build` xanh không cờ | CI `build` |
| 1.2 | **[PO]** Môi trường staging (dịch vụ + DB riêng); tách `db:deploy` ra pre-deploy; không chạy `db:seed` mặc định trên production | ARC-005 | 0.2 | Mỗi PR merge deploy staging trước; production deploy bằng thao tác có kiểm soát | Smoke test staging |
| 1.3 | Xác minh sao lưu/PITR; diễn tập khôi phục | ARC-005 | 1.2 | Biên bản khôi phục với RPO/RTO đo được; điền runbook §4 | Biên bản |
| 1.4 | Khai `SENTRY_DSN` ở web + 3 worker; cảnh báo lỗi | ARC-023 | — | Lỗi thử xuất hiện trong Sentry có `requestId` | Thử tay |
| 1.5 | Tài khoản vận hành thứ hai, tách mã N, MFA cho console | ARC-012 | 0.3 | 2 operator, mã tài chính tách riêng | `test:platform` |
| 1.6 | Quyết định triển khai worker nghiên cứu thị trường hoặc ẩn tính năng | ARC-030 | — | `render.yaml` có dịch vụ, hoặc UI ghi "chưa vận hành" | E2E UX |
| 1.7 | Khoá phân tán cho 3 lịch nền (hoặc chuyển sang cron) | ARC-010 | — | Chạy 2 instance cục bộ: mỗi lượt quét chạy đúng một lần | tenant test mới |

## Giai đoạn 2 — Nhất quán kiến trúc (3–6 tuần)

| # | Hành động | ID | Phụ thuộc | Tiêu chí | Cổng |
|---|---|---|---|---|---|
| 2.1 | Integration Hub: chuyển Telegram, Zalo OA/ZNS, eSMS, Messenger, SePay thành đầu nối Hub; Notification dùng Hub; danh mục ghi đúng trạng thái | ARC-007 | 0.1; Thẻ chào chỉ được nối qua adapter mỏng vì đóng băng | Mỗi kênh còn đúng 1 nơi gọi API nhà cung cấp (test kiến trúc grep host) | `npm test`, `test:tenant` (`integration-hub`) |
| 2.2 | Chính sách AI chung cho worker Python | ARC-009 | — | Worker từ chối gọi mô hình không qua kiểm giấy phép/sàn riêng tư; test pytest | `pytest` |
| 2.3 | Máy trạng thái đơn SSOT; sửa `business-reporting.ts` | ARC-017 | — | Một bảng chuyển được tham chiếu bởi orders/coordinator; test bao mọi cặp | `npm test` |
| 2.4 | **[PO]** Quyết định tầng Ngành (plugin-only hoặc dữ liệu); thống nhất từ vựng vai UX | ARC-008, ARC-016 | — | Không còn khoá vai trong UI ngoài bảng ánh xạ; sự kiện thông báo không gửi tới vai không tồn tại | `npm test`, `lint:ux` |
| 2.5 | Áp 3 ma trận còn lại (Thanh toán, Phí gia công, Mẫu) hoặc giữ ghi chú phạm vi | ARC-008 | 2.4 | Test luồng tiền dùng quyết định ma trận | `test:tenant` `governance-matrix` |
| 2.6 | Gác mã năng lực cho `content-engine/rewrite` | ARC-025 | **[PO]** chốt mã | Mục rời khỏi `NO_CAPABILITY_GUARD` | route guard test |
| 2.7 | Kiểu domain riêng; cấm `import type` từ `infra/` trong domain/components | ARC-018 | — | `check:layers` đỏ khi vi phạm | `check:layers` |
| 2.8 | **[PO]** Lược đồ: enum cho cột trạng thái mới, ràng buộc CHECK số dư; DB test dựng bằng migration | ARC-019 | 1.2 | Migration mới + `migrate diff` sạch | CI |

## Giai đoạn 3 — Thương mại & bàn giao (4–8 tuần, song song GĐ2)

| # | Hành động | ID | Tiêu chí | Cổng |
|---|---|---|---|---|
| 3.1 | **[PO]** Nghị định 13: đồng ý, hạn lưu, xoá theo chủ thể | ARC-011 | Luồng xoá/xuất dữ liệu khách có test tenant | `test:tenant` |
| 3.2 | **[PO]** Cổng thanh toán (nếu sản phẩm cần) như một đầu nối Hub | ARC-007 | Thanh toán thử end-to-end trên staging | E2E |
| 3.3 | Tách `docs/internal` (export-ignore) và `docs/client`; gộp `docs/Audit`↔`docs/audit` | ARC-015 | `handover:check` 0 cảnh báo | `handover:check` |
| 3.4 | Gói bàn giao: SLA, hướng dẫn quản trị console, hướng dẫn người dùng theo vai, quy trình nâng cấp, danh mục quyền truy cập | ARC-028 | Runbook không còn [CẦN XÁC NHẬN] | Review PO |
| 3.5 | ERD theo miền; OpenAPI cho `/api/v1/integration/*` | ARC-024, ARC-027 | Tệp sinh tự động, kiểm trong `check:docs` | `check:docs` |
| 3.6 | Cập nhật TRANG_THAI §3/§6, README, CLAUDE (cổng, số liệu), AGENT_RULES §12; thêm kiểm tự động cho các số liệu này | ARC-014 | `check:docs` bắt lệch | `check:docs` |
| 3.7 | CSP chuyển sang chặn; kiểm Origin cho route ghi | ARC-022 | Không lỗi CSP trong 2 tuần report-only; E2E xanh | E2E |
| 3.8 | Pentest độc lập | — | Báo cáo, không còn lỗi Cao chưa xử lý | Báo cáo |
| 3.9 | Kiểm tải theo SLO S1–S4 | ARC-032 | Số đo p95, giới hạn instance | Báo cáo |

## Giai đoạn 4 — Enterprise & tối ưu (liên tục)

| # | Hành động | ID |
|---|---|---|
| 4.1 | Ratchet số dòng tệp; tách 10 tệp lớn nhất khi chạm vào | ARC-013 |
| 4.2 | Test buộc Screen Contract cho mọi trang | ARC-020 |
| 4.3 | Ratchet chuỗi hardcode, mở rộng i18n | ARC-021 |
| 4.4 | Lộ trình tách Thẻ chào sau đóng băng (kênh → Hub, giá/thanh toán → orders/promotions) | ARC-029 |
| 4.5 | SSE qua pub/sub; nhiều instance web | ARC-010 |
| 4.6 | Cân nhắc RLS Postgres làm lớp phòng thủ thứ hai cho tenancy | — |
| 4.7 | Dọn tàn dư (`vercel.json`, `cron-job-entry.txt`, `dify-chat-provider.ts`) | ARC-026 |
| 4.8 | Thay `xlsx` CDN | ARC-031 |

## Thứ tự phụ thuộc chính

```
0.1 ─► 0.2 ─► 1.1 ─► 1.2 ─► 1.3
 │             └──► 2.8
 ├─► 0.4
 └─► 2.1 ─► 3.2
2.4 ─► 2.5
0.3 ─► 1.5
3.6, 3.3 ─► 3.4 (bàn giao)
```

## Điều kiện "sẵn sàng" đề xuất

| Mốc | Phải xong |
|---|---|
| Production an toàn | Giai đoạn 0 + 1.1–1.4 |
| Thương mại (khách trả tiền đầu tiên) | + 1.5–1.7, 2.1, 2.2, 3.1, 3.7, 3.8 |
| Bàn giao khách | + 3.3–3.6 |
| Enterprise | + 2.3–2.8, 3.9, Giai đoạn 4 (4.5, 4.6) |
