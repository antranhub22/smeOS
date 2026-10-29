# 15. Commercial / Production / Enterprise / Handover Gates

## 1. Commercial readiness
- Asset classes và data ownership được xác định.
- Business records có nguồn chuẩn.
- Quyền sử dụng, chia sẻ và xuất dữ liệu phù hợp nghiệp vụ/hợp đồng.
- Có xử lý lỗi upload, xử lý job và output không thành công.
- Quota, size limits và chi phí storage được xem xét.
- Các điều kiện retention/deletion theo hợp đồng được xác định.

## 2. Production readiness
- Authorization được kiểm tra ở backend.
- Tenant isolation có negative tests.
- Upload validation và xử lý file không tin cậy phù hợp threat model.
- Metadata/payload consistency và reconciliation có cơ chế.
- Lifecycle jobs có retry, idempotency và observability.
- Backup scope, RPO/RTO được phê duyệt.
- Restore test có bằng chứng gần đây theo chu kỳ quy định.
- Có alerting, incident runbooks và rollback.
- Secrets và PII được bảo vệ trong logs/configuration.

## 3. Enterprise readiness
- Ownership và accountability rõ.
- Policy versions và exception registry.
- Audit trail đủ cho các hành động quan trọng.
- Classification, retention, legal hold và deletion có quản trị.
- Access reviews và privileged access controls theo rủi ro.
- Có thể cung cấp evidence package theo phạm vi hợp đồng.
- Rủi ro, known issues và compensating controls được công khai nội bộ/phê duyệt.
- Quy trình thay đổi và migration có kiểm soát.

## 4. Client handover
- Architecture overview và storage/data-flow diagrams.
- Data classification and ownership matrix.
- API/storage contracts.
- Deployment/environment configuration guide.
- Backup/restore and incident runbooks.
- Retention/deletion/export behavior.
- Test report, tenant-isolation evidence và restore evidence phù hợp.
- Known limitations, open findings và accepted exceptions.
- Release/version mapping.
- Danh sách quyền truy cập và quy trình chuyển giao.
- Secret handover bằng kênh bảo mật riêng; không đưa secret vào ZIP/repository.
- Bằng chứng license và quyền sử dụng third-party components/assets khi liên quan.

## 5. Release decision

Mỗi gate phải có:
- release scope
- required controls
- evidence links
- failed controls
- accepted exceptions (owner, rationale, expiry)
- residual risks
- approver
- decision timestamp.

`PASS`: mọi control bắt buộc đạt.  
`CONDITIONAL PASS`: chỉ khi policy cho phép và ngoại lệ được phê duyệt.  
`FAIL`: còn control chặn phát hành.

Không dùng cụm từ “enterprise-grade certified” nếu không có chương trình đánh giá/chứng nhận tương ứng. Có thể nói “đã được đánh giá theo bộ tiêu chí nội bộ” khi đúng sự thật.
