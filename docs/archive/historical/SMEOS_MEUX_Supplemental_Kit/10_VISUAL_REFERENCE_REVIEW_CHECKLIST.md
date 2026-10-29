# 10 — Visual Reference Review & Comparison Checklist

## Mục đích

Dùng khi có ảnh tham chiếu hoặc khi review trước/sau để xác định thay đổi có tiến gần định hướng SMEOS hay không. Đây là checklist đánh giá có cấu trúc, không phải thang điểm khoa học đã được xác thực.

## 1. Chuẩn bị so sánh
- Chụp trước/sau ở cùng viewport, zoom và trạng thái.
- Dùng cùng dữ liệu mẫu nếu có thể.
- Ghi lại trạng thái responsive và vai trò người dùng.
- Không so sánh trang khác nhiệm vụ như thể chúng cần giống nhau.

## 2. Các chiều đánh giá

Chấm từng chiều:
- **0:** Không đạt / có vấn đề rõ.
- **1:** Đạt một phần.
- **2:** Đạt tốt.
- **N/A:** Không áp dụng, kèm lý do.

| Chiều | Câu hỏi |
|---|---|
| Task clarity | Có hiểu trang dùng để làm gì nhanh chóng không? |
| Visual hierarchy | Tiêu đề, nội dung chính và hành động có phân cấp rõ không? |
| Information density | Có nhiều thông tin hữu ích mà không gây quá tải không? |
| Visual noise | Có card, viền, màu, icon hoặc mô tả dư thừa không? |
| Navigation consistency | Điều hướng và page shell nhất quán với module tương tự không? |
| Primary action | Hành động chính có dễ tìm và dễ hiểu không? |
| Contextual relevance | Các lựa chọn có phù hợp trạng thái/chế độ hiện tại không? |
| Discoverability | Tùy chọn nâng cao có dễ tìm mà không chiếm diện tích không? |
| Accessibility | Keyboard, focus, label, contrast và semantic behavior có được đảm bảo không? |
| Responsive | Nội dung và hành động còn dùng được ở viewport được hỗ trợ không? |
| Workflow integrity | Tác vụ, quyền và thông tin nghiệp vụ có được giữ nguyên không? |

Không chỉ cộng điểm tổng. Một lỗi nghiêm trọng về accessibility, mất dữ liệu hoặc nghiệp vụ không thể được bù bằng điểm thẩm mỹ.

## 3. Bắt buộc ghi nhận finding
Mỗi finding:
- ID.
- Ảnh/URL/trang và viewport.
- Chiều đánh giá.
- Điểm hoặc trạng thái.
- Bằng chứng quan sát được.
- Tác động đến người dùng.
- Đề xuất.
- Mức độ ưu tiên.
- Cách xác minh sau sửa.

## 4. Visual regression

Nếu dự án có screenshot testing:
- Chọn các trang đại diện và trạng thái ổn định.
- Chuẩn hóa viewport, font, dữ liệu và trạng thái tải.
- Chỉ cập nhật baseline sau khi review thay đổi có chủ đích.
- Phân biệt thay đổi hình ảnh mong đợi với regression ngoài ý muốn.
- Không xem screenshot diff là bằng chứng đầy đủ về UX hoặc accessibility.

Nếu chưa có hạ tầng, agent có thể đề xuất triển khai thử nghiệm nhưng không tự thêm dependency lớn mà chưa được duyệt.
