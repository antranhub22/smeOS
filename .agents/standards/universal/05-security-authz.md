# 05 · Bảo mật, phân quyền & nhật ký cho SaaS nhiều tenant

## 1. Cách ly tenant
1. ID tenant **chỉ** lấy từ phiên phía server — không từ body/query/header.
2. Truy cập tài nguyên tenant khác → **404**, không 403 (không lộ sự tồn tại).
3. Mọi bảng thuộc tenant có cột tenant + index; repository dùng helper gắn điều kiện tenant (`scopedWhere`).
4. Quan hệ chéo tenant (chuỗi ↔ đối tác, chat nội bộ, giao việc) chỉ qua liên kết **ACTIVE** đã xác minh; kiểm chủ sở hữu trước khi đổi trạng thái liên kết.

## 2. Phân quyền
- Kiểm bằng **mã năng lực (capability)**, không theo tên vai trò UI.
- Ba lớp cắt theo thứ tự: mặc định theo vai → công tắc của tổ chức → **trần cứng** cắt sau cùng.
- Quyền nền tảng (operator) là bộ mã riêng, không trộn với mã tenant.
- **Test kiến trúc quét mọi route**: route không gọi gác quyền phải nằm trong danh sách miễn trừ kèm lý do; danh sách chỉ được co lại.
- Cấp tài khoản cho đối tác: mật khẩu ngẫu nhiên mỗi tài khoản, trả **một lần**; không mật khẩu dùng chung.

## 3. Đầu vào & đầu ra
| Mối nguy | Biện pháp |
|---|---|
| SSRF khi server tải URL | Chỉ `https` + host công khai, **không theo redirect**, trần kích thước — một helper dùng chung |
| XSS qua URL ảnh | Allowlist scheme (`blob:`, `data:image`, `http(s)`, đường dẫn app) + mã hoá ký tự `<>"'` |
| Prompt injection | Dữ liệu người dùng vào prompt dạng JSON string, giới hạn độ dài, đánh dấu là dữ liệu |
| ReDoS | Giới hạn độ dài đầu vào trước regex; tránh lượng từ lồng nhau |
| Lạm dụng tạo tài nguyên | Rate limit theo IP cho đăng ký/dùng thử; giới hạn độ dài trường; mã tham chiếu (vd. ngành) phải tồn tại trong registry |
| Webhook giả mạo | Kiểm chữ ký HMAC trên **raw body** trước khi đọc bất kỳ trường nào; thiếu bí mật → **fail closed**; chống replay bằng timestamp |
| Cron/endpoint nội bộ | Bí mật riêng, so sánh hằng thời gian |
| Bí mật lưu DB (token nhà cung cấp) | Mã hoá AES-GCM, khoá dẫn xuất theo **mục đích** (HKDF) từ khoá chủ |
| CSP | Bắt đầu Report-Only + endpoint nhận báo cáo → chuyển sang chặn khi sạch |

## 4. Nhật ký (audit)
- Bắt buộc: thay đổi cấu hình quản trị, quyền, xoá vĩnh viễn, **mọi xuất dữ liệu**, thao tác của operator nền tảng.
- Ghi trước/sau; xoá vĩnh viễn ghi log **trong cùng transaction**; không ghi giá trị tìm kiếm hay dữ liệu cá nhân thừa.
- Test kiến trúc: mọi route xuất dữ liệu phải gọi hàm audit.

## 5. Quy trình
- Quét tĩnh (CodeQL), quét bí mật (gitleaks) trong CI; dương tính giả → allowlist có lý do.
- Mỗi finding có mã (AUD-xxx), mức P0–P3; P0/P1 sửa trước khi phát hành.

## 6. Lỗi thường gặp
- Route mới thêm từ nhánh khác chỉ gọi lấy tenant, quên kiểm capability.
- Đổi trạng thái liên kết chéo tenant theo `id` mà không kiểm chủ sở hữu.
- Token xác minh webhook có giá trị mặc định cứng trong code.
- Ẩn nút trên UI thay cho kiểm quyền server.
