# 08 — Storage routing matrix (đề xuất)

| Lớp | Hệ thống | Tiền tố key | Truy cập | Cache | Retention | Backup |
|---|---|---|---|---|---|---|
| Business data | Postgres | — | `requireTenantContext` + capability | — | D-03 | PITR + export định kỳ (D-01) |
| Input ảnh/video | R2 | `org/<org>/<product\|unfiled>/<asset>.<ext>` | URL ký ≤ 15 phút | `private` | Theo product; thùng rác 30 ngày (D-03) | Versioning R2 (D-06) |
| Input bảng tính (PII) | R2 | `org/<org>/imports/<asset>.<ext>` | URL ký, `attachment` | `private, no-store` | Ngắn, ví dụ 30 ngày (D-03) | Không cần |
| Output AI nội bộ | R2 | `org/<org>/…` (như trên) | URL ký | `private` | Như input | Versioning |
| Output công khai đã duyệt | R2 | `public/<org>/<asset>.<ext>` (thay `videos/`) | Chỉ GET, chỉ khi `approval_state=APPROVED` | `public` | Đến khi gỡ | Versioning |
| Tạm/trung gian worker | R2 | `tmp/<org>/<job>/…` | Chỉ worker | — | Lifecycle rule 7 ngày (D-03) | Không |
| Quarantine | R2 | `quarantine/<org>/…` | Không phục vụ ra ngoài | — | Đến khi xác thực xong | Không |
| Governance | Postgres `audit_logs`, `*_events` | — | Capability quản trị | — | D-03 (thường dài hơn dữ liệu) | PITR |
| Secrets | Render env | — | Render | — | — | Ngoài phạm vi |
