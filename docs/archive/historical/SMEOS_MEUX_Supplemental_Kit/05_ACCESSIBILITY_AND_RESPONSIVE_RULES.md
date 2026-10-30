# 05 — Accessibility & Responsive UX

## 1. Nguyên tắc

Tối giản không được làm giảm khả năng tiếp cận. Khi repository đã có tiêu chuẩn accessibility, dùng tiêu chuẩn đó làm nguồn chính và bổ sung liên kết, không tạo bộ quy định mâu thuẫn.

Mục tiêu tham chiếu nên là WCAG 2.2 AA nếu phù hợp với phạm vi sản phẩm và yêu cầu tổ chức; agent phải xác minh khả năng áp dụng và không tuyên bố tuân thủ nếu chưa kiểm thử đầy đủ.

## 2. Checklist

- **MUST:** Mọi thao tác quan trọng sử dụng được bằng bàn phím.
- **MUST:** Focus state rõ ràng, không bị che khuất hoặc loại bỏ không có thay thế.
- **MUST:** Label được liên kết với trường nhập liệu; placeholder không phải label duy nhất.
- **MUST:** Lỗi được mô tả bằng văn bản và liên kết với trường liên quan khi phù hợp.
- **MUST:** Trạng thái không chỉ được truyền đạt bằng màu.
- **MUST:** Tên accessible của nút/icon button phản ánh hành động.
- **MUST:** Dialog/drawer có quản lý focus hợp lý, đóng được theo quy ước phù hợp và trả focus về vị trí khởi tạo.
- **MUST:** Nội dung quan trọng không bị cắt khi phóng to hoặc tăng cỡ chữ trong các trường hợp được hỗ trợ.
- **SHOULD:** Hỗ trợ reduced motion nếu có chuyển động.
- **SHOULD:** Cung cấp vùng nhấn đủ lớn theo tiêu chuẩn mục tiêu và loại thiết bị.
- **MUST:** Không dùng tooltip hover làm cách duy nhất để truy cập nội dung trên thiết bị cảm ứng hoặc bàn phím.

## 3. Responsive

- **MUST:** Xác định các viewport/breakpoint được hỗ trợ từ sản phẩm thực tế.
- **MUST:** Tránh tràn ngang ngoài các khu vực mà cuộn ngang là hợp lý, như bảng dữ liệu rộng.
- **MUST:** Hành động chính vẫn tìm được trên viewport nhỏ.
- **MUST:** Drawer, modal, popover và sticky bar không che nội dung hoặc thao tác thiết yếu.
- **SHOULD:** Trên màn hình nhỏ, thay đổi cấu trúc và thứ tự ưu tiên thay vì chỉ thu nhỏ toàn bộ UI desktop.
- **SHOULD:** Dùng danh sách/card thay cho bảng chỉ khi cải thiện tác vụ; không tự động biến mọi bảng thành card.
- **MUST:** Kiểm tra trạng thái loading, empty, error và dữ liệu dài ở viewport nhỏ.

## 4. Bằng chứng

Agent cần báo cáo:
- Công cụ tự động đã chạy.
- Kiểm tra thủ công đã thực hiện.
- Các trường hợp chưa kiểm tra.
- Lỗi còn lại và mức độ nghiêm trọng.

Không được xem việc chạy một accessibility scanner là bằng chứng đầy đủ cho WCAG compliance.
