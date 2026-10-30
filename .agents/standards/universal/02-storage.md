# 02 · Lưu trữ tệp (object storage) cho SaaS nhiều tenant

## 1. Năm nguyên tắc

1. **Tệp thuộc tổ chức, không thuộc người.** Khoá đường dẫn bắt đầu bằng tenant: `org/<tenant_id>/<nhóm>/<id>.<ext>`. Người đổi vai, rời đi hay bị xoá không làm mồ côi dữ liệu.
2. **Một cổng (port) kho tệp** với `put / get / delete / list / signedUrl`. Adapter nhà cung cấp (S3, R2, đĩa) chỉ ở `adapters/`. Adapter AI/media **không tự ghi kho** — trả byte, use-case ghi qua port.
3. **Mọi tệp có một bản ghi tham chiếu (registry).** Danh sách nguồn tham chiếu là SSOT, dùng chung cho đếm tham chiếu khi xoá và đối soát. Tệp không có nguồn = bị coi là mồ côi = có thể bị xoá nhầm.
4. **Xoá hai giai đoạn, có thể chặn.** Thùng rác (hết hạn sau N ngày) → xoá vĩnh viễn bản ghi + đưa xoá payload vào **outbox** trong cùng transaction → job xoá payload khi không còn tham chiếu, có giới hạn lần thử. **Giữ pháp lý (legal hold)** ở cấp tệp và cấp tổ chức chặn mọi đường xoá (API, thùng rác, cron, outbox, bàn giao) — trả 409.
5. **Không bao giờ phát URL công khai thô.** URL ký có hạn, **ký kèm phương thức HTTP** (URL xem không dùng để ghi được), không có ngoại lệ không ký theo tiền tố.

## 2. Ghi tệp an toàn

- Giới hạn kích thước theo loại, đọc body có trần cứng.
- Kiểm **magic bytes**, suy content-type từ khoá đã ký — không tin header client.
- SVG trả kèm CSP `sandbox`; HTML do người dùng tải lên không phục vụ cùng origin.
- Bí mật ký riêng (`*_SIGNING_SECRET`), có thể fallback về bí mật phiên khi chưa cấu hình.

## 3. Vận hành & kiểm soát

| Việc | Yêu cầu |
|---|---|
| Xoá payload thật | Sau cờ bật tường minh, **chỉ khi đã có backup object store** |
| Đối soát | Lệnh chỉ đọc: liệt kê tệp mồ côi + bản ghi thiếu payload; không tự sửa |
| Xuất dữ liệu / xoá vĩnh viễn | **Audit log bắt buộc**, cùng transaction với thao tác xoá; không ghi giá trị tìm kiếm vào log |
| Thư viện tệp người dùng | Quyền đọc theo **capability của công cụ nguồn**; chuỗi xem chi nhánh, chi nhánh thấy của mình + trụ sở |
| Bàn giao / dọn tenant | Tôn trọng legal hold |

## 4. Cưỡng chế bằng test

- **Kiến trúc:** quét mọi lời gọi `put(` (kể cả worker ngôn ngữ khác) → mỗi nơi ghi phải khai nguồn registry; đếm tham chiếu phải phủ mọi nguồn.
- **Kiến trúc:** mọi route xuất dữ liệu phải ghi audit.
- **Tenant:** tệp tổ chức khác → 404; legal hold → 409; thùng rác hết hạn được dọn.
- **Đơn vị:** ký/kiểm chữ ký theo phương thức; magic bytes; khoá đường dẫn.

## 5. Checklist khi thêm nơi ghi tệp mới

- [ ] Ghi qua port, khoá dạng `org/<tenant>/…`
- [ ] Thêm nguồn vào danh sách registry + hàm đếm tham chiếu
- [ ] Khai nơi ghi trong test kiến trúc
- [ ] Đọc bằng URL ký có hạn, đúng phương thức
- [ ] Hiện trong thư viện (nếu người dùng cần thấy) với đúng capability
- [ ] Test tenant: tổ chức khác không đọc được

## 6. Lỗi thường gặp

- Tệp lưu trong cột JSON (metadata) không nằm trong registry → bị xoá khi còn dùng.
- URL ký GET dùng được cho PUT → ghi đè tệp.
- Bỏ qua chữ ký cho một tiền tố "tiện" (vd. video) → lộ toàn bộ tiền tố.
- Dọn thùng rác "lười" khi liệt kê → không chạy nếu không ai mở màn.
- Số ngày giữ thùng rác viết cứng nhiều chỗ.
