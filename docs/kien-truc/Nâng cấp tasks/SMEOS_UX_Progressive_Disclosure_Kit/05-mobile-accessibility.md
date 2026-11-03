# 05 — Mobile, Responsive & Accessibility

## 5.1. Mobile-first thực tế
- Xác minh các viewport đại diện từ repository/analytics; nếu chưa có dữ liệu, đề xuất bộ viewport thử nghiệm và ghi rõ là giả định.
- Không gây tràn ngang toàn trang ngoài trường hợp có chủ đích và có phương án sử dụng.
- Các hành động chính phải dễ chạm và không đặt quá sát nhau.
- Giữ CTA chính dễ tìm trên màn hình nhỏ; không che nội dung hoặc trạng thái quan trọng.
- Tránh modal quá cao, nhiều lớp modal hoặc form yêu cầu cuộn khó kiểm soát.
- Với bảng rộng, cân nhắc chuyển thành danh sách/card hoặc cung cấp cách xem chi tiết; không tự động thu nhỏ chữ đến mức khó đọc.
- Test bàn phím ảo, safe areas, xoay màn hình nếu phù hợp và nội dung dài.
- Không phụ thuộc hover để truy cập chức năng.

## 5.2. Accessibility
Dùng WCAG 2.2 AA làm mục tiêu tham chiếu phù hợp, đồng thời xác minh yêu cầu pháp lý/kinh doanh thực tế nếu có.
- HTML semantic và cấu trúc heading hợp lý.
- Label rõ ràng cho trường nhập.
- Tất cả thao tác quan trọng có thể dùng keyboard.
- Focus visible và thứ tự focus hợp lý.
- Thông báo lỗi gắn với trường tương ứng.
- Trạng thái bất đồng bộ được thông báo cho công nghệ trợ giúp khi phù hợp.
- Không dùng màu sắc duy nhất để truyền đạt trạng thái.
- Kiểm tra tương phản văn bản và thành phần giao diện.
- Hình ảnh có alternative text phù hợp; hình trang trí dùng cách xử lý semantic phù hợp.
- Dialog/accordion có tên, vai trò, trạng thái và hành vi focus đúng.
- Tôn trọng reduced motion khi dùng chuyển động.

## 5.3. Chuyển động và hiệu ứng
- Chuyển động chỉ hỗ trợ phản hồi, định hướng hoặc quan hệ nhân quả.
- Không dùng animation dài để che thời gian chờ.
- Cung cấp trạng thái tĩnh/giảm chuyển động khi phù hợp.
- Không làm mất khả năng thao tác trong lúc hiệu ứng diễn ra.

## 5.4. Mạng yếu và khôi phục
- Hiển thị trạng thái khi yêu cầu đang gửi hoặc chưa xác định được kết quả.
- Tránh tạo yêu cầu trùng do double-click hoặc retry.
- Giữ dữ liệu nhập trong phạm vi an toàn và phù hợp quyền riêng tư.
- Không tuyên bố đã lưu nếu server chưa xác nhận.
- Kiểm tra điều hướng đi/đến trong lúc tác vụ đang chạy.

## 5.5. Kiểm thử tối thiểu
- Mobile viewport nhỏ, trung bình và lớn.
- Desktop viewport phổ biến.
- Keyboard-only cho luồng chính.
- Trạng thái lỗi/validation.
- Loading chậm và phản hồi lỗi mạng mô phỏng.
- Focus, label, thông báo trạng thái.
- Kiểm tra zoom/phóng to nếu có thể.
