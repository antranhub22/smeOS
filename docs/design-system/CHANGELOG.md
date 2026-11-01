# smeOS Design System CHANGELOG

Tất cả các thay đổi đáng chú ý của SMEOS Design System sẽ được ghi nhận tại đây theo chuẩn [Keep a Changelog](https://keepachangelog.com/vi/1.0.0/) và tuân thủ [Semantic Versioning](https://semver.org/lang/vi/).

---

## [1.1.0] - 2026-11-01

### Milestone: Giai đoạn 3 — Enterprise Shell & Layout Architecture (S3-01 → S3-06)

Đạt tiêu chuẩn **Commercial & Production Ready** toàn diện cho tầng Shell, Bố cục trang và Điều hướng của hệ thống smeOS theo quyết định kiến trúc `ADR-011` (D-UI-09, D-UI-10) và kế hoạch `docs/plan/ui-enterprise-upgrade.md`.

### Đã thêm & Nâng cấp (Added & Upgraded)
- **Unified `AppShell` (S3-01)**:
  - Tệp: `src/components/layout/app-shell.tsx`.
  - Tích hợp chuẩn hoá toàn hệ thống: Skip-link `#noi-dung-chinh` (focus ring chuẩn), `LiveRegionProvider`, `FloatingLayerProvider`, landmark chuẩn `<main id="noi-dung-chinh">`, và đệm đáy `pb-[calc(4.5rem+env(safe-area-inset-bottom))]` trên di động.
  - Đồng bộ hóa hoàn toàn cho cả 2 layout: `src/app/(app)/layout.tsx` và `src/app/(platform)/layout.tsx` (đóng hoàn toàn phát hiện UI-A-02 và UI-F-03).
- **`PageLayout` Archetypes A–F & `PageHeader` v2 (S3-02)**:
  - Thư mục: `src/components/layout/page-layout/`.
  - 6 archetypes chuẩn mực theo đặc tả UX-028:
    - Archetype A (`DashboardLayout`): Khổ rộng (max-w-7xl), ưu tiên KPI và khối việc tiếp theo.
    - Archetype B (`ListLayout`): Bộ lọc sát danh sách (UX-P09), thanh hành động chọn nhiều (UX-P10), phân trang.
    - Archetype C (`DetailLayout`): Khổ vừa (max-w-6xl), thông tin đối tượng ở đầu kèm panel lề.
    - Archetype D (`FormLayout`): Khổ hẹp (max-w-3xl / max-w-4xl), nhãn rõ ràng, nút lưu ở đáy.
    - Archetype E (`BuilderLayout`): Bố cục chia 2 cột: điều khiển bên trái, xem trước trực tiếp bên phải.
    - Archetype F (`SettingsLayout`): Cài đặt phân nhóm có danh mục điều hướng.
  - Nâng cấp `PageHeader` v2 với semantic `<header>`, tiêu đề chuẩn 20px `h1` (`text-display`), breadcrumbs với `aria-label="Breadcrumb"`, nút quay lại (back button) có nhãn trợ năng, huy hiệu trạng thái, chú giải `InfoTip` và giới hạn hành động K2.
  - Đóng hoàn toàn phát hiện UI-J-01 và UI-J-02.
- **`FloatingLayer` (S3-03)**:
  - Tệp: `src/components/layout/floating-layer.tsx`.
  - Bộ điều phối các nút và widget nổi (Copilot, UI Studio Drawer, StageGateApprovalBar) theo độ ưu tiên (`priority`), tự động đệm cách đáy trên di động, triệt tiêu xung đột che khuất trên màn 360px - 430px (đóng phát hiện UI-F-02).
- **Copilot Responsiveness & BottomSheet (S3-04)**:
  - Tệp: `src/components/chat/floraos-global-copilot.tsx`.
  - Trên màn hình nhỏ (`< sm`): hiển thị dạng `BottomSheet` toàn chiều rộng (`inset-x-0 bottom-0 rounded-t-2xl max-h-[85dvh]`) có tay cầm kéo và lớp nền mờ (backdrop), triệt tiêu hoàn toàn lỗi tràn 40px mép trái trên màn 360px (đóng phát hiện P1 UI-F-01).
  - Trên desktop (`>= sm`): hiển thị dạng cửa sổ nổi co giãn linh hoạt theo viewport (`max-h-[calc(100vh-5rem)]`).
  - Bổ sung `role="dialog"`, `aria-modal="true"`, phím tắt Escape để đóng, dọn sạch `console.error` và chuyển đổi 100% sang token ngữ nghĩa.
- **Điều hướng & Tách tệp SRP (S3-05)**:
  - Loại bỏ các mục trỏ tới `/van-hanh/*` khỏi `nav-industry.ts` theo quyết định kiến trúc D-UI-10, đảm bảo mọi `href` trong tầng Ngành đều mở được hợp lệ (đóng phát hiện UI-A-05).
  - Tách `nav-store.ts` (458 dòng) thành `nav-store-entries.ts` (339 dòng) và `nav-store.ts` (123 dòng), tuân thủ 100% giới hạn SRP ≤ 350 dòng (đóng phát hiện P3 / K11).
  - Bổ sung bộ kiểm thử `src/components/layout/nav-tier-accessibility.test.ts`.
- **Triệt tiêu Hardcoded `roleKey` (S3-06)**:
  - Thay thế kiểm tra `roleKey` trong `src/app/(app)/san-pham/page.tsx` bằng mã năng lực `session.can("G3") || session.can("L4")`.
  - Tích hợp chuẩn hóa `cua_hang` vào `resolveRoleUx`, loại bỏ rẽ nhánh cứng trong `src/app/(app)/page.tsx`.
  - Đảm bảo 0 vi phạm `roleKey ===` trong toàn bộ thư mục `src/app/` (đóng phát hiện UI-J-05).

---

## [1.0.0] - 2026-11-01

### Milestone: Giai đoạn 2 — Enterprise Component Architecture (C2-00 → C2-17)

Đạt tiêu chuẩn **Commercial & Production Ready** cho tầng thư viện Component của smeOS Design System theo quyết định kiến trúc `ADR-011` và kế hoạch `docs/plan/ui-enterprise-upgrade.md`.

### Đã thêm (Added)
- **`Button` (C2-01)**:
  - Hỗ trợ trạng thái `loading` với spinner trợ năng (`aria-busy="true"`, `motion-reduce:hidden`, khóa tự động double-submit).
  - Hỗ trợ `asChild` kết nối mượt mà với Next.js `<Link>`.
  - Vùng chạm tối thiểu 44×44px khi con trỏ thô (`pointer: coarse`) cho các kích thước `xs` và `icon-sm`.
  - Contract: `docs/design-system/components/button.md`.
- **Form Controls & Primitives (C2-02)**:
  - Các primitives biểu mẫu trợ năng: `FormField`, `useFormField`, `FormLabel`, `RequiredMark`, `FormDescription`, `FormMessage`. Tự động gắn kết `id`, `aria-describedby`, `aria-invalid` giữa label, input, description và error message.
  - `Input` và `Textarea` nâng cấp chuẩn styling và trạng thái lỗi.
  - Contract: `docs/design-system/components/form-field.md`.
- **`Select` Base-UI Migration (C2-03)**:
  - Chuyển đổi toàn bộ sang `@base-ui/react/select` không phụ thuộc Radix UI, API tương thích 100% với các subcomponents: `Select`, `SelectTrigger`, `SelectValue`, `SelectContent`, `SelectItem`, `SelectGroup`, `SelectLabel`, `SelectSeparator`.
  - Contract: `docs/design-system/components/select.md`.
- **Selection Controls (C2-04)**:
  - Hiện thực mới hoàn toàn trên Base-UI cho `Checkbox`, `RadioGroup`, `RadioItem`, `Switch`.
  - Hỗ trợ focus ring rõ ràng, disabled state và kích thước chuẩn chạm.
  - Contract: `docs/design-system/components/selection-controls.md`.
- **Unified Overlays (C2-05)**:
  - Tái cấu trúc toàn bộ overlay primitives trên cùng một lõi `@base-ui/react/dialog`: `Dialog`, `Drawer` (slide-in panel), `BottomSheet` (di động `max-h-[90dvh]`, safe-area insets, drag affordance), `ConfirmDialog` (hộp thoại xác nhận hành động nguy hiểm).
  - Khóa focus (focus trap), phục hồi focus (focus restoration), đóng bằng Escape và click backdrop.
  - Contract: `docs/design-system/components/overlays.md`.
- **`Toast` & `useToast` (C2-06)**:
  - Tích hợp `LiveRegionProvider` phát âm thanh trợ năng cho screen readers (`assertive` cho tone error, `polite` cho tone khác).
  - 4 tones ngữ nghĩa: `success`, `error`, `info`, `warning` với tự động đóng theo thời gian.
  - Contract: `docs/design-system/components/toast.md`.
- **Navigation & Tabs (C2-07, C2-08)**:
  - `DropdownMenu` hiện thực trên `@base-ui/react/menu` với submenu, separator, keyboard navigation.
  - `Tabs` (Base-UI) và nâng cấp `TabActionHeader` dùng `DropdownMenu` cho menu tràn `…`, loại bỏ DOM listeners tự chế và thay thang màu cũ bằng token ngữ nghĩa.
  - Contracts: `docs/design-system/components/dropdown-menu.md`, `docs/design-system/components/tabs.md`.
- **`DataTable` & `Pagination` (C2-09)**:
  - Hỗ trợ sắp xếp cột (sorting), chọn nhiều dòng (multi-row selection UX-P10), mật độ dòng linh hoạt qua `--table-py/px`, tự động chuyển sang chế độ xếp chồng thẻ (card stack) trên màn hình di động `< sm`.
  - Phân trang `Pagination` với điều hướng trang đầu, trang trước, trang sau, trang cuối và hiển thị tổng số bản ghi.
  - Contract: `docs/design-system/components/data-table.md`.
- **`SearchFilterBar` (C2-10)**:
  - Thanh tìm kiếm và bộ lọc đa năng chuẩn UX-P09: ô tìm kiếm kèm nút xóa, 2–3 bộ lọc nhanh, panel lọc nâng cao với `Disclosure`, huy hiệu đếm số lượng bộ lọc đang áp dụng, nút "Xoá bộ lọc" khôi phục mặc định.
  - Contract: `docs/design-system/components/search-filter-bar.md`.
- **`EmptyState` 4 Biến thể (C2-11)**:
  - 4 biến thể rõ ràng theo chuẩn UX-P08: `kind: "none" | "filtered" | "forbidden" | "error"` với tiêu đề, giải thích, nút hành động khôi phục và icon đặc trưng.
  - Contract: `docs/design-system/components/empty-state.md`.
- **`StatusBadge` & `Badge` (C2-12, C2-13)**:
  - Xóa bỏ hoàn toàn mã màu hex hardcoded trong `Badge`, tone `success` dùng `text-success-text`.
  - Xây dựng `StatusBadge` kết nối với `STATUS_REGISTRY` tập trung, chuẩn hóa màu sắc và nhãn cho đơn hàng, sản phẩm, tác vụ xử lý (job) và phê duyệt.
  - Contracts: `docs/design-system/components/badge.md`, `docs/design-system/components/status-badge.md`.
- **`KpiTile` & Deprecation (C2-14)**:
  - Khối hiển thị chỉ số kinh doanh chuẩn mực: số `text-display font-extrabold tabular-nums`, tính năng ẩn/hiện số tiền nhạy cảm (`sensitive` toggle với `Eye`/`EyeOff`), chỉ báo xu hướng tăng/giảm/trung tính, chú giải `InfoTip`.
  - Đánh dấu `@deprecated` trên `StatTile` cũ theo quyết định kiến trúc D-UI-12.
  - Contract: `docs/design-system/components/kpi-tile.md`.
- **`Avatar`, `DateField`, `Tooltip` / `InfoTip`, `Separator` (C2-15)**:
  - `Avatar` hiện thực trên `@base-ui/react/avatar` với fallback chữ cái đầu.
  - `DateField` dùng native `<input type="date">` đảm bảo khả năng trợ năng và picker bản địa trên iOS/Android.
  - `Tooltip` và `InfoTip` phân định rõ vai trò (Tooltip giải thích nút/biểu tượng, InfoTip giải thích thuật ngữ/khái niệm nghiệp vụ với icon `Info` và `role="note"`).
  - Contracts: `docs/design-system/components/avatar.md`.
- **UI Component Catalog (C2-00)**:
  - Trang showroom trưng bày và kiểm thử tương tác thực tế của toàn bộ linh kiện Design System tại đường dẫn `/van-hanh/thu-vien-giao-dien`.

### Đã gỡ bỏ (Removed) (C2-16)
- Xóa bỏ hoàn toàn các gói thư viện phụ thuộc cũ khỏi `package.json`:
  - `@radix-ui/react-select`
  - `@radix-ui/react-separator`
  - `@radix-ui/react-tooltip`
  - `lucide-react`
- Xóa bỏ các tệp mã nguồn không còn sử dụng:
  - `src/components/ui/table.tsx` (thay thế bởi `data-table.tsx`)
  - `src/components/ui/inline-source-picker.tsx` (0 lượt dùng)

### Chỉ số Đo lường (DoD K1–K13 Status)

| Mã | Chỉ số | Đầu vào (Audit) | Hiện tại (Sau GĐ 2) | Mục tiêu GĐ 3 (Tuần 6) | Đích Enterprise (Tuần 12) | Trạng thái |
|---|---|---|---|---|---|---|
| K1 | Vi phạm R1 (màu Tailwind thô) | ~2.200 | ~1.950 | ≤ 1.000 | 0 | 🟡 Đang giảm liên tục |
| K2 | Tệp dùng token shadcn cũ (R17) | 261 | 258 | 0 | 0 | 🟡 Sẵn sàng codemod GĐ 4 |
| K3 | Điều khiển thô ngoài `ui/` (R18) | ~2.000 | ~1.926 | −40% | ≤ 30 | 🟡 Các primitives mới sẵn sàng |
| K4 | Overlay tự chế (R19) | 71 tệp | 70 tệp | 0 ở luồng chính | 0 | 🟡 Đã có Base-UI Dialog/Drawer/BottomSheet |
| K5 | Trang dùng `PageHeader`/`PageLayout` | 8/105 | 9/105 | 100% trang StoreOS/ChainOS | 100% trang nội bộ | 🟡 Chuẩn bị GĐ 3 |
| K6 | Screen Contract v2 | 0 | Sẵn sàng cho GĐ 3 | 100% trang lõi | 100% page.tsx | 🟡 Bắt đầu GĐ 3 |
| K7 | Ảnh mốc visual trong CI | 2 | 2 | 25 | 100% | ⚪ GĐ 3 |
| K8 | Trang có axe kiểm tra trong CI | 13 | 13 | 40 | 100% | ⚪ GĐ 3 |
| K9 | Kiểm thủ công WCAG 2.2 AA | 0 | 0 | 5 hành trình chính | 12 hành trình chính | ⚪ GĐ 5 |
| K10| Biến token thừa, mã chết theme | ≥ 8 nhóm | 0 | 0 | 0 | ✅ **ĐẠT (GĐ 1)** |
| K11| Tệp `.tsx` > 350 dòng trong `ui/`, `layout/` | 54 (toàn dự án) | **0 trong `src/components/ui/`** | 0 trong `ui/`, `layout/` | ≤ 20 | ✅ **ĐẠT cho tầng `ui/`** |
| K12| Xung đột hướng dẫn agent | 8 | 0 | 0 | 0 | ✅ **ĐẠT (GĐ 0/1)** |
| K13| Design System có phiên bản + CHANGELOG | Không | **`1.0.0`** | `1.0.0` | `1.x` | ✅ **ĐẠT (GĐ 2 hoàn tất)** |
