# 13. Assessment Control Catalog

## 1. Cách đánh giá

Mỗi control có một trạng thái:
- `PASS`: có bằng chứng phù hợp.
- `PARTIAL`: thực hiện một phần hoặc bằng chứng chưa đủ.
- `FAIL`: chưa đáp ứng.
- `NOT_APPLICABLE`: có lý do được ghi lại và người có thẩm quyền chấp thuận.
- `NOT_ASSESSED`: chưa kiểm tra.

Mức độ rủi ro:
- `CRITICAL`: có thể dẫn đến cross-tenant data exposure, mất dữ liệu trọng yếu, lộ secrets hoặc phá vỡ kiểm soát nghiêm trọng.
- `HIGH`: rủi ro lớn đối với dữ liệu, quyền truy cập, tính toàn vẹn hoặc khả năng phục hồi.
- `MEDIUM`: kiểm soát thiếu có tác động giới hạn hoặc có biện pháp bù trừ.
- `LOW`: vấn đề tối ưu hóa hoặc tài liệu hóa không chặn vận hành.

Mức độ cuối cùng phải dựa trên impact, likelihood, exposure và compensating controls.

## 2. Controls

| ID | Control | Bằng chứng tối thiểu | Mức mặc định |
|---|---|---|---|
| SDAGF-001 | Có inventory asset classes | Catalog được duyệt, mapping module | High |
| SDAGF-002 | Mỗi class có system of record | Data ownership matrix | High |
| SDAGF-003 | Storage routing được định nghĩa | Routing matrix và config/code mapping | High |
| SDAGF-004 | Asset ID ổn định | Schema/code/test | Medium |
| SDAGF-005 | Metadata bắt buộc được validate | Schema + automated tests | Medium |
| SDAGF-006 | Tenant context được kiểm tra server-side | Code review + negative tests | Critical |
| SDAGF-007 | Không dùng path/ID thay cho authorization | Code/tests | Critical |
| SDAGF-008 | Upload validation/quarantine phù hợp rủi ro | Tests/config/scan evidence | High |
| SDAGF-009 | Secrets không nằm trong assets/logs/repository | Secret scan + review | Critical |
| SDAGF-010 | Lifecycle state transitions được kiểm soát | State machine + tests | High |
| SDAGF-011 | Retention có owner và cơ sở | Retention matrix | High |
| SDAGF-012 | Deletion xử lý versions/derived copies | Deletion design + tests | High |
| SDAGF-013 | Legal hold ngăn xóa khi áp dụng | Policy + tests | High |
| SDAGF-014 | Versioning không ghi đè trái phép | Code/tests | High |
| SDAGF-015 | Provenance input-output cho output quan trọng | Lineage records + sample trace | Medium |
| SDAGF-016 | Retry/idempotency được xử lý | Integration tests | High |
| SDAGF-017 | Registry/payload reconciliation có cơ chế | Job/runbook/evidence | High |
| SDAGF-018 | Audit events cho hành động nhạy cảm | Sample events + tests | High |
| SDAGF-019 | Storage encryption/access controls được xác minh | Config/provider evidence | High |
| SDAGF-020 | Backup scope và RPO/RTO được phê duyệt | Policy/runbook | High |
| SDAGF-021 | Restore đã được kiểm thử | Dated restore evidence | Critical/High |
| SDAGF-022 | Module dùng contract chuẩn | Dependency/code audit | Medium |
| SDAGF-023 | CI kiểm tra policy trọng yếu | Pipeline evidence | High |
| SDAGF-024 | Schema/API changes có compatibility plan | PR/ADR/test | Medium |
| SDAGF-025 | Client handover không lộ secrets | Release checklist/scan | Critical |
| SDAGF-026 | Orphan/failed artifacts có lifecycle | Reconciliation and cleanup policy | Medium |
| SDAGF-027 | Access to backups is restricted | IAM/config review | High |
| SDAGF-028 | Cross-tenant search/export tests exist | Negative test evidence | Critical |
| SDAGF-029 | Error/log output avoids sensitive payload | Test/log review | High |
| SDAGF-030 | Policy exceptions have owner and expiry | Exception registry | Medium |

## 3. Finding record

Mỗi finding phải có:
- `finding_id`
- `control_id`
- status
- observed facts
- evidence references
- impact/likelihood
- severity
- affected modules/assets/tenants
- root cause (nếu xác minh được)
- recommended remediation
- owner
- target date
- decision/exception
- verification evidence
- closure approver.

## 4. Evidence rules

- Ưu tiên code, schema, configuration, automated test results, deployment settings, logs và runbook được xác minh.
- Tài liệu mô tả ý định không đủ để chứng minh runtime behavior.
- Không suy diễn “không tồn tại” chỉ vì không tìm thấy trong một thư mục.
- Ghi rõ phạm vi audit, commit SHA/branch và thời điểm kiểm tra.
- Không đưa secret hoặc dữ liệu cá nhân thật vào báo cáo.
- Mọi NOT_APPLICABLE phải có rationale.

## 5. Readiness gate

Không tính trung bình để che lấp control Critical/High chưa đạt. Gate phải định nghĩa controls bắt buộc cho từng loại release và chấp nhận ngoại lệ theo chính sách.
