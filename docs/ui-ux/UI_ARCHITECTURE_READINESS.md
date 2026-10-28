# UI ARCHITECTURE READINESS FOR RUNTIME SYSTEM (SMEOS)

> Tài liệu thực hiện trong khuôn khổ **Phase 1: UI/UX Standardization & Runtime UI System**.  
> Phân tích mức độ sẵn sàng của kiến trúc frontend hiện tại để hỗ trợ hệ thống chuyển đổi UI Preset tại Runtime (Phase 4).

---

## 1. KHẢ NĂNG TÁCH BIỆT TRÌNH DIỄN (PRESENTATION) KHỎI NGHIỆP VỤ (BUSINESS LOGIC)

### 1.1. Hiện trạng tầng Nghiệp vụ (Domain & Use-Cases)
- **Điểm mạnh rất lớn**: Nhờ tuân thủ nghiêm ngặt **Clean Repository & Boundary Isolation Standard** (PO 25/10/2026, ADR-001/002/006), toàn bộ logic nghiệp vụ của 38 module nằm độc lập trong `src/modules/<module-name>/domain/` và `use-cases/`.
- Tầng Server Component (`page.tsx`) chỉ đảm nhận việc lấy dữ liệu qua Use-Case rồi truyền data thuần (`initialData`, `session`) xuống Client Component.
- **Kết luận**: Tầng nghiệp vụ hoàn toàn độc lập với CSS và Presentation. Việc thay đổi phong cách hiển thị sẽ **KHÔNG BAO GIỜ** làm ảnh hưởng đến tính toàn vẹn của logic tính toán, cọc đơn, phân quyền hay CSDL.

### 1.2. Hiện trạng tầng Trình diễn (UI Components)
- **Điểm nghẽn cần tháo gỡ**: Trong các Client Component của màn hình (ví dụ: `my-page-client.tsx`, `order-list.tsx`), mã JSX hiện đang kết hợp chặt giữa:
  1. Trạng thái giao diện (`useState`, `useTransition`, modal visibility).
  2. Các lớp CSS cụ thể (màu sắc, border, padding, bo góc).
- **Giải pháp chuyển tiếp**: Để hỗ trợ nhiều preset, ta không cần viết lại toàn bộ JSX. Ta chỉ cần chuẩn hóa các **Semantic Design Tokens** và **Shared Components (Button, Card, Input, Table, Layout)**. Khi đổi Preset, ta chỉ thay đổi giá trị của các CSS Variables tại root DOM hoặc data-attributes, toàn bộ các component sẽ tự động thích ứng ngay lập tức.

---

## 2. KHẢ NĂNG TẬP TRUNG HÓA DESIGN TOKENS (TOKEN CENTRALIZATION)

### 2.1. Đánh giá hạ tầng Tailwind v4
- Repo sử dụng **Tailwind CSS v4** với `@theme` đặt tại `src/app/globals.css`.
- Trong Tailwind v4, các biến khai báo trong `@theme` được ánh xạ trực tiếp thành các CSS Custom Properties (biến CSS chuẩn W3C) như:
  - `--color-primary`
  - `--color-bg`
  - `--color-surface`
  - `--color-border`
  - `--color-text`
  - `--color-text-muted`
  - `--font-sans`

### 2.2. Cơ chế Hoán đổi Preset ở Runtime (Runtime Theme Switching Mechanism)
Thay vì cố định giá trị màu cứng trong `@theme`, ta có thể tổ chức:
1. **Lớp Biến Semantic Cốt lõi**:
   ```css
   :root {
     /* Mặc định: Preset Mộc Lan */
     --color-primary: #7A2E42;
     --color-bg: #FBF6F2;
     --color-surface: #FFFFFF;
     --color-border: #E7DCD0;
     --color-text: #2A1E22;
     --radius-base: 1rem;
   }

   [data-theme="modern-slate"] {
     /* Preset Doanh nghiệp Hiện đại */
     --color-primary: #2563EB;
     --color-bg: #F8FAFC;
     --color-surface: #FFFFFF;
     --color-border: #E2E8F0;
     --color-text: #0F172A;
     --radius-base: 0.5rem;
   }

   [data-theme="pure-swiss"] {
     /* Preset Tối giản Thụy Sĩ */
     --color-primary: #18181B;
     --color-bg: #FAFAFA;
     --color-surface: #FFFFFF;
     --color-border: #E4E4E7;
     --color-text: #09090B;
     --radius-base: 0.25rem;
   }
   ```
2. **Ưu điểm vượt trội**:
   - Chuyển đổi theme tức thì trong 0ms: Chỉ cần gán `document.documentElement.setAttribute('data-theme', newTheme)`.
   - **Không cần reload trang (Zero Page Reload)**.
   - **Không cần build lại ứng dụng (Zero Rebuild)**.
   - Phù hợp 100% với React 19 và Next.js App Router (không gây hydration mismatch vì server có thể đọc theme từ cookie hoặc localStorage khi render).

---

## 3. KHẢ NĂNG HỖ TRỢ ĐA DENSITY & ĐA LAYOUT

### 3.1. Hỗ trợ Độ dày đặc (UI Density)
Các hệ thống SaaS B2B thường yêu cầu 2-3 mức density:
- **Comfortable (Mặc định)**: Dành cho điện thoại di động, thợ cắm hoa, thao tác cảm ứng (Touch-friendly, padding lớn, nút cao 44-48px).
- **Compact (Dày đặc)**: Dành cho kế toán, quản lý chuỗi kiểm kê kho, thu ngân POS (bảng dữ liệu nhiều dòng, nút cao 32-36px, khoảng cách giữa các dòng giảm 40%).
- **Kiến trúc đề xuất**: Bổ sung token khoảng cách `--density-table-row: 48px` (comfortable) vs `36px` (compact) và điều khiển qua thuộc tính `data-density="compact"`.

### 3.2. Hỗ trợ Layout Variants
- SMEOS đã có sẵn 2 khối Layout chính: `DesktopNav` (Sidebar) và `BottomNav` (Thanh đáy mobile).
- Để hỗ trợ Preset có layout khác nhau (ví dụ: Top Navigation cho màn hình lớn thay vì Sidebar dọc), kiến trúc Layout Adapter trong Phase 2 chỉ cần thêm một wrapper `AppLayoutShell` đọc cấu hình `layoutType: "sidebar" | "top-nav" | "compact-dock"`.

---

## 4. MA TRẬN ĐÁNH GIÁ MỨC ĐỘ SẴN SÀNG (READINESS SCORECARD)

| Tiêu chí kiến trúc | Điểm đánh giá (1-5) | Hiện trạng | Yêu cầu chuẩn bị cho Phase 2 |
|---|:---:|---|---|
| **Phân lập Logic & UI** | 5/5 | Đã sạch 100% qua Clean Architecture | Duy trì, không can thiệp use-cases |
| **Hạ tầng CSS Tokens** | 4/5 | Đã có `@theme` tại `globals.css` | Chuyển đổi sang CSS variables hỗ trợ multi-preset dataset |
| **Độ bao phủ Component** | 3.5/5 | Đã có 19 shared UI components | Dọn dẹp 203 file còn dùng token shadcn cũ (`bg-background`) |
| **Kiến trúc Context & State** | 5/5 | Đã có `SessionProvider`, `I18nProvider` | Bổ sung `UiPresetProvider` tương thích cùng mô hình |
| **Cơ chế Fallback an toàn** | 4/5 | Có sẵn default values | Định nghĩa fallback về Mộc Lan nếu preset không hợp lệ |

---

## 5. KẾT LUẬN

Hệ thống SMEOS **HOÀN TOÀN ĐỦ ĐIỀU KIỆN KỸ THUẬT** để triển khai hệ thống Runtime UI Switching. Nền tảng Tailwind v4 kết hợp CSS Custom Properties và React 19 Context là kiến trúc tối ưu nhất để thực hiện mục tiêu này mà không làm tăng bundle size và không phá vỡ bất kỳ nghiệp vụ kinh doanh nào.
