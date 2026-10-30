# 12. Audit, Observability & Reconciliation

## 1. Sự kiện cần xem xét ghi nhận

- asset created/received
- upload initiated/completed/rejected
- validation/scanning completed
- metadata/classification/owner changes
- read/download/export/share/publication khi rủi ro yêu cầu
- approval/rejection
- version created/replaced
- policy allow/deny cho hành động nhạy cảm
- retention/archival/deletion/legal hold
- restore/backup operation
- integrity mismatch
- tenant-isolation violation attempt
- processing job started/completed/failed
- migration/reconciliation result.

## 2. Audit event fields

- event ID
- timestamp UTC
- actor/service identity
- tenant context nếu có
- action
- target asset/version ID
- result
- reason/policy ID/version
- correlation/trace ID
- source module
- client/request context tối thiểu cần thiết
- before/after metadata summary nếu phù hợp và an toàn.

Không lưu payload đầy đủ, secret hoặc PII dư thừa trong event.

## 3. Audit log integrity

- quyền ghi và đọc tách biệt khi phù hợp
- không cho application user sửa/xóa event tùy ý
- retention riêng
- theo dõi khoảng trống, duplicate hoặc lỗi ghi audit
- đồng bộ thời gian
- có thể xuất bằng chứng theo yêu cầu kiểm toán có kiểm soát.

## 4. Operational metrics

- upload success/failure rate
- validation/scan latency
- processing job duration/failure/retry
- storage usage/cost by profile/tenant (trong phạm vi privacy)
- orphan object/reference counts
- unauthorized access denials
- signed URL issuance and failures
- retention/deletion backlog
- backup success and restore test outcomes
- integrity mismatch
- quota violations.

## 5. Reconciliation jobs

Cần xác định job đối soát:
- registry records không có payload
- payload không có registry record
- version pointers không hợp lệ
- asset references hỏng
- retention đã quá hạn nhưng chưa xử lý
- deletion đã đánh dấu nhưng chưa hoàn tất
- metadata size/checksum không khớp
- derived assets không còn parent reference theo policy.

Reconciliation mặc định tạo finding/report; không tự xóa hoặc sửa dữ liệu rủi ro cao nếu chưa có policy và guardrails rõ ràng.

## 6. Incident handling

Runbook cần chỉ rõ:
- phát hiện và phân loại sự cố
- cô lập asset/tenant/job nếu cần
- bảo toàn bằng chứng
- đánh giá phạm vi dữ liệu bị ảnh hưởng
- thông báo đúng vai trò
- khôi phục và xác minh
- post-incident review và cập nhật controls.
