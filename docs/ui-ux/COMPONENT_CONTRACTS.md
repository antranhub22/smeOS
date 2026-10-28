# COMPONENT CONTRACTS & USAGE GUIDELINES (SMEOS)

> Tài liệu quy chuẩn kỹ thuật cho hệ thống **Shared Components** trong khuôn khổ **Phase 2: UI Foundation Architecture**.  
> Tất cả các màn hình ở Phase 3 bắt buộc tuân theo các hợp đồng giao diện (Component Contracts) dưới đây.

---

## 1. BUTTON CONTRACT (`src/components/ui/button.tsx`)

### Props Interface:
```typescript
export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "ghost" | "warning" | "danger" | "subtle"
  size?: "default" | "sm" | "xs" | "lg" | "icon" | "icon-sm"
}
```

### Quy tắc sử dụng:
1. **Chỉ duy nhất 1 nút `primary` trên một màn hình** (Quy tắc K2 & 03a UX-010). Các hành động phụ dùng `secondary`, `outline`, hoặc `subtle`.
2. **Kích thước nút bấm theo ngữ cảnh**:
   - `size="default"` (h-12 / 48px): Dùng cho nút hành động chính của trang, trên điện thoại di động (Touch Target chuẩn).
   - `size="sm"` (h-11 / 44px): Dùng cho toolbar, header modal, action bar.
   - `size="xs"` (h-8 / 32px): Dùng bên trong các hàng của bảng dữ liệu (`<Table>`), thanh lọc nhanh, các nút phụ chiếm ít diện tích.
   - `size="icon"` (44×44px) / `size="icon-sm"` (32×32px): Khi dùng nút icon-only, **BẮT BUỘC** phải có `aria-label` hoặc `title` (Tuân thủ UX Lint R6 / WCAG 4.1.2).
3. **Màu sắc & Ngữ nghĩa**:
   - Thao tác xóa, hủy nguy hiểm: Bắt buộc dùng `variant="danger"`.
   - Lưu nháp, bộ lọc, xem chi tiết: Dùng `variant="outline"` hoặc `variant="subtle"`.
   - Xác nhận, hoàn tất, gửi đi: Dùng `variant="primary"`.

---

## 2. CARD CONTRACT (`src/components/ui/card.tsx`)

### Compound Components Pattern:
```tsx
<Card variant="default | flat | elevated | interactive">
  <CardHeader>
    <CardTitle>Tiêu đề thẻ</CardTitle>
    <CardDescription>Mô tả ngắn gọn bổ trợ</CardDescription>
  </CardHeader>
  <CardContent>
    {/* Nội dung dữ liệu hoặc form */}
  </CardContent>
  <CardFooter>
    {/* Nút bấm hành động */}
  </CardFooter>
</Card>
```

### Quy tắc sử dụng:
1. **Không tự viết div viền thủ công**: Cấm viết `<div className="rounded-xl border bg-white p-4">`. Bắt buộc dùng `<Card>`.
2. **Variants**:
   - `default`: Nền trắng `bg-surface`, viền `border-border`, đổ bóng vi mô `shadow-xs`.
   - `flat`: Dùng cho khối thông tin phụ lồng bên trong (`bg-surface-alt`).
   - `interactive`: Dùng cho danh sách thẻ sản phẩm bấm để chọn (có hiệu ứng hover viền thương hiệu và đổ bóng).

---

## 3. INPUT CONTRACT (`src/components/ui/input.tsx`)

### Props Interface:
```typescript
export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  inputSize?: "default" | "sm"
  hasError?: boolean
}
```

### Quy tắc sử dụng:
1. **Liên kết nhãn rõ ràng**: Mọi `<Input>` phải đi kèm `<label htmlFor="...">` hoặc có `aria-label`. Tuyệt đối không dùng mỗi placeholder thay thế nhãn.
2. **Kích thước**:
   - `default` (h-11): Dùng cho các form nhập liệu thông thường.
   - `sm` (h-9): Dùng cho thanh tìm kiếm nhanh trong bảng hoặc thanh công cụ.
3. **Báo lỗi**: Khi `hasError={true}`, input tự động chuyển viền đỏ `border-danger`. Luôn đặt `<InlineError message="..." />` ngay dưới trường nhập liệu.

---

## 4. TABLE CONTRACT (`src/components/ui/table.tsx`)

### Compound Structure:
```tsx
<Table containerClassName="my-custom-wrapper">
  <TableHeader>
    <TableRow>
      <TableHead>Mã đơn</TableHead>
      <TableHead>Khách hàng</TableHead>
      <TableHead>Tổng tiền</TableHead>
      <TableHead className="text-right">Thao tác</TableHead>
    </TableRow>
  </TableHeader>
  <TableBody>
    {items.map(item => (
      <TableRow key={item.id}>
        <TableCell className="font-semibold">{item.code}</TableCell>
        <TableCell>{item.customerName}</TableCell>
        <TableCell>{formatCurrency(item.total)}</TableCell>
        <TableCell className="text-right">
          <Button size="xs" variant="outline">Xem</Button>
        </TableCell>
      </TableRow>
    ))}
  </TableBody>
</Table>
```

### Quy tắc an toàn Responsive:
- `<Table>` đã tích hợp sẵn container `overflow-x-auto` bên ngoài, đảm bảo không làm tràn ngang viewport trên iPhone.
- Tiêu đề cột `TableHead` dùng `text-caption` in hoa trang trọng, màu `text-text-muted`.
- Các hàng được tích hợp hover state `hover:bg-surface-alt/50`.

---

## 5. PAGE CONTAINER & PAGE HEADER CONTRACT

### Page Layout chuẩn mọi màn hình:
```tsx
import { PageContainer } from "@/components/ui/page-container"
import { PageHeader } from "@/components/ui/page-header"
import { Button } from "@/components/ui/button"

export function MyView() {
  return (
    <PageContainer>
      <PageHeader
        breadcrumbs="Quản lý / Đơn hàng"
        title="Danh sách đơn hàng"
        description="Theo dõi tiến độ gia công, giao hàng và thanh toán đa kênh."
        actions={
          <>
            <Button variant="outline" size="sm">Xuất Excel</Button>
            <Button variant="primary" size="sm">Tạo đơn mới</Button>
          </>
        }
      />
      {/* Nội dung trang */}
    </PageContainer>
  )
}
```
