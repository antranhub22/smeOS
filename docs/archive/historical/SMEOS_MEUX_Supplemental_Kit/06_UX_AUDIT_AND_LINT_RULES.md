# 06 — UX Audit & Lint Rules

## 1. Mục tiêu

Tạo cách audit nhất quán cho trang, component và luồng nghiệp vụ; phân biệt vấn đề thị giác, vấn đề tương tác, vấn đề accessibility và lỗi nghiệp vụ.

## 2. Mức độ nghiêm trọng

- **P0 — Critical:** Rủi ro an toàn, bảo mật, mất dữ liệu, thao tác phá hủy không có bảo vệ hoặc chặn luồng cốt lõi.
- **P1 — High:** Người dùng khó hoàn thành tác vụ chính, thông tin quan trọng bị ẩn, hành động chính không rõ, lỗi accessibility ảnh hưởng lớn.
- **P2 — Medium:** Nhiễu thị giác đáng kể, nội dung lặp, cấu trúc không nhất quán hoặc tăng số bước không cần thiết.
- **P3 — Low:** Chi tiết thẩm mỹ nhỏ, không ảnh hưởng đáng kể đến khả năng sử dụng.

## 3. Quy tắc audit

### IA-01 — Task clarity
- Câu hỏi: Người dùng có nhận ra nhiệm vụ chính nhanh chóng không?
- Mức mặc định: P1 nếu tác vụ chính không thể nhận biết; P2 nếu chỉ hơi mơ hồ.

### VH-01 — Visual hierarchy
- Kiểm tra tiêu đề, nội dung chính, hành động chính và hành động phụ có phân cấp rõ không.
- P1 nếu gây thao tác sai hoặc cản trở tác vụ; nếu không, P2/P3.

### ID-01 — Redundant copy
- Phát hiện tiêu đề, mô tả, badge hoặc helper text lặp thông tin.
- Không tự động xóa copy; xác nhận nó không mang ý nghĩa pháp lý, nghiệp vụ hoặc hướng dẫn.

### ID-02 — Excessive containers
- Phát hiện card/box lồng nhau hoặc đường viền không tạo ý nghĩa cấu trúc.
- Đề xuất bỏ/đơn giản hóa, không tự động áp dụng trên toàn hệ thống.

### PD-01 — Progressive disclosure
- Tìm tùy chọn nâng cao, hướng dẫn dài hoặc nhóm ít dùng luôn chiếm diện tích.
- Xác nhận khả năng tìm thấy và không ẩn thông tin thiết yếu.

### CU-01 — Context relevance
- Kiểm tra trường và lựa chọn có phù hợp với chế độ/trạng thái hiện tại không.
- Kiểm tra việc chuyển chế độ có làm mất dữ liệu không.

### AC-01 — Accessibility
- Kiểm tra label, keyboard, focus, contrast, semantic markup, accessible name, error association và zoom/responsive.

### CO-01 — Component consistency
- Tìm component trùng lặp, custom style không cần thiết, token bị hardcode và pattern không thống nhất.

### ST-01 — State completeness
- Kiểm tra loading, empty, error, disabled, success, permission denied và trạng thái dữ liệu thiếu khi liên quan.

### ACPT-01 — Action predictability
- Hành động destructive phải có phân cấp phù hợp, xác nhận khi cần và thông báo hậu quả.
- Không dùng màu hoặc vị trí duy nhất để phân biệt hành động.

### RESP-01 — Responsive behavior
- Kiểm tra các viewport được hỗ trợ, overflow, sticky elements, overlay và form dài.

### MEAS-01 — Evidence
- Mỗi finding phải có vị trí, bằng chứng, tác động, mức độ, đề xuất và phương pháp xác minh.

### VD-01 — Visual layout consistency
- Kiểm tra shell điều hướng, page header và workspace có nhất quán với module cùng loại không.
- Phân loại: P1 nếu bố cục cản trở tác vụ; P2 nếu tạo nhầm lẫn/không nhất quán đáng kể; P3 nếu chỉ là khác biệt thẩm mỹ nhỏ.

### VD-02 — Excessive surface decoration
- Kiểm tra card, border, shadow, nền và container lồng nhau có mục đích rõ không.
- Không tự động xóa; xác nhận ý nghĩa cấu trúc và trạng thái tương tác trước.

### VD-03 — Primary action hierarchy
- Kiểm tra hành động chính có dễ nhận biết và không bị nhiều hành động phụ cạnh tranh không.

### VD-04 — Page archetype fit
- Kiểm tra trang có dùng pattern phù hợp với dashboard, list, detail, form, builder hoặc settings/integration không.

### VD-05 — Reference comparison
- Nếu có ảnh tham chiếu, ghi nhận các thuộc tính cần học và review theo `10_VISUAL_REFERENCE_REVIEW_CHECKLIST.md`; không yêu cầu sao chép pixel-for-pixel.

## 4. UX lint tự động và review thủ công

### Có thể kiểm tra tự động khi codebase hỗ trợ
- Lint accessibility/semantic markup.
- Hardcoded color/spacing nếu dự án có token policy.
- Dùng component không chuẩn hoặc import sai pattern.
- Duplicate component/style trong phạm vi có thể phát hiện.
- Một số vi phạm quy tắc CSS/JSX có thể xác định chắc chắn.

### Cần review thủ công hoặc kiểm thử
- Mật độ thông tin có phù hợp với nhiệm vụ.
- Nội dung nào nên thu gọn.
- Hành động chính có dễ nhận biết.
- Cấu trúc thông tin có dễ quét.
- Progressive disclosure có làm chức năng khó tìm.
- Một thay đổi có cải thiện hiệu quả thật hay không.

Không xây dựng lint rule dựa trên heuristic chủ quan nếu chưa đánh giá false positives. Quy tắc tự động phải có mô tả, phạm vi, ví dụ đúng/sai, cách sửa và cơ chế ngoại lệ.

## 5. Mẫu finding

- ID:
- Trang/component:
- Quy tắc:
- Bằng chứng:
- Tác động tới người dùng/nghiệp vụ:
- Mức độ:
- Đề xuất:
- Phạm vi ảnh hưởng:
- Cách kiểm chứng:
- Ngoại lệ (nếu có):
