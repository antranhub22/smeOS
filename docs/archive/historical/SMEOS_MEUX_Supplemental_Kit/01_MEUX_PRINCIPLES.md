# 01 — SMEOS Minimalist Enterprise UX Principles

## 1. Mục tiêu

MEUX là phần mở rộng định hướng cho tiêu chuẩn UX hiện hành của SMEOS. Mục tiêu là giảm tải nhận thức và nhiễu thị giác trong khi vẫn bảo toàn khả năng nghiệp vụ, độ chính xác, khả năng khám phá tính năng và hiệu quả thao tác.

MEUX không đồng nghĩa với “ít chữ bằng mọi giá”, “mọi thứ phải phẳng”, hoặc “mọi màn hình đều phải giống nhau”. Màn hình quản trị dữ liệu có thể cần mật độ cao; màn hình tạo nội dung cần ưu tiên xem trước và lựa chọn trực quan.

## 2. Nguyên tắc cốt lõi

### P1. Task-first
- **MUST:** Mỗi trang xác định được nhiệm vụ chính của người dùng.
- **MUST:** Có một hành động chính rõ ràng khi trang có một mục tiêu hoàn thành cụ thể.
- **SHOULD:** Đưa dữ liệu và thao tác cần thiết cho nhiệm vụ lên vùng đầu tiên người dùng nhìn thấy.
- **MUST NOT:** Để nội dung giới thiệu dài chiếm ưu thế hơn tác vụ chính trong công cụ nội bộ.

### P2. Hierarchy before decoration
- **MUST:** Phân biệt rõ tiêu đề trang, nhóm nội dung, trường dữ liệu, hành động chính và hành động phụ bằng cấu trúc, typography và khoảng cách.
- **SHOULD:** Dùng nền, đường viền, bóng và màu nhấn có chủ đích, không dùng đồng loạt cho mọi container.
- **MUST NOT:** Dùng icon, badge hoặc màu sắc chỉ để trang trí nếu chúng làm tăng nhiễu.

### P3. Progressive disclosure
- **MUST:** Tùy chọn nâng cao, nội dung hướng dẫn dài và cấu hình ít dùng phải được cân nhắc để thu gọn hoặc hiển thị theo nhu cầu.
- **MUST:** Không giấu thông tin thiết yếu cho quyết định, chi phí, dữ liệu mất mát hoặc hành động không thể đảo ngược.
- **SHOULD:** Giữ lại lựa chọn đã nhập khi người dùng mở/đóng phần tùy chỉnh.

### P4. Contextual UI
- **MUST:** Chỉ hiển thị lựa chọn có liên quan đến chế độ, trạng thái hoặc lựa chọn hiện tại.
- **MUST:** Trạng thái ẩn/hiện không được làm mất dữ liệu đã nhập.
- **SHOULD:** Khi một lựa chọn làm thay đổi các trường tiếp theo, cung cấp tín hiệu ngắn gọn về điều đã thay đổi.

### P5. High information value, low visual noise
- **MUST:** Mỗi thành phần hiển thị phải có vai trò nhận biết, quyết định, thao tác, trạng thái hoặc hỗ trợ.
- **SHOULD:** Ưu tiên nhãn ngắn, dữ liệu có thể quét nhanh, bảng/danh sách khi phù hợp và mô tả theo ngữ cảnh.
- **MUST NOT:** Lặp lại cùng thông tin trong tiêu đề, mô tả, badge và trợ giúp nếu không có lý do.

### P6. Consistency by system
- **MUST:** Tái sử dụng component và design tokens đã được chuẩn hóa.
- **MUST NOT:** Tạo biến thể giao diện riêng nếu component hiện có đáp ứng yêu cầu.
- **SHOULD:** Bổ sung component/pattern vào thư viện và tài liệu trước hoặc cùng lúc với việc áp dụng diện rộng.

### P7. Accessibility and clarity
- **MUST:** Không giảm độ tương phản, khả năng đọc, khả năng điều hướng bàn phím hoặc khả năng nhận biết trạng thái để đạt vẻ ngoài tối giản.
- **MUST:** Trạng thái không được truyền đạt chỉ bằng màu sắc.
- **SHOULD:** Dùng ngôn ngữ ngắn, cụ thể, hướng hành động; tránh thuật ngữ kỹ thuật với người dùng nghiệp vụ nếu không cần thiết.

### P8. Measure, don't assume
- **MUST:** Đánh giá thay đổi dựa trên tác vụ và bằng chứng, không chỉ dựa vào cảm nhận “đẹp hơn”.
- **SHOULD:** Theo dõi thời gian hoàn thành tác vụ, tỷ lệ hoàn thành, lỗi, số bước, khả năng tìm thấy chức năng và phản hồi người dùng.
- **MUST:** Không xóa chức năng hoặc thông tin nghiệp vụ chỉ để làm màn hình gọn hơn nếu chưa đánh giá tác động.

## 3. Quy tắc quyết định cho từng thành phần

Với mỗi phần tử UI, hỏi:
1. Người dùng cần biết điều gì?
2. Người dùng cần quyết định hoặc làm gì?
3. Có cần nhìn thấy ngay không?
4. Có thể hiển thị khi người dùng yêu cầu mà không gây khó tìm không?
5. Có component chuẩn hiện hữu phù hợp không?
6. Việc ẩn/thu gọn có ảnh hưởng khả năng truy cập, an toàn, tuân thủ hoặc tính toàn vẹn dữ liệu không?

## 4. Không được tối giản theo cách gây hại

- Không thay nhãn rõ nghĩa bằng icon khó đoán.
- Không ẩn phí, điều kiện, cảnh báo, lỗi hoặc trạng thái quan trọng.
- Không dùng tooltip làm nơi duy nhất chứa hướng dẫn thiết yếu.
- Không buộc người dùng nhớ thông tin ở màn hình trước để hoàn thành bước sau.
- Không dùng quá nhiều modal/drawer khiến người dùng mất ngữ cảnh.
- Không làm giảm kích thước vùng nhấn để nhét thêm thành phần.
