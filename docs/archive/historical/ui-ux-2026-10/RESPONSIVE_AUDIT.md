# RESPONSIVE & MOBILE VIEWPORT AUDIT (SMEOS)

> Tài liệu thực hiện trong khuôn khổ **Phase 1: UI/UX Standardization & Runtime UI System**.  
> Đánh giá khả năng thích ứng trên điện thoại di động (đặc biệt iPhone iOS Safari), máy tính bảng và màn hình desktop.  
> Phân loại rõ: **[Xác minh]** (đã chứng minh qua code), **[Rủi ro code]** (tiềm ẩn từ CSS/Layout), **[Cần test browser/thiết bị thật]**.

---

## 1. TỔNG QUAN HẠ TẦNG RESPONSIVE HIỆN TẠI

Hệ thống SMEOS đã có một số điểm sáng về tư duy Mobile-First rất đáng khen ngợi:
1. **Thanh điều hướng kép thích ứng (Dual Adaptive Navigation) [Xác minh]**:
   - Màn hình `>= 768px` (md): Hiển thị sidebar `DesktopNav` cố định bên trái (hỗ trợ thu gọn 56px hoặc mở 240px).
   - Màn hình `< 768px`: Tự động ẩn sidebar, kích hoạt thanh điều hướng đáy `BottomNav` cố định và nút Menu mở ngăn kéo `MobileNavDrawer`.
2. **Xử lý Safe Areas (Tai thỏ & Thanh vuốt Home iPhone) [Xác minh]**:
   - `BottomNav` có `pb-[env(safe-area-inset-bottom)]`.
   - Vùng nội dung chính trong `src/app/(app)/layout.tsx` được thiết lập: `pb-[calc(4.5rem+env(safe-area-inset-bottom))] md:pb-0`, giúp nội dung trang không bị che khuất bởi thanh điều hướng đáy trên iPhone 12/13/14/15/16.
3. **Chống phóng to ngoài ý muốn trên iOS Safari [Xác minh]**:
   - Tại `src/app/globals.css` dòng 329–336 đã có cấu hình:
     ```css
     @media screen and (max-width: 767px) {
       input:not([type="checkbox"]):not([type="radio"]):not([type="range"]),
       select,
       textarea {
         font-size: 16px !important;
       }
     }
     ```
     Điều này ngăn chặn iOS Safari tự động zoom trang vào ô input khi focus (vấn đề kinh điển gây xô lệch layout trên web di động).

---

## 2. CÁC RỦI RO & VẤN ĐỀ TRÊN MOBILE (IPHONE & ANDROID)

### 2.1. Nguy cơ tràn ngang (Horizontal Overflow) [Rủi ro code]
- **Các bảng dữ liệu nghiệp vụ (Data Tables)**:
  - Bảng danh sách đơn hàng, bảng lịch sử cọc, bảng đối chiếu BOM trong các module quản trị có nhiều cột thông tin (Mã đơn, Tên khách, Số điện thoại, Ngày hẹn, Tổng tiền, Trạng thái, Thao tác).
  - Một số file dùng `min-w-[600px]` hoặc `min-w-[800px]` mà quên bọc thẻ cha bằng `overflow-x-auto w-full`. Trên màn hình iPhone (chiều rộng 375px–393px), điều này sẽ đẩy toàn bộ khung nhìn bị tràn ngang nếu không có thanh cuộn cục bộ.
- **Thanh Tab điều hướng dài (Horizontal Tab Scrolling)**:
  - Một số trang cấu hình (`/ho-so`, `/cua-hang`) có từ 5–7 tab ngang. Nếu không có lớp `overflow-x-auto whitespace-nowrap scrollbar-none`, các tab này sẽ bị rớt dòng lộn xộn hoặc tràn ra ngoài mép màn hình.

### 2.2. Chiều cao Modal / Dialog trên Mobile Viewport [Rủi ro code]
- Trong `src/components/ui/dialog.tsx`:
  - Thẻ `Popup` được đặt `max-h-[90vh]`.
  - Trên trình duyệt Safari di động, thanh địa chỉ URL bar và thanh công cụ dưới đáy thường co giãn khi cuộn (hiện tượng 100vh vs 100dvh).
  - Nếu sử dụng `90vh` thay vì `90dvh`, modal khi bật bàn phím ảo (virtual keyboard) có thể bị che mất nút "Lưu" hoặc "Xác nhận" ở chân footer.
  - Cần nâng cấp sang đơn vị Dynamic Viewport: `max-h-[90dvh]` hoặc `max-h-[calc(100dvh-2rem)]`.

### 2.3. Vấn đề Touch Targets (Diện tích chạm cảm ứng) [Xác minh & Rủi ro]
- **Nút bấm chính**: Đạt chuẩn (44px và 48px).
- **Icon buttons và Table action icons**:
  - Tại một số component danh sách đơn hàng hoặc thẻ sản phẩm, các icon "Sửa", "Xóa", "Copy link" được định cỡ `w-6 h-6` hoặc `w-7 h-7` kèm padding `p-1` (tổng vùng bấm ~28–32px).
  - Vi phạm khuyến nghị WCAG 2.5.5 (Target Size tối thiểu 44×44px hoặc 24×24px kèm khoảng đệm 8px). Trên ngón tay người dùng hoa hoặc thợ tại tiệm (ngón tay to hoặc ướt), việc chạm chính xác các nút này rất khó khăn.

### 2.4. Khóa cuộn màn hình nền khi mở Drawer/Modal [Cần test browser thật]
- Khi mở `MobileNavDrawer` hoặc các Dialog trên iOS Safari, nếu không có cơ chế `body-scroll-lock` chuẩn xác, người dùng khi vuốt nội dung modal có thể vô tình kích hoạt hiện tượng "cuộn kép" (vừa cuộn modal vừa cuộn trang nền phía sau).
- Cần xác minh hành vi này trên thiết bị iOS Safari thật ở giai đoạn kiểm thử.

---

## 3. CHECKLIST ĐÁNH GIÁ THEO THIẾT BỊ

| Hạng mục kiểm tra | Desktop (>= 1024px) | Tablet (768px - 1023px) | Mobile (375px - 430px) | Trạng thái hiện tại |
|---|---|---|---|---|
| **Điều hướng (Nav)** | Sidebar 240px / 56px | Sidebar thu gọn / Drawer | BottomNav 5 nút cố định | Đạt chuẩn [Xác minh] |
| **Không tràn ngang (No overflow-x)** | Tốt | Thỉnh thoảng có bảng rộng | Có nguy cơ ở các trang báo cáo | Cần bọc `overflow-x-auto` [Rủi ro code] |
| **Bàn phím ảo không che input** | N/A | Tốt | Đã set 16px chống zoom | Đạt chuẩn [Xác minh] |
| **Touch target >= 44x44px** | Tốt (dùng chuột) | Tương đối | Thiếu ở action icon nhỏ | Cần mở rộng click area [Rủi ro code] |
| **Khoảng đệm Bottom Safe Area** | Tự nhiên | Tự nhiên | Đã có `safe-area-inset-bottom` | Đạt chuẩn [Xác minh] |
| **Bento Grid thích ứng** | Lưới 3-4 cột | Lưới 2 cột | Lưới 1 cột dọc | Đạt chuẩn [Xác minh] |
| **Ảnh tràn viền Studio** | Tỷ lệ đẹp | Tỷ lệ đẹp | Cần kiểm tra độ co giãn dọc | Cần test browser thật |

---

## 4. KẾT LUẬN & ĐỀ XUẤT CHO PHASE 2 & 3

1. **Chuẩn hóa Container**: Tạo chuẩn `PageContainer` có padding responsive: `px-4 sm:px-6 lg:px-8 py-4 sm:py-6`.
2. **Chuẩn hóa Responsive Table Wrapper**: Tạo component `<DataTableContainer>` luôn tự động thêm `overflow-x-auto` và viền mềm mại, kèm chỉ báo cuộn ngang nếu bảng vượt quá chiều rộng màn hình.
3. **Mở rộng Touch Padding**: Cho mọi nút icon nhỏ trên mobile bằng cách bọc vùng chạm vô hình (hit slop) tối thiểu 44×44px.
