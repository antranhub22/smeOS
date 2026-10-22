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
| Chuỗi cung ứng | gitleaks (toàn lịch sử), `npm audit` mức high (production: 0 lỗi), CodeQL, Dependabot. `xlsx` cài từ cdn.sheetjs.com — tự kiểm bản mới ở https://cdn.sheetjs.com | `.github/workflows/ci.yml`, `codeql.yml`, `.github/dependabot.yml` |

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
| M5 (phần còn lại) | `staff_notifications.recipient_info` chưa có hạn lưu (`chain_branches` đã tách bảng 22/10) | Hạn lưu đi cùng Nghị định 13 |
| M2 | Tệp vượt 350 dòng | Tách dần khi sửa |
| — | Ràng buộc CHECK `orders_balance_vnd_check` chưa có ở CSDL | `VAN_HANH_CAP_NHAT_CSDL.md` mục 2 |
| — | Kiểm thử xâm nhập độc lập | Thuê bên thứ ba trước khi ký với khách |

Việc làm tay một lần trước khi đưa khách vào:
- Dọn tài khoản (PO 22/10/2026): chỉ giữ `tuans2@dev.com` làm superadmin nền tảng (đủ mã N), xoá hẳn mọi tài khoản khác. Production chưa có khách thật. Tạo export CSDL trước, rồi trong Render Shell của `smeos-web` chạy:
  1. `npm run don-tai-khoan -- --giu=tuans2@dev.com` — chỉ xem danh sách sẽ xoá.
  2. `MAT_KHAU_MOI='<mật khẩu mới ≥ 12 ký tự>' npm run don-tai-khoan -- --giu=tuans2@dev.com --xac-nhan` — xoá thật, đổi mật khẩu, cấp mã.

  Không hoàn tác được. Tổ chức hết thành viên được liệt kê nhưng không bị xoá.
- Tài khoản test chức năng (PO 22/10/2026), tạo SAU bước dọn tài khoản. Tổ chức riêng "smeOS QA": `test01@smeos.com` vai Điều hành, `test02@smeos.com` vai Sale, không có mã N.
  - Lệnh: `MAT_KHAU_TEST01='…' MAT_KHAU_TEST02='…' npm run tao-tai-khoan-test -- --xac-nhan`. Bỏ `--xac-nhan` thì chỉ kiểm tra.
  - Đổi vai `test02`: thêm `--vai=dieu_phoi`.
  - Đừng chạy lại `don-tai-khoan` sau bước này: lệnh đó xoá cả tài khoản test.
- Đặt `CRON_SECRET` (giống nhau ở web và cron) và `NEXT_PUBLIC_APP_URL`.
- Bật thông báo lỗi của Render (`VAN_HANH_SU_CO_VA_SAO_LUU.md` mục 2).
- Bật branch protection cho `main` (bắt buộc PR, CI xanh, ≥ 1 người duyệt).
- Bật secret scanning và push protection trong *Settings → Code security*.
- Duyệt đăng ký (PO 22/10/2026): mọi tài khoản tự đăng ký hoặc dùng thử chờ `tuans2@dev.com` duyệt ở `/van-hanh/dang-ky` (mã `N13`). Nếu đã chạy `don-tai-khoan` TRƯỚC bản có `N13`, cấp thêm: `npm run gan-van-hanh-nen-tang -- --email=tuans2@dev.com --capabilities=N13`. Duyệt dùng thử hiện mật khẩu tạm một lần để gửi cho khách.
- Người vận hành nền tảng: chỉ `tuans2@dev.com` (đủ mã N, cấp bằng lệnh dọn tài khoản ở trên). Thêm người sau này: `npm run gan-van-hanh-nen-tang -- --email=… --capabilities=…`.
- Deploy đầu tiên theo `VAN_HANH_CAP_NHAT_CSDL.md` mục 4: export CSDL trước, rồi đọc log `db-deploy`.
