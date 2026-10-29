# 10 — Implementation roadmap (chờ duyệt — chưa thực hiện gì)

| Task | Nội dung | Owner role | Phụ thuộc | Acceptance criteria | Test | Rollback | Evidence |
|---|---|---|---|---|---|---|---|
| **P0-1** | Bỏ ngoại lệ `videos/` cho PUT ngay; GET chuyển sang URL ký (T1) | Backend | D-05 | PUT không chữ ký → 4xx; video vẫn phát trong app | Unit route + tenant test | Revert | Test xanh, diff |
| P0-2 | Giới hạn byte, sniff magic, xử lý SVG, ghi một lần (T2) | Backend | — | Tệp > giới hạn → 413; MIME giả → 4xx | Unit | Revert | Test |
| P0-3 | Rà log truy cập Render: đã có ai PUT `videos/` chưa | DevOps | — | Biên bản | — | — | Log export (đã redact) |
| P0-4 | Thu bằng chứng cấu hình bucket R2 (public, SSE, key scope) | DevOps | — | Ảnh chụp/biên bản | — | — | C-019/027 |
| **P1-1** | Duyệt catalog lớp tài sản + routing matrix | PO + Architect | Báo cáo này | Tài liệu CANONICAL | check:docs | — | ADR |
| P1-2 | Migration cột metadata + `storage_outbox` (09) | Backend | Duyệt schema | Migration khớp schema (CI) | test:tenant | Migration down | — |
| P1-3 | `StoragePort.delete/head` (TS + Python) | Backend | P1-2 | Xoá asset → outbox → payload biến mất | Unit + pytest | Tắt consumer | — |
| P1-4 | Bật versioning/sao chép R2 | DevOps | D-06 | Xoá nhầm khôi phục được | Diễn tập | Tắt | Biên bản |
| P1-5 | Diễn tập PITR lần đầu | DevOps | D-01/02 | RTO đo thực tế | — | Xoá instance tạm | Biên bản có ngày |
| P1-6 | Cron purge thùng rác thay lazy purge | Backend | P1-2, D-03 | Purge chạy khi không ai mở UI | Unit | Tắt cron | — |
| **P2-1** | Pilot module `assets` + `storage`: legal hold, đối soát report-only | Backend | P1 | Báo cáo mồ côi/thiếu | Unit | Tắt job | Báo cáo đầu tiên |
| P2-2 | Sự kiện audit bắt buộc (T9) | Backend | — | Có dòng audit cho export/purge | Unit | — | — |
| **P3** | Chuyển dần video-studio, audio-studio, greeting-card, avi-gift-import, worker Python sang contract | Backend | P2 | Mọi `put` có dòng registry | Test kiến trúc | Theo module | — |
| **P4** | CI: negative test route storage; test kiến trúc cấm `put` ngoài port; kiểm cột bắt buộc | Backend | P3 | CI chặn vi phạm | — | — | ci.yml |
| **P5** | Kiểm lại 30 control, checklist bàn giao kho tệp, diễn tập restore kho | Architect + PO | P4 | Không còn FAIL Critical/High | — | — | Báo cáo audit lại |

## Tiến độ
| Task | Trạng thái | Bằng chứng |
|---|---|---|
| P0-1 | **Xong**: bỏ miễn chữ ký `videos/`; chữ ký gắn phương thức (URL GET không dùng để PUT được); thêm `STORAGE_SIGNING_SECRET` | `src/app/api/v1/storage/[...key]/route.ts`, `src/modules/assets/infra/storage-signing.ts`, `tests/unit/storage/storage-route-signature.test.ts` |
| P0-2 | **Xong**: giới hạn byte theo kiểu tệp (ảnh 20MB, video 100MB, bảng tính 25MB), đọc body có giới hạn, kiểm magic-byte, kiểu tệp lấy từ key, SVG có CSP sandbox. *Chưa làm:* ghi một lần (P1) | `src/modules/assets/domain/upload-content-rules.ts` (+ test) |
| P0-3, P0-4 | Chờ DevOps (D-08) | — |

## Tiêu chí sẵn sàng bàn giao (map `docs/governance/sdagf/15-readiness-and-handover.md`)
| Cổng | Điều kiện đạt |
|---|---|
| Commercial-ready | Không còn FAIL ở control Critical (007, 021, 028); DPA ghi rõ retention D-03 và backup D-01/02 |
| Production-ready | P0 + P1 xong; diễn tập PITR và restore R2 có biên bản; cron purge và job đối soát chạy |
| Enterprise-grade | P2–P4 xong: legal hold, audit sự kiện bắt buộc, CI chặn vi phạm contract kho; rà quyền mỗi quý |
| Handover-ready | P5: audit lại 30 control không còn FAIL Critical/High; checklist bàn giao gồm quét secret, đối soát kho, biên bản xác nhận xoá mẫu, runbook restore đã chạy thử |
