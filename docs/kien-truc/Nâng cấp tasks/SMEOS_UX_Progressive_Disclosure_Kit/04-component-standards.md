# 04 — Component Standards

## 4.1. Mục tiêu
Biến nguyên tắc UX thành các component/pattern có thể tái sử dụng, thay vì để mỗi tính năng tự xây lại hành vi.

## 4.2. Nguyên tắc
- Trước khi tạo component mới, tìm component tương đương trong repository.
- Ưu tiên mở rộng component hiện có nếu không làm hỏng các use case.
- Không tạo design system thứ hai song song nếu dự án đã có một hệ thống chuẩn.
- Component dùng chung không được nhúng business logic đặc thù không cần thiết.
- Tách trạng thái UI khỏi trạng thái backend theo kiến trúc hiện có.
- Component phải hỗ trợ loading, disabled, error, empty và success khi có liên quan.
- Không thay đổi API public của component hàng loạt nếu chưa audit các nơi sử dụng.
- Không thêm thư viện mới nếu khả năng hiện có đáp ứng được, trừ khi có lý do và được phê duyệt.

## 4.3. Component cần kiểm kê
- Primary/secondary/tertiary button.
- Upload/dropzone và file preview.
- Form field, validation, help text.
- Disclosure/accordion/collapsible settings.
- Progress/status indicator.
- Background task list hoặc task status panel.
- Result panel và action group.
- Toast/inline alert/error summary.
- Empty state.
- Confirmation dialog.
- Search/filter panel.
- Responsive table/list.
- Loading skeleton.
- Tooltip/help affordance.

Đây là danh sách kiểm kê mục tiêu, không phải yêu cầu phải tạo tất cả nếu dự án không cần.

## 4.4. Hợp đồng component
Mỗi component/pattern quan trọng phải ghi:
1. Tên và mục tiêu.
2. Props/input và giá trị mặc định.
3. Event/callback.
4. Các trạng thái hỗ trợ.
5. Hành vi keyboard/focus/semantic.
6. Responsive behavior.
7. Error behavior.
8. Quy tắc dữ liệu và bảo mật liên quan.
9. Các trường hợp không được sử dụng.
10. Unit/integration/visual tests phù hợp.

## 4.5. Trạng thái tối thiểu cho tác vụ bất đồng bộ
- `idle`: chưa bắt đầu.
- `validating`: đang kiểm tra đầu vào nếu có bước này.
- `submitting`: đang gửi yêu cầu tạo tác vụ.
- `queued`: đã nhận, đang chờ.
- `running`: đang xử lý.
- `succeeded`: backend xác nhận hoàn tất.
- `failed`: thất bại.
- `canceled`: đã hủy, nếu được hỗ trợ.

Không phải mọi tác vụ đều cần mọi trạng thái. Mapping trạng thái backend sang UI phải được ghi rõ, không suy diễn trạng thái thành công từ timeout hoặc phản hồi không rõ ràng.

## 4.6. Quy tắc chất lượng
- Tránh layout shift khi hiển thị lỗi hoặc kết quả.
- Không dùng màu sắc làm tín hiệu duy nhất.
- Nút phải có nhãn rõ; icon-only cần accessible name/tooltip phù hợp.
- Tránh trạng thái disabled không giải thích được lý do khi lý do đó có thể cung cấp hữu ích.
- Không khóa toàn bộ giao diện khi chỉ một vùng đang xử lý.
- Không đưa dữ liệu nhạy cảm vào URL, log phía client hoặc thông báo lỗi.

## 4.7. Quy trình thêm component mới
1. Ghi use case và khoảng trống của component hiện tại.
2. Tìm nơi sử dụng tương tự.
3. Đề xuất API và states.
4. Thêm tests và tài liệu.
5. Thử nghiệm trong một use case pilot.
6. Kiểm tra regression.
7. Chỉ sau đó mới mở rộng sử dụng.
