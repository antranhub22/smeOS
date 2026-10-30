# 05. Storage Routing Standard

## 1. Mục tiêu

Chọn nơi lưu trữ dựa trên loại và yêu cầu của dữ liệu, không dựa vào module tạo ra nó một cách máy móc.

## 2. Decision matrix

| Loại | Nơi lưu logic thường phù hợp | Quy tắc |
|---|---|---|
| Business entities | Domain database/system of record | Ràng buộc, transaction và quan hệ nghiệp vụ |
| File/blob lớn | Object/file storage | Payload tách khỏi metadata; dùng asset ID |
| Asset metadata | Asset Registry/database | Định danh, owner, state, classification, storage reference |
| Temporary/intermediate | Temp/object storage hoặc job workspace | TTL, không dùng làm nguồn chuẩn, có cleanup |
| Source code | Version control repository | Review, branch, commit, access controls |
| Build/package artifacts | Artifact/package registry hoặc immutable release storage | Gắn với commit/build/release ID |
| Audit/provenance | Audit store/database/log platform | Quyền ghi có kiểm soát, truy vấn theo correlation IDs |
| Secrets | Secret manager/vault | Không lưu trong repository, file output hoặc log |
| Cache | Cache store | Tái tạo được; không coi là nguồn chuẩn |
| Backups | Backup system tách biệt theo yêu cầu rủi ro | Khả năng phục hồi và quyền truy cập riêng |

## 3. Các yếu tố quyết định routing

1. Asset class và system of record.
2. Payload size, access pattern và throughput.
3. Transactional consistency requirements.
4. Sensitivity, residency và contractual requirements.
5. Tenant isolation model.
6. Versioning, immutability và retention.
7. Recovery time objective (RTO) và recovery point objective (RPO).
8. Cost, egress và lifecycle cost.
9. Search/query requirements.
10. Integration constraints và provider lock-in.

## 4. Storage profiles

Định nghĩa các profile logic, sau đó ánh xạ vào hạ tầng thực tế:
- `BUSINESS_RECORD`
- `DURABLE_OBJECT`
- `TEMPORARY_OBJECT`
- `IMMUTABLE_RELEASE_ARTIFACT`
- `AUDIT_RECORD`
- `SECRET`
- `CACHE`
- `BACKUP`

Mỗi profile phải quy định access pattern, versioning, encryption, retention, backup, deletion và monitoring.

## 5. Object key / path rules

- Dùng asset ID hoặc opaque identifier làm phần định danh chính; tránh dùng tên khách hàng/email/số điện thoại trong path.
- Không xem path là cơ chế authorization.
- Tránh cho người dùng tự quyết định storage path.
- Chuẩn hóa tên file hiển thị riêng khỏi storage key.
- Không ghi thông tin bí mật hoặc PII vào URL, key hay log nếu không cần.
- Không thay thế identity của asset khi đổi tên file hoặc di chuyển storage.

## 6. Public vs private access

Mặc định private. Chỉ mở public khi asset class cho phép và có phê duyệt/điều kiện rõ ràng. Với URL ký số:
- thời hạn ngắn và phù hợp mục đích
- giới hạn phương thức và tài nguyên
- không coi URL là danh tính người dùng
- ghi nhận sự kiện cấp URL nếu rủi ro yêu cầu
- thu hồi bằng cách phù hợp với khả năng storage

## 7. Migration giữa storage providers

Bắt buộc có:
- inventory và checksum
- mapping identity
- copy/verify phase
- dual-read hoặc controlled cutover khi cần
- rollback plan
- reconciliation report
- deletion plan cho nguồn cũ sau khi được phê duyệt
- bằng chứng rằng quyền và retention được giữ nguyên

Không thực hiện migration phá hủy trong giai đoạn audit.
