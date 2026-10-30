# 13 — Đánh giá lại 30 control sau P0–P4 (29/10/2026)

Phạm vi: mã trên branch `claude/focused-faraday-nlh8p6` (PR antranhub22/smeOS#72). Bằng chứng: code, test (unit + tenant/platform chạy trên Postgres 16 thật), migration đã áp. **Không** gồm bằng chứng ngoài repo (Render, R2, log runtime) — các control phụ thuộc vào đó giữ nguyên NOT_ASSESSED hoặc FAIL tới khi có biên bản.

| ID | Control | Ban đầu | Hiện tại | Bằng chứng chính | Còn thiếu |
|---|---|---|---|---|---|
| 001 | Inventory asset classes | PARTIAL | **PASS** | `02-asset-inventory.md`, ánh xạ `asset_kind` → lớp SDAGF ở `07-target-architecture.md` (T-tailoring) | — |
| 002 | System of record mỗi class | PARTIAL | **PASS** | `STORAGE_REFERENCE_SOURCES` (10 nguồn, gồm 2 nguồn JSON) | — |
| 003 | Storage routing | PARTIAL | **PASS** | `08-storage-routing-matrix.md`; khoá do máy chủ dựng | Lifecycle rule `tmp/` khi có tiền tố tạm |
| 004 | Asset ID ổn định | PASS | PASS | — | — |
| 005 | Metadata bắt buộc validate | PARTIAL | PARTIAL | Kiểu tệp/cỡ kiểm phía máy chủ (P0-2) | `metadata` JSON chưa có schema |
| 006 | Tenant context server-side | PASS | PASS | `test:tenant` 595 ca (2 đỏ có sẵn ở `product-copies`, đỏ y hệt trên `main`) | — |
| 007 | Không dùng path/ID thay authz | FAIL | **PASS** | Bỏ miễn `videos/`; chữ ký gắn phương thức | — |
| 008 | Upload validation | FAIL | PARTIAL | Cỡ, magic-byte, SVG sandbox | Quét malware (D-07: khi khách yêu cầu) |
| 009 | Secrets ngoài repo/log | PASS | PASS | gitleaks CI; `STORAGE_SIGNING_SECRET` tách khoá | — |
| 010 | Lifecycle transitions | PARTIAL | PARTIAL | `trashed_at/purge_after` thành cột | State machine tập trung cho `asset_state` |
| 011 | Retention có owner/cơ sở | FAIL | PARTIAL | D-03 đã duyệt; thùng rác 30 ngày thực thi bằng cron | Luật sư xác nhận; retention log/audit/bảng tính chưa tự động |
| 012 | Deletion versions/derived | FAIL | PARTIAL | Outbox + đếm tham chiếu 10 nguồn | **Bật cờ** sau backup R2 |
| 013 | Legal hold | FAIL | **PASS** | Cấp asset + cấp tổ chức; chặn API/thùng rác/cron/outbox/dọn bàn giao; N14 + audit | — |
| 014 | Versioning không ghi đè | PARTIAL | PARTIAL | PUT chỉ với chữ ký PUT 15 phút, khoá UUID | Ghi một lần (`If-None-Match`) |
| 015 | Provenance | PASS | PASS | Cột provenance `assets` | Video/audio chưa có model/provider đầy đủ |
| 016 | Retry/idempotency | PARTIAL | PASS | Outbox `@@unique([op, storage_key])`, thử lại ≤ 5 | — |
| 017 | Reconciliation | FAIL | PARTIAL | `npm run storage:reconcile` (chỉ đọc) | Chạy trên production + biên bản |
| 018 | Audit hành động nhạy cảm | PARTIAL | **PASS** | Export ×4, xoá vĩnh viễn ×3 (cùng transaction), legal hold ×2 | — |
| 019 | Encryption/access storage | NOT_ASSESSED | NOT_ASSESSED | — | Bằng chứng R2 (D-08) |
| 020 | Backup scope & RPO/RTO | PARTIAL | PARTIAL | D-01/02 đã duyệt | Backup R2 (P1-4), DB export ngoài Render |
| 021 | Restore đã kiểm thử | FAIL | **FAIL** | — | Biên bản diễn tập có ngày (P1-5) |
| 022 | Module dùng contract chuẩn | PARTIAL | PARTIAL | 12 nơi ghi khai trong test hợp đồng | Worker video ghi đĩa cục bộ (R-14) |
| 023 | CI kiểm policy trọng yếu | PARTIAL | **PASS** | `storage-write-contract`, `export-audit`, `storage-route-signature`, `route-capability-guard` | — |
| 024 | Compatibility plan | PASS | PASS | Migration khớp schema (CI), backfill an toàn | — |
| 025 | Handover không lộ secret | PASS | PASS | `14-handover-checklist.md` | — |
| 026 | Orphan/failed lifecycle | FAIL | PARTIAL | Outbox giới hạn thử; đối soát phát hiện mồ côi | Quyết định tự dọn mồ côi |
| 027 | Truy cập backup | NOT_ASSESSED | NOT_ASSESSED | — | IAM Render/R2 (D-08) |
| 028 | Test xuyên tenant search/export | PASS | PASS | + `tests/tenant/storage-lifecycle.test.ts` | — |
| 029 | Log không lộ payload | NOT_ASSESSED | NOT_ASSESSED | Log lọc khoá nhạy cảm; audit export không ghi ô tìm kiếm | Rà log runtime (D-08) |
| 030 | Exception có owner/hạn | PARTIAL | PARTIAL | Ngoại lệ `videos/` đã bỏ | Sổ đăng ký ngoại lệ chính thức |

**Tổng hiện tại:** PASS 15 · PARTIAL 11 · FAIL 1 (021) · NOT_ASSESSED 3 (019, 027, 029).

## Cổng sẵn sàng (theo `10-implementation-roadmap.md`)
| Cổng | Trạng thái | Chặn bởi |
|---|---|---|
| Commercial-ready | **Chưa** | 021 FAIL (Critical/High); DPA chưa có mốc retention đã qua luật sư |
| Production-ready | **Chưa** | Backup R2 + diễn tập; bật cờ xoá payload; R-14 (video worker) |
| Enterprise-grade | Gần | Thêm 019/027/029 có bằng chứng; sổ ngoại lệ |
| Handover-ready | **Chưa** | Mọi mục ở `14-handover-checklist.md` |

Không có kết luận chứng nhận ISO/SOC 2 nào từ đánh giá này.
