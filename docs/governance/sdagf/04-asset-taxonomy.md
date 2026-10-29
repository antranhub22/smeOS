# 04. Asset & Data Taxonomy

## 1. Taxonomy chuẩn

### A. Input
Dữ liệu được tiếp nhận từ người dùng, hệ thống khác hoặc công cụ:
- file upload, ảnh gốc, tài liệu gốc
- form input, import CSV/XLSX
- API request, webhook payload
- prompt, parameters, user-provided reference
- dữ liệu đồng bộ từ connector

### B. Business data
Thực thể có ý nghĩa nghiệp vụ:
- product, order, customer, quote, invoice, catalog, tenant configuration
- trạng thái, quan hệ và lịch sử nghiệp vụ
Business data thường có nguồn chuẩn trong database/domain service, không nên xem một bản export là nguồn chuẩn.

### C. Intermediate artifacts
Dữ liệu phát sinh trong xử lý:
- thumbnail, resized image, extracted text
- normalized/converted files
- temporary export, generated previews
- intermediate AI output, processing manifest
Có thể xóa khi hết mục đích nếu không có yêu cầu lưu giữ.

### D. Output / deliverables
Tài sản sinh ra từ nghiệp vụ hoặc công cụ:
- final image, PDF, report, quote document
- export, generated copy, package
- customer-facing download
Phải xác định trạng thái draft/reviewed/approved/published và quyền phát hành nếu có rủi ro.

### E. Technical artifacts
- source code, package, build artifact, migration, test result, SBOM, deployment bundle
- configuration artifact không chứa secret
- CI/CD logs và release manifest
Tuân theo quy trình engineering và release.

### F. Governance records
- audit events, approval records, policy decisions
- provenance/lineage records
- version manifests, retention/deletion evidence
Cần chống sửa/xóa trái phép và có retention rõ.

## 2. Thuộc tính phân loại

Mỗi asset class phải định nghĩa:
- mục đích sử dụng
- owner
- canonical system of record
- sensitivity/classification
- tenant scope
- allowed operations
- storage profile
- lifecycle states
- retention basis
- provenance requirement
- backup/recovery tier
- integrity validation
- export/share rules
- deletion constraints
- applicable legal/contractual obligations

## 3. Classification levels đề xuất

- **Public:** được phê duyệt công khai.
- **Internal:** dùng nội bộ, không phát hành tự do.
- **Confidential:** thông tin kinh doanh hoặc khách hàng cần giới hạn truy cập.
- **Restricted:** dữ liệu cá nhân nhạy cảm, credentials, secrets hoặc dữ liệu có rủi ro cao. Secrets nên được giữ trong secret manager, không lưu như file thông thường.

Phân loại cụ thể phải được xác nhận bởi Security/Data Owner và điều chỉnh theo luật, hợp đồng, thị trường.

## 4. Quy tắc khi chưa phân loại

- Không phát hành public.
- Không tạo URL chia sẻ công khai.
- Không log payload nhạy cảm.
- Đưa vào trạng thái pending classification/quarantine nếu cần.
- Yêu cầu owner hoặc policy engine xác định phân loại trước khi xử lý tiếp.

## 5. Mẫu Asset Class Record

- `asset_class_id`
- `name`
- `description`
- `examples`
- `canonical_owner`
- `system_of_record`
- `default_classification`
- `tenant_scope`
- `storage_profile`
- `lifecycle_profile`
- `retention_policy_id`
- `allowed_operations`
- `provenance_level`
- `recovery_tier`
- `export_policy`
- `approval_requirements`
- `exceptions`
