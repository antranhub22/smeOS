# J — Actual Screen Compliance Report

Điểm miền: **1 / INITIAL**.

> **Giới hạn bắt buộc phải đọc:** không dựng được môi trường chạy (`npm ci` bị chặn 403 khi tải `xlsx` từ `cdn.sheetjs.com`; không có DB `*_test` đã seed). **Không có ảnh chụp, không đo tràn/chồng lấn thật, không kiểm tương tác.** Báo cáo dưới đây là **đối chiếu mã nguồn** với chuẩn đã ghi. Không có kết quả test nào được bịa.

## Chọn mẫu

| Tầng | Màn | Lý do chọn |
|---|---|---|
| SaaS Mother | `/van-hanh` (`PlatformJourneyHome`), `/van-hanh/to-chuc` | Trang chủ Console + danh sách tổ chức |
| SaaS Ngành | — | **Không áp dụng**: không có tuyến riêng (A2); menu trỏ vào `/van-hanh/*` |
| ChainOS | `/dieu-phoi`, `/dieu-phoi/doi-tac` | Màn điều phối cốt lõi + quản lý đối tác |
| StoreOS | `/don-hang`, `/san-pham`, `/cong-cu` | Danh sách nghiệp vụ chính + “mẫu chuẩn” theo `OPERATING_PRINCIPLES` §6 |

## Bảng đối chiếu

Cột: Contract · Archetype khai báo · Kiểu header · `<h1>` (cỡ/màu) · Token cũ (`bg-background`, `text-foreground`…) · Cỡ chữ Tailwind gốc (`text-xs/sm/base/lg/xl`) · `<button>` thô · Trạng thái tải/rỗng/lỗi thấy trong tệp trang.

| Màn | Contract | Archetype | Header | `<h1>` | Token cũ | Cỡ gốc | `<button>` thô | Tải / Rỗng / Lỗi |
|---|---|---|---|---|---:|---:|---:|---|
| `/van-hanh` | `van-hanh.md` (30/10) | Không khai | `ChoiceGrid`/`JourneyShell` (journey kit) | Trong `ChoiceGrid` | 0 | 0 | 2 | Không thấy trong tệp |
| `/van-hanh/to-chuc` | **Không** | — | Tự dựng | `text-base font-bold text-text` (16px) | 2 | 4 | 0 | Skeleton ✓ / — / — |
| `/dieu-phoi` | **Không** | — | Tự dựng + **`UserMenu` lặp lại trong trang** (`page.tsx:10,63`) | `text-xl font-extrabold text-text` (20px, không token) | 2 | 3 | 2 | Nằm trong `ControlTowerDashboard` (983 dòng, 0 Skeleton, 0 EmptyState) |
| `/dieu-phoi/doi-tac` | **Không** | — | `PageContainer` + `PageHeader` ✓ | qua `PageHeader` | 0 | 1 | 0 | — |
| `/don-hang` | `don-hang.md` (31/10) | Có (B) | `<header>` tự dựng | `text-title font-extrabold text-foreground` (17px, token cũ) | 3 | 0 | 1 | Không thấy trong tệp trang (nằm ở component con) |
| `/san-pham` | `san-pham.md` (26/09; trang đổi 4 commit sau) | Không khai | `<header>` tự dựng | `text-title font-extrabold text-primary` (17px, màu thương hiệu) | 0 | 0 | 4 | Skeleton ✓ / EmptyState ✓ / lỗi ✓ |
| `/cong-cu` (mẫu chuẩn) | Không (có `cong-cu-*` cho trang con) | — | `ToolHero` theo §6.10 | `text-display font-extrabold text-text tracking-tight` (20px) | 0 | 0 | 1 | — |

Lệnh tái lập (mỗi tệp):
```bash
f="src/app/(app)/dieu-phoi/page.tsx"
grep -oE "<h1 className=\"[^\"]*\"" "$f"
grep -oE "\b(bg-background|text-foreground|text-muted-foreground|border-input|bg-muted)\b" "$f" | wc -l
grep -oE "\btext-(xs|sm|base|lg|xl|2xl)\b" "$f" | wc -l
```

## Bất nhất ghi nhận

| ID | Bất nhất | Bằng chứng | Chuẩn bị lệch | Mức |
|---|---|---|---|---|
| UI-J-01 | **5 kiểu tiêu đề trang** trên 6 màn: 16px, 17px (màu chữ), 17px (màu thương hiệu), 20px không token, 20px token | Bảng trên | `page-archetypes.md` §1 (một `<h1>`, header chung), 03a §5 vs `DESIGN_TOKENS.md` §3 (mâu thuẫn sẵn) | P2 |
| UI-J-02 | Header trang dựng tay ở 4/6 màn; chỉ `/dieu-phoi/doi-tac` dùng `PageHeader` | Như trên | `COMPONENT_CONTRACTS.md` §5 “Page Layout chuẩn mọi màn hình” | P2 |
| UI-J-03 | `/dieu-phoi` render lại `UserMenu` bên trong trang trong khi shell đã có menu người dùng | `src/app/(app)/dieu-phoi/page.tsx:10,63` | `page-archetypes.md` §1 “Không tạo thanh tiêu đề/điều hướng riêng cho một module nếu không có lý do ghi trong Screen Contract” — **màn này không có contract** | P2 |
| UI-J-04 | Ghi đè kích thước/màu của `Button` bằng class | `/dieu-phoi/page.tsx:58` `className="bg-primary hover:bg-primary-dark text-white text-xs gap-1.5 h-9 font-bold shadow-sm"` | `COMPONENT_CONTRACTS.md` §1 (size `sm` = 44px), K2 | P2 |
| UI-J-05 | Ẩn/hiện theo `roleKey` thay vì capability | `/san-pham/page.tsx:56-60` | 04 §5, `CLAUDE.md` NN#3 | P2 |
| UI-J-06 | Màn ChainOS cốt lõi không có trạng thái rỗng/tải chuẩn | `control-tower-dashboard.tsx` 0 `Skeleton`, 0 `EmptyState`; 983 dòng (> 350) | 03a §24–27, UX-P08, `CLAUDE.md` NN#7 | P2 (cần xác minh runtime) |
| UI-J-07 | Màn MI/điều phối dùng dày thang màu đổi tên | `sales-order-intake-modal.tsx` 71 lần, `opportunity-detail-drawer.tsx` 64, `creative-handoff-modal.tsx` 49 | R1 / token ngữ nghĩa | P1 (gộp vào UI-B-01) |

## Điểm tuân thủ tốt (có bằng chứng)

- `/san-pham`: đủ Skeleton + EmptyState + nhánh lỗi + InfoTip — gần chuẩn ST-01 nhất trong mẫu.
- `/cong-cu`: theo đúng mẫu `ToolHero`/thoáng mà `OPERATING_PRINCIPLES` §6 chỉ định; icon qua Phosphor.
- `/dieu-phoi/doi-tac`: dùng `PageContainer` + `PageHeader` + `Card` + `Input` chuẩn.
- Mọi màn dùng icon qua `@/components/ui/icons` (test `icon-library` bảo vệ).

## Việc cần để hoàn tất miền J (khi có môi trường)

1. Dựng DB `*_test` + seed, chạy `npm run dev` (cổng **3200**, không phải 3100 như tài liệu agent ghi).
2. `UX_AUDIT_BASE_URL=http://localhost:3200 npm run ux:audit -- <tuyến>` cho 7 màn trên ở 390/1280; bổ sung tay 360/430/768/1024/1440.
3. Ghi kết quả vào bảng trên (cột “Đo thực tế”), đặc biệt UI-F-01/F-03/J-06 đang ở mức “cần xác nhận”.
