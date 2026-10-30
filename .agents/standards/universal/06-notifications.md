# 06 · Thông báo đa tầng, đa kênh

## 1. Mô hình
- **Danh mục sự kiện khai báo trong code** theo tầng sở hữu (nền tảng / ngành / chuỗi / cửa hàng): key, nhóm, mức ưu tiên, vai nhận mặc định, kênh mặc định, `deepLinkTemplate`. Hợp đồng sự kiện là một tệp độc lập, không import gì của dự án — chép sang dự án khác được.
- **Phân giải gửi/không gửi** cho từng (sự kiện × kênh × người nhận):
  1. Cổng 1 — kênh đã được nền tảng kích hoạt chưa;
  2. Cổng 2 — khoá cứng từ trên xuống (nền tảng → ngành → chuỗi → cửa hàng), **chỉ trong phạm vi của khoá** (GLOBAL, tổ chức mình hoặc tổ chức cha);
  3. Ghi đè từ dưới lên: người dùng > cửa hàng > chuỗi > mặc định nền tảng.
- Hộp thư trong ứng dụng **luôn bật**; kênh ngoài là bổ sung.

## 2. Quy tắc
1. **Không bao giờ làm hỏng luồng nghiệp vụ**: gửi thông báo là best-effort, lỗi chỉ ghi log.
2. Người nhận lấy theo **vai mặc định của sự kiện** trong thành viên đang hoạt động; có trần số người nhận.
3. Mỗi `deepLinkTemplate` phải trỏ tới trang có thật và không còn `{biến}` chưa điền — **test kiểm**.
4. Nội dung kênh ngoài: escape HTML, chỉ link http(s), không ghi email vào log, không dùng kênh mặc định dùng chung giữa tenant.
5. Màn ma trận cho từng tầng chỉ hiện sự kiện tầng đó được thấy (bảng hiển thị theo tầng) và báo rõ sự kiện nào **đang thực sự gửi**.
6. Kênh chưa nối nhà cung cấp phải ghi rõ là "chưa gửi thật", không giả thành công.
7. Hub đẩy thời gian thực (SSE) trong bộ nhớ chỉ đúng với một tiến trình — nhiều instance cần pub/sub.

## 3. Cưỡng chế
- Test phân giải: kích hoạt kênh, khoá theo phạm vi, ưu tiên ghi đè.
- Test deep link ↔ route thật.
- Test escape nội dung từng kênh.
- Test tenant: khoá/ưu tiên của tổ chức khác không ảnh hưởng.
