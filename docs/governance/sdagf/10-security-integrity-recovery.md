# 10. Security, Integrity & Recovery

## 1. Ingestion/file upload

Theo nguyên tắc OWASP File Upload:
- allowlist loại file khi nghiệp vụ cho phép
- không tin extension hoặc MIME type do client khai báo
- kiểm tra magic bytes/content signature khi phù hợp
- giới hạn kích thước, số lượng, thời gian xử lý và archive expansion
- đổi tên storage key thành giá trị do hệ thống tạo
- lưu file private và ngoài webroot/public path
- scan malware khi phù hợp với threat model và hạ tầng
- quarantine đến khi kiểm tra xong
- chống path traversal, polyglot files và parser abuse theo rủi ro
- không mở/render file chưa tin cậy trực tiếp trong privileged context
- kiểm tra quyền và tenant trước khi nhận/lấy file.

## 2. Data protection

- TLS cho truyền tải.
- Encryption at rest theo khả năng nền tảng và yêu cầu rủi ro.
- Quản lý khóa theo trách nhiệm rõ; không hard-code key.
- Secret manager cho credentials, tokens và keys.
- Không ghi secrets vào repository, output, logs, error traces hoặc tài liệu bàn giao.
- Tối thiểu hóa PII trong metadata và logs.
- Xác định data residency và cross-border transfer requirements nếu áp dụng.
- Có quy trình xử lý incident và credential rotation.

## 3. Integrity

- Dùng checksum cryptographic phù hợp (ví dụ SHA-256) để xác minh payload.
- Kiểm tra kích thước, checksum và content metadata sau transfer/migration.
- Chỉ cập nhật registry sau khi xác định trạng thái ghi payload theo consistency strategy.
- Có periodic integrity check theo mức rủi ro.
- Không coi checksum là bằng chứng về tính an toàn nội dung hay nguồn gốc đáng tin cậy.

## 4. Backup & recovery

Mỗi storage profile phải có:
- RPO và RTO được chủ hệ thống phê duyệt
- phạm vi backup (metadata, payload, config, keys/secret recovery references, audit)
- tần suất và retention
- isolation/immutability khi phù hợp
- quyền truy cập backup riêng
- restore runbook
- kiểm thử restore theo lịch và sau thay đổi lớn
- bằng chứng kết quả, thời gian thực tế và vấn đề tồn tại.

Không tự đặt RPO/RTO hoặc retention mục tiêu khi chưa hiểu business criticality.

## 5. Disaster recovery

- Phân loại criticality theo domain/asset class.
- Xác định dependency map và thứ tự phục hồi.
- Xác định failover/failback, DNS/configuration và credential dependencies.
- Có kế hoạch đối soát dữ liệu sau phục hồi.
- Xác minh deletion tombstones, legal holds và quyền truy cập sau restore.
- Thực hiện tabletop hoặc restore drill.

## 6. Security failure handling

- Mặc định deny khi authorization/policy service không thể xác minh đối với thao tác nhạy cảm.
- Không để lỗi scan khiến file quarantine tự động được phát hành.
- Retry có giới hạn và backoff.
- Alert khi có cross-tenant access denial bất thường, bulk export, policy bypass hoặc deletion failure.
- Không lộ nội dung/PII trong lỗi trả về client.
