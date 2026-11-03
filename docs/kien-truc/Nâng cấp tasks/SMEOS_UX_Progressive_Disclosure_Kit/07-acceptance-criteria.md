# 07 — Acceptance Criteria & Definition of Done

## 7.1. Điều kiện nghiệm thu chung
Một thay đổi UX chỉ được coi là hoàn tất khi:
- Mục tiêu và luồng chính được mô tả.
- Thông tin được phân lớp L1–L4.
- Mọi trường/nút quan trọng có mục đích rõ.
- Trạng thái cần thiết đã được triển khai, không chỉ thiết kế tĩnh.
- Hành vi desktop/mobile được kiểm tra.
- Accessibility cơ bản được kiểm tra.
- Test phù hợp chạy thành công hoặc có giới hạn được ghi nhận.
- Không phát sinh regression trong luồng liên quan.
- Có bằng chứng nghiệm thu.
- Tài liệu/pattern liên quan được cập nhật.

## 7.2. Acceptance criteria — Upload & Generate
- Given chưa có đầu vào hợp lệ, when người dùng chưa tải file, then hành động tạo bị ngăn hoặc hướng dẫn tải file rõ ràng.
- Given file không hợp lệ, then hệ thống giải thích vấn đề và yêu cầu tiếp theo.
- Given file hợp lệ, when người dùng kích hoạt tạo, then yêu cầu được gửi một cách an toàn và trạng thái được phản hồi.
- Given tác vụ đang chạy, then giao diện không giả vờ hoàn thành và không khóa các phần không liên quan.
- Given người dùng rời màn hình rồi quay lại, then trạng thái được khôi phục nếu nghiệp vụ hỗ trợ.
- Given backend xác nhận thành công, then kết quả và hành động tiếp theo được hiển thị.
- Given tác vụ thất bại, then lỗi có thể hiểu được, dữ liệu hợp lệ được giữ và retry được cung cấp khi an toàn.
- Given người dùng nhấn nhiều lần, then không tạo tác vụ trùng ngoài ý muốn.
- Given mobile viewport, then luồng chính không tràn ngang và các nút có vùng chạm phù hợp.

## 7.3. Acceptance criteria — Progressive Settings
- Thiết lập nâng cao đóng mặc định nếu không cần cho tác vụ phổ biến.
- Người dùng có thể hiểu nhãn mở rộng trước khi mở.
- Đóng/mở không làm mất giá trị đã nhập.
- Các trường có điều kiện chỉ xuất hiện khi có liên quan.
- Thay đổi có tác động lớn đến kết quả/chi phí được thông báo phù hợp.
- Keyboard và trạng thái mở/đóng hoạt động đúng.

## 7.4. Acceptance criteria — Background Task
- Trạng thái UI phản ánh nguồn sự thật backend.
- Có xử lý pending/running/succeeded/failed theo khả năng hệ thống.
- Có hành vi timeout/retry được xác định.
- Không tuyên bố thành công nếu không có xác nhận.
- Điều hướng/reload không làm mất liên kết đến tác vụ nếu yêu cầu sản phẩm cần khôi phục.
- Có bảo vệ phù hợp với double-submit/idempotency.
- Không lộ dữ liệu nội bộ hoặc thông tin nhạy cảm trong lỗi/log phía client.

## 7.5. Kiểm thử
Ưu tiên:
- Unit tests cho logic component/validation.
- Integration tests cho luồng request/state.
- E2E cho luồng cốt lõi.
- Visual regression khi hệ thống đã có nền tảng phù hợp.
- Manual accessibility review và keyboard testing.
- Kiểm thử trên thiết bị thật cho các vấn đề mobile quan trọng.

Không tuyên bố đã chạy test nếu chưa chạy. Ghi chính xác lệnh, kết quả và giới hạn môi trường.

## 7.6. Definition of Done
- [ ] Acceptance criteria đạt.
- [ ] Không còn lỗi P0/P1 chưa được xử lý hoặc chấp thuận chính thức.
- [ ] Test liên quan chạy qua.
- [ ] Có bằng chứng kiểm tra mobile.
- [ ] Trạng thái và error recovery được kiểm tra.
- [ ] Tài liệu được cập nhật.
- [ ] Ngoại lệ đã được ghi nhận.
- [ ] Có xác nhận của người chịu trách nhiệm khi cần.
