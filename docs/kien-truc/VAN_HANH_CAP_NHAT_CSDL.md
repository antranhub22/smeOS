# Vận hành — Cập nhật CSDL bằng migration

> Trạng thái `CANONICAL` · chủ sở hữu: Platform Lead · cập nhật 22/10/2026.
> Áp dụng từ commit chuyển `render.yaml` sang `npm run db:deploy` (rà soát 21/10/2026, giai đoạn 3).

## 1. Vì sao đổi

Trước 22/10, mỗi lần build trên Render chạy `prisma db push --accept-data-loss`. Lệnh đó ép CSDL
thật khớp `schema.prisma` bằng mọi giá: đổi tên một cột là Prisma xoá cột cũ, tạo cột mới, **mất dữ
liệu mà không ai duyệt**. Lịch sử `prisma/migrations/` cũ cũng không dùng được nữa: dừng từ 07/10,
và chạy lại từ CSDL rỗng thì lỗi ở migration thứ bảy
(`20260922025831_…` sửa bảng `product_analysis_runs` mà chưa migration nào tạo).

Từ nay:

| Việc | Lệnh |
|---|---|
| Deploy (Render, tự động) | `npm run db:deploy` → `scripts/db-deploy.mjs` → `prisma migrate deploy` |
| Đổi schema (máy dev) | `npx prisma migrate dev --name <ten_thay_doi>` rồi commit migration cùng schema |
| CI | Dựng CSDL bằng `npm run db:deploy`, rồi `prisma migrate diff ... --exit-code`: schema đổi mà thiếu migration là đỏ |
| CSDL test (`*_test`) | vẫn `db push` qua `npm run db:test:setup` — CSDL đó bị xoá sạch trước mỗi ca thử |

## 2. Migration nền `20261022000000_smeos_baseline`

Là toàn bộ lược đồ tại ngày 22/10/2026, sinh bằng
`prisma migrate diff --from-empty --to-schema prisma/schema.prisma --script`.
21 migration thời floraos (`0_init` … `20261007120000_greeting_catalog_event_product`) đã gỡ khỏi
thư mục; xem lại trong lịch sử git của `prisma/migrations/`.

Ràng buộc `orders_balance_vnd_check` (CHECK) có trong migration cũ nhưng **không** có trong nền:
production chạy `db push` nên chưa từng có nó, đưa vào nền sẽ làm CSDL mới khác CSDL thật. Bất biến
`balance_vnd = total_vnd - paid_vnd` vẫn do code giữ.

## 3. `npm run db:deploy` làm gì

`scripts/db-deploy-plan.mjs` đọc trạng thái CSDL rồi chọn bước (test: `scripts/db-deploy-plan.test.ts`):

| Trạng thái CSDL | Các bước |
|---|---|
| Đã có dòng `20261022000000_smeos_baseline` trong `_prisma_migrations` | `migrate deploy` — đường thường ngày |
| Rỗng (chưa có bảng `organizations`) | `migrate deploy` dựng từ đầu |
| Có bảng, chưa có nền (đang chạy bằng `db push`) | kiểm lệch → cất lịch sử cũ → đánh dấu nền đã áp → `migrate deploy` |

- **Kiểm lệch:** `prisma migrate diff --from-config-datasource --to-schema prisma/schema.prisma --exit-code`.
  Lệch là build dừng với thông báo `CSDL đang lệch schema.prisma`, không ghi gì vào CSDL.
- **Cất lịch sử cũ:** bảng `_prisma_migrations` thời floraos (nếu có) được **đổi tên** thành
  `_prisma_migrations_pre_baseline_<thời điểm>`, không xoá. Nhờ vậy dòng migration lỗi cũ không
  chặn `migrate deploy` (lỗi P3009).

Đã thử trên Postgres 16 cả bốn trường hợp: CSDL rỗng; CSDL `db push`; CSDL `db push` có lịch sử
floraos kèm một dòng lỗi và ràng buộc CHECK cũ; CSDL lệch (thêm một cột ngoài schema → build dừng,
không tạo bảng lịch sử).

## 4. Lần deploy đầu tiên sau khi đổi

1. **Sao lưu trước:** Render → `smeos-postgres` → *Recovery* → *Create export* (bản export giữ
   7 ngày), hoặc `pg_dump` từ máy được phép. Ghi lại giờ — PITR cũng quay về được mốc này.
2. Merge PR. Render tự build.
3. Đọc log build, phải thấy theo thứ tự:
   `db-deploy: các bước check-drift → … → resolve-baseline → deploy`,
   `Migration 20261022000000_smeos_baseline marked as applied.`,
   `No pending migrations to apply.`
4. Build dừng ở `CSDL đang lệch schema.prisma` → xem mục 6. App đang chạy **không** bị ảnh hưởng
   vì Render giữ bản cũ khi build lỗi.

## 5. Đổi schema từ nay

1. Sửa `prisma/schema.prisma` (cần PO duyệt — `CLAUDE.md`).
2. `npx prisma migrate dev --name <ten_thay_doi>` trên CSDL dev. Prisma sinh
   `prisma/migrations/<thời điểm>_<ten>/migration.sql`.
3. **Đọc SQL sinh ra.** `DROP COLUMN`, `DROP TABLE`, đổi kiểu cột, thêm cột `NOT NULL` không có
   mặc định đều cần cách làm hai bước:
   - Lần deploy 1: thêm cột mới (cho phép `NULL`), code ghi cả hai, chạy chép dữ liệu.
   - Lần deploy 2: khi code chỉ còn đọc cột mới, mới xoá cột cũ.
4. Commit migration **cùng** schema và code. Không sửa migration đã lên production; sai thì viết
   migration mới để sửa.

## 6. Khi gặp sự cố

**CSDL lệch ở lần đầu.** Lần deploy trước đã `db push` đúng schema này, nên lệch nghĩa là có người
sửa CSDL bằng tay hoặc có bản deploy chưa xong.
1. Chạy cùng lệnh kiểm lệch với URL production (quyền chỉ đọc là đủ), thêm `--script` để xem SQL.
2. Phần lệch là rác (cột, bảng thừa) → sao lưu, áp SQL đó bằng `npx prisma db execute --stdin`,
   rồi deploy lại.
3. Phần lệch là dữ liệu cần giữ → đưa nó vào `schema.prisma` qua một PR, rồi deploy lại.

**Migration lỗi giữa chừng (P3009).** `migrate deploy` dừng và đánh dấu migration lỗi.
1. Đọc log, sửa CSDL về trạng thái trước migration hoặc hoàn tất bằng tay.
2. `npx prisma migrate resolve --rolled-back <ten>` (đã gỡ) hoặc `--applied <ten>` (đã làm xong tay).
3. Deploy lại.

**Cần quay lui.** Prisma không có migration ngược. Có hai cách:
- Viết migration mới đảo thay đổi (ưu tiên).
- Khôi phục bản sao lưu ở mục 4 bước 1 hoặc PITR (`VAN_HANH_SU_CO_VA_SAO_LUU.md`), chấp nhận mất
  dữ liệu ghi sau thời điểm đó.
