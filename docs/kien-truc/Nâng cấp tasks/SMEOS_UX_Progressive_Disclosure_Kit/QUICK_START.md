# Quick Start — Dùng bộ SMEOS UX Standard với Antigravity

## Cách dùng an toàn (khuyến nghị)
1. Mở repository SMEOS trong Antigravity.
2. Tạo branch riêng cho công việc UX standardization hoặc xác nhận working tree sạch; không xóa thay đổi hiện có.
3. Giải nén bộ tài liệu này vào repository, hoặc yêu cầu agent hợp nhất nội dung vào `docs/ux-standard/`.
4. Mở `ANTIGRAVITY_MASTER_PROMPT.md`.
5. Dán prompt vào Antigravity.
6. Cho agent thực hiện Giai đoạn 1 — Audit hiện trạng trước.
7. Đọc báo cáo, chốt pilot và phê duyệt Giai đoạn 2.
8. Chỉ tiếp tục code khi tiêu chuẩn và phạm vi pilot đã rõ.

## Nếu muốn agent tự động chạy đủ 5 giai đoạn
Chỉ dùng khi bạn đã chấp nhận rủi ro và có branch/backup. Sửa đoạn trong prompt về Exit Gates để cho phép tự động chuyển giai đoạn khi gate đạt, nhưng vẫn yêu cầu:
- Không thay đổi phạm vi rủi ro cao không được phê duyệt.
- Không bỏ qua kiểm thử.
- Không tuyên bố thành công khi chưa xác minh.
- Dừng khi có P0, mất dữ liệu, thay đổi kiến trúc lớn hoặc yêu cầu quyền/secret.
- Báo cáo và commit theo chính sách dự án; không tự push/deploy nếu chưa được cho phép.

**Khuyến nghị:** dù agent có thể tự thực hiện các bước kỹ thuật, hãy giữ phê duyệt giữa Giai đoạn 1 và 2, và trước khi rollout diện rộng.
