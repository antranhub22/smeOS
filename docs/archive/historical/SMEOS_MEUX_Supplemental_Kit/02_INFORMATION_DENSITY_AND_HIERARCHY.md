# 02 — Information Density & Visual Hierarchy

## 1. Mục tiêu

Tối ưu lượng thông tin hữu ích trên mỗi màn hình mà không làm tăng tải nhận thức. Không đặt mục tiêu tối đa hóa số thành phần trên màn hình; mục tiêu là tối đa hóa khả năng quét, hiểu và hoàn thành tác vụ.

## 2. Phân tầng nội dung

Mỗi trang nên phân loại nội dung thành:

- **Primary:** nội dung/hành động trực tiếp phục vụ nhiệm vụ chính.
- **Secondary:** thông tin giúp lựa chọn hoặc hoàn thành nhiệm vụ.
- **Tertiary:** hướng dẫn, giải thích, tùy chọn nâng cao hoặc nội dung ít dùng.
- **System status:** trạng thái tải, thành công, lỗi, cảnh báo, đồng bộ hoặc quyền truy cập.

Quy tắc:
- **MUST:** Primary phải dễ nhận diện hơn Secondary và Tertiary.
- **MUST:** System status xuất hiện gần đối tượng hoặc hành động liên quan.
- **SHOULD:** Tertiary được chuyển thành trợ giúp theo ngữ cảnh, accordion, drawer hoặc vùng nâng cao nếu không cần liên tục hiển thị.
- **MUST NOT:** Thu gọn trạng thái lỗi, cảnh báo rủi ro, thông tin tài chính hoặc điều kiện quan trọng.

## 3. Quy tắc bố cục

- **MUST:** Mỗi vùng nội dung có mục đích rõ ràng; tránh container lồng nhau chỉ để tạo khung.
- **SHOULD:** Dùng khoảng cách và typography trước khi thêm đường viền để tạo phân cấp.
- **SHOULD:** Dùng danh sách hoặc bảng cho dữ liệu cần so sánh; dùng card khi từng mục là một đơn vị độc lập có hành động hoặc nội dung trực quan đáng kể.
- **SHOULD:** Hạn chế nhiều vùng có nền tương phản mạnh cùng xuất hiện trong một viewport.
- **MUST:** Hành động chính phải ở vị trí dự đoán được và không bị lẫn với hành động phụ.
- **SHOULD:** Với biểu mẫu dài, nhóm trường theo mục tiêu nghiệp vụ, chia bước chỉ khi giúp giảm độ phức tạp thực sự.

## 4. Mô tả và nhãn

- Tiêu đề nên nêu tên tác vụ hoặc đối tượng.
- Mô tả chỉ giải thích điều mà tiêu đề không thể truyền đạt.
- Placeholder là ví dụ nhập liệu, không thay thế label.
- Trợ giúp đặt gần trường hoặc hành động liên quan.
- Không lặp lại tên chức năng trong nhiều nhãn liên tiếp nếu ngữ cảnh đã rõ.
- Dùng ngôn ngữ cụ thể, tránh các câu quảng bá như “trải nghiệm mạnh mẽ, chuyên nghiệp, tối ưu toàn diện” trong màn hình nghiệp vụ nếu không giúp người dùng thực hiện tác vụ.

## 5. Baseline định lượng để audit nội bộ

Các giá trị dưới đây là **heuristics ban đầu**, không phải chuẩn phổ quát. Agent phải ghi nhận baseline thực tế của dự án và điều chỉnh khi có lý do.

- Mỗi màn hình nghiệp vụ nên có một hành động chính nổi bật, hoặc ghi rõ vì sao có nhiều hành động ngang cấp.
- Nếu một vùng có từ 3 câu mô tả trở lên, kiểm tra xem có thể rút gọn hoặc chuyển trợ giúp vào ngữ cảnh không.
- Nếu một trang có từ 3 tầng container lồng nhau trở lên, kiểm tra xem có cấu trúc nào dư thừa không.
- Nếu cùng một trạng thái hoặc thông tin xuất hiện ở nhiều nơi, kiểm tra tính cần thiết và nguồn dữ liệu.
- Nếu người dùng phải cuộn qua nhiều khối giải thích trước khi chạm tới đầu vào chính, đánh dấu cần review.
- Nếu có hơn 7 lựa chọn ngang cấp, cân nhắc nhóm, tìm kiếm, lọc, phân loại hoặc mặc định hợp lý; không tự động cắt giảm lựa chọn.

Không dùng các heuristic này làm lint lỗi cứng nếu chưa được xác nhận phù hợp với module.

## 6. Typography và spacing

- **MUST:** Dùng scale typography và spacing tokens hiện có.
- **MUST NOT:** Đặt kích thước tùy ý trong từng màn hình nếu token chuẩn đáp ứng.
- **SHOULD:** Dùng cỡ chữ, độ đậm và khoảng cách nhất quán để biểu đạt cấp bậc.
- **MUST:** Nội dung chính vẫn đọc được ở mức zoom và kích thước viewport được hỗ trợ.
- **MUST NOT:** Thu nhỏ font toàn cục chỉ để hiển thị nhiều thông tin hơn.

## 7. Kiểm tra nhanh

- Nhìn trong 5 giây có hiểu trang dùng để làm gì không?
- Hành động chính có dễ nhận biết không?
- Có đoạn mô tả nào chỉ lặp lại điều hiển nhiên không?
- Có container nào chỉ bao quanh một container khác mà không thêm ý nghĩa không?
- Có thể quét các lựa chọn và trạng thái mà không đọc từng đoạn không?
- Nội dung quan trọng có bị đẩy xuống dưới bởi phần giới thiệu không?
