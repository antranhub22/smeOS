# 08 — UX Governance, Exceptions & Versioning

## 8.1. Vai trò
- **Product owner:** xác nhận mục tiêu nghiệp vụ, mức rủi ro và ưu tiên.
- **UX/design owner:** duy trì nguyên tắc, pattern và tính nhất quán.
- **Engineering owner:** xác nhận tính khả thi, kiến trúc và chất lượng kỹ thuật.
- **QA:** xác minh acceptance criteria và regression.
- **AI coding agent:** audit, đề xuất, triển khai trong phạm vi được giao, báo cáo bằng chứng; không tự đặt ra sự thật chưa xác minh.

Một người có thể đảm nhiệm nhiều vai trò trong nhóm nhỏ, nhưng trách nhiệm cần rõ.

## 8.2. Exit gates cho 5 giai đoạn

### Giai đoạn 1 — Audit hiện trạng
Chỉ chuyển bước khi có:
- Inventory route/screen/component.
- Báo cáo issue có bằng chứng.
- Ma trận phân lớp cho luồng cốt lõi.
- Rủi ro/phụ thuộc và khoảng trống chưa xác minh.
- Đề xuất pilot và lý do.

### Giai đoạn 2 — UX Standard
Chỉ chuyển bước khi có:
- Nguyên tắc bắt buộc và khuyến nghị.
- Quy tắc L1–L4.
- Pattern library và quy tắc ngoại lệ.
- Quy tắc mobile/accessibility.
- Acceptance criteria và checklist audit.
- Owner phê duyệt các quyết định có tác động rộng.

### Giai đoạn 3 — Component & patterns
Chỉ chuyển bước khi có:
- Inventory component hiện có.
- Quyết định reuse/extend/create.
- Component contract và states.
- Tests/tài liệu cho component pilot.
- Không có thay đổi phá vỡ ngoài phạm vi chưa được phê duyệt.

### Giai đoạn 4 — Pilot
Chỉ chuyển bước khi có:
- Một luồng đại diện được chọn dựa trên audit.
- Baseline và phương pháp đo.
- Luồng sau cải tiến được triển khai trong phạm vi pilot.
- Test/QA evidence.
- So sánh trước/sau hoặc ghi rõ vì sao chưa đủ dữ liệu.
- Quyết định rollout, sửa pilot hoặc dừng.

### Giai đoạn 5 — Rollout & governance
Hoàn tất khi có:
- Kế hoạch rollout theo nhóm tính năng.
- Checklist bắt buộc trong quy trình phát triển.
- Chủ sở hữu tiêu chuẩn.
- Cách quản lý ngoại lệ và phiên bản.
- Lịch audit lại dựa trên thay đổi/rủi ro.
- Dashboard hoặc báo cáo theo dõi khi khả thi.

## 8.3. Quản lý ngoại lệ
Mỗi ngoại lệ phải ghi:
- ID và ngày.
- Pattern/quy tắc bị ngoại lệ.
- Lý do nghiệp vụ/kỹ thuật.
- Tác động tới người dùng.
- Rủi ro và biện pháp giảm thiểu.
- Người phê duyệt.
- Thời điểm xem xét lại hoặc điều kiện hết hạn.

Không dùng ngoại lệ để né các yêu cầu về bảo mật, quyền, dữ liệu, accessibility hoặc trạng thái giao dịch quan trọng.

## 8.4. Phiên bản
Dùng semantic-like versioning cho tài liệu:
- **Major:** thay đổi nguyên tắc hoặc hợp đồng ảnh hưởng rộng.
- **Minor:** thêm pattern/quy tắc tương thích.
- **Patch:** làm rõ câu chữ hoặc sửa lỗi tài liệu.

Ghi changelog, phạm vi tác động và hướng dẫn migration nếu component contract thay đổi.

## 8.5. Đo lường
Chọn metrics phù hợp với tác vụ; không buộc mọi metric cho mọi màn hình:
- Task completion rate.
- Time on task.
- Error/validation rate.
- Abandonment rate.
- Số bước/thao tác cần thiết.
- Tỷ lệ cần trợ giúp.
- Tỷ lệ retry và tỷ lệ tác vụ hoàn thành.
- UX consistency: số biến thể không cần thiết của pattern.
- Accessibility issues theo mức độ.

### Quy tắc đo
- Xác định định nghĩa, nguồn dữ liệu và khoảng thời gian trước khi so sánh.
- Lấy baseline trước pilot khi có thể.
- Không đặt mục tiêu số học tùy tiện khi chưa có baseline.
- Không thu thập dữ liệu cá nhân không cần thiết.
- Phân biệt chỉ số thực tế với ước lượng.
- Không đánh đổi an toàn hoặc khả năng hiểu để giảm số lần nhấn.

## 8.6. Tần suất audit
Audit khi:
- Thêm một loại luồng hoặc pattern mới.
- Thay đổi lớn trong điều hướng/design system.
- Có phản hồi người dùng lặp lại hoặc lỗi nghiêm trọng.
- Sau rollout lớn.
- Định kỳ theo năng lực nhóm; chu kỳ đề xuất ban đầu là hàng quý, cần điều chỉnh theo tốc độ thay đổi và rủi ro.

## 8.7. Quy tắc chặn phát hành
Chặn hoặc yêu cầu phê duyệt rõ khi:
- Có issue P0.
- Luồng cốt lõi không thể hoàn thành.
- Trạng thái giao dịch/tác vụ bị báo sai.
- Có nguy cơ mất dữ liệu hoặc thực hiện hành động không được ủy quyền.
- Có regression nghiêm trọng.
- Không có cách xác minh yêu cầu quan trọng.
