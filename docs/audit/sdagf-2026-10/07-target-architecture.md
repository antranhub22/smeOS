# 07 — Kiến trúc mục tiêu (đề xuất, chờ duyệt)

## Logic
```
Route ─▶ use-case (domain thuần) ─▶ AssetRegistry (Prisma, assets) ─▶ StoragePort {put, get, head, delete, signedUrl}
                                   └▶ storage_outbox (xoá/sao chép bất đồng bộ, idempotent)
Cron (Render) ─▶ /internal/storage-sweep: purge hết hạn · xử lý outbox · đối soát (report-only trước)
Python worker ─▶ cùng contract (SDK chung, ghi registry trước khi trả URL)
```

## Đề xuất (mỗi mục truy về finding)

| # | Đề xuất | Giải quyết | Thay thế | Trade-off | Migration impact | Rollback | Ước lượng | Cần duyệt |
|---|---|---|---|---|---|---|---|---|
| T1 | Bỏ ngoại lệ `videos/`; video dùng URL ký có hạn, trang công khai ký lại khi render | R-01, C-007 | Giữ public nhưng chặn PUT | Link video cũ đã chia sẻ sẽ chết | Không đổi schema; worker trả key thay URL | Khôi phục ngoại lệ chỉ cho GET | S | D-05 |
| T2 | PUT: giới hạn byte theo MIME, sniff magic-byte, cấm SVG hoặc ép `attachment`, ghi một lần | R-02, C-008/014 | Quét malware ngoài (ClamAV) | Phụ thuộc mới nếu quét | Không | Revert commit | S | D-07 nếu thêm dependency |
| T3 | Thêm `delete`/`head` vào `StoragePort` + bảng `storage_outbox` | R-03, C-012/026 | Xoá đồng bộ trong request | Outbox cần schema mới | Migration thêm bảng | Tắt worker outbox | M | Schema (PO) |
| T4 | Cron purge thùng rác + legal hold (`legal_hold_until`) | R-06, C-011/013 | Giữ lazy purge | Thêm cột | Migration cột | Cron tắt được | M | D-03, D-04 |
| T5 | Job đối soát registry↔payload (report-only → auto-fix) | R-07, C-017 | Lifecycle rule R2 | Liệt kê bucket tốn I/O | Không | Tắt job | M | — |
| T6 | Backup kho: versioning/sao chép R2 + diễn tập restore DB/kho theo quý | R-04/05, C-020/021 | Rclone sang provider thứ 2 | Chi phí lưu trữ | Không đổi code | Tắt | S–M | D-01, D-02, D-06 |
| T7 | Khoá ký kho riêng `STORAGE_SIGNING_SECRET` (fallback `SESSION_SECRET`) | R-09 | Giữ nguyên | Thêm env | Không | Fallback | XS | D-07 (env) |
| T8 | Mở rộng provenance cho video/audio qua registry `assets` | R-12, C-002/015 | — | — | Ghi thêm dòng | — | M | — |
| T9 | Danh sách sự kiện audit bắt buộc (export, purge, tải bảng tính, đổi legal hold) | C-018 | — | — | Không | — | S | — |
| T10 | Test CI: negative test route storage, test kiến trúc "mọi `put` phải có registry" | C-023 | — | — | Không | — | S | — |
