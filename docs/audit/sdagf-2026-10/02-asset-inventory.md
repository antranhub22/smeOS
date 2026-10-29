# 02 — Asset inventory (Phase 2)

Nhãn: **F** = OBSERVED FACT, **I** = INFERENCE, **?** = chưa xác minh.

| Lớp tài sản | Ví dụ / module | System of record | Lưu vật lý | Định danh / metadata | Tenant scope | Nhạy cảm | Vòng đời / version | Thực thi quyền | Provenance | Retention / xoá | Backup | Độ tin cậy / gap |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| **Input — ảnh/video người dùng tải lên** | `assets` kind `ORIGINAL`; coordinator (ảnh thành phẩm) | Bảng `assets` (F, `schema.prisma:424`) | R2/S3 hoặc `var/storage` (F) | `id` UUID cấp ở `create-upload-url.ts`; key `org/<org>/<product\|unfiled>/<id>.<ext>` (F) | `organization_id` + key (F) | Trung bình (có thể có mặt người) | `state` PROCESSING/READY/FAILED/ARCHIVED; `version` Int (F) | Cấp URL: session+capability; tải lên: HMAC 15 phút (F) | `input_sha256` (F) | Thùng rác 30 ngày → xoá **chỉ dòng DB** (F) | **Không** (F/?) | Cao. Gap: không xoá payload, không quét nội dung |
| **Input — bảng tính nhập liệu** | `avi-gift-import`, products batch import (xlsx/csv) | `assets` + bảng nghiệp vụ | Kho tệp | như trên | có | Cao (có thể chứa PII khách) | Không rõ | HMAC; tải xuống `private, max-age=3600` (F, `route.ts:70`) | ? | Không thấy chính sách | Không | Trung bình |
| **Business data** | products, orders, crm customers, greeting-card… (113 model) | Postgres (F) | Render Postgres | UUID | `organization_id` + index (F, CLAUDE.md luật 2) | Cao (PII khách, đơn, thanh toán) | Chủ yếu ghi đè; 2 model có `deleted_at` (F) | `requireTenantContext` + `requireCapability` (F) | `order_events`, `audit_logs` (F) | Không có ma trận retention (F) | PITR 3–7 ngày (F, doc) | Cao |
| **Intermediate** | phân tích vision, `generation_jobs`, `job_events`, `video_jobs` | Postgres | DB + kho tệp | `idempotency_key` unique theo (org, feature) (F, `schema.prisma:525`) | có | Thấp–TB | Job đứng quá 15 phút bị cron dọn (F, `render.yaml` §5) | Worker dùng DB URL chung | `job_events` | Không thấy dọn tệp trung gian | PITR (DB) | Trung bình |
| **Output AI** | `assets` kind ENHANCED/MASTER/MARKETING/SOCIAL/VIDEO/RATIO; audio; landing; greeting collage | `assets`, `video_jobs` | Kho tệp | `parent_asset_id`, `provider`, `model`, `model_version`, `pipeline_version`, `parameters`, `prompt`, `output_sha256`, `cost_usd` (F) | có | TB | `approval_state` + `approved_by/at` (F) | Ảnh: HMAC. **Video: không xác thực** (F, R-01) | Tốt cho ảnh (F); video: ? | Không xoá payload | Không | Cao |
| **Output công khai** | catalog công khai, landing, link video | `catalog-links` | Kho tệp | key `videos/…` cho phép (F, `get-public-catalog.ts:86`) | Theo key | TB | Không hết hạn (F) | Không có (thiết kế "public link") | ? | ? | Không | Trung bình |
| **Export** | CSV khách/đơn/vision; export dữ liệu org cho platform | Sinh lúc gọi | Stream response (I) | — | Theo ctx; platform theo `orgId` | Cao | — | `R13`, `requirePlatformContext` (F) | Có audit hay không: ? | — | — | Trung bình; cần xác minh audit cho export |
| **Technical** | migrations, seed, logs, build | Git, Render | — | — | — | Thấp–Cao (log) | Git | CI | Git | Theo Render | Git | Không có bằng chứng redaction log tập trung (?) |
| **Governance records** | `audit_logs`, `decision_id`, `*_events`, thùng rác | Postgres | DB | UUID | có | Cao | Append (I); không thấy chống sửa/xoá | Ghi qua `recordAuditLog` | — | Chưa có retention | PITR | Trung bình |
| **Secrets** | env trên Render | Render env | — | — | — | Critical | — | Render | — | — | — | Repo sạch theo quét pattern; CI có gitleaks (F) |

## Luồng dữ liệu đại diện (current state)

```
Upload:  Browser ──POST /assets/upload-url (session+cap)──▶ server cấp asset_id + key + HMAC(15')
         Browser ──PUT /api/v1/storage/<key>?exp&sig──▶ route (KHÔNG session) ──▶ StorageProvider.put
         Browser ──POST /assets {storage_key}──▶ register-asset: storageKeyMatchesContext ✔ ──▶ assets row
Xử lý:   generation_jobs (idempotency) ──▶ Python worker ──doc_bytes/ghi_bytes──▶ kho ; ghi assets(kind=…, parent_asset_id)
Video:   video_worker ──▶ ghi videos/<org>/<job>.mp4 ──▶ URL /api/v1/storage/videos/... (KHÔNG chữ ký, KHÔNG hạn)
Xem:     GET asset view-url (session) ──▶ URL HMAC ──▶ route GET (public, immutable cache)
Xoá:     DELETE /assets/:id hoặc thùng rác ──▶ deleteMany dòng DB ──╳ payload không bị xoá
Restore: thùng rác khôi phục metadata; DB: PITR Render; kho tệp: KHÔNG có cơ chế
```
