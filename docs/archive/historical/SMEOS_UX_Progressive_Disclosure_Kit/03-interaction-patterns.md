# 03 — Interaction Pattern Library

## 3.1. Quy tắc chung cho mọi pattern
Mỗi pattern phải mô tả:
- Mục tiêu và trường hợp sử dụng.
- Khi nào không nên dùng.
- Luồng cơ bản.
- Trạng thái mặc định, loading, success, empty, error và disabled.
- Hành vi desktop/mobile.
- Accessibility và keyboard.
- Hành vi dữ liệu khi người dùng rời trang/quay lại.
- Logging/analytics cần thiết nếu phù hợp.
- Acceptance criteria và test cases.

## 3.2. Danh mục pattern chuẩn

### UX-P01 — Upload & Generate
Tải đầu vào → xác thực → một hành động chính → xử lý → kết quả.
- Không cho chạy nếu đầu vào bắt buộc chưa hợp lệ.
- Hiển thị loại file/kích thước/giới hạn trước hoặc tại thời điểm cần.
- Phân biệt upload và xử lý nếu là hai giai đoạn khác nhau.
- Không báo thành công trước khi backend xác nhận.
- Có thay ảnh, thử lại hoặc tạo lại phù hợp với nghiệp vụ.

### UX-P02 — Smart Form
- Chỉ hỏi thông tin cần thiết cho tác vụ hiện tại.
- Tự điền dữ liệu đáng tin cậy đã có và người dùng được phép sử dụng.
- Nhóm trường theo ý nghĩa nghiệp vụ, không theo cấu trúc database.
- Hiển thị validation gần trường, giữ dữ liệu sau lỗi.
- Nếu form dài, chia bước theo nhiệm vụ thực sự; tránh chia bước chỉ để tạo cảm giác ngắn.

### UX-P03 — Progressive Settings
- Nhóm cài đặt cơ bản và nâng cao.
- Mặc định đóng phần nâng cao.
- Nhãn phải nói rõ người dùng sẽ tìm thấy gì.
- Giữ các lựa chọn đã nhập khi đóng/mở.
- Nếu lựa chọn nâng cao làm thay đổi chi phí, thời gian hoặc đầu ra đáng kể, phải thông báo.

### UX-P04 — Background Task
- Tạo task với ID/trạng thái bền vững theo kiến trúc hiện có.
- Người dùng có thể rời màn hình nếu nghiệp vụ cho phép.
- Khi quay lại, hiển thị trạng thái mới nhất.
- Có trạng thái pending/queued/running/succeeded/failed/canceled nếu phù hợp.
- Tránh polling quá mức; dùng cơ chế hiện có hoặc lựa chọn phù hợp với stack.
- Xác định retry, timeout, idempotency và xử lý tác vụ trùng theo yêu cầu kỹ thuật.
- Không để UI tự giả lập trạng thái hoàn thành.

### UX-P05 — Result & Next Action
- Kết quả là trọng tâm.
- Hiển thị hành động tiếp theo phổ biến như tải xuống, dùng kết quả, chỉnh sửa hoặc tạo lại.
- Không làm người dùng phải quay về màn hình đầu nếu có thể tiếp tục ngay.
- Phân biệt kết quả bản nháp với kết quả đã xuất bản/gửi đi.

### UX-P06 — Error Recovery
- Nói điều gì xảy ra, người dùng có thể làm gì tiếp theo.
- Tránh chỉ hiển thị mã lỗi nội bộ.
- Giữ dữ liệu hợp lệ.
- Chỉ hiển thị “Thử lại” khi retry hợp lý.
- Nếu cần hỗ trợ, cung cấp mã tham chiếu an toàn, không lộ dữ liệu nhạy cảm.

### UX-P07 — Confirmation
- Dùng cho hành động có hậu quả lớn, khó hoàn tác, gửi ra ngoài hoặc tạo chi phí đáng kể.
- Không thêm hộp xác nhận cho mọi thao tác nhỏ.
- Nội dung xác nhận phải nêu hành động và hậu quả rõ ràng.
- Với xóa hoặc thay đổi quan trọng, cân nhắc undo/soft delete nếu nghiệp vụ cho phép.

### UX-P08 — Empty State
- Nêu trạng thái hiện tại.
- Giải thích hành động đầu tiên có ích.
- Có CTA phù hợp nếu người dùng có thể tiến hành.
- Không dùng minh họa trang trí thay cho hướng dẫn cần thiết.

### UX-P09 — Search & Filter
- Hiển thị tìm kiếm và bộ lọc phổ biến trước.
- Bộ lọc nâng cao nằm trong vùng mở rộng.
- Hiển thị số lượng bộ lọc đang áp dụng và cách xóa chúng.
- Không xóa bộ lọc hoặc truy vấn bất ngờ khi người dùng chuyển chế độ hiển thị.

### UX-P10 — Bulk Actions
- Chỉ hiện hành động phụ thuộc lựa chọn khi có mục được chọn.
- Hiển thị số lượng mục được chọn.
- Làm rõ phạm vi hành động.
- Với thao tác phá hủy hoặc không thể hoàn tác, áp dụng confirmation phù hợp.

## 3.3. Ưu tiên triển khai
Ưu tiên theo mức độ phổ biến và tác động trong audit thực tế. Thông thường bắt đầu từ Upload & Generate, Smart Form, Background Task, Result & Next Action và Error Recovery nếu chúng phù hợp với sản phẩm.
