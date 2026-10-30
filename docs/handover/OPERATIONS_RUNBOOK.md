# Sổ tay vận hành smeOS (bàn giao)

Bản nháp bàn giao 28/10/2026 — soạn từ mã nguồn (`render.yaml`, `package.json`, `.env.example`, `CLAUDE.md`) và kết quả audit (`docs/audit/`). Mục đánh dấu **[CẦN XÁC NHẬN]** chưa có bằng chứng trong repo; chủ sản phẩm điền trước khi giao cho khách.

## 1. Thành phần hệ thống (Render, vùng Singapore)

| Dịch vụ | Loại | Vai trò | Lệnh chạy |
|---|---|---|---|
| `smeos-web` | web (Node 22, Next.js 16) | Ứng dụng + API `/api/v1/*` | build: `npm ci --include=dev && npx prisma generate && npm run db:deploy && npm run db:seed && npm run build`; start: `npm run start` |
| `smeos-worker-media` | worker (Python) | Xử lý ảnh/biến thể sản phẩm | `python -m media_ai.jobs.worker` |
| `smeos-worker-video` | worker (Python) | Dựng video | `python -m media_ai.video.video_worker` |
| `smeos-worker-vision` | worker (Python) | Phân tích ảnh sản phẩm | xem `render.yaml` |
| `smeos-cron-dispatch-sweep` | cron, mỗi 5 phút | Nhắc việc điều phối chuỗi + kiểm sức khoẻ | gọi `POST /api/v1/internal/chain-dispatch-sweep` rồi `GET /api/v1/internal/health` (header `x-cron-secret`) |
| `smeos-postgres` | PostgreSQL 16 (`basic-256mb`) | Dữ liệu chính, mọi bảng tenant có `organization_id` | — |
| `smeos-redis` | Key Value 256 MB | Bộ đếm giới hạn tần suất dùng chung | chỉ mạng nội bộ Render |

Kiểm tra sức khoẻ: Render gọi `GET /api/health` (tiến trình + CSDL). `GET /api/health/ready` thêm điều kiện Redis trên production — dùng khi chạy nhiều instance. Cron kiểm `GET /api/v1/internal/health` mỗi 5 phút (CSDL, Redis, job tồn đọng, worker còn sống); không khoẻ → 503 → lượt cron thất bại → Render báo lỗi.

## 2. Biến môi trường

Danh sách đầy đủ và giải thích: `.env.example`; giá trị thật chỉ nằm trong Render (đều `sync: false`, không có trong repo).

| Nhóm | Biến | Thiếu thì sao |
|---|---|---|
| Bắt buộc khởi động | `DATABASE_URL`, `SESSION_SECRET`, `INTEGRATION_TOKEN_SECRET`, `SSO_SESSION_SECRET` | ứng dụng dừng ngay lúc khởi động (`src/lib/env.ts`) |
| Cron | `CRON_SECRET` | endpoint nội bộ đóng hẳn trên production |
| AI | `OPENAI_API_KEY`, `ANTHROPIC_API_KEY`, `GEMINI_API_KEY`… | cổng AI báo `HET_DUONG_DU_PHONG` khi không còn nhà cung cấp nào dùng được |
| Lưu trữ | `STORAGE_ENDPOINT`, `STORAGE_BUCKET`, `STORAGE_ACCESS_KEY`, `STORAGE_SECRET_KEY`, `STORAGE_REGION` | không tải/xem được ảnh |
| Chat Facebook | `FB_APP_SECRET`, `FB_WEBHOOK_VERIFY_TOKEN` | **webhook từ chối mọi sự kiện (401/403)** — cố ý, xem §5 |
| Zalo OA nền tảng | `ZALO_OA_APP_ID`, `ZALO_OA_APP_SECRET`, `ZALO_OA_REFRESH_TOKEN`, `ZALO_OA_WEBHOOK_SECRET` | không mời/nhắc chi nhánh qua Zalo |
| Theo dõi lỗi | `SENTRY_DSN`, `SENTRY_ENVIRONMENT` — đặt ở **cả** `smeos-web` và 3 worker | không gửi lỗi lên Sentry, chỉ còn log JSON |
| Dữ liệu mẫu | `SEED_DEV_DATA` = `"false"` trên production | để `"true"` sẽ nạp tài khoản demo có mật khẩu cố định — **không bật trên production** |

Zalo OA của **từng tiệm** (chat bán hàng) không dùng biến môi trường: tiệm nhập OA ID, App ID, Secret Key, Access Token trong *Hội thoại → Kênh tích hợp*.

## 3. Triển khai bản mới

1. Mở PR vào `main`; CI (`.github/workflows/ci.yml`) phải xanh: typecheck, lint ratchet, UX lint, unit, tenant, platform, build, E2E, worker pytest, gitleaks, `npm audit` (high).
2. Merge → Render tự build `smeos-web`. Bước build chạy `npm run db:deploy` (`prisma migrate deploy`) **trước** `build`; migration lỗi → build dừng, bản cũ vẫn chạy.
3. Sau khi deploy: kiểm `/api/health`, đăng nhập một tài khoản Điều hành, mở trang chủ và một đơn hàng.

Migration chỉ đi tiến. Migration mới phải idempotent hoặc an toàn khi chạy lại (mẫu: `prisma/migrations/20261028000000_notification_org_index_and_names`).

## 4. Quay lui và khôi phục

- Lỗi mã (không đổi dữ liệu): *Render → smeos-web → Deploys → Rollback* về bản trước.
- Lỗi do migration: không có lệnh "down". Quay lui = khôi phục CSDL từ bản sao lưu rồi rollback mã. **[CẦN XÁC NHẬN]** gói `basic-256mb` có sao lưu tự động/PITR bao lâu; ai có quyền khôi phục; đã thử khôi phục lần nào chưa.
- Dữ liệu từng tổ chức: SaaS Mother tải bản ZIP (CSV + ảnh) ở *Vận hành → Trung tâm dữ liệu* (năng lực `N1`).

## 5. Xử lý sự cố thường gặp

| Triệu chứng | Nguyên nhân hay gặp | Cách xử lý |
|---|---|---|
| Tin Messenger không về, log 401 ở `/api/v1/chat/webhooks/facebook` | thiếu/sai `FB_APP_SECRET` | đặt App Secret của Facebook App trong Render, redeploy |
| Đăng ký webhook Facebook báo lỗi verify | thiếu `FB_WEBHOOK_VERIFY_TOKEN` hoặc khác giá trị nhập ở Facebook Developers | đặt cùng một giá trị ở hai nơi |
| Tin Zalo của một tiệm không về, 401 ở `/api/v1/chat/webhooks/zalo` | tiệm chưa nhập App ID / Secret Key, hoặc nhập sai | tiệm nhập lại trong *Kênh tích hợp* |
| Nút AI báo lỗi, log `HET_DUONG_DU_PHONG` | hết hạn mức hoặc sai khoá của mọi nhà cung cấp AI | kiểm khoá + hạn mức nhà cung cấp |
| Nhắc việc điều phối không chạy | cron lỗi hoặc `CRON_SECRET` lệch giữa cron và web | xem log `smeos-cron-dispatch-sweep` |
| `/internal/health` báo `worker_offline:<tên>` | worker `smeos-worker-<tên>` dừng hoặc mất kết nối CSDL (worker đặt `application_name` `smeos-worker:<tên>`, đếm qua `pg_stat_activity`) | xem log worker trên Render, khởi động lại; job đang chờ sẽ được nhận lại, job treo > 15 phút tự `FAILED` |
| Đối tác chuỗi mới không đăng nhập được | Điều hành chưa chuyển mật khẩu ban đầu (chỉ hiện một lần khi tạo) | tạo lại hoặc dùng luồng đặt lại mật khẩu |

## 6. Bảo mật đã có (bằng chứng: `docs/audit/04`, `07`)

Cách ly tenant (`organization_id` lấy từ phiên, tổ chức khác → 404; 113 bộ thử cách ly chạy trên Postgres thật); phân quyền theo mã năng lực, route mới bắt buộc khai báo; mật khẩu bcrypt; webhook ký số (Facebook, Zalo, cron); giới hạn tần suất đăng nhập/đăng ký; quét bí mật toàn lịch sử (gitleaks) và `npm audit` trong CI.

## 7. Giới hạn đã biết khi bàn giao

- Ma trận Ưu đãi / Cam kết / Chính sách áp vào trang khách, báo giá, đặt đơn; ma trận Thanh toán / Phí gia công / Mẫu mới lưu và khoá cấp dưới, chưa đổi cách tính tiền (nợ #185).
- Thông báo tự gửi cho 6 sự kiện đơn hàng; sự kiện chuỗi/nền tảng chưa nối (nợ #185).
- Mở khoá công cụ chi nhánh đã chặn ở máy chủ (403) và ở trang.
- 95 tệp mã > 350 dòng (nợ kỹ thuật có từ trước, không ảnh hưởng chức năng).
- Ảnh mẫu kiểm thử giao diện `/vai-tro` cần chụp lại trên CI.
- Chưa làm: kiểm tải (load test), diễn tập khôi phục CSDL.

## 8. Cam kết hỗ trợ **[CẦN XÁC NHẬN — điền theo hợp đồng]**

| Mục | Giá trị |
|---|---|
| Thời gian hỗ trợ | |
| Mức độ sự cố và thời gian phản hồi (P1/P2/P3) | |
| Kênh báo sự cố | |
| Người nhận cảnh báo Render / CI | |
| Bàn giao quyền truy cập (Render, GitHub, nhà cung cấp AI, lưu trữ, Facebook App, Zalo OA) | |

## 9. Xuất mã nguồn bàn giao

Tệp dành riêng cho quy trình phát triển (`CLAUDE.md`, `.claude/`, `.agents/`, `AGENTS.md`) được đánh dấu `export-ignore` trong `.gitattributes`. Bản giao khách tạo bằng:

```bash
git archive --format=zip -o smeos-handover.zip main
```

Trên máy dev có `.agents/` riêng: chạy `npm run dev:link-skills` một lần để tạo lại `.claude/skills`.

## 10. SLO v1 (30/10/2026 — ROADMAP E1.7)

Đo trên **28 ngày trượt**. Ngân sách lỗi = 100% − mục tiêu; tiêu quá nửa ngân sách trong 7 ngày → dừng tính năng mới, ưu tiên sửa độ tin cậy. Mục tiêu v1 đặt theo hạ tầng hiện tại (1 instance web gói `starter`) và được xem lại sau 4 tuần có số thật. PO duyệt mục tiêu 30/10/2026.

| # | Hành trình | SLI (tốt / tổng) | Mục tiêu | Nguồn đo |
|---|---|---|---|---|
| S1 | Tạo đơn hàng | `POST /api/v1/orders` không lỗi máy chủ | 99,5% | log `http.internal_error` với `path` = `/api/v1/orders`, `method` = `POST` (lỗi) · số dòng `orders` tạo trong kỳ (thành công) |
| S2 | Trang khách `/c/[slug]` | lượt mở trang không lỗi máy chủ | 99,5% | log `http.unhandled_error` với `routePath` = `/c/[slug]`; tổng lượt từ số liệu HTTP của Render. **[CẦN XÁC NHẬN]** công cụ kiểm từ bên ngoài (uptime) — thêm nhà cung cấp, PO duyệt |
| S3 | Phân tích ảnh sản phẩm | job `vision.analyze` kết thúc `COMPLETED` (bỏ `CANCELLED`) | 97% | bảng `generation_jobs` (truy vấn dưới) |
| S3b | Độ trễ phân tích ảnh | job hoàn tất trong 2 phút kể từ khi tạo | 95% | như S3 |
| S4 | Gửi thông báo | người nhận gửi được / người nhận | 99% | log `notification.dispatched` (`recipients`, `sent`, `failed`, theo `eventKey`) |

Lỗi do người dùng (4xx: sai dữ liệu, thiếu quyền, hết hạn mức) **không** tính vào SLI.

```sql
-- S3 / S3b — chạy trên bản sao đọc hoặc lúc vắng tải
SELECT count(*) FILTER (WHERE status = 'COMPLETED')::float
         / NULLIF(count(*) FILTER (WHERE status IN ('COMPLETED','FAILED')), 0) AS ti_le_thanh_cong,
       count(*) FILTER (WHERE status = 'COMPLETED' AND completed_at - created_at <= interval '2 minutes')::float
         / NULLIF(count(*) FILTER (WHERE status = 'COMPLETED'), 0) AS ti_le_duoi_2_phut
  FROM generation_jobs
 WHERE feature = 'vision.analyze' AND created_at >= now() - interval '28 days';
```

**Cảnh báo hiện có** (theo dõi lỗi: Sentry khi có `SENTRY_DSN`; chưa có công cụ metrics):

| Tín hiệu | Kích hoạt | Xử lý |
|---|---|---|
| Lượt cron `smeos-cron-dispatch-sweep` thất bại | `/internal/health` 503: CSDL, Redis, job tồn đọng > 15 phút, `worker_offline:*` | §5 và `docs/kien-truc/VAN_HANH_SU_CO_VA_SAO_LUU.md` §3 |
| Render health check đỏ | `/api/health` 503 | Render tự khởi động lại; kéo dài → CSDL |
| Sentry: lỗi mới / tăng đột biến | lỗi 500 trong route (`http.internal_error`), lỗi không ai bắt (`http.unhandled_error`), `log.error`/`log.exception` ở worker; tag `requestId`, `jobId`, `path` | mở theo `requestId` → §11. Cài một lần: tạo dự án Sentry, bật cảnh báo "issue mới" gửi email người trực |
| Xem tay hằng tuần | truy vấn S3; đếm `http.internal_error`, `notification.dispatched` có `failed > 0` trong log Render | ghi số vào bảng theo dõi SLO, so ngân sách lỗi |

## 11. Truy vết một sự cố bằng mã yêu cầu

Mọi phản hồi web có header `x-request-id` (sinh ở `src/proxy.ts`, giữ mã hợp lệ do Render gửi). Mọi dòng log trong cùng request mang `requestId`; job tạo trong request lưu `generation_jobs.request_id`; worker ghi `job.claimed` và mọi dòng log của job đó với cùng `requestId` (`workers/shared/log_json.py`).

1. Lấy mã: người dùng/hỗ trợ đọc `x-request-id` trong tab Network của trình duyệt, hoặc từ dòng log lỗi (`requestId`).
2. Log web: lọc log `smeos-web` theo mã đó → thấy `http.internal_error`/sự kiện nghiệp vụ, `jobId` nếu có.
3. Job: `SELECT id, feature, status, error FROM generation_jobs WHERE request_id = '<mã>';`
4. Log worker: lọc log `smeos-worker-*` theo cùng mã → `job.claimed` rồi các dòng xử lý.

Không dán log có dữ liệu khách vào ticket; log đã lọc khoá nhạy cảm nhưng `message` của worker có thể chứa mô tả sản phẩm.

