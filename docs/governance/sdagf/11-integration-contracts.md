# 11. Module Integration Contracts

## 1. Mục tiêu

Module sử dụng storage thông qua contract ổn định, không tự ý phụ thuộc vào provider-specific path hoặc truy cập storage của module khác.

## 2. Logical operations

Các API/operations cần cân nhắc:
- `createAssetIntent`
- `requestUpload`
- `completeUpload`
- `validateAsset`
- `getAssetMetadata`
- `getAssetContent`
- `createDerivedAsset`
- `createProcessingRecord`
- `requestApproval`
- `publishAsset`
- `createDownloadGrant`
- `archiveAsset`
- `requestDeletion`
- `getAssetLineage`

Tên trên chỉ là gợi ý. Phải đối chiếu API conventions hiện tại và không tạo API mới nếu có chức năng tương đương.

## 3. Contract requirements

Mỗi contract phải định nghĩa:
- request/response schema và version
- authentication/authorization
- tenant context
- idempotency behavior
- validation rules
- error codes
- rate/size limits
- retry semantics
- audit events
- consistency guarantees
- backward compatibility
- observability/correlation IDs.

## 4. Upload flow tham khảo

1. Client yêu cầu upload intent kèm loại asset và metadata hợp lệ.
2. Backend xác thực actor, tenant, quota và policy.
3. Backend cấp phương thức upload có scope/TTL giới hạn hoặc nhận upload qua backend.
4. File được đưa vào quarantine/private storage.
5. Backend xác minh kích thước, loại file, checksum và scan status nếu áp dụng.
6. Registry chuyển trạng thái theo kết quả validation.
7. Module chỉ nhận `asset_id`/version reference, không tự chế storage path.

## 5. Download flow tham khảo

1. Client yêu cầu đọc asset bằng asset ID.
2. Backend kiểm tra tenant, actor, relationship, classification, lifecycle state và purpose.
3. Nếu được phép, backend stream nội dung hoặc cấp signed URL ngắn hạn.
4. Ghi audit event theo mức rủi ro.
5. Không dùng asset ID khó đoán làm biện pháp authorization.

## 6. Event-driven integration

Nếu sử dụng events:
- event có event ID, schema version, tenant context phù hợp, asset/version IDs và timestamp
- không chứa payload nhạy cảm nếu không cần
- có idempotent consumer
- xử lý duplicate/out-of-order delivery
- retry/dead-letter policy
- versioning và compatibility
- không phát event `published` trước khi output thực sự sẵn sàng và quyền truy cập được thiết lập.

## 7. Module responsibilities

Mỗi module phải:
- khai báo asset classes sử dụng/tạo
- dùng central policy/contract phù hợp
- không tự đặt retention trái chính sách nền tảng
- không lưu bản sao không có mục đích
- khai báo nguồn chuẩn nghiệp vụ
- tạo provenance khi cần
- cung cấp test cho access, lifecycle và tenant isolation
- không bỏ qua security checks trong background jobs.
