# 06 — UX Audit Checklist

## 6.1. Mục tiêu audit
Xác minh hiện trạng trước khi thiết kế lại. Không sửa code trong giai đoạn audit trừ khi có yêu cầu riêng được phê duyệt.

## 6.2. Phạm vi kiểm tra
1. Cấu trúc route và các khu vực sản phẩm.
2. Sidebar, điều hướng, breadcrumb và chuyển ngữ cảnh.
3. Màn hình nghiệp vụ, form, bảng, modal và menu.
4. Upload, generate, preview, download và các tác vụ bất đồng bộ.
5. Loading, empty, success, error, disabled và confirmation.
6. Mobile/responsive và accessibility.
7. Component dùng chung và các biến thể trùng lặp.
8. Các nơi người dùng phải nhập lại dữ liệu hoặc cấu hình lặp.
9. Luồng có rủi ro: xóa, thanh toán, gửi, xuất bản, quyền truy cập.
10. Test hiện có, cách chạy dự án và khả năng kiểm chứng.

## 6.3. Phương pháp audit
- Bước 1: đọc README, package/config, kiến trúc và hướng dẫn phát triển.
- Bước 2: lập danh sách routes/screens/components; dùng script chỉ khi an toàn và phù hợp.
- Bước 3: chọn luồng nghiệp vụ chính theo mức độ sử dụng/tác động, không chọn ngẫu nhiên.
- Bước 4: đi qua từng luồng bằng code review và chạy ứng dụng nếu môi trường cho phép.
- Bước 5: ghi vấn đề kèm bằng chứng và mức độ tin cậy.
- Bước 6: phân loại thông tin theo L1–L4.
- Bước 7: đề xuất ưu tiên, ước lượng phạm vi và rủi ro.
- Bước 8: tổng kết khoảng trống và đề xuất pilot.

## 6.4. Mức độ nghiêm trọng
- **P0 — Critical:** có nguy cơ dữ liệu sai/mất, bảo mật, quyền, thanh toán hoặc hành động không thể phục hồi; không thể phát hành an toàn.
- **P1 — High:** cản trở nghiêm trọng luồng cốt lõi, người dùng dễ thất bại hoặc không hiểu trạng thái.
- **P2 — Medium:** gây thêm bước, nhầm lẫn hoặc không nhất quán đáng kể.
- **P3 — Low:** tinh chỉnh thị giác/vi mô, không chặn luồng chính.

Đây là thang ưu tiên nội bộ. Không dùng số lượng issue làm thước đo duy nhất.

## 6.5. Mẫu ghi nhận issue
Mỗi issue phải có:
- ID.
- Route/màn hình.
- Nhóm người dùng và mục tiêu.
- Bước tái hiện.
- Hành vi hiện tại.
- Vấn đề quan sát được.
- Bằng chứng (file/line, screenshot, test hoặc quan sát chạy thực tế).
- Mức tin cậy: xác minh / một phần / chưa xác minh.
- Mức nghiêm trọng P0–P3.
- Nguyên tắc/pattern liên quan.
- Đề xuất thay đổi.
- Rủi ro và phụ thuộc.
- Tiêu chí xác minh sau sửa.

## 6.6. Checklist cho mỗi màn hình
- [ ] Mục tiêu màn hình rõ ràng.
- [ ] Hành động chính dễ nhận biết.
- [ ] Thông tin được phân lớp L1–L4.
- [ ] Không có trường bắt buộc không có lý do.
- [ ] Mặc định có căn cứ và an toàn.
- [ ] Các tùy chọn nâng cao được đặt đúng chỗ.
- [ ] Trạng thái loading/success/error/empty được xem xét.
- [ ] Lỗi có hướng khắc phục và giữ dữ liệu khi phù hợp.
- [ ] Mobile không tràn, không phụ thuộc hover.
- [ ] Keyboard/focus/label được kiểm tra.
- [ ] Có test phù hợp hoặc ghi rõ khoảng trống test.
- [ ] Tuân thủ component/pattern hiện có hoặc có lý do cho ngoại lệ.

## 6.7. Đầu ra bắt buộc
- Báo cáo tổng quan.
- Danh mục route/screen/component.
- Issue register có bằng chứng.
- Ma trận phân lớp disclosure.
- Danh sách component/pattern trùng lặp hoặc thiếu.
- Danh sách rủi ro và ngoại lệ.
- Đề xuất pilot kèm lý do.
- Những phần không thể xác minh và cách xác minh tiếp.
