# Từ điển thuật ngữ UI (03c UX-026)

Một khái niệm — một cách gọi. Cột "Không dùng" là đầu vào cho lint R16 (`scripts/ux-lint/rules-pd.ts`, danh sách `GLOSSARY_BANNED`). R16 hiện tự động bắt: Worker, render, job, P\d; các dòng trạng thái tác vụ do R14 + `task-state.ts` thực thi.

| Khái niệm | Dùng | Không dùng trên UI |
|---|---|---|
| Tác vụ đang chạy | Đang xử lý | Đang chạy, processing, running |
| Tác vụ đang chờ | Đang chờ xử lý | Trong hàng đợi, queued, pending |
| Tác vụ hoàn tất | Đã xong | Completed, done, succeeded |
| Tác vụ thất bại | Chưa xong được | Lỗi hệ thống, failed, error |
| Thiết lập nâng cao | Tùy chỉnh thêm | Khác, Advanced, Nâng cao (đứng một mình) |
| Đơn vị tính AI | credit (thuật ngữ sản phẩm đã thiết lập — xem ghi chú luật R12 trong `scripts/ux-lint/rules.ts`) | Token, lượt, tín dụng |
| Mã tra cứu lỗi | Mã hỗ trợ | Request ID, trace ID |
| Máy xử lý nền | hệ thống (hoặc bỏ hẳn) | Worker |
| Dựng video/ảnh | Dựng, Đang dựng video | render, Render |
| Tác vụ | tác vụ (hoặc bỏ mã) | job |
| Bước duyệt | tên bước nghiệp vụ: Duyệt kịch bản, Duyệt video | P1, P2 … P9 |

Bổ sung từ mới: PR cập nhật bảng này + lint R16 trong cùng commit.
