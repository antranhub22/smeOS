# 01 — SMEOS UX Principles

## 1.1. Mục tiêu sản phẩm
SMEOS giúp chủ cửa hàng hoa hoàn thành nghiệp vụ nhanh chóng, kể cả khi không am hiểu công nghệ. Người dùng tập trung vào kết quả kinh doanh; hệ thống chịu trách nhiệm xử lý độ phức tạp kỹ thuật phía sau.

## 1.2. Các nguyên tắc bắt buộc

### P01 — Outcome over configuration
Thiết kế xoay quanh kết quả người dùng muốn đạt được, không xoay quanh danh sách tính năng hoặc thông số kỹ thuật.
- Ưu tiên: “Tạo ảnh sản phẩm”, “Tạo báo giá”, “Tạo link bán hàng”.
- Tránh bắt người dùng lựa chọn model AI, prompt, thông số render hoặc cấu hình nội bộ nếu không cần thiết.

### P02 — One primary action
Mỗi màn hình/tác vụ nên có một hành động chính nổi bật. Hành động phụ được phân cấp về thị giác.
- Không đồng nghĩa mọi màn hình chỉ có đúng một nút.
- Nếu có nhiều hành động chính ngang nhau vì nghiệp vụ, hãy chia luồng hoặc làm rõ thứ tự.

### P03 — Progressive disclosure
Hiển thị thông tin và chức năng theo nhu cầu, kinh nghiệm, ngữ cảnh và mức độ rủi ro. Không đưa mọi tùy chọn lên màn hình đầu tiên.

### P04 — Smart defaults
Dùng mặc định an toàn, có ích và có thể giải thích. Tận dụng cấu hình cửa hàng đã lưu nếu người dùng có quyền và dữ liệu còn hợp lệ.
- Không tự chọn mặc định cho quyết định có hậu quả đáng kể nếu thiếu căn cứ.
- Cho biết lựa chọn mặc định khi nó ảnh hưởng đáng kể đến kết quả.

### P05 — Automate the routine
Tự động hóa việc lặp lại và kỹ thuật hóa khi có thể: nhận diện định dạng, lưu tiến trình, áp dụng thương hiệu, kiểm tra dữ liệu, retry có kiểm soát.
- Không tự động thực hiện hành động bên ngoài có hậu quả cao nếu chưa có ủy quyền/confirmation phù hợp.

### P06 — Make system status visible
Người dùng phải biết hệ thống đang chờ gì, đang làm gì, đã hoàn tất hay gặp lỗi gì. Không che trạng thái quan trọng chỉ vì muốn giao diện “đơn giản”.

### P07 — Recover without starting over
Giữ lại đầu vào và dữ liệu hợp lệ khi có thể. Lỗi phải có thông điệp dễ hiểu và hành động khắc phục cụ thể.

### P08 — Familiar language
Dùng ngôn ngữ nghiệp vụ của chủ cửa hàng. Tránh jargon như “payload”, “job queue”, “token”, “endpoint” trong giao diện người dùng.

### P09 — Consistency before novelty
Cùng một hành vi nên có cách thể hiện nhất quán trên toàn SMEOS. Không tạo biến thể chỉ vì sở thích thẩm mỹ.

### P10 — Mobile-first in real conditions
Thiết kế cho thao tác một tay, màn hình nhỏ, mạng không ổn định và bối cảnh người dùng đang làm việc tại cửa hàng.

### P11 — Accessible by default
Đảm bảo cấu trúc semantic, focus, keyboard, tương phản, nhãn form, thông báo trạng thái và hỗ trợ công nghệ trợ giúp.

### P12 — Evidence-based improvement
Không tuyên bố UX tốt hơn chỉ vì giao diện trông sạch hơn. Đánh giá bằng kiểm thử tác vụ, lỗi, thời gian, mức độ hoàn thành và phản hồi người dùng.

## 1.3. Nguyên tắc không được hiểu sai
- “Đơn giản” không có nghĩa là xóa các thông tin cần để ra quyết định.
- “Một nút” không có nghĩa là bỏ qua xác nhận an toàn.
- “Chạy background” không có nghĩa là người dùng không biết tác vụ đang diễn ra.
- “Tự động” không có nghĩa là hệ thống được phép tự thực hiện mọi hành động.
- “Ẩn nâng cao” không có nghĩa là làm cho tính năng không thể tìm thấy.
- Không dùng progressive disclosure để che giấu phí, điều khoản, rủi ro, quyền riêng tư, trạng thái thanh toán hoặc hậu quả không thể hoàn tác.

## 1.4. Phân loại rủi ro
1. **Thấp:** có thể thử lại hoặc hoàn tác dễ dàng, ví dụ tạo bản nháp ảnh.
2. **Trung bình:** ảnh hưởng dữ liệu/chi phí nhưng có thể phục hồi, ví dụ tạo nhiều biến thể tốn quota.
3. **Cao:** thanh toán, gửi thông tin ra ngoài, xóa dữ liệu, xuất bản công khai, thay đổi quyền hoặc hành động khó hoàn tác.

Mức xác nhận và mức tự động hóa phải tỷ lệ với rủi ro. Agent phải phát hiện và ghi rõ các hành động thuộc nhóm trung bình/cao trong audit.

## 1.5. Thuật ngữ
- **Progressive Disclosure:** hiển thị từng lớp thông tin/chức năng theo nhu cầu.
- **Primary action:** hành động chính của tác vụ.
- **Smart default:** lựa chọn mặc định có căn cứ.
- **Background task:** tác vụ tiếp tục xử lý mà không bắt người dùng giữ nguyên màn hình.
- **Pattern:** giải pháp UX đã được mô tả và chuẩn hóa để tái sử dụng.
- **Component contract:** định nghĩa đầu vào, trạng thái, hành vi, lỗi, accessibility và điều kiện nghiệm thu của component.
- **Exit Gate:** điều kiện phải đạt trước khi chuyển giai đoạn.
