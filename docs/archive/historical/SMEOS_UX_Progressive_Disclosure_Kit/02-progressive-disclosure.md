# 02 — Progressive Disclosure Rules

## 2.1. Mô hình 4 lớp

### L1 — Essential: cần ngay
Thông tin/hành động cần để bắt đầu hoặc hoàn thành tác vụ chính.
- Hiển thị mặc định.
- Ưu tiên câu chữ dễ hiểu, ít trường nhập.
- Không đặt cấu hình kỹ thuật không cần thiết ở đây.

Ví dụ công cụ tạo ảnh: vùng tải ảnh, hướng dẫn ngắn, nút “Tạo ảnh sản phẩm”, trạng thái và kết quả.

### L2 — Contextual: cần theo ngữ cảnh
Thông tin chỉ có ích với một số đầu vào hoặc tình huống.
- Chỉ xuất hiện khi có liên quan.
- Nếu điều kiện không xảy ra, không chiếm không gian.
- Giải thích vì sao cần thông tin đó nếu không hiển nhiên.

Ví dụ: lựa chọn tỷ lệ ảnh chỉ hiện khi người dùng chọn kênh đầu ra có yêu cầu tỷ lệ cụ thể.

### L3 — Advanced: nâng cao
Thiết lập ít dùng hoặc chỉ dành cho người có nhu cầu cụ thể.
- Ẩn mặc định sau nhãn rõ nghĩa như “Tùy chỉnh thêm”.
- Không dùng tên mơ hồ như “Khác” nếu nội dung là thiết lập quan trọng.
- Cho phép quay lại trạng thái cơ bản mà không mất dữ liệu hợp lệ.
- Không mặc định tất cả thiết lập nâng cao đều dành cho chuyên gia; cần kiểm tra với người dùng thực.

Ví dụ: prompt tùy chỉnh, điều chỉnh phong cách sâu, thông số đầu ra hiếm dùng.

### L4 — System-managed: hệ thống tự xử lý
Logic nội bộ và công việc có thể tự động hóa mà không cần người dùng thao tác.
- Không hiển thị các chi tiết nội bộ không giúp người dùng ra quyết định.
- Vẫn phải thể hiện trạng thái, lỗi, yêu cầu xác nhận và kết quả có ý nghĩa với người dùng.
- Các tác vụ backend phải có logging/observability phù hợp theo kiến trúc dự án.

Ví dụ: xác thực file, lưu tác vụ, xếp hàng, retry có giới hạn, lưu kết quả, kiểm tra quyền, áp dụng preset.

## 2.2. Quy trình phân loại mỗi trường/nút
Với từng trường, nút, thông báo hoặc tùy chọn:
1. Người dùng cần nó để hoàn thành tác vụ cơ bản không?
2. Nó chỉ cần trong một ngữ cảnh cụ thể không?
3. Nó chỉ cần cho nhu cầu hiếm hoặc chuyên sâu không?
4. Đây có phải việc hệ thống nên tự làm không?
5. Ẩn nó có làm người dùng hiểu sai, mất kiểm soát, bỏ lỡ chi phí/rủi ro hoặc không thể khắc phục lỗi không?
6. Có dữ liệu/bằng chứng người dùng thực sự cần nó ở lớp hiện tại không?

Ghi quyết định vào ma trận phân lớp; không phân loại chỉ dựa vào ý kiến cá nhân.

## 2.3. Quy tắc hiển thị
- Không hiển thị toàn bộ trường nâng cao ngay khi tải trang.
- Không ẩn thông tin bắt buộc để hiểu giá, điều kiện, quyền, hậu quả hoặc trạng thái.
- Giữ nhãn và vị trí tương đối nhất quán giữa các tính năng tương tự.
- Mọi vùng mở rộng phải có nhãn rõ, trạng thái mở/đóng dễ nhận biết và hoạt động bằng keyboard.
- Nếu tùy chọn nâng cao thay đổi kết quả đáng kể, hiển thị giá trị đang áp dụng hoặc tóm tắt cấu hình.
- Khi người dùng thay đổi ngữ cảnh, chỉ ẩn những trường không còn liên quan; không âm thầm xóa dữ liệu người dùng đã nhập nếu có thể giữ lại an toàn.
- Trường bắt buộc phải có lý do nghiệp vụ và thông báo lỗi gần trường đó.
- Dùng điều kiện hiển thị rõ ràng; tránh chuỗi phụ thuộc khiến giao diện khó đoán.

## 2.4. Quy tắc về mặc định
Mặc định tốt cần:
- Phù hợp với phần lớn trường hợp phổ biến đã xác minh.
- An toàn và không tạo hậu quả bất ngờ.
- Có thể thay đổi khi cần.
- Không vi phạm quyền, chính sách hoặc giới hạn của tài khoản.
- Được kiểm thử với dữ liệu thiếu, dữ liệu cũ và cấu hình khác nhau.

Nếu chưa có bằng chứng, ghi “mặc định đề xuất — cần xác minh” và kiểm thử trước khi áp dụng toàn hệ thống.

## 2.5. Ví dụ: tải ảnh → tạo ảnh → nhận kết quả
**L1:** tải ảnh, nút tạo, trạng thái, kết quả.  
**L2:** tỷ lệ hoặc kênh xuất nếu có liên quan.  
**L3:** prompt tùy chỉnh, phong cách chuyên sâu, tham số hiếm dùng.  
**L4:** kiểm tra file, tạo job, lưu trạng thái, xử lý nền, retry có giới hạn, lưu kết quả.

Trạng thái tối thiểu cần thiết:
- Chưa có ảnh.
- Đang tải ảnh.
- Ảnh đã sẵn sàng.
- Đang xử lý.
- Hoàn thành.
- Thất bại có thể thử lại.
- Thất bại cần hành động khác.
- Đã hủy (nếu hỗ trợ).

## 2.6. Ma trận quyết định
Dùng `templates/disclosure-matrix.csv` để ghi từng mục. Mọi quyết định L1/L2/L3/L4 phải có lý do ngắn gọn và cách xác minh.
