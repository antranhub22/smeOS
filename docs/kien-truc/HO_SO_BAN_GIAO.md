# Hồ sơ bàn giao smeOS

> Trạng thái `CANONICAL` · chủ sở hữu: Product Owner · cập nhật 22/10/2026.
> Điểm vào duy nhất cho đội nhận bàn giao. Tệp này chỉ trỏ đến SSOT, không chép lại nội dung.

## 1. Hệ thống gồm gì

| Thành phần | Mã nguồn | Chạy ở đâu (`render.yaml`) |
|---|---|---|
| Web + API (Next.js 16, Prisma 7) | `src/` | `smeos-web` |
| Worker ảnh, đọc ảnh, video (Python) | `workers/` | `smeos-worker-media` · `-vision` · `-video` |
| Cron nhắc mốc gia công, kiểm sức khoẻ | `src/app/api/v1/internal/*` | `smeos-cron-dispatch-sweep` (5 phút) |
| PostgreSQL 16 | `prisma/schema.prisma`, `prisma/migrations/` | `smeos-postgres` |
| Redis (giới hạn tần suất dùng chung) | `src/core/cache/redis-client.ts` | `smeos-redis` |

Tài liệu gốc:
- Kiến trúc: `docs/kien-truc/FLORAOS_SAAS_TARGET_ARCHITECTURE_V2.md`
- Trạng thái và nợ kỹ thuật: `docs/kien-truc/TRANG_THAI.md`, `docs/dac-ta/TECHNICAL_DEBT.md`
- API: `docs/dac-ta/06-api-specification.md`
- CSDL: `docs/dac-ta/07-database-specification.md`
- Quy tắc code: `CLAUDE.md`, `.agents/AGENT_RULES.md`

## 2. Vận hành

| Việc | Tài liệu |
|---|---|
| Deploy, đổi schema, migration lỗi | `docs/kien-truc/VAN_HANH_CAP_NHAT_CSDL.md` |
| Sao lưu, khôi phục, quan trắc, sự cố, xoay khoá | `docs/kien-truc/VAN_HANH_SU_CO_VA_SAO_LUU.md` |
| Dọn dữ liệu mẫu trước khi giao một tenant | `docs/kien-truc/QUY_TRINH_BAN_GIAO_SACH_TENANT.md` |

## 3. Biến môi trường

Danh sách đầy đủ có chú thích: `.env.example` (không chứa giá trị thật). Trên Render, mọi biến
bí mật khai `sync: false` và được nhập trên dashboard, **không bao giờ nằm trong repo**. Repo này
công khai: lịch sử git ai cũng đọc được.

Bắt buộc ở production, thiếu là app từ chối chạy hoặc tính năng tắt:
- `DATABASE_URL`
- `SESSION_SECRET`, `SSO_SESSION_SECRET`, `INTEGRATION_TOKEN_SECRET`
- `CRON_SECRET` — giống nhau ở web và cron
- `NEXT_PUBLIC_APP_URL`
- `REDIS_URL` — tự nối từ `smeos-redis`
- `STORAGE_*`
- `OPENAI_API_KEY` — đọc ảnh, kiểm ảnh QC/giao hàng

## 4. Kiểm soát bảo mật đang có

| Lớp | Cơ chế | Kiểm bằng |
|---|---|---|
| Cách ly tenant | `organization_id` chỉ lấy từ `requireTenantContext()`; truy cập chéo → 404 | `npm run test:tenant` (bắt buộc trong CI) |
| Phân quyền shop | Mã năng lực `R*` — `src/core/rbac/capability-catalog.ts`, `requireCapability()` | `tests/unit/architecture/route-capability-guard.test.ts` |
| Console nền tảng | Mã `N*` — `src/core/platform/platform-capability-catalog.ts` | `npm run test:platform` |
| Link công khai (gia công) | Token HMAC theo tổ chức, mã đơn, chi nhánh; hạn 14 ngày | `tests/tenant/subcontract-public-link.test.ts` |
| Cron nội bộ | `x-cron-secret`, so sánh thời gian hằng; production thiếu khoá → từ chối | `src/core/http/cron-auth.test.ts` |
| AI | Mọi lời gọi qua `callCapability` (sổ chi phí, sàn riêng tư, lọc giấy phép mô hình) | skill `ai-integration` |
| Chuỗi cung ứng | gitleaks (toàn lịch sử), `npm audit` mức critical, CodeQL, Dependabot | `.github/workflows/ci.yml`, `codeql.yml`, `.github/dependabot.yml` |

## 5. Cổng chất lượng

Bảng "Definition of done" trong `CLAUDE.md` khớp với `.github/workflows/ci.yml`:
- typecheck, ESLint ratchet, UX lint;
- unit, tenant, platform;
- đối chiếu tài liệu, template SSOT;
- migration khớp schema;
- build, E2E UX, worker pytest;
- bảo mật.

PR chỉ merge khi CI xanh.

## 6. Việc còn mở khi bàn giao (22/10/2026)

Chờ PO quyết:

| Mã | Việc | Ghi chú |
|---|---|---|
| — | Nghị định 13/2023: đồng ý, hạn lưu, xuất/xoá dữ liệu cá nhân | PO hoãn 22/10 |
| M5 | Ngày lưu dạng chuỗi; `chain_branches` nằm trong JSON settings | Đổi schema |
| M13 | Ma trận điều hướng lưu trong tệp, mất khi deploy lại | Chuyển vào CSDL |
| M11 | 12 lỗ hổng `high` ở dependency production (`xlsx` chưa có bản vá) | Đổi thư viện cần PO duyệt |
| M12 | 20 ngành ghi "hoạt động" nhưng chỉ 7 ngành có plugin | Quyết định sản phẩm |
| M2 | Tệp vượt 350 dòng | Tách dần khi sửa |
| — | Ràng buộc CHECK `orders_balance_vnd_check` chưa có ở CSDL | `VAN_HANH_CAP_NHAT_CSDL.md` mục 2 |
| — | Kiểm thử xâm nhập độc lập | Thuê bên thứ ba trước khi ký với khách |

Việc làm tay một lần trước khi đưa khách vào:
- Đổi mật khẩu 3 tài khoản seed, thu hồi phiên của chúng.
- Đặt `CRON_SECRET` (giống nhau ở web và cron) và `NEXT_PUBLIC_APP_URL`.
- Bật thông báo lỗi của Render (`VAN_HANH_SU_CO_VA_SAO_LUU.md` mục 2).
- Bật branch protection cho `main` (bắt buộc PR, CI xanh, ≥ 1 người duyệt).
- Bật secret scanning và push protection trong *Settings → Code security*.
- Cấp mã `N1`/`N2`/`N12` cho người vận hành.
- Deploy đầu tiên theo `VAN_HANH_CAP_NHAT_CSDL.md` mục 4: export CSDL trước, rồi đọc log `db-deploy`.
