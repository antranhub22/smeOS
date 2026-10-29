# 03 — Kiến trúc hiện trạng

```
                ┌──────────────── Render (Singapore) ────────────────┐
 Browser ──▶ smeos-web (Next.js 16) ──Prisma──▶ smeos-postgres (PITR 3–7 ngày)
              │  /api/v1/** (383 route)            ▲
              │  /api/v1/storage/[...key] ──┐      │ DATABASE_URL (dùng chung)
              │                              ▼      │
              │                     StorageProvider ─┴─▶ R2/S3 (bucket do env STORAGE_*)
              │                       (put/get/signedUrl, KHÔNG delete)    hoặc var/storage
              ▼                                                ▲
         smeos-redis (rate limit)          smeos-worker-media/video/vision (Python)
         smeos-cron-dispatch-sweep (5')         └─ workers/shared/storage.py (SigV4 riêng)
```

## Ranh giới trách nhiệm (OBSERVED)
- **Tenant isolation ở DB:** `scopedWhere(ctx, …)` trong repository; xoá theo `deleteMany` có điều kiện tổ chức (`asset-repository.ts:97-104`).
- **Tenant isolation ở kho:** key có tiền tố `org/<organization_id>/`, dựng phía máy chủ (`storage-key.ts`), đối chiếu khi đăng ký (`register-asset.ts:51`). Truy cập payload chỉ dựa vào **chữ ký HMAC theo key** (`storage-signing.ts:17-25`, dùng `SESSION_SECRET`), không kiểm tenant tại thời điểm đọc. Đây là thiết kế "bearer URL" có chủ ý.
- **Ngoại lệ:** tiền tố `videos/` không cần chữ ký (`route.ts:15`).
- **Hai bản cài SigV4 độc lập:** TS (`modules/assets/domain/sigv4.ts`) và Python (`workers/shared/storage.py:59-105`), nên có nguy cơ lệch hành vi.
- **Hai tầng "storage":** `modules/assets` (payload + registry) và `modules/storage` (thùng rác, đặt trạng thái ARCHIVED trong `metadata`/`attributes` JSON).

## INFERENCE
- Trạng thái "trong thùng rác" lưu ở JSON `metadata.trashed_at/expires_at`, không phải cột, nên không index và không ràng buộc được (độ tin cậy cao, `trash-repository.ts:137-196`).
- Dùng `SESSION_SECRET` để ký URL kho: xoay khoá phiên sẽ vô hiệu mọi URL kho đang lưu (độ tin cậy cao).
