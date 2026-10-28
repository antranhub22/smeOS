# DESIGN TOKENS — DANH MỤC BIẾN THIẾT KẾ TOÀN DIỆN (SMEOS)

> Tài liệu kỹ thuật chuẩn hóa Design Tokens trong khuôn khổ **Phase 2: UI Foundation Architecture**.  
> Được khai báo và kích hoạt tại: `src/app/globals.css` và `src/lib/ui-system/tokens.ts`.

---

## 1. SEMANTIC COLOR TOKENS (MÀU NGỮ NGHĨA)

Tất cả component tuyệt đối cấm dùng màu Tailwind thô (`bg-red-500`, `text-zinc-900`). Bắt buộc dùng các token ngữ nghĩa dưới đây:

| Token Name | Biến CSS (`globals.css`) | Mộc Lan (Default) | Modern Slate | Pure Swiss | Mục đích sử dụng |
|---|---|---|---|---|---|
| `bg-primary` | `--color-primary` | `#7A2E42` (Đỏ mận) | `#2563EB` (Xanh) | `#18181B` (Đen) | Nút chính, chỉ báo active, điểm nhấn thương hiệu |
| `bg-primary-dark`| `--color-primary-dark` | `#57202F` | `#1D4ED8` | `#09090B` | Hover trạng thái nút chính |
| `bg-primary-muted`| `--color-primary-muted`| `#F5E6EA` | `#EFF6FF` | `#F4F4F5` | Nền nhạt badge, icon background thương hiệu |
| `border-primary-border`| `--color-primary-border`| `#E0B4C0` | `#BFDBFE` | `#E4E4E7` | Viền khu vực thương hiệu |
| `bg-bg` | `--color-bg` | `#FBF6F2` (Kem ngà) | `#F8FAFC` (Xám xanh)| `#FAFAFA` (Xám trắng)| Nền toàn bộ trang web (Body background) |
| `bg-surface` | `--color-surface` | `#FFFFFF` | `#FFFFFF` | `#FFFFFF` | Nền Card, Panel, Modal, Drawer, Table |
| `bg-surface-alt`| `--color-surface-alt` | `#F5ECE4` | `#F1F5F9` | `#F4F4F5` | Nền phụ, hover row, phân khu nội dung |
| `border-border` | `--color-border` | `#E7DCD0` | `#E2E8F0` | `#E4E4E7` | Viền card, viền input, đường phân cách ngang dọc |
| `text-text` | `--color-text` | `#2A1E22` (Than ấm) | `#0F172A` (Đen slate)| `#09090B` (Đen tuyền)| Tiêu đề, nhãn, văn bản chính (Contrast ≥ 9:1) |
| `text-text-muted`| `--color-text-muted` | `#746364` | `#64748B` | `#71717A` | Văn bản phụ, chú thích, placeholder (Contrast ≥ 4.5:1) |
| `bg-selected` | `--color-selected` | `#F5ECE4` | `#EFF6FF` | `#F4F4F5` | Hàng trong bảng hoặc mục sidebar đang được chọn |
| `text-selected-text`| `--color-selected-text`| `#7A2E42` | `#2563EB` | `#18181B` | Màu chữ của mục đang chọn |
| `text-danger` / `bg-danger-bg` | `--color-danger` / `*-bg` | `#C4463D` / `#FBEBE9` | `#DC2626` / `#FEE2E2` | `#B91C1C` / `#FEF2F2` | Lỗi, nút xóa nguy hiểm, hủy đơn hàng |
| `text-success` / `bg-success-bg`| `--color-success` / `*-bg` | `#52643F` / `#EAF0E6` | `#059669` / `#ECFDF5` | `#047857` / `#ECFDF5` | Đã thanh toán, hoàn thành đơn, hợp lệ |
| `text-warning` / `bg-warning-bg`| `--color-warning` / `*-bg` | `#C97A2E` / `#FBF1E4` | `#D97706` / `#FEF3C7` | `#B45309` / `#FFFBEB` | Chờ cọc, cảnh báo tồn kho, cần chú ý |
| `text-info` / `bg-info-bg` | `--color-info` / `*-bg` | `#1D4ED8` / `#EFF6FF` | `#0284C7` / `#F0F9FF` | `#1D4ED8` / `#EFF6FF` | Thông tin hướng dẫn, gợi ý Copilot |

---

## 2. LEGACY COMPATIBILITY TOKENS (TỰ ĐỘNG ÁNH XẠ SHADCN)

Để bảo vệ 203 file cũ không bị lỗi hiển thị khi chưa kịp migrate:

```css
--color-background: var(--color-bg);
--color-foreground: var(--color-text);
--color-input: var(--color-border);
--color-muted-foreground: var(--color-text-muted);
--color-card: var(--color-surface);
--color-card-foreground: var(--color-text);
--color-popover: var(--color-surface);
--color-popover-foreground: var(--color-text);
--color-destructive: var(--color-danger);
--color-ring: var(--color-primary);
```

---

## 3. TYPOGRAPHY SCALE (THANG CỠ CHỮ CHUẨN)

| Token Class | Kích thước Font | Line Height | Ứng dụng chuẩn |
|---|---|---|---|
| `text-caption` | 11px | 1.35 | Badge nhỏ, chú thích biểu đồ, timestamp, phím tắt |
| `text-meta` | 12px | 1.40 | Nhãn phụ, breadcrumbs, placeholder, table header |
| `text-body-sm` | 13px | 1.50 | Nội dung bảng, mô tả card, form helper text |
| `text-body` | 13.5px | 1.50 | Văn bản chính thông thường, input text |
| `text-title-sm` | 14.5px | 1.40 | Tiêu đề card, nhóm nút bấm, tab item |
| `text-title` | 17px | 1.30 | Tiêu đề section, tiêu đề dialog modal |
| `text-display` | 20px | 1.25 | Tiêu đề trang chính (Page Title) |
| `text-display-lg` | 22px | 1.20 | Số liệu KPI lớn, tổng doanh thu |
| `text-display-xl` | 26px | 1.15 | Hero banner, logo title |

---

## 4. BORDER RADIUS SCALE (THANG BO GÓC)

| Token Class | Mộc Lan | Modern Slate | Pure Swiss | Ứng dụng |
|---|---|---|---|---|
| `rounded-sm` | 4px | 2px | 2px | Tooltip, badge nhỏ |
| `rounded-md` | 8px | 6px | 4px | Input, checkbox, select dropdown |
| `rounded-lg` | 12px | 8px | 4px | Button xs/sm, sub-cards |
| `rounded-xl` | 16px | 10px | 4px | Button default, dialog modal |
| `rounded-2xl` | 20px | 12px | 4px | Card chính, container panel |
| `rounded-3xl` | 24px | 16px | 6px | Hero banner, spotlight cards |
| `rounded-full` | 9999px | 9999px | 9999px | Avatar, status pills, nút tròn camera |

---

## 5. UI DENSITY MATRIX (MẬT ĐỘ THÔNG TIN)

Điều khiển toàn cục qua thuộc tính `data-density="compact" | "comfortable" | "spacious"`:

| Thuộc tính UI | Compact (Kế toán / Kho) | Comfortable (Mặc định) | Spacious (Cảm ứng / POS) |
|---|---|---|---|
| **Chiều cao hàng bảng (Table row)** | 36px | 48px | 60px |
| **Padding ô bảng (Cell padding)** | `0.375rem 0.75rem` | `0.75rem 1rem` | `1rem 1.25rem` |
| **Padding thẻ (Card padding)** | 14px (`p-3.5`) | 20px (`p-5`) | 28px (`p-7`) |
| **Khoảng cách form (Form gap)** | 12px (`gap-3`) | 16px (`gap-4`) | 24px (`gap-6`) |
| **Nút bấm mặc định (Button)** | 36px / 40px | 44px / 48px | 48px / 56px |
