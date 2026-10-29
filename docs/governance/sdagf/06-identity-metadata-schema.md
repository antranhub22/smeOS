# 06. Asset Identity, Metadata & Registry

## 1. Định danh

Mỗi asset được quản trị nên có `asset_id` ổn định, không phụ thuộc tên file, đường dẫn, tenant display name hay provider-specific object key.

Khuyến nghị định dạng ID opaque, không nhúng PII hoặc thông tin nhạy cảm. Có thể dùng UUID/ULID hoặc định dạng hiện có nếu phù hợp; quyết định cuối cùng sau audit.

## 2. Metadata tối thiểu

```json
{
  "asset_id": "opaque-stable-id",
  "asset_class_id": "product-image-original",
  "display_name": "original-image.jpg",
  "media_type": "image/jpeg",
  "size_bytes": 123456,
  "checksum": {
    "algorithm": "sha256",
    "value": "..."
  },
  "tenant_id": "tenant-id-or-null-for-platform-scope",
  "owner_ref": {
    "type": "module-or-principal",
    "id": "owner-id"
  },
  "system_of_record": "logical-system-name",
  "storage_profile": "DURABLE_OBJECT",
  "storage_ref": "provider-neutral-reference",
  "classification": "Confidential",
  "lifecycle_state": "quarantined",
  "version_id": "version-id",
  "created_at": "RFC3339 timestamp",
  "created_by": "principal-or-service-id",
  "updated_at": "RFC3339 timestamp",
  "provenance_ref": "optional-provenance-id",
  "retention_policy_id": "policy-id",
  "legal_hold": false,
  "tags": [],
  "schema_version": 1
}
```

Đây là schema minh họa, không phải migration có thể chạy trực tiếp. Cần điều chỉnh kiểu dữ liệu, nullable fields, indexes và quan hệ theo database hiện tại.

## 3. Metadata bổ sung theo class

Có thể cần:
- `parent_asset_ids`
- `derived_from`
- `processing_job_id`
- `tool_name` / `tool_version`
- `approval_status`
- `published_at`
- `expires_at`
- `retention_basis`
- `content_language`
- `dimensions`
- `page_count`
- `record_count`
- `data_schema_version`
- `source_system`
- `external_reference`
- `deletion_status`
- `deletion_evidence_ref`

Không lưu metadata nhạy cảm không cần thiết. Dữ liệu nghiệp vụ chuyên biệt nên giữ trong domain model và chỉ tham chiếu từ registry khi phù hợp.

## 4. Registry invariants

- `asset_id` không tái sử dụng.
- `tenant_id` và owner không được thay đổi chỉ bởi client input; phải xác định từ authorization context/policy.
- Asset reference phải được kiểm tra quyền ở mỗi lần truy cập.
- Metadata và payload phải có reconciliation.
- Mọi version phải có quan hệ với asset logical identity.
- Không lưu signed URL dài hạn như canonical storage reference.
- Thay đổi classification, owner, tenant, lifecycle hoặc retention phải có audit event.
- Xóa registry row không được coi là đã xóa payload, các version, thumbnail, replica, backup hoặc bản xuất.

## 5. Version model

Phân biệt:
- **Logical asset:** danh tính ổn định của tài sản.
- **Asset version:** một phiên bản cụ thể.
- **Storage object:** nơi lưu vật lý cho version đó.
- **Business entity version:** phiên bản dữ liệu nghiệp vụ, nếu domain cần.

Không dùng một `version` chung cho mọi lớp nếu các vòng đời khác nhau.

## 6. Schema evolution

- Mỗi schema có `schema_version`.
- Thay đổi phải có migration plan, backward compatibility analysis và rollback strategy.
- Tránh breaking changes đối với các module chưa được nâng cấp.
- Có test đọc dữ liệu cũ và dữ liệu mới.
- Ghi nhận cách xử lý asset metadata cũ/không đầy đủ.
