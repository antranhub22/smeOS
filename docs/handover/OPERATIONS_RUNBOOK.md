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

Kiểm tra sức khoẻ: Render gọi `GET /api/health`. Cron kiểm `GET /api/v1/internal/health` mỗi 5 phút; không khoẻ → 503 → lượt cron thất bại → Render báo lỗi.

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
| Đối tác chuỗi mới không đăng nhập được | Điều hành chưa chuyển mật khẩu ban đầu (chỉ hiện một lần khi tạo) | tạo lại hoặc dùng luồng đặt lại mật khẩu |

## 6. Bảo mật đã có (bằng chứng: `docs/audit/04`, `07`)

Cách ly tenant (`organization_id` lấy từ phiên, tổ chức khác → 404; 113 bộ thử cách ly chạy trên Postgres thật); phân quyền theo mã năng lực, route mới bắt buộc khai báo; mật khẩu bcrypt; webhook ký số (Facebook, Zalo, cron); giới hạn tần suất đăng nhập/đăng ký; quét bí mật toàn lịch sử (gitleaks) và `npm audit` trong CI.

## 7. Giới hạn đã biết khi bàn giao

- Ma trận chính sách (governance) đã lưu và áp khoá theo tầng (Mẹ → Chuỗi → Cửa hàng), nhưng **chưa** được luồng giá/thanh toán/đơn đọc khi tính toán (nợ #185).
- Ma trận thông báo tự gửi cho 3 sự kiện (đơn mới, đơn huỷ, giao việc chế tác); các sự kiện khác chưa nối (nợ #185).
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
