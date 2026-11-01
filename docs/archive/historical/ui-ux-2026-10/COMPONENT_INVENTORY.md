# COMPONENT INVENTORY — THỐNG KÊ HỆ THỐNG COMPONENT (SMEOS)

> Tài liệu thực hiện trong khuôn khổ **Phase 1: UI/UX Standardization & Runtime UI System**.  
> Phân loại, kiểm kê trạng thái và mức độ tái sử dụng của các thành phần giao diện.

---

## 1. SHARED BASE UI COMPONENTS (`src/components/ui/`)

| Tên Component | File Path | Công nghệ nền | Trạng thái hiện tại | Vấn đề / Khuyến nghị chuẩn hóa |
|---|---|---|---|---|
| **Button** | `src/components/ui/button.tsx` | CVA + HTML Button | Ổn định (5 variants: primary, secondary, outline, ghost, warning; 3 sizes: default h-12, sm h-11, icon) | Thiếu variant `danger`, `subtle`. Chiều cao default 48px và sm 44px tối ưu cho touch mobile nhưng hơi cao đối với table actions/data density trên desktop. Cần bổ sung size `xs` (32px) cho dashboard B2B. |
| **Card** | `src/components/ui/card.tsx` | Pure Div ForwardRef | Đơn giản (`rounded-2xl border border-border bg-surface`) | Chưa có CardHeader, CardContent, CardFooter, CardTitle, CardDescription chuẩn hóa theo compound pattern. Nhiều màn hình tự style div riêng thay vì dùng `<Card>`. |
| **Input** | `src/components/ui/input.tsx` | ForwardRef HTML Input | **Xung đột Token** | Đang dùng lớp CSS shadcn: `border-input bg-background placeholder:text-muted-foreground` thay vì semantic token `border-border bg-surface placeholder:text-text-muted`. Cần chuẩn hóa về token hệ thống. |
| **Dialog (Modal)** | `src/components/ui/dialog.tsx` | `@base-ui/react` | Đầy đủ tính năng (Title, Description, SubHeader, Footer, Sizes: sm/md/lg) | Header dùng `text-foreground` thay vì `text-text`. Đã hỗ trợ `subHeader` cho tab điều hướng cố định và responsive mobile. |
| **Select** | `src/components/ui/select.tsx` | `@radix-ui/react-select` | Hoàn chỉnh | Trải nghiệm chọn mục mượt mà, hỗ trợ keyboard navigation, đã được bọc accessibility đầy đủ. |
| **Badge** | `src/components/ui/badge.tsx` | CVA Div | Tốt (6 variants: primary, secondary, outline, success, warning, danger) | Cần đồng bộ màu nền `*-bg` và viền `*-border` với token ngữ nghĩa. |
| **Skeleton** | `src/components/ui/skeleton.tsx` | Div animate-pulse | Đơn giản (`bg-surface-alt animate-pulse rounded-md`) | Cần các biến thể `SkeletonBlock`, `SkeletonRow`, `SkeletonCard` để chống layout shift (CLS). |
| **EmptyState** | `src/components/ui/empty-state.tsx` | Lucide + Text + Action | Chuẩn UX 03a | Bao gồm icon, tiêu đề, mô tả và CTA nút bấm. Giúp loại bỏ các trạng thái rỗng trơ trọi. |
| **InlineError** | `src/components/ui/inline-error.tsx` | AlertCircle + Text | Chuẩn WCAG | Có `role="alert"`, màu `text-danger`, thông báo lỗi rõ ràng bên dưới form field. |
| **TabHeader** | `src/components/ui/tab-header.tsx` | Custom Nav Tabs | Phong phú | Hỗ trợ tab có icon, đếm số badge, responsive cuộn ngang trên mobile. |
| **Tooltip** | `src/components/ui/tooltip.tsx` | `@radix-ui/react-tooltip` | Đạt chuẩn | Giúp hiển thị nhãn cho các nút icon-only trên desktop. |
| **Progress** | `src/components/ui/progress.tsx` | Div Bar | Đơn giản | Dùng cho tiến trình upload ảnh và wizard các bước. |
| **Separator** | `src/components/ui/separator.tsx` | `@radix-ui/react-separator` | Chuẩn | Đường kẻ phân cách ngang/dọc dùng token `bg-border`. |
| **FeatureGuidanceCard** | `src/components/templates/shared/feature-guidance-card.tsx` | Callout Card | Đạt chuẩn SSOT | Khối gợi ý hướng dẫn nghiệp vụ (tối đa 1 card mỗi màn hình theo chuẩn 03a). |
| **StageGateApprovalBar** | `src/components/ui/stage-gate-approval-bar.tsx` | Fixed Action Bar | Chuyên dụng | Thanh duyệt đa bước có nút hành động cố định, xác nhận phê duyệt. |

---

## 2. LAYOUT & NAVIGATION COMPONENTS (`src/components/layout/`)

| Tên Component | Mục đích | Trách nhiệm | Đánh giá kiến trúc |
|---|---|---|---|
| **DesktopNav** | Sidebar chính (Desktop) | Chuyển đổi 240px (mở) / 56px (thu gọn), tìm kiếm nhanh (`/`), quản lý nhóm menu thu gọn mở rộng, hỗ trợ phím tắt `⌘B`. | Xử lý rất tốt việc phân tách theo vai trò (`roleUx`), phân quyền (`can()`), ghi nhớ trạng thái theo `orgId` vào localStorage. |
| **BottomNav** | Thanh đáy (Mobile) | 5 vị trí: Trang chủ, Ô nghiệp vụ theo vai (Slot 2), Nút hành động nổi ở giữa (Slot 3: Camera / Việc chính), Thông báo / Lịch sử, Menu mở rộng. | Xử lý safe area iOS chuẩn `pb-[env(safe-area-inset-bottom)]`. Nút trung tâm nhô cao 52px tạo điểm nhấn thao tác một tay. |
| **MobileNavDrawer** | Ngăn kéo phụ (Mobile) | Trượt từ cạnh trái khi người dùng bấm Menu thêm, chứa toàn bộ các công cụ và cài đặt phụ. | Thân thiện với thiết bị di động, tự động đóng khi chuyển route. |
| **ArchitectureNametag** | Nhãn nhận diện kiến trúc | Hiển thị tầng vận hành (SaaS Mother / Ngành / ChainOS / StoreOS). | Hỗ trợ phân biệt môi trường và ngữ cảnh đa tenant. |
| **ToolkitShortcutsGroup**| Nhóm phím tắt công cụ | Cung cấp truy cập nhanh vào 10 bộ công cụ trọng tâm theo ngành. | Cho phép tùy biến công cụ yêu thích theo người dùng. |
| **UserMenu** | Menu người dùng & Tổ chức | Chuyển đổi tổ chức, đổi mật khẩu, đăng xuất, hiển thị thông tin nhân sự. | Dropdown đầy đủ thông tin định danh và vai trò. |

---

## 3. JOURNEY-FIRST UX COMPONENTS (`src/components/journey/`)

Hệ thống triển khai chuẩn UX **Journey-First (J1–J7)**:
- **`ChoiceGrid`**: Lưới chọn mục tiêu công việc ("Bạn muốn làm gì?") tại trang bắt đầu của hành trình.
- **`ActionCard`**: Thẻ hành động lớn trực quan hóa lộ trình.
- **`JourneyShell` & `JourneyProgress`**: Khung bao bọc tiến trình lũy tiến (Progressive Disclosure), che giấu sự phức tạp kỹ thuật.
- **`NextActions`**: Khối điều hướng hành động tiếp theo ở cuối mọi kết quả xử lý, triệt tiêu hoàn toàn "ngõ cụt" trải nghiệm.
- **`ActionContractWrapper`**: Chuẩn hóa luồng 7 bước: Chọn → Nhập → Xem trước → Tiến hành → Xử lý → Kết quả → Tiếp theo.

---

## 4. CÁC COMPONENT RIÊNG THEO MODULE (MODULE-SPECIFIC)

- **Creative Studio & Media (`src/components/creative-studio/`, `product-photo-studio/`, `ad-banner-poster/`)**:
  - Hỗ trợ dropzone thông minh, xem trước ảnh tràn viền, bộ lọc hiệu ứng studio, phối màu poster.
  - Sử dụng kỹ thuật hòa nền `mix-blend-mode: multiply` và bộ 4 card layout cao cấp (`CatalogCardOverlay`, `CatalogCardPaper`, `CatalogCardGlass`, `CatalogCardSplit`).
- **Greeting Card & Brochure (`src/components/greeting-card/`)**:
  - Hỗ trợ xem catalogue đa ngành, đặt hàng nhanh, chọn phương thức cọc/thanh toán, gửi lời chúc qua link động.
  - Tích hợp mô hình *Single Living Dashboard Card* cho thông báo Telegram Bot / Zalo.
- **Catalog & BOM (`src/components/catalog/`)**:
  - Lưới sản phẩm bento thích ứng, phiếu định mức nguyên liệu đa ngành (BOM), tính toán chi phí và giá vốn tự động.
- **Internal Chat & Coordination (`src/components/internal-chat/`, `coordinator/`)**:
  - Chat điều phối đơn hàng, nhận đơn gia công, luồng bàn giao shipper.

---

## 5. NHẬN DIỆN VẤN ĐỀ TRÙNG LẶP & PHÂN MẢNH

1. **Trùng lặp form controls**: Nhiều module (`greeting-card`, `profiles`, `crm`) tự viết các ô input, label và helper text riêng bằng các thẻ `<div className="...">` kèm input native thay vì dùng component `<Input>` dùng chung.
2. **Bất nhất Card Component**: Thay vì dùng `<Card>`, các nhà phát triển trước đó thường viết trực tiếp `<div className="rounded-xl border bg-white p-4">`, dẫn đến khi muốn thay đổi border-radius hoặc màu nền cho toàn hệ thống thì không thể kế thừa được.
3. **Phân mảnh Dialog / Modal**: Có màn dùng `Dialog` chuẩn từ `src/components/ui/dialog.tsx`, nhưng cũng có màn dùng backdrop tự chế với `fixed inset-0 bg-black/50` kết hợp `useState(isOpen)`.
