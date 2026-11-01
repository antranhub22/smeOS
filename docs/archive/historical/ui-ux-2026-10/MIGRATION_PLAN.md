# MIGRATION PLAN — KẾ HOẠCH DI TRÚ & CHUẨN HÓA DIỆN RỘNG (PHASE 3 PREPARATION)

> Tài liệu hướng dẫn chuyển đổi từ cấu trúc cũ sang UI Foundation Architecture chuẩn cho **Phase 3 (Chuẩn hóa UI/UX theo Style Mộc Lan Artisan)**.  
> Đảm bảo quy trình an toàn, không gián đoạn dịch vụ, triệt tiêu 965 lỗi UX Lint theo từng cụm module.

---

## 1. NGUYÊN TẮC DI TRÚ AN TOÀN (SAFETY-FIRST MIGRATION)

1. **Tuân thủ Cơ chế Tương thích Ngược (Backwards Compatibility)**:
   - Các component `Button`, `Card`, `Input`, `Dialog` đã được nâng cấp trong Phase 2 giữ nguyên toàn bộ interface cũ. Code hiện tại không bị gãy khi gọi các props truyền thống.
   - Các token shadcn cũ (`bg-background`, `text-foreground`, `border-input`) đã được alias tự động trong `globals.css` về tokens Semantic của hệ thống, giúp giao diện hiển thị đúng ngay cả khi chưa kịp sửa đổi file.

2. **Chiến lược "Ratchet & Module Batches"**:
   - Tiến hành di trú theo từng nhóm màn hình đại diện và từng cụm module.
   - Sau mỗi cụm module hoàn thành, chạy `npm run lint:ux -- --check` để đảm bảo tổng số vi phạm giảm dần đều (từ 965 xuống 0), tuyệt đối không để phát sinh vi phạm mới.

---

## 2. LỘ TRÌNH 4 BƯỚC DI TRÚ TRONG PHASE 3

### Bước 1: Nhóm Màn hình Thử nghiệm Đại diện (Pilot Phase)
- **Mục tiêu**: Chọn 2 nhóm màn hình đặc thù để hoàn thiện và kiểm chứng trước:
  1. `src/app/(app)/san-pham/` & `src/components/catalog/`: Đại diện cho luồng Quản lý Danh mục & Sản phẩm, Bento grid, thẻ Card tương tác.
  2. `src/app/(app)/don-hang/` & `src/components/orders/`: Đại diện cho luồng Bảng dữ liệu nghiệp vụ (Data Table), bộ lọc, trạng thái thanh toán, modal duyệt.

### Bước 2: Dọn dẹp Token Thô & Token Shadcn (R1 Clean-up Batch)
- Thay thế triệt để các mã màu thô:
  - `bg-white` ➔ `bg-surface`
  - `border-zinc-200`, `border-gray-200` ➔ `border-border`
  - `text-zinc-900`, `text-gray-900` ➔ `text-text`
  - `text-zinc-500`, `text-gray-500` ➔ `text-text-muted`
  - `bg-background` ➔ `bg-bg` hoặc `bg-surface`
  - `text-foreground` ➔ `text-text`
  - `border-input` ➔ `border-border`

### Bước 3: Chuẩn hóa Typography & Form Controls (R2 & Form Batch)
- Thay thế các lớp cỡ chữ tùy ý `text-[...px]` bằng thang token:
  - `text-[10px]`, `text-[11px]` ➔ `text-caption`
  - `text-[12px]` ➔ `text-meta`
  - `text-[13px]` ➔ `text-body-sm`
  - `text-[14px]` ➔ `text-body`
  - `text-[15px]` ➔ `text-title-sm`
  - `text-[17px]`, `text-[18px]` ➔ `text-title`
- Bọc toàn bộ các bảng dữ liệu bằng component `<Table>` mới để chống tràn ngang trên iPhone.

### Bước 4: Sửa lỗi Trợ năng & Phím bấm (R5, R6, R11, R12 Batch)
- Bổ sung `aria-label` cho 11 nút icon-only (R6).
- Chuyển 6 thẻ `div/span` có `onClick` sang `<button type="button">` (R5).
- Thay thế 12 từ kỹ thuật cấm (BOM ➔ Phiếu nguyên liệu, Master Index ➔ Danh sách tổng) (R12).

---

## 3. DANH SÁCH MODULE PHÂN CHIA THEO ĐỢT DI TRÚ

| Đợt | Nhóm Module | Phạm vi File | Mục tiêu giải quyết vi phạm |
|---|---|---|---|
| **Batch 1 (Core & Layout)** | Layout & Shared Navigation | `src/components/layout/`, `src/app/(app)/layout.tsx` | 88 vi phạm |
| **Batch 2 (Catalog & Product)**| Sản phẩm, Danh mục, Kho hàng | `src/components/catalog/`, `products/`, `san-pham/` | 132 vi phạm |
| **Batch 3 (Orders & Coordinator)**| Đơn hàng, Điều phối, Báo giá | `src/components/orders/`, `coordinator/`, `the-chao/` | 79 vi phạm |
| **Batch 4 (Studio & Content)** | Creative Studio, Photo Studio, Poster | `src/components/product-photo-studio/`, `product-image-set/`, `ad-banner-poster/` | 261 vi phạm |
| **Batch 5 (CRM & Settings)** | Khách hàng, Chat, Hồ sơ, Cài đặt | `src/components/internal-chat/`, `organization/`, `profiles/` | 195 vi phạm |
| **Batch 6 (Remaining)** | Public Storefront & Platform Console | `src/components/greeting-card/`, `platform/`, `(platform)/` | 210 vi phạm |

---

## 4. TIÊU CHÍ NGHIỆM THU PHASE 3

- [ ] 100% các route nghiệp vụ hiển thị nhất quán theo chuẩn Mộc Lan Artisan Heritage.
- [ ] Không có hiện tượng tràn ngang trên màn hình iPhone (375px–430px).
- [ ] Giữ nguyên 100% API contracts, dữ liệu và phân quyền.
- [ ] `npm run lint:ux` đạt 0 vi phạm (hoặc giảm trên 95% theo ratchet).
- [ ] `npx tsc --noEmit` và bộ test tự động xanh 100%.
