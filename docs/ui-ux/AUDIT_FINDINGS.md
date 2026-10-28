# AUDIT FINDINGS — VISUAL, CONSISTENCY & UX (SMEOS)

> Tài liệu thực hiện trong khuôn khổ **Phase 1: UI/UX Standardization & Runtime UI System**.  
> Phân loại rõ: **[Xác minh]** (đã chứng minh qua code/lint), **[Rủi ro code]** (suy luận từ kiến trúc), và **[Cần test browser]** (cần kiểm chứng động).

---

## 1. TỔNG HỢP VI PHẠM TỪ UX LINT RATIO (965 VI PHẠM ĐÃ XÁC MINH)

Kết quả chạy `npm run lint:ux` trên toàn bộ codebase (`src/app` và `src/components`):

```
======================== UX LINT SUMMARY ========================
Tổng số vi phạm: 965
---------------------------------------------------------------------------------------------
Thư mục                     | R1 (Màu) | R2 (Cỡ chữ) | R12 (Từ cấm) | R6 (Icon) | R5 (Click) | Khác | Tổng
---------------------------------------------------------------------------------------------
app/(app)                   |  255     |  32         |   -          |   1       |   1        |  4   | 293
components/product-photo-.. |  110     |   6         |   -          |   -       |   1        |  -   | 117
components/layout           |   69     |  14         |   -          |   -       |   1        |  4   |  88
components/internal-chat    |   66     |   9         |   -          |   3       |   1        |  -   |  79
components/product-image-set|   73     |   6         |   -          |   -       |   -        |  -   |  79
components/ad-banner-poster |   19     |  41         |   -          |   2       |   1        |  2   |  65
components/organization     |   41     |  12         |   4          |   1       |   -        |  -   |  58
components/catalog          |   26     |  27         |   -          |   -       |   -        |  -   |  53
components/chain-data       |   15     |  13         |   1          |   -       |   -        |  -   |  29
app/dang-ky-thanh-cong      |   23     |   -         |   -          |   -       |   -        |  -   |  23
components/platform         |    7     |  13         |   -          |   3       |   -        |  -   |  23
components/greeting-card    |   16     |   3         |   -          |   1       |   -        |  1   |  21
Các thư mục còn lại         |   17     |  12         |   7          |   -       |   1        |  4   |  41
---------------------------------------------------------------------------------------------
TỔNG CỘNG                   |  731     | 188         |  12          |  11       |   6        | 17   | 965
```

### Ý nghĩa các mã luật:
- **R1 (731 lỗi) [Xác minh]**: Dùng lớp màu Tailwind thô (`bg-red-50`, `text-zinc-700`, `border-gray-200`, `text-emerald-600`...) thay vì dùng token ngữ nghĩa (`bg-danger-bg`, `text-text-muted`, `border-border`, `text-success`). Điều này khiến giao diện bị "đóng băng" màu cứng, không thể thay đổi giao diện/theme ở runtime.
- **R2 (188 lỗi) [Xác minh]**: Dùng cỡ chữ tùy ý dạng `text-[11px]`, `text-[13px]`, `text-[15px]` thay vì dùng thang token (`text-caption`, `text-meta`, `text-body-sm`, `text-title-sm`). Gây ra nhịp điệu typography rối mắt và không theo tỷ lệ vàng (typographic scale).
- **R12 (12 lỗi) [Xác minh]**: Từ kỹ thuật cấm xuất hiện trên UI người dùng (`BOM`, `Master Index`, `PII`, `Florist Ticket`). Cần thay bằng ngôn ngữ tự nhiên thân thiện với SME (`Phiếu nguyên liệu`, `Danh sách tổng`, `Thông tin khách hàng`).
- **R6 (11 lỗi) [Xác minh]**: Nút bấm chỉ có icon mà thiếu `aria-label` hoặc `title` — vi phạm nghiêm trọng chuẩn trợ năng WCAG 4.1.2 (khiến người dùng khiếm thị hoặc máy đọc màn hình không hiểu nút bấm làm gì).
- **R5 (6 lỗi) [Xác minh]**: Gắn sự kiện `onClick` trên thẻ không tương tác (`<div onClick=...>`, `<span onClick=...>`) mà thiếu `role="button"`, `tabIndex={0}` hoặc phím Enter/Space handler — vi phạm WCAG 2.1.1.
- **R4 (4 lỗi) [Xác minh]**: Có hơn 1 nút Primary trong cùng một màn hình (vi phạm quy tắc 1 mục tiêu hành động chính duy nhất của trang).
- **R11 (4 lỗi) [Xác minh]**: Nút bấm không có `onClick`, không phải `type="submit"`, và không nằm trong Link/Form (nút "chết").
- **R10 (3 lỗi) [Xác minh]**: Màn hình gọi API fetch dữ liệu nhưng thiếu nhánh hiển thị trạng thái rỗng (`EmptyState`) hoặc lỗi (`InlineError`).

---

## 2. BẤT NHẤT VỀ THỊ GIÁC (VISUAL CONSISTENCY ISSUES)

### 2.1. Sự xung đột giữa 3 hệ thống Token trong cùng một ứng dụng [Xác minh]
Khảo sát source code phát hiện 3 luồng định nghĩa CSS đang tồn tại song song:
1. **Chuẩn Mộc Lan SSOT**: `bg-bg`, `bg-surface`, `border-border`, `text-text`, `text-text-muted`, `bg-primary`.
2. **Chuẩn shadcn còn sót lại**: `bg-background`, `text-foreground`, `border-input`, `text-muted-foreground`. Tìm thấy tại **203 file** trong repo (đặc biệt trong `src/components/ui/input.tsx`, `dialog.tsx`, và module `greeting-card`). Vì `globals.css` không định nghĩa `--color-background` hay `--color-foreground` nên các lớp này hoạt động không đoán trước được hoặc rơi về giá trị mặc định của trình duyệt/Tailwind v4.
3. **Màu cứng Tailwind**: Hơn 731 vị trí dùng trực tiếp `zinc`, `stone`, `gray`, `emerald`, `amber`, `red`.

### 2.2. Bất nhất về Bo góc (Radius) và Đổ bóng (Shadow) [Xác minh]
- Có trang dùng `rounded-md` (6px), có trang dùng `rounded-xl` (12px), có trang dùng `rounded-2xl` (16px), và một số card dùng `rounded-3xl` (24px).
- Chưa có semantic token cho radius (ví dụ `--radius-sm`, `--radius-md`, `--radius-lg`), dẫn đến mỗi lập trình viên tự chọn độ bo góc theo cảm tính.
- Đổ bóng (Shadow): Chưa có chuẩn cho elevation layers (Card hover, Popover, Dialog, Floating action bar).

### 2.3. Bất nhất về Kích thước Nút bấm & Form Controls [Rủi ro code]
- Nút bấm `Button` mặc định có chiều cao `h-12` (48px) và `h-11` (44px) - rất tốt cho ngón tay trên mobile, nhưng trong các bảng dữ liệu quản lý nhiều dòng (data tables), nút này chiếm diện tích quá lớn, làm bảng bị kéo dài bất thường.
- Ngược lại, một số icon button dạng thao tác nhanh chỉ có kích thước `h-7 w-7` (28px), quá nhỏ để bấm chính xác trên điện thoại cảm ứng.

---

## 3. CÁC VẤN ĐỀ TRẢI NGHIỆM NGƯỜI DÙNG (UX ISSUES)

### 3.1. Phân cấp Thông tin & Breadcrumbs [Rủi ro code]
- Một số màn hình con nằm sâu 3 cấp (ví dụ: `/san-pham/[id]/chinh-sua` hoặc `/ho-so/chinh-sach-thanh-toan`) không có thanh Breadcrumb hoặc nút Quay lại rõ ràng, khiến người dùng trên mobile dễ bị mất phương hướng khi không dùng nút Back của trình duyệt.
- Tiêu đề màn hình (`PageHeader`) chưa có component dùng chung: Chỗ thì dùng `<h1 className="text-2xl font-bold">`, chỗ thì `<h2 className="text-title">`, chỗ thì kèm phụ đề, chỗ thì không.

### 3.2. Trạng thái Loading, Empty và Feedback [Xác minh]
- **Loading State**: Hiện tại một số màn hình vẫn dùng text "Đang tải dữ liệu..." hoặc spinner quay giữa trang thay vì dùng Skeleton. Điều này gây hiện tượng giật giũ giao diện (Cumulative Layout Shift - CLS) khi dữ liệu thực tế nạp xong.
- **Empty State**: Mặc dù đã có component `<EmptyState>`, nhiều bảng dữ liệu chỉ đơn giản render `<div>Không có dữ liệu</div>` mà không có hình minh họa và nút kêu gọi hành động (Call to Action).
- **Error Feedback**: Nhiều form khi submit thất bại chỉ hiển thị console error hoặc alert native của trình duyệt, không đưa thông báo lỗi cạnh trường nhập liệu.

### 3.3. Các luồng thao tác có nguy cơ gây nhầm lẫn [Cần test browser]
- **Luồng duyệt đơn & chốt cọc (Coordinator)**: Trạng thái đơn hàng giữa Chờ cọc, Đã cọc một phần, Đã thanh toán 100% đôi khi không thể hiện rõ quyền hạn thao tác tiếp theo của từng vai trò (Thu ngân vs Điều phối).
- **Luồng phân chia tab trên màn hình hẹp**: Một số form cấu hình chính sách (Store Policies) có quá nhiều tab ngang, trên màn hình di động nhỏ bị tràn viền hoặc che khuất tab cuối.
