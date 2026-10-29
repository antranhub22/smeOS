# 08. Lifecycle, Versioning, Retention & Deletion

## 1. Lifecycle chuẩn

Trạng thái mẫu:
`received → quarantined → validated → draft/processing → in_review → approved → published → archived → pending_deletion → deleted/purged`

Không phải class nào cũng cần mọi trạng thái. Định nghĩa state machine riêng cho mỗi asset class và cấm chuyển trạng thái không hợp lệ.

## 2. Quy tắc chuyển trạng thái

Mỗi transition phải chỉ rõ:
- trạng thái nguồn và đích
- actor/service được phép
- điều kiện tiên quyết
- side effects
- audit event
- retry/idempotency behavior
- lỗi và rollback/compensation
- yêu cầu phê duyệt

## 3. Versioning

- Không ghi đè một published asset nếu cần bảo toàn lịch sử hoặc bằng chứng.
- Thay đổi nội dung tạo version mới, trừ khi class được xác định rõ là mutable.
- Gắn output với input versions và processing version khi có ý nghĩa.
- Có quy tắc chọn `current_version` và xử lý concurrent updates.
- Versioning không thay thế backup.

## 4. Retention

Không đặt một thời hạn duy nhất cho tất cả dữ liệu. Mỗi class phải xác định:
- retention period hoặc retention trigger
- cơ sở pháp lý/hợp đồng/nghiệp vụ
- thời điểm bắt đầu tính hạn
- ngoại lệ legal hold
- nơi áp dụng: registry, payload, versions, derived files, logs, replicas, backups
- hành động khi hết hạn
- bằng chứng hoàn thành
- chủ thể phê duyệt

Nếu chưa biết yêu cầu pháp lý/contractual, đánh dấu `Decision Required`; không tự bịa thời hạn.

## 5. Deletion workflow

1. Xác minh yêu cầu và quyền xóa.
2. Kiểm tra legal hold, hợp đồng và yêu cầu lưu giữ.
3. Xác định tất cả bản liên quan: versions, derived assets, thumbnails, exports, replicas, indexes, caches và downstream copies.
4. Đánh dấu pending deletion và ngăn phát hành mới khi phù hợp.
5. Thực hiện xóa theo policy, bao gồm provider lifecycle nếu có.
6. Xử lý backups theo khả năng và chính sách backup; không tuyên bố xóa hoàn toàn nếu bản backup còn tồn tại.
7. Ghi nhận kết quả và ngoại lệ.
8. Chạy reconciliation.
9. Cung cấp bằng chứng xóa ở mức phù hợp, tránh lưu lại nội dung đã xóa trong audit record.

## 6. Legal hold

- Legal hold phải ngăn các hành động xóa/ghi đè bị cấm.
- Ghi người áp dụng, lý do, thời điểm, phạm vi và người có quyền gỡ.
- Quyền gỡ hold phải hạn chế.
- Kiểm tra legal hold trước bulk deletion và retention jobs.

## 7. Archive

Archive phải xác định:
- thời gian truy xuất kỳ vọng
- chi phí
- quyền truy cập
- integrity checks
- cách restore
- thời hạn archive
- điều kiện xóa cuối cùng

## 8. Backup và deletion interaction

Backups có thể giữ dữ liệu đã xóa cho đến khi hết chu kỳ backup. Chính sách phải mô tả rõ:
- backup expiry
- restore behavior đối với tombstones/deletion records
- cách tái áp dụng deletion sau restore
- giới hạn khả năng xóa tức thời khỏi immutable backups
- cách truyền đạt thực tế này cho khách hàng/hợp đồng.
