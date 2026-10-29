# 07 — Acceptance Criteria & Rollout

## 1. Tiêu chí nghiệm thu tài liệu

- [ ] Agent đã xác định tài liệu UX hiện có và source of truth.
- [ ] Có mapping giữa quy tắc hiện tại, phần giữ nguyên, phần sửa và phần bổ sung.
- [ ] Không có hai quy tắc mâu thuẫn mà không có quyết định giải quyết.
- [ ] Các quy tắc được phân loại MUST/SHOULD/MAY.
- [ ] Có ví dụ, anti-pattern và cách kiểm tra cho quy tắc quan trọng.
- [ ] Có liên kết từ tài liệu tổng quan đến tài liệu chi tiết.
- [ ] Có lịch sử thay đổi và ghi rõ các quyết định chưa giải quyết.

## 2. Tiêu chí nghiệm thu triển khai UI

- [ ] Không làm mất chức năng hoặc dữ liệu nghiệp vụ.
- [ ] Hành động chính và trạng thái được nhận diện rõ.
- [ ] Nội dung lặp hoặc trang trí dư thừa được xử lý có lý do.
- [ ] Tùy chọn nâng cao được tổ chức phù hợp mà vẫn dễ tìm.
- [ ] Trạng thái mở/đóng hoặc đổi chế độ không làm mất dữ liệu âm thầm.
- [ ] Dùng component và token hiện có khi phù hợp.
- [ ] Responsive behavior được kiểm tra.
- [ ] Accessibility checks được chạy và kết quả được ghi lại.
- [ ] Unit/component/integration/e2e tests liên quan đã chạy theo khả năng dự án.
- [ ] Không có regression nghiêm trọng ở các luồng liền kề.

## 2A. Tiêu chí nghiệm thu thị giác (VDLS)
- [ ] Trang đã được phân loại theo page archetype phù hợp.
- [ ] Shell, header và điều hướng nhất quán với module tương tự hoặc có lý do cho ngoại lệ.
- [ ] Vùng làm việc chính có ưu tiên hợp lý.
- [ ] Card, border, shadow và nền chỉ được dùng khi tạo ý nghĩa.
- [ ] Copy không lặp và không có khối giới thiệu dư thừa.
- [ ] Hành động chính dễ tìm nhưng không làm giảm khả năng truy cập hành động phụ.
- [ ] Ảnh trước/sau được so sánh ở viewport và trạng thái tương đương nếu có thể.
- [ ] Checklist visual review đã được hoàn thành; các ngoại lệ được ghi nhận.
- [ ] Người phụ trách đã duyệt pilot trước rollout diện rộng.

## 3. Đo lường

Trước khi thay đổi diện rộng, ghi nhận baseline nếu có thể:
- Thời gian hoàn thành tác vụ.
- Tỷ lệ hoàn thành.
- Số lỗi hoặc lần thử lại.
- Số bước/nhấp chuột cần thiết.
- Tỷ lệ người dùng tìm thấy chức năng.
- Phản hồi định tính từ người dùng.

Không đặt mục tiêu số cụ thể khi chưa có baseline hoặc dữ liệu phù hợp. Nếu chưa thể đo, ghi rõ giới hạn và dùng kiểm thử tác vụ định tính.

## 4. Rollout

1. Chọn một trang đại diện có đủ độ phức tạp, ví dụ công cụ tạo landing page.
2. Tạo prototype hoặc nhánh thử nghiệm.
3. Review cùng người phụ trách nghiệp vụ/UX.
4. Kiểm thử luồng chính, luồng lỗi và responsive.
5. Chốt pattern/component dùng lại.
6. Áp dụng theo module, không chạy thay đổi diện rộng thiếu kiểm soát.
7. Theo dõi regression và cập nhật tiêu chuẩn dựa trên bằng chứng.

## 4A. Thí điểm và visual regression
- Thí điểm một trang đại diện trước khi thay đổi shell hoặc component dùng chung.
- Chọn trang phù hợp; không mặc định mọi module phải giống một screenshot tham chiếu.
- Nếu có screenshot testing, so sánh ở viewport, dữ liệu và trạng thái ổn định.
- Review mọi khác biệt hình ảnh trước khi cập nhật baseline.
- Screenshot diff không thay thế kiểm thử tác vụ, accessibility hoặc business logic.

## 5. Bảo vệ thay đổi

- Không sửa/xóa tài liệu gốc trước khi tạo bản sao lưu hoặc dùng version control.
- Không đổi kiến trúc frontend/backend ngoài phạm vi UX nếu chưa được phê duyệt.
- Không thêm dependency mới nếu không chứng minh được nhu cầu.
- Không thay đổi logic nghiệp vụ để thuận tiện cho giao diện.
- Không thực hiện migration hoặc thao tác phá hủy dữ liệu trong nhiệm vụ chuẩn hóa UX.
- Các thay đổi có phạm vi lớn phải được chia thành commit nhỏ, có thể review và rollback.
