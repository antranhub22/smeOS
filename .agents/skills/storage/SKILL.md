---
name: storage
description: >-
  Kiến trúc lưu trữ tệp SMEOS: StorageProvider port, khoá org/<org>/…, URL ký theo phương thức,
  kiểm nội dung tải lên, registry nguồn tham chiếu, thùng rác 30 ngày, xoá vĩnh viễn + outbox,
  legal hold, đối soát, Kho dữ liệu v2. Kích hoạt khi ghi/đọc/xoá tệp, sửa src/modules/assets,
  src/modules/storage, api/v1/storage, worker ghi kho, hoặc route xuất dữ liệu.
---

# Storage

Đọc trước: `.agents/standards/smeos/02-storage.md` (code thật + trạng thái), rồi `.agents/standards/universal/02-storage.md`.

Bắt buộc:
- Ghi chỉ qua `StorageProvider` + `buildStorageKey`. Adapter AI/media không ghi kho.
- Nơi ghi mới → thêm nguồn `STORAGE_REFERENCE_SOURCES` + `countPayloadReferences` + khai trong `tests/unit/architecture/storage-write-contract.test.ts`.
- Chỉ phát URL ký có hạn, đúng phương thức. Không thêm ngoại lệ không ký.
- Xoá qua use-case thùng rác/xoá vĩnh viễn (legal hold 409, outbox, audit). Không gọi `storage.delete` trực tiếp.
- Route xuất dữ liệu → audit (test kiến trúc `export-audit.test.ts`).
- Bật `STORAGE_DELETE_PAYLOADS`, đổi số ngày giữ, đổi legal hold → hỏi PO.

Gate: `npm test`, `npm run test:tenant` (`storage-lifecycle`), `npm run storage:reconcile` (chỉ đọc).
