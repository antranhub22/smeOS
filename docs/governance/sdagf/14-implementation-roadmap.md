# 14. Implementation Roadmap

## Phase 0 — Governance setup
- Chỉ định Platform Owner, Security Owner và module owners.
- Phê duyệt scope, mục tiêu và nguyên tắc không phá hủy.
- Xác định môi trường, branch/commit và phạm vi audit.

**Exit criteria:** có người chịu trách nhiệm, phạm vi và quy tắc thay đổi.

## Phase 1 — Discovery / current-state audit
Khảo sát:
- repository, thư mục, file upload/download paths
- database schemas và ownership
- storage providers/buckets/volumes
- asset-producing modules and tools
- API endpoints, background jobs, event handlers
- tenant model and authorization
- logs, backup, retention, deletion
- tests, CI/CD, deployment configs
- external integrations and generated artifacts.

Đầu ra: inventory, diagrams, evidence map, findings, unknowns và risk register.

**Không thay đổi code hoặc file trong phase này.**

## Phase 2 — Taxonomy and routing design
- Phân loại asset classes thực tế.
- Xác định system of record.
- Lập storage routing matrix.
- Xác định metadata tối thiểu và lifecycle profile.
- Ghi các quyết định chưa rõ vào Decision Log.

## Phase 3 — Target architecture
- Thiết kế logical boundaries.
- Xác định central contracts và module adapters.
- Thiết kế authorization, tenant isolation, provenance và lifecycle.
- Đánh giá phương án theo chi phí, độ phức tạp và migration risk.
- Tạo ADR cho quyết định lớn.

## Phase 4 — Pilot
Chọn một module có đại diện cho input → processing → output nhưng không phải module có rủi ro cao nhất nếu chưa đủ bằng chứng.
- Triển khai asset identity/metadata theo thiết kế.
- Tích hợp policy checks.
- Thêm provenance và lifecycle.
- Viết tests và runbook.
- Kiểm tra rollback và reconciliation.

## Phase 5 — Controlled rollout
- Ưu tiên theo rủi ro.
- Không migrate toàn bộ một lần.
- Dùng compatibility adapters nếu cần.
- Theo dõi metrics, orphan records và access denials.
- Có rollback/cutover criteria.

## Phase 6 — Automation and enforcement
- CI lint/schema/policy checks.
- Test tenant isolation.
- Secret scanning.
- Lifecycle/retention checks.
- Release readiness gate.
- Documentation ownership and update checks.

## Phase 7 — Verification and handover
- Audit lại controls.
- Restore drill.
- Xác minh quyền và tenant isolation.
- Kiểm tra export/deletion.
- Hoàn thiện runbooks, known issues, exceptions và evidence package.

## Prioritization

1. Critical: cross-tenant access, secrets, destructive data loss, missing recovery.
2. High: retention/deletion, integrity, unauthorized export, upload security.
3. Medium: metadata completeness, provenance coverage, automation.
4. Low: naming consistency and convenience improvements.

Không triển khai theo thứ tự trên nếu audit cho thấy dependency hoặc risk khác yêu cầu điều chỉnh; phải ghi lý do.
