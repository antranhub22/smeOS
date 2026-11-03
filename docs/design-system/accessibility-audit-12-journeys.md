# Quy trình kiểm trợ năng WCAG 2.2 AA trên 12 hành trình

> **Tiêu chuẩn:** WCAG 2.2 Level AA · **Trạng thái:** Chưa kiểm. Bảng kết quả (mục 3) chỉ được điền khi có người kiểm, ngày kiểm và tệp kết quả lưu trong repo.
> **Công cụ:** Playwright + `@axe-core/playwright` (`tests/e2e/ux/a11y*.spec.ts`), bàn phím, VoiceOver (macOS/iOS), NVDA (Windows).

## 1. Năm phép kiểm cho mỗi hành trình

1. **Chỉ dùng bàn phím** — `Tab`, `Shift+Tab`, `Enter`, `Space`, `Escape`, phím mũi tên đi hết hành trình, không dùng chuột.
2. **Tiêu điểm hiện rõ và không bị che** (2.4.7, 2.4.11) — vòng tiêu điểm thấy được; khi cuộn, header dính và thanh điều hướng đáy không che phần tử đang có tiêu điểm.
3. **Tương phản** (1.4.3, 1.4.11) — chữ thường ≥ 4,5:1, chữ lớn và thành phần giao diện ≥ 3:1, trên cả 3 preset `moc-lan`, `modern-slate`, `pure-swiss`, chế độ sáng và tối.
4. **Phóng 200%** (1.4.4) — không mất nội dung, không cuộn ngang hai chiều.
5. **Giảm chuyển động** (2.3.3) — với `prefers-reduced-motion: reduce`, hiệu ứng quay, nhấp nháy, chuyển cảnh dừng hoặc chuyển tức thời.

Mỗi hành trình chạy thêm quét axe tự động; mọi vi phạm `critical`/`serious` là lỗi chặn.

## 2. Mười hai hành trình

| # | Hành trình | Tuyến |
|---|---|---|
| J01 | Khách xem bộ sưu tập và đặt hàng | `/b/[sendCode]`, `/bst/[orgSlug]`, `/c/[slug]` |
| J02 | Khách nhận thiệp số và lời chúc | `/g/[id]` |
| J03 | Đăng nhập, đăng ký và dùng thử | `/dang-nhap` |
| J04 | Bảng điều khiển cửa hàng | `/` |
| J05 | Sản phẩm và định lượng | `/san-pham`, `/san-pham/[id]`, `/san-pham/tao-moi` |
| J06 | Đơn hàng và trạng thái | `/don-hang` |
| J07 | Khách hàng | `/khach-hang` |
| J08 | Điều phối chuỗi | `/dieu-phoi`, `/dieu-phoi/doi-tac` |
| J09 | Cổng đối tác gia công | `/subcontract/[orderCode]` |
| J10 | Số liệu kinh doanh | `/so-lieu` |
| J11 | Cài đặt và chính sách | `/cai-dat`, `/uu-dai`, `/tich-hop` |
| J12 | Console vận hành nền tảng | `/van-hanh` |

## 3. Kết quả

| # | Bàn phím | Tiêu điểm | Tương phản | Phóng 200% | Trình đọc màn hình | axe | Người kiểm · ngày |
|---|---|---|---|---|---|---|---|
| J01–J12 | Chưa kiểm | Chưa kiểm | Chưa kiểm | Chưa kiểm | Chưa kiểm | Chưa chạy | — |

## 4. Cơ chế trợ năng có trong mã

| Cơ chế | Vị trí |
|---|---|
| Thông báo cho trình đọc màn hình | `LiveRegionProvider` trong `src/components/layout/app-shell.tsx` |
| Quản lý lớp nổi (modal, drawer, bottom sheet) | `src/components/layout/floating-layer.tsx` |
| Luật lint nút chỉ có icon phải có nhãn (R6), hiệu ứng phải có `motion-reduce` (R23) | `scripts/ux-lint/` — R23 còn 96 vi phạm trong baseline |
| Chưa có | `scroll-padding` cho header dính (2.4.11); thay điều khiển HTML thô — còn 1.009 `<button>` và 636 `<input>` ngoài `src/components/ui/` |
