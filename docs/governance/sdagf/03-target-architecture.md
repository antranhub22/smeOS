# 03. Target Architecture

## 1. Logical architecture

SDAGF phân tách các trách nhiệm logic. Không yêu cầu mỗi thành phần phải là microservice riêng; có thể triển khai trong monolith hoặc các service hiện có nếu ranh giới được bảo toàn.

1. **Ingestion & Validation**
   - Nhận upload, import, API payload, prompt hoặc dữ liệu do module tạo.
   - Xác thực schema, kích thước, định dạng, quyền sử dụng và chính sách an toàn.
   - Cách ly file chưa kiểm tra khi cần.

2. **Policy Decision / Enforcement**
   - Xác định loại tài sản, tenant, actor, mục đích, thao tác và trạng thái.
   - Cho phép/từ chối thao tác theo policy.
   - Enforcement phải ở backend/service boundary; UI chỉ hỗ trợ trải nghiệm, không phải ranh giới bảo mật.

3. **Asset Registry**
   - Lưu asset ID, class, owner, tenant, lifecycle state, version, provenance references và storage reference.
   - Không lưu secrets hoặc payload lớn trong metadata nếu không cần thiết.

4. **Storage Adapters**
   - Cung cấp giao diện thống nhất cho object/file storage, relational database, temporary storage, artifact registry hoặc các hệ thống hiện có.
   - Che giấu provider-specific details khỏi business modules.
   - Không áp đặt một backend trước khi audit stack hiện tại.

5. **Processing Orchestration**
   - Quản lý job tạo/chuyển đổi asset.
   - Ghi nhận input references, tool/version, parameters phù hợp, status, output references và lỗi.
   - Không lưu dữ liệu nhạy cảm trong logs mặc định.

6. **Version & Lifecycle Service**
   - Quản lý version, approval, retention, archival, legal hold và deletion workflow.
   - Hỗ trợ soft-delete khi phù hợp, nhưng phải phân biệt soft-delete với việc dữ liệu thực sự được xóa.

7. **Audit & Provenance**
   - Ghi lại các sự kiện quan trọng và chuỗi biến đổi.
   - Chỉ cho phép đọc theo quyền; ngăn sửa/xóa log tùy tiện.

8. **Operational Controls**
   - Monitoring, backup/restore, alerting, reconciliation, quota và cost controls.

## 2. Logical data flow

1. Actor/module gửi input.
2. Backend xác thực danh tính, tenant context và quyền.
3. Ingestion kiểm tra file/payload và áp dụng giới hạn.
4. Registry tạo asset identity hoặc ghi nhận business entity theo contract.
5. Storage adapter ghi payload vào nơi lưu phù hợp.
6. Registry lưu metadata và storage reference theo cách nhất quán.
7. Nếu có xử lý, tạo processing record liên kết input với output.
8. Output đi qua validation/review/approval tùy loại.
9. Khi phát hành, cấp quyền truy cập đúng đối tượng và ghi audit event.
10. Lifecycle policy xử lý retention, archive hoặc deletion.

## 3. Ranh giới dữ liệu

- **Business system of record:** nguồn chuẩn của dữ liệu nghiệp vụ; phải được xác định theo domain.
- **Asset registry:** nguồn chuẩn cho metadata quản trị tài sản và tham chiếu storage.
- **Payload storage:** nơi lưu nội dung file/object.
- **Cache/temp storage:** dữ liệu có thể tái tạo hoặc có TTL; không phải nguồn chuẩn.
- **Audit store:** bằng chứng sự kiện; có chính sách truy cập và retention riêng.
- **Backup/replica:** bản phục vụ phục hồi hoặc hiệu năng; không mặc nhiên là nguồn chuẩn.

Không tạo bản sao payload trong mỗi module nếu chỉ cần tham chiếu asset ID. Nếu phải sao chép, ghi rõ mục đích, chủ sở hữu, retention và cách đồng bộ/xóa.

## 4. Consistency & failure handling

Thiết kế phải xử lý tình huống registry đã ghi nhưng payload chưa ghi, hoặc payload đã ghi nhưng registry chưa ghi:
- Xác định chiến lược transaction/outbox/saga hoặc reconciliation phù hợp.
- Có idempotency key cho thao tác tạo lặp lại.
- Có job phát hiện orphan objects và dangling references.
- Không xóa orphan tự động nếu chưa xác minh và có grace period/approval.
- Có trạng thái xử lý lỗi và khả năng retry an toàn.

## 5. Kiến trúc vật lý

Sau audit, chọn phương án phù hợp với stack thực tế:
- Relational DB cho business records và metadata có quan hệ.
- Object storage cho file/blob lớn.
- Artifact registry/package registry cho build artifacts khi phù hợp.
- Cache/temp store cho dữ liệu tái tạo có TTL.
- Dedicated append-only/audit storage nếu rủi ro yêu cầu.

Đây là các lựa chọn phổ biến, không phải chỉ định công nghệ. Phải đánh giá dung lượng, tải, chi phí, consistency, region, backup, khả năng phục hồi và lock-in.
