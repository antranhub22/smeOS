# Kế hoạch hoàn thiện kiến trúc CSDL smeOS — Production · Commercial · Enterprise

- Trạng thái: `PROPOSED` — lập 05/11/2026. Chuyển `ACTIVE` khi PO duyệt ADR-012…016 (mục 0).
- Quyết định nền: `docs/adr/ADR-012.md` (mô hình tầng) · `ADR-013.md` (cách ly, toàn vẹn) · `ADR-014.md` (dữ liệu cá nhân) ·
  `ADR-015.md` (vận hành) · `ADR-016.md` (cô lập theo gói).
- Đầu vào: báo cáo "Audit kiến trúc CSDL smeOS 4 tầng" (G1–G17, 05/11/2026) · `docs/audit/architecture-audit/15_PO_DECISION_REGISTER.md`
  · `16_IMPLEMENTATION_PLAN.md` / `18_IMPLEMENTATION_CHECKLIST.md` (các mục P1-01, P1-02, P2-A2…A5, P2-F1…F3, P3-03, P3-09
  được kế hoạch này thay thế hoặc chi tiết hoá — đánh dấu ở cột "Thay").
- Cách giao: mỗi ô checklist một PR (D-42). Mục **[SCHEMA]** cần PO duyệt từng PR (D-29); mục **[VẬN HÀNH]** đổi
  `render.yaml`/gói hạ tầng cần PO duyệt trước (`CLAUDE.md`).

## 1. Định nghĩa "kiến trúc CSDL hoàn thiện"

Chương trình chỉ được báo xong khi **mọi** dòng dưới đây có bằng chứng (đường dẫn test, biên bản, hay lệnh kiểm):

| # | Tiêu chí | Bằng chứng | Khoảng trống |
|---|---|---|---|
| DoD-1 | Cây tổ chức trong CSDL: một bảng chi nhánh, một bảng liên kết tổ chức, một hàm `resolveTierChain`; chỗ cho tầng Ngành | `tests/tenant/tier-consistency.test.ts` xanh; không còn `chain_partnerships`, `chain_branches` | G1, G2 |
| DoD-2 | Một bảng quyết định theo tầng, có lịch sử | Tenant test ma trận + thông báo + tích hợp không đổi kết quả | G3 |
| DoD-3 | RLS bật **chặn thật** trên mọi bảng tenant; 5 tài khoản CSDL; không dịch vụ nào dùng tài khoản chủ | Test "bỏ `scopedWhere` → 0 dòng"; `\du` khớp ADR-013 D-I1 | G4 |
| DoD-4 | Chia sẻ đơn cho đối tác theo tham chiếu, có hạn | Tenant test hết hạn → 404 | G5 |
| DoD-5 | Mọi bảng có trong sổ D-S1; quyết định quản trị và liên hệ/địa chỉ khách không còn nằm trong JSON (tách bảng rộng theo tính năng — ngoài phạm vi, xem mục 5) | Sổ bảng-thuộc-tenant khớp schema trong CI | G6 (một phần) |
| DoD-6 | Một hồ sơ khách mỗi tổ chức; liên hệ khách chỉ ở `customers` + `order_recipients` | Test kiến trúc: không cột liên hệ nào ngoài hai bảng | G7 |
| DoD-7 | Nhật ký bất biến; ghi truy cập của nhân viên nền tảng; ghi nhật ký ở ranh giới route | Test `UPDATE audit_logs` bị từ chối; test kiến trúc ranh giới | G8 |
| DoD-8 | Đối soát số dư hằng đêm, 0 lệch mở quá 7 ngày | Báo cáo `reconciliation_findings` | G9 |
| DoD-9 | Hạn lưu chạy hằng đêm; bảng sự kiện trong ngưỡng ADR-015 D-O6 | Truy vấn kích thước bảng trong biên bản | G10 |
| DoD-10 | Pool, `statement_timeout`, index mọi khoá ngoại | Test CI index FK; cấu hình tài khoản | G11 |
| DoD-11 | Báo cáo không làm p95 request vượt SLO | Biên bản thử tải | G12 |
| DoD-12 | Dữ liệu cá nhân mã hoá cột; xoá/xuất theo yêu cầu chạy được | Dump CSDL không có số điện thoại rõ; tenant test xoá lan sang tổ chức được chia sẻ | G13 |
| DoD-13 | Vùng dữ liệu đã chọn và ghi vào sổ quyết định | D-P7 trong `15_PO_DECISION_REGISTER.md` | G14 |
| DoD-14 | RPO ≤ 15 phút, RTO ≤ 1 giờ có biên bản diễn tập; export ngoài nhà cung cấp 35 ngày | Biên bản quý gần nhất | G15 |
| DoD-15 | Migration ở pre-deploy; CI chặn migration phá dữ liệu | Script expand/contract trong `ci.yml` | G16 |
| DoD-16 | Ba mức cô lập bán được; xuất, nhập, khôi phục riêng một tenant; dựng được một triển khai riêng | Biên bản khôi phục một tenant ≤ 4 giờ; biên bản dựng `DEDICATED` | G17 |
| DoD-17 | Thử tải quy mô mục tiêu đạt SLO | Biên bản ADR-015 D-O7 | — |

## 2. Giai đoạn và phụ thuộc

```
GĐ0 Quyết định ─► GĐ1 Nền nhanh ─► GĐ2 Mô hình tầng ─┬─► GĐ3 Cách ly & toàn vẹn ─┐
                                                      └─► GĐ4 Dữ liệu cá nhân ────┼─► GĐ6 Bật enterprise & chứng minh
                                     GĐ1 ─────────────────► GĐ5 Cô lập theo gói ──┘
```

GĐ3 và GĐ4 chạy song song sau GĐ2. GĐ5 cần sổ bảng (GĐ1) và nhật ký/`smeos_system` (GĐ3). GĐ6 cần tất cả.

## 3. Checklist

Ký hiệu: **[SCHEMA]** đổi schema · **[VẬN HÀNH]** hạ tầng/`render.yaml` · **[PO]** quyết định của PO · **B5** chạm Thẻ chào,
cần test khoá hành vi trước.

### GĐ0 — Quyết định (trước mọi PR)

- [ ] PO duyệt ADR-012 (✓ 06/11/2026), ADR-013, ADR-014, ADR-015, ADR-016 (đổi trạng thái thành `ĐÃ CHỐT`)
- [x] ADR-012 §6: (1) nhượng quyền không xem báo cáo chuỗi — D-53 · (2) không làm công cụ tách chi nhánh — D-54 · (3) `FLOWER_NETWORK` chỉ là nhãn, gộp về `CHAIN` — D-55
- [ ] ADR-013 §6: chủ tổ chức xem nhật ký truy cập trong ứng dụng? mốc bật RLS chặn thật?
- [x] ADR-014 §6: tìm theo 4 số cuối (D-49) · hạn lưu mức thường dùng (D-50) · vùng dữ liệu B (D-51)
- [ ] Kế toán/pháp lý xác nhận bảng hạn lưu D-50 trước khi cam kết với khách
- [x] ADR-015 §6: gói CSDL theo giai đoạn + kênh cảnh báo (D-52)
- [ ] PO duyệt con số chi phí giai đoạn G-a; cho email + nhóm Telegram nhận cảnh báo; xác nhận quy mô thử tải (D-40)
- [ ] ADR-016 §6: gói nào được `SHARED_PLUS` / `DEDICATED`? hạn giữ dữ liệu sau khi khách rời?
- [ ] Ghi mọi câu trả lời vào `15_PO_DECISION_REGISTER.md` (mã D-49 trở đi)

### GĐ1 — Nền nhanh (không đổi mô hình; phần lớn không chạm schema)

| ☐ | Mục | ADR | Thay | Gate thêm |
|---|---|---|---|---|
| [x] | O-1 [SCHEMA] Index cột con của 34 khoá ngoại + test CI "FK phải có index" (làm 61 khoá: gồm cả khoá cũ thiếu index — PR #135) | 015 | P2-F3 (một phần) | `migrate diff` sạch |
| [x] | O-2 Khai `max` pool từng dịch vụ (web, 3 worker, cron) | 015 | — | Bảng tổng kết nối trong runbook — PR #135 |
| [ ] | O-3 [VẬN HÀNH] Nâng gói CSDL (I-7) + `pg_stat_statements` + cảnh báo D-O8 | 015 | P1-02 | Cảnh báo thử tới người nhận I-5 |
| [x] | O-4 [VẬN HÀNH] Migration ở pre-deploy; production chỉ seed hệ thống | 015 | P1-01 | Build không chạm CSDL — PR #135; còn: export nhanh trước migration (cùng O-6) |
| [x] | O-5 Script CI kiểm expand/contract trên `migration.sql` mới | 015 | — | Ca thử: `DROP COLUMN` không chú thích → đỏ — PR #135 |
| [ ] | O-6 [VẬN HÀNH] Export đêm ra kho ngoài nhà cung cấp, giữ 35 ngày + 12 tháng | 015 | — | 7 bản liên tiếp |
| [ ] | O-7 [VẬN HÀNH] Diễn tập PITR lần đầu + biên bản | 015 | P1-02 | RTO đo được ≤ 1 giờ |
| [ ] | Dọn khoá `NOT VALID` còn sót của PR #127 (`VAN_HANH_CAP_NHAT_CSDL.md` §7) | 015 | — | 0 dòng `NOT convalidated` |
| [x] | S-1 Sổ bảng-thuộc-tenant sinh từ schema; `TENANT_TABLES` đọc sổ | 016 | — | `check:docs` + test sổ khớp schema — PR #135 |
| [x] | P-1 Nhãn `@pii` + `pii-registry` + test CI | 014 | — | Cột cá nhân không nhãn → đỏ |
| [x] | T-1 `resolveTierChain` trên bảng hiện tại; thay 4 bản tra chuỗi cha (CRUD quan hệ, kiểm liên kết, danh sách đối tác chuyển ở T-3) | 012 | P2-A2 (phần hàm) | Tenant test khoá công cụ, ma trận, thông báo — PR #135 |
| [x] | I-3 Job đối soát `paid_vnd` (PR #135); `credit_balance` để sau P2-B5 vì chưa có sổ nạp credit | 013 | — | Tenant test dữ liệu lệch được phát hiện |

### GĐ2 — Mô hình tầng (ADR-012)

| ☐ | Mục | Thay | Gate thêm |
|---|---|---|---|
| [x] | T-2 [SCHEMA] `organization_links` + backfill + ghi kép + `is_primary` (giữ bằng trigger ràng buộc — Prisma không khai được index riêng phần) | P2-A2 | Tenant test đối tác hai chuỗi: cạnh chính đúng, tạm ngưng thì chuyển — `tests/tenant/organization-links-sync.test.ts` |
| [x] | T-3a Mọi đọc sang `organization_links` (lọc cạnh chuỗi); bỏ `BRANCH` ở API; ghi kép giữ để quay lui được | P2-A2 | `test:tenant`, `test:platform` |
| [x] | T-3b [SCHEMA] Ghi thẳng `organization_links`; contract: xoá `chain_partnerships` — PO duyệt 06/11/2026 (trang đối tác, chat nội bộ còn khoá "Sắp ra mắt" trên production; migration có chốt dừng khi dữ liệu chưa khớp) | P2-A2 | `test:tenant`, `test:platform`; `check:migrations` (`-- contract:`) |
| [x] | T-4a [SCHEMA] **B5** Thêm cột điều phối vào `branches`, chép `chain_branches` (D-57), `memberships.branch_id` (D-56), `orders.branch_id` cho đơn đã nhận; ghi kép | P2-A3 | Giá theo chi nhánh, `/cua-hang`, điều phối không đổi; `tests/tenant/branches-merge.test.ts` |
| [x] | T-4b Mọi đọc chi nhánh điều phối / trang cửa hàng sang `branches` (`accepts_dispatch`, `memberships.branch_id`) | P2-A3 | Như trên |
| [x] | T-4c [SCHEMA] Ghi thẳng `branches`; contract: xoá `chain_branches`, `memberships.chain_branch_code` (PO duyệt 06/11/2026; migration có chốt dừng khi dữ liệu chưa khớp) | P2-A3 | `check:migrations` (`-- contract:`) |
| [ ] | T-5 `grants` có phạm vi trong `TenantContext`; phạm vi chi nhánh đợt 1 (đơn, khách, điều phối) | P2-A4, P2-A5 | Tenant test chéo chi nhánh |
| [ ] | T-5b Phạm vi chi nhánh đợt 2 (sản phẩm/giá, kho, báo cáo) và đợt 3 (còn lại) | P2-A5 | Như trên, từng đợt |
| [x] | T-6a [SCHEMA nhỏ] `industries` (seed 7 ngành plugin) + `organizations.industry_key` (khoá ngoại), chép từ `settings.industry`, trigger đồng bộ; `resolveTierChain` đọc cột | P2-A1 (xem ghi chú) | `npm run check:industry`; `tests/tenant/industries.test.ts` |
| [ ] | T-6b Đường đọc ngành còn lại sang `industry_key`; khoá phạm vi dạng `platform · industry: · org: · branch:` (`notification_hard_locks`, `integration_governance`) | P2-A1 | Ma trận thông báo, tích hợp không đổi kết quả |
| [ ] | T-6c [SCHEMA] Contract: bỏ `settings.industry` và trigger đồng bộ | — | `check:migrations` |
| [ ] | T-7 [SCHEMA] `governance_decisions` + backfill + chuyển `layered-resolver` + contract | — | Ma trận, thông báo, tích hợp không đổi kết quả |
| [x] | T-8a Đổi dữ liệu `organization_type.FLOWER_NETWORK` → `CHAIN` (kể cả yêu cầu đổi mô hình đang chờ); mọi đường ghi lưu `CHAIN` (D-55) | — | Chuỗi cũ loại `FLOWER_NETWORK` vẫn vào đúng ChainOS |
| [ ] | T-8b [SCHEMA] Contract: bỏ giá trị enum `FLOWER_NETWORK` và các nhánh so loại tổ chức này — sau khi T-8a chạy trên production | — | `check:migrations`; tier-of, điều hướng, ma trận không đổi kết quả |
| [ ] | `tests/tenant/tier-consistency.test.ts`: mỗi trục × Mẹ / Chuỗi / Cửa hàng | P2-A11 | Xanh trong CI |

Ghi chú P2-A1 (Ngành chỉ là plugin, D-01): vẫn gỡ phần **mô phỏng** tầng Ngành đang không có dữ liệu; tầng Ngành quay
lại có chủ đích qua T-6 và ADR affiliate sau này (D-48).

### GĐ3 — Cách ly và toàn vẹn (ADR-013)

| ☐ | Mục | Gate thêm |
|---|---|---|
| [ ] | I-1 [VẬN HÀNH] 5 tài khoản CSDL; mỗi dịch vụ một chuỗi kết nối | Không dịch vụ nào dùng tài khoản chủ |
| [ ] | O-8 [VẬN HÀNH] `statement_timeout`, `idle_in_transaction_session_timeout` theo tài khoản | Truy vấn 20 s bị huỷ ở `smeos_app` |
| [ ] | I-2 [SCHEMA] Nhật ký bất biến + `app.purge_reason` + `platform_access_logs` | Test `UPDATE audit_logs` bị từ chối; xoá ngoài đường purge bị từ chối |
| [ ] | I-7 Test kiến trúc: route ghi có tenant phải ghi `audit_logs` hoặc có trong danh sách miễn | Test xanh |
| [ ] | I-4 Client extension đặt `app.org_id` theo giao dịch; worker đặt ngữ cảnh job; đo p95 | p95 tăng ≤ 10% |
| [ ] | I-5 [SCHEMA] RLS chế độ ghi nhận trên CSDL khôi phục; chạy toàn bộ test + e2e | 0 vi phạm ghi nhận |
| [ ] | Ghi dòng mới `AGENT_RULES.md` §14: bộ quét liên tenant phải chạy bằng `smeos_system` | — |

### GĐ4 — Dữ liệu cá nhân (ADR-014)

| ☐ | Mục | Thay | Gate thêm |
|---|---|---|---|
| [ ] | P-2 [SCHEMA] **B5** `customers.status PROSPECT`; `customer_id` trên `leads`, `greeting_sessions`; backfill | — | Tenant test lead/phiên Thẻ chào trỏ đúng khách |
| [ ] | P-3 [SCHEMA] **B5** `order_recipients` thay JSON địa chỉ/VAT | — | Phiếu in, theo dõi đơn, xuất đơn không đổi |
| [ ] | P-4 [SCHEMA] `shared_order_access`; gia công dùng chia sẻ | — | Hết hạn → đối tác 404 |
| [ ] | P-5 [SCHEMA] Mã hoá cột + `phone_hash` + `phone_last4`; đổi 4 chỗ tìm kiếm | — | Dump không có số rõ |
| [ ] | P-6 [SCHEMA] `retention_policies` + job hạn lưu (cần I-2) | P2-F2 | Dòng quá hạn xử lý; legal hold giữ |
| [ ] | P-7 [SCHEMA] `data_subject_requests` + xoá/xuất | P2-F1 | Xoá lan sang tổ chức được chia sẻ |
| [ ] | P-8 [PO] Chọn vùng dữ liệu; đổi mặc định `data_region` theo quyết định | — | Ghi sổ quyết định |

### GĐ5 — Cô lập theo gói và vòng đời tenant (ADR-016)

| ☐ | Mục | Gate thêm |
|---|---|---|
| [ ] | S-2 Xuất/nhập tenant theo sổ; thay `scripts/handover-backup-engine.ts` | Vòng tròn xuất → nhập khớp từng dòng |
| [ ] | S-3 [SCHEMA nhỏ] `lifecycle_status`; tạm ngưng/rời/xoá; thay `handover-clean-tenant.ts`, `clean-siin-store-orders.ts` | Xoá không chạm tổ chức khác |
| [ ] | S-4 [VẬN HÀNH] Runbook + diễn tập khôi phục riêng một tenant | Biên bản ≤ 4 giờ |
| [ ] | S-5 [SCHEMA nhỏ] `isolation_tier` gắn gói | Gói không cho phép → 422 |
| [ ] | S-6 [VẬN HÀNH] Mẫu triển khai `DEDICATED` + dựng thử một lần + sổ triển khai | Biên bản dựng từ đầu |

### GĐ6 — Bật enterprise và chứng minh

| ☐ | Mục | Gate thêm |
|---|---|---|
| [ ] | I-6 [SCHEMA] Bật RLS chặn thật trên production (mốc theo câu trả lời ADR-013 §6) | Test "bỏ `scopedWhere` → 0 dòng" chạy trên CSDL thật |
| [ ] | O-9 [VẬN HÀNH] Thử tải quy mô mục tiêu trên CSDL khôi phục PITR | Biên bản p95 đạt SLO |
| [ ] | O-10 Dọn `generation_jobs` cũ; bản sao đọc / phân vùng nếu chạm ngưỡng | Theo ngưỡng ADR-015 D-O6 |
| [ ] | P3-03 ERD theo miền sinh từ schema, kiểm trong CI | Tệp sinh khớp schema |
| [ ] | [PO] Quyết định lại kiểm thử bảo mật bên ngoài (D-26 hiện "không làm") cho khách enterprise | Ghi sổ quyết định |
| [ ] | Gói bằng chứng: điền cột "Bằng chứng" của mục 1 cho DoD-1 → DoD-17 | PO ký nhận |

## 4. Cổng kiểm cho mọi PR của chương trình

Theo bảng "Definition of done" trong `CLAUDE.md`, thêm:

- [SCHEMA]: migration viết tay theo expand/contract, chạy trong một giao dịch, thử trên CSDL có dữ liệu bẩn (cách đã dùng
  ở PR #127); `npx prisma migrate diff --exit-code` sạch; `test:tenant` + `test:platform` xanh; so với `main` chỉ báo lỗi mới.
- Chạm Thẻ chào: B5 — test khoá hành vi cho đường sắp sửa có trước, test cũ xanh (`KIEN_TRUC_SSOT_DON_HANG_DA_NGUON.md` §0).
- [VẬN HÀNH]: runbook cập nhật cùng PR (`VAN_HANH_SU_CO_VA_SAO_LUU.md`, `VAN_HANH_CAP_NHAT_CSDL.md`).
- Mỗi PR đánh dấu ô của mình ở tệp này và ghi số PR bên cạnh.

## 5. Ma trận phủ khoảng trống

| Khoảng trống | Bước |
|---|---|
| G1 cây tổ chức · G2 bốn biểu diễn chi nhánh | T-1 … T-6 |
| G3 quyết định theo tầng | T-6, T-7 |
| G4 cách ly ở CSDL | I-1, I-4, I-5, I-6 |
| G5 sao chép dữ liệu khách sang đối tác | P-4 |
| G6 ranh giới domain, bảng rộng, JSON | S-1, P-3, T-7 (JSON quản trị), P-1 |
| G7 khách ở nhiều nơi | P-2, P-3 |
| G8 nhật ký | I-2, I-7 |
| G9 số dư | I-3 |
| G10 bảng tăng không giới hạn | P-6, O-10 |
| G11 pool, timeout, index | O-1, O-2, O-8 |
| G12 báo cáo trên CSDL chính | O-9, O-10 |
| G13 dữ liệu cá nhân | P-1, P-5, P-6, P-7 |
| G14 vùng dữ liệu | P-8, S-6 |
| G15 HA, sao lưu | O-3, O-6, O-7 |
| G16 migration, staging | O-4, O-5 |
| G17 cô lập theo gói | S-1 … S-6 |

G6 chỉ được xử lý một phần ở kế hoạch này (tách `orders`/`order_coordinations` theo domain là việc của từng tính năng
khi chạm vào, theo D-45). Mọi khoảng trống khác có ít nhất một bước có điều kiện xong đo được.
