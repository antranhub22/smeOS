# 06 — Gap analysis (SDAGF mục tiêu ↔ hiện trạng)

| Miền SDAGF | Tài liệu framework | Hiện trạng | Gap | Tailoring đề xuất |
|---|---|---|---|---|
| Taxonomy | 04 | `asset_kind` cho ảnh/video | Thiếu lớp bảng tính, audio, collage, export, governance | Giữ `asset_kind`, thêm trường `asset_class` (6 lớp SDAGF), không tách bảng |
| Routing | 05 | 1 bucket, 2 tiền tố | Không có lớp public/private/quarantine/temp | 1 bucket với 4 tiền tố, đủ cho quy mô hiện tại; **không** cần nhiều bucket |
| Identity/metadata | 06 | UUID + key org | `metadata` JSON tự do | Cột bắt buộc nhỏ + zod cho JSON |
| Access | 07 | HMAC bearer URL, ngoại lệ video | C-007 FAIL | Mọi đọc/ghi phải ký có hạn; public chỉ qua tiền tố `public/` chỉ-đọc |
| Lifecycle/retention | 08 | 30 ngày thùng rác, lazy purge | Không retention, không legal hold, không xoá payload | Outbox xoá + cron purge; retention do PO chốt |
| Provenance | 09 | Tốt cho ảnh AI | Video/audio thiếu | Áp lại cột sẵn có cho `video_jobs`/audio |
| Security/recovery | 10 | PITR DB | Không backup kho, chưa diễn tập | Bật versioning R2 / sao chép, diễn tập theo quý |
| Contracts | 11 | `StorageProvider` thiếu `delete`/`head` | Contract chưa đủ | Mở rộng port, không tạo service mới |
| Audit/observability | 12 | `audit_logs` rộng | Chưa chắc phủ export/xoá vĩnh viễn/tải | Danh sách sự kiện bắt buộc + test |
| Readiness/handover | 15 | Có quy trình bàn giao | Chưa có checklist kho tệp | Bổ sung bước quét kho, đối soát |

**Không áp nguyên xi:** chưa cần service "Artifact Registry" riêng. Bảng `assets` cùng module `assets`/`storage` đáp ứng được mà không phá ranh giới domain/infra (CLAUDE.md luật 4).
