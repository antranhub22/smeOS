# 03 — Progressive Disclosure & Contextual UI

## 1. Mục tiêu

Giảm lượng thông tin xuất hiện cùng lúc bằng cách tổ chức giao diện theo nhu cầu và trạng thái người dùng, nhưng vẫn giữ tính dễ tìm, khả năng dự đoán và toàn vẹn dữ liệu.

## 2. Chọn đúng pattern

| Pattern | Dùng khi | Tránh khi |
|---|---|---|
| Inline expand / accordion | Tùy chọn phụ thuộc cùng một nhóm nội dung | Người dùng phải so sánh liên tục nhiều nhóm đang bị ẩn |
| Drawer | Chỉnh sửa phụ hoặc xem chi tiết mà cần giữ ngữ cảnh trang | Tác vụ quan trọng cần so sánh nhiều thông tin toàn màn hình |
| Modal | Xác nhận hoặc tác vụ ngắn, tập trung | Biểu mẫu dài, nhiều bước hoặc cần tham chiếu dữ liệu nền |
| Tabs | Các nhóm nội dung ngang cấp, người dùng thường chuyển qua lại | Tabs che giấu một quy trình bắt buộc theo thứ tự |
| Wizard/stepper | Quy trình có thứ tự hoặc phụ thuộc dữ liệu giữa các bước | Người dùng có thể hoàn thành tác vụ trong một màn hình đơn giản |
| Tooltip | Giải thích ngắn, không thiết yếu | Nội dung hướng dẫn bắt buộc, lỗi hoặc điều kiện quan trọng |
| Advanced settings | Cấu hình ít dùng hoặc dành cho người có kinh nghiệm | Cấu hình ảnh hưởng lớn đến chi phí, bảo mật hoặc kết quả nhưng không dễ nhận biết |

## 3. Quy tắc bắt buộc

- **MUST:** Nhãn mở rộng phải nói rõ người dùng sẽ thấy hoặc làm gì.
- **MUST:** Có dấu hiệu trạng thái mở/đóng và hỗ trợ bàn phím.
- **MUST:** Việc mở/đóng không được xóa dữ liệu đã nhập.
- **MUST:** Khi đổi chế độ, không âm thầm loại bỏ cấu hình hiện tại; nếu không thể giữ, cảnh báo và yêu cầu xác nhận.
- **MUST:** Không đặt thông tin quan trọng duy nhất trong tooltip.
- **SHOULD:** Giữ các lựa chọn cơ bản hiển thị và đặt phần nâng cao dưới “Tùy chọn nâng cao”, “Tùy chỉnh” hoặc nhãn cụ thể hơn.
- **SHOULD:** Nhớ trạng thái mở/đóng trong phiên nếu điều đó giúp công việc và không gây bất ngờ.
- **MUST:** Nếu một trường trở nên không liên quan do lựa chọn khác, xử lý giá trị cũ theo quy tắc nghiệp vụ rõ ràng: giữ, xóa có cảnh báo, hoặc yêu cầu người dùng quyết định.

## 4. Áp dụng vào công cụ tạo landing page

Ví dụ cấu trúc tham khảo, cần điều chỉnh theo logic thực tế của SMEOS:

### Mặc định
- Chọn sản phẩm.
- Chọn mục tiêu/trang đích.
- Chọn chế độ tạo (AI tự động hoặc tự thiết kế).
- Một nút hành động chính.

### Tùy chỉnh
- Video giới thiệu.
- Ghi chú định hướng nội dung.
- Phong cách catalog.
- Các tùy chọn nội dung bổ sung.

### Nâng cao (nếu sản phẩm thực sự hỗ trợ)
- SEO, tracking, cấu hình chuyển đổi, tùy chỉnh section hoặc các thiết lập chuyên sâu.

Không mặc định tất cả tùy chọn phải ẩn. Nếu video hoặc ghi chú là đầu vào thường dùng và ảnh hưởng đáng kể đến chất lượng kết quả, hãy giữ một trường tóm tắt hiển thị hoặc cung cấp một cách mở rõ ràng.

## 5. Contextual UI — điều kiện hiển thị

Với mỗi trường hoặc nhóm tùy chọn, tài liệu hóa:
- Điều kiện hiển thị.
- Điều kiện vô hiệu hóa.
- Giá trị mặc định.
- Điều xảy ra với dữ liệu đã nhập khi điều kiện thay đổi.
- Trạng thái lỗi và thông báo.
- Khả năng truy cập bằng bàn phím/screen reader.

Ví dụ:
- Khi chọn “AI tự động”, hiển thị đầu vào và cấu hình dành cho AI.
- Khi chọn “Tự thiết kế”, hiển thị cấu hình thủ công.
- Khi chuyển qua lại, giữ dữ liệu tương thích; không âm thầm mất dữ liệu.

## 6. Khả năng tìm thấy (discoverability)

- **MUST:** Người dùng có thể nhận ra còn tùy chọn nâng cao mà không phải đoán.
- **SHOULD:** Dùng nhãn cụ thể thay cho “Khác” hoặc “Thêm”.
- **SHOULD:** Với cấu hình quan trọng, hiển thị tóm tắt trạng thái ngay cả khi phần cấu hình đang đóng.
- **MUST NOT:** Ẩn một chức năng thường dùng chỉ để làm màn hình đẹp hơn nếu làm tăng đáng kể số bước hoặc khiến người dùng khó tìm.
