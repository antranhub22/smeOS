# Checklist nghiệm thu — Catalog PDF

## Repository / triển khai
- [ ] Agent đã audit stack, scripts, cấu trúc và thư viện PDF hiện có.
- [ ] Có ghi lại quyết định kiến trúc và trade-off.
- [ ] Build/lint/test chạy được hoặc có báo cáo lỗi môi trường.

## Design
- [ ] T01 Editorial, T02 Minimal, T03 Premium Lookbook khác nhau rõ về art direction.
- [ ] Logo, màu và typography thương hiệu nhất quán.
- [ ] Layout phù hợp ngành hàng và mật độ dữ liệu.
- [ ] Không có style chỉ là đổi màu của layout giống nhau.

## Data
- [ ] Đổi style không sửa dữ liệu sản phẩm.
- [ ] Giá, currency, unit được tách.
- [ ] Field tùy chọn rỗng không sinh nhãn rỗng.
- [ ] Không tự tạo giá/mô tả/thông số/ảnh để bù dữ liệu.
- [ ] Product inactive không xuất mặc định.

## PDF
- [ ] PDF mở được và đúng kích thước trang.
- [ ] Tiếng Việt và font không lỗi; font nhúng khi license cho phép.
- [ ] Không overflow/overlap ngoài ý muốn.
- [ ] Không có trang trắng bất ngờ.
- [ ] Ảnh không méo và crop không làm mất chủ thể quan trọng.
- [ ] Link hoạt động; QR target hợp lệ và quét được.
- [ ] Metadata không chứa secrets/debug data.
- [ ] Digital PDF được tối ưu dung lượng hợp lý.

## Edge cases
- [ ] Tên sản phẩm dài.
- [ ] Mô tả dài.
- [ ] Thiếu ảnh chính.
- [ ] Thiếu ảnh phụ.
- [ ] Giá trống.
- [ ] Attributes trống.
- [ ] Nhiều variants.
- [ ] Ảnh dọc và ảnh ngang.
- [ ] Số sản phẩm lẻ.
- [ ] Danh mục dài qua nhiều trang.

## Tài liệu bàn giao
- [ ] Hướng dẫn chạy và tạo catalog mẫu.
- [ ] Hướng dẫn thêm style.
- [ ] Hướng dẫn thêm layout.
- [ ] Có fixtures và test cases lặp lại được.
- [ ] Báo cáo nêu rõ phần hoàn thành, phần chưa làm và hạn chế.
