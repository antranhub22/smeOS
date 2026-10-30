# 16. Templates

## A. Architecture Decision Record (ADR)

```markdown
# ADR-NNN: <Decision title>

- Status: Proposed | Accepted | Rejected | Superseded
- Date:
- Owner:
- Reviewers:
- Related controls:
- Related modules:

## Context
Vấn đề và bối cảnh đã xác minh.

## Decision
Quyết định được đề xuất/chấp thuận.

## Alternatives
Các phương án đã xem xét.

## Consequences
Tác động về bảo mật, dữ liệu, chi phí, vận hành, migration và lock-in.

## Evidence
Liên kết đến code/config/test hoặc nguồn tham chiếu.

## Rollback / Exit strategy
Điều kiện và cách quay lui.
```

## B. Asset Class Definition

```yaml
asset_class_id: example-class
name: Example asset class
description: ""
examples: []
canonical_owner: ""
system_of_record: ""
default_classification: Confidential
tenant_scope: tenant-scoped
storage_profile: DURABLE_OBJECT
lifecycle_profile: standard-review-publish
retention_policy_id: decision-required
allowed_operations: []
provenance_level: required-for-derived-output
recovery_tier: decision-required
approval_requirements: []
export_policy: restricted
deletion_constraints: []
status: proposed
approver: ""
```

## C. Audit Finding

```yaml
finding_id: SDAGF-F-0001
control_id: SDAGF-001
status: FAIL
severity: High
scope: ""
observed_facts: []
evidence_refs: []
impact: ""
likelihood: ""
recommendation: ""
owner: ""
target_date: ""
exception_id: null
verification_evidence: []
closure_status: open
```

## D. Policy Exception

```yaml
exception_id: SDAGF-EX-0001
control_id: SDAGF-001
scope: ""
reason: ""
risk_assessment: ""
compensating_controls: []
owner: ""
approver: ""
created_at: ""
expires_at: ""
review_date: ""
status: proposed
```

## E. Storage Migration Plan

```markdown
# Storage Migration Plan

## Scope and reason
## Current-state evidence
## Target state
## Asset inventory and count
## Identity mapping
## Data classification and permissions
## Copy and checksum verification
## Dual-read / cutover strategy
## Consistency and reconciliation
## Backup and rollback
## Downtime / customer impact
## Acceptance criteria
## Post-cutover monitoring
## Source cleanup approval
## Sign-off
```

## F. Test scenario

```markdown
# Test: <scenario>

- Control ID:
- Preconditions:
- Tenant/actor:
- Asset class/state:
- Action:
- Expected authorization result:
- Expected state change:
- Expected audit event:
- Expected lineage effect:
- Cleanup:
- Evidence:
```

## G. Decision log

Mọi điểm chưa thể quyết định trong audit phải ghi:
- decision ID
- question
- why it matters
- options
- evidence needed
- risk of delay
- decision owner
- due date
- final decision and rationale.
