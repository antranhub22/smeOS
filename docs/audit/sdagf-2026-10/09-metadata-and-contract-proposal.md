# 09 — Metadata & contract (đề xuất — mọi thay đổi schema cần PO duyệt)

## `assets` — cột bổ sung đề xuất
| Cột | Kiểu | Mục đích | Control |
|---|---|---|---|
| `asset_class` | enum `INPUT\|BUSINESS\|INTERMEDIATE\|OUTPUT\|TECHNICAL\|GOVERNANCE` | Taxonomy SDAGF | 001 |
| `visibility` | enum `PRIVATE\|PUBLIC` | Routing tiền tố `public/` | 007 |
| `trashed_at`, `purge_after` | DateTime? (thay JSON `metadata.trashed_at`) | Index được, cron purge | 011 |
| `legal_hold_until` | DateTime? | Chặn purge | 013 |
| `payload_state` | enum `PRESENT\|PENDING_DELETE\|DELETED\|MISSING` | Đối soát | 017 |
| `file_size`, `output_sha256` | bắt buộc với READY, server tính | Toàn vẹn | 005 |

Bảng mới `storage_outbox(id, organization_id, op, storage_key, attempts, last_error, created_at, done_at)` có `@@index([organization_id])` và `@@unique([op, storage_key])` để idempotent.

## Contract `StoragePort` (TS, `src/core/ports` hoặc `modules/assets/domain`)
```ts
interface StoragePort {
  put(key: string, body: Uint8Array, opts: { contentType: string; ifNoneMatch?: "*" }): Promise<void>
  get(key: string): Promise<Uint8Array>
  head(key: string): Promise<{ size: number; etag: string } | null>
  delete(key: string): Promise<void>           // idempotent: thiếu tệp = OK
  signedUrl(key: string, method: "GET" | "PUT", ttlSeconds: number): Promise<string>
}
```
Python worker dùng cùng ngữ nghĩa trong `workers/shared/storage.py` (thêm `xoa`, `kiem_ton_tai`).

## Quy tắc contract
1. Không payload nào được ghi khi chưa có dòng registry (trạng thái `PROCESSING`).
2. Không trả URL không ký, trừ tiền tố `public/` (chỉ GET).
3. Xoá registry luôn đi kèm bản ghi outbox trong cùng transaction.
