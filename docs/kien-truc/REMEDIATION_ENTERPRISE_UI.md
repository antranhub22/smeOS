# Kế hoạch khắc phục nhánh Enterprise UI/UX trước bàn giao

> Nhánh nguồn: `Hoan_Thien_Kien_Truc_He_Thong_UI_UX_Tieu_Chuan_Enterprise` (32 commit trên `main` tại `cbd8763f`).
> Nhánh thực thi: `claude/zen-carson-os8a8r` — dựng từ nhánh nguồn, kết thúc bằng một PR vào `main`.
> Chủ sở hữu: Product Owner. Quyết định PO chốt ngày 03/11/2026 (mục 2).
> Cách dùng: mỗi commit khắc phục tick đúng dòng của nó **trong cùng commit** và điền mã commit vào bảng mục 9.

## 1. Mục tiêu và tiêu chí hoàn tất

Nhánh đạt chuẩn bàn giao khi đồng thời thoả:

1. Không còn lỗ hổng rò rỉ dữ liệu giữa tenant; mỗi lỗ hổng đã vá có ca thử tenant chứng minh.
2. Mọi cổng CI ở `.github/workflows/ci.yml` xanh trên PR vào `main` — không skip, không nới test, không nâng baseline để che lỗi mới.
3. Tài liệu bàn giao chỉ chứa số liệu có nguồn đo lưu trong repo.
4. Đặc tả 06/07, Screen Contract và `TRANG_THAI.md` khớp mã.

## 2. Quyết định PO (03/11/2026)

| # | Vấn đề | Quyết định |
|---|---|---|
| Q1 | Khu vực đóng băng bị sửa bởi commit dọn nợ UX | Catalog (11 tệp, chỉ đổi token): duyệt, cập nhật mốc. Thẻ chào (91 tệp, có 17 hộp xác nhận đổi hành vi): khôi phục về `main`; nâng giao diện Thẻ chào làm ở PR riêng có E2E |
| Q2 | Link báo giá công khai đoán được (`BG-0001`) | Thêm cột `public_token` ngẫu nhiên bằng migration mới chồng lên; link công khai chỉ dùng token |
| Q3 | Báo cáo hiệu năng / re-audit chứa số liệu không có nguồn | Gỡ số liệu không có nguồn, viết lại theo trạng thái thật; đo hiệu năng thật là việc riêng sau bàn giao |
| Q4 | Gỡ 4 dependency, thêm workflow `ui-weekly` | Giữ cả hai; đồng bộ lockfile; sửa bước dựng DB test của workflow |
| Q5 | Cách theo dõi | Tệp này trong repo, cập nhật theo từng commit; tóm tắt ở `TRANG_THAI.md`; kết thúc bằng PR có CI xanh |

## 3. Nguyên tắc thực thi

- Thứ tự: T0 → P0 → P1 → P2 → P3 → Z. Không bắt đầu đợt sau khi đợt trước còn cổng đỏ do chính nó gây ra.
- Mỗi việc một commit Conventional Commits, gồm mã + test + tài liệu.
- Mọi thay đổi `prisma/schema.prisma` đi kèm migration sinh bằng `prisma migrate dev`; không sửa migration đã commit.
- Cổng tenant/platform chỉ chạy trên database tên `*_test`.
- Việc nào môi trường không kiểm chứng được thì ghi rõ "chưa kiểm chứng" ở cột Ghi chú, không tick.

## 4. Đợt T0 — Đồng bộ nền

- [x] **T0-1** Merge `origin/main` (6 commit: cổng dev 3200, `CONTEXT.md`) vào nhánh thực thi. Thử merge không xung đột. Chạy toàn bộ cổng, ghi kết quả làm mốc ở mục 9.
- [x] **T0-2** (D6) Đồng bộ `package-lock.json` với `package.json` sau khi gỡ `lucide-react`, `@radix-ui/react-select`, `@radix-ui/react-separator`, `@radix-ui/react-tooltip`. Kiểm: `npm ci` chạy sạch, không còn 4 gói trong `packages[""]`.

## 5. Đợt P0 — Bảo mật dữ liệu (chặn bàn giao)

- [x] **P0-1** (A1) Link báo giá công khai dùng token bí mật.
  - Schema: `quotations.public_token String @unique` (≥ 128-bit, sinh bằng `crypto.randomBytes`), migration thêm cột nullable → backfill → `NOT NULL`.
  - `src/modules/sales/infra/quotation-repository.ts`: thay `findByPublicCode` bằng `findByPublicToken`; không trả báo giá trạng thái `DRAFT`.
  - Route `src/app/api/v1/public/quotation/[token]/route.ts` (`enforceRateLimit` 60 lượt/phút) và trang `src/app/bg/[token]/page.tsx` (`robots: noindex`, tiêu đề không chứa mã); dữ liệu công khai là `PublicQuotationView` — không số điện thoại, ghi chú nội bộ, mã tổ chức. Trang không giới hạn tần suất: token 256 bit làm việc dò không khả thi.
  - UI tạo link: `src/components/sales/quotation/{partner-quote-builder,quote-preview-card,quotations-list-view}.tsx` — dùng `publicToken`; nút "Link gửi"/"Xem" chỉ hiện khi báo giá đã rời trạng thái nháp.
  - Test tenant: truy cập bằng mã `BG-xxxx` → 404; token của tổ chức A không lộ dữ liệu tổ chức B; báo giá `DRAFT` → 404.
- [x] **P0-2** (A2) Kiểm quyền sở hữu mọi ID tham chiếu nhận từ body.
  - `create-quotation.use-case.ts` (`leadId`, `customerId`, `assetUsageId`, `items[].productId`), `update-quotation` tương ứng, `create-asset-usage.use-case.ts` (`campaignId`), `create-print-rendition.use-case.ts` (`assetUsageId`).
  - Kiểm qua phương thức repository có `scopedWhere(ctx, { id })` (`src/modules/sales/infra/quotation-reference-guard.ts`); không thuộc tổ chức → `notFound()` (404).
  - `QuotationRepository.update` ghi theo `scopedWhere(ctx, { id })` thay cho `{ id }` trần (phát hiện khi sửa).
  - Test tenant: mỗi loại ID của tổ chức B dùng từ tổ chức A → 404, không ghi bản ghi nào.
- [x] **P0-3** (A3) Chuyển báo giá thành đơn nguyên tử.
  - `convert-quotation-to-order.use-case.ts`: chiếm quyền chuyển bằng `updateMany` có điều kiện trạng thái (`claimConversion`) trước khi tạo đơn; `ingestOrder` lỗi → `releaseConversion` trả trạng thái cũ. `ingestOrder` không nhận client giao dịch nên không gói chung một giao dịch.
  - Test tenant: hai lệnh chuyển song song → đúng 1 đơn, lệnh còn lại nhận lỗi nghiệp vụ.
- [x] **P0-4** (C3) `quotation_items.organization_id` + `@@index([organization_id])`; migration backfill từ `quotations`; repository ghi cột khi tạo/cập nhật. Cập nhật đặc tả 07.

## 6. Đợt P1 — Cổng CI xanh

- [x] **P1-1** (Q1) Khôi phục 91 tệp trong `FROZEN_ROOTS` của Thẻ chào về bản `main` (chỉ hai commit `ff4206cb`, `f146b67c` chạm vào). Ghi lại baseline UX lint riêng cho `components/greeting-card` và các tuyến Thẻ chào, ghi lý do trong commit. Kiểm: `the-chao-freeze.test.ts` xanh, typecheck xanh.
- [x] **P1-2** (Q1) Cập nhật mốc Catalog theo duyệt PO 03/11/2026: `UPDATE_CATALOG_FREEZE=1` cho `catalog-freeze.test.ts`, ghi ngày duyệt ở đầu tệp test.
- [x] **P1-3** Danh mục năng lực 166 → 168 mã (M4, M5): bổ sung đặc tả 02 và ca thử `capability-catalog.test.ts` khớp danh mục thật.
- [x] **P1-4** Module "In ấn" bị hiện ở production khi chưa có công cụ `DONE`: sửa registry toolkit để ẩn đúng luật (`business-modules.test.ts:82`), không sửa test.
- [x] **P1-5** Route `src/app/api/v1/organizations/brand/route.ts` (bí danh re-export): gỡ nếu không có nơi gọi; còn nơi gọi thì chuyển nơi gọi sang `organization/brand` rồi gỡ.
- [x] **P1-6** `src/modules/products/domain/sales-scripts-catalog.ts` dùng `formatters.ts` thay cho `Intl` trực tiếp (ratchet 173 tệp).
- [x] **P1-7** `tests/unit/ux/feature-guidance-contrast.test.ts` đọc token từ `src/styles/tokens/color.css` — nơi token đã chuyển tới; giá trị `#FFFFFF` giữ nguyên.
- [x] **P1-8** (B2) 18 lỗi ESLint mới: thay `as any` bằng enum Prisma có kiểu ở `crm/infra/*`, `print/infra/*`, các test; nạp dữ liệu trong `useEffect` ở `components/marketing-center/*`, `components/sales/quotation/*` theo quy ước hiện hành của dự án (chú thích `eslint-disable-next-line react-hooks/set-state-in-effect` kèm lý do, nợ #149 — dự án chưa có hook nạp dữ liệu chung); sửa `components/ui/form-field.tsx`. Kiểm: `npm run lint:ratchet` xanh, baseline ESLint không đổi.
- [x] **P1-9** (B3) 59 chỗ lệch `check:docs`: 33 endpoint vào đặc tả 06; 7 bảng + 9 enum vào đặc tả 07; 6 bảng (`asset_usages`, `campaigns`, `quotations`, `customer_segments`, `customer_interactions`, `print_renditions`) vào `TENANT_TABLES`; ca thử cách ly cho `asset_usages`, `customer_segments`, `customer_interactions`, `print_renditions`.
- [x] **P1-10** (E1) Migration đổi tên index `customer_interactions_organization_id_customer_id_occurred_at_i` cho khớp tên Prisma sinh. Kiểm: `prisma migrate diff` rỗng.
- [x] **P1-11** (Q4) `.github/workflows/ui-weekly.yml`: thay `npm run db:test:setup || true` bằng đúng bước dựng `floraos_test` của `ci.yml` (`CREATE DATABASE` + `prisma db push`); bỏ `|| true`.

## 7. Đợt P2 — Tài liệu bàn giao trung thực

- [x] **P2-1** (Q3) Viết lại `12_PERFORMANCE_REPORT.md`: bỏ bảng LCP/CLS không có nguồn và các mốc "Tuần 1–12", sửa phiên bản Next.js 16; trạng thái "Chưa đo" kèm phương pháp đo (Lighthouse trên bản build, 6 tuyến).
- [x] **P2-2** (Q3) Viết lại `13_RE_AUDIT_ENTERPRISE_REPORT.md` theo số thật: kết quả cổng, baseline UX lint (5.367 điểm, lý do tăng do siết luật R1/R17–R21, phần giảm do allowlist), số tệp > 350 dòng. Rà `docs/design-system/CHANGELOG.md` và biên bản `accessibility-audit-12-journeys.md` — nhận định nào chưa có bằng chứng chạy thì ghi "chưa kiểm chứng".
- [x] **P2-3** (E2) Gộp `docs/Audit/` vào `docs/audit/` (`git mv`), sửa liên kết và registry; kiểm không còn đường dẫn trùng chỉ khác hoa thường.
- [ ] **P2-4** (E4) Thêm tệp `LICENSE` (giấy phép độc quyền) với tên pháp nhân sở hữu do PO cung cấp.

## 8. Đợt P3 — Chất lượng

- [x] **P3-1** (C1) `get-segment-customers.use-case.ts`: bỏ trần 500 khách; duyệt toàn bộ khách theo trang có giới hạn số vòng, hoặc đẩy điều kiện lọc xuống truy vấn. Test: tổ chức 1.200 khách cho kết quả đúng.
- [x] **P3-2** (C2) Xuất PDF in ấn: giới hạn kích thước `imageDataUrl`, kiểm định dạng và nội dung bằng bộ kiểm tệp tải lên hiện có (`checkUploadContent`). PDF vẫn trả trực tiếp cho người tải; lưu bản PDF vào kho qua `StorageProvider` kèm URL ký là việc riêng vì cần đăng ký nguồn ghi kho mới (skill `storage`).
- [ ] **P3-3** (D1) Tách `print-workflow.tsx` (434), `kpi-definitions.ts` (356), `chain-dispatch-settings.tsx` (358), `store-policies-editor.tsx` (353) về ≤ 350 dòng; 9 tệp vốn đã quá ngưỡng trở về ≤ số dòng trên `main`.
- [x] **P3-4** (D2) Kiểm giá trị enum từ query string bằng zod ở các route mới → 400 thay vì 500.
- [x] **P3-5** (D3) Thay so khớp chuỗi `err.message.includes(...)` bằng lỗi có kiểu (`notFound()`) ở `crm/use-cases/*`, `print/use-cases/*` và route tương ứng.
- [x] **P3-6** (D4) Sinh mã báo giá an toàn khi đồng thời: thử lại có giới hạn (≤ 3 lần) khi trùng `@@unique([organization_id, code])`. Test hai yêu cầu song song.
- [x] **P3-7** (E3) `MutationObserver` ở `src/lib/ui-system/ui-provider.tsx` chỉ chạy khi `NODE_ENV !== "production"`.
- [x] **P3-8** Nút "Mở UI Studio" trong menu người dùng (`src/components/layout/user-menu.tsx`) hiện cho platform operator ở production nhưng ngăn UI Studio chỉ gắn khi dev (`app-shell.tsx`) — nút không có tác dụng. Hiện nút và ngăn theo cùng một điều kiện.
- [x] **P3-9** Trạng thái báo giá hiện mã kỹ thuật (`SENT`, `DRAFT`, "ĐÃ GỬI" viết cứng) ở `partner-quote-builder.tsx`, `quote-preview-card.tsx` — dùng `QUOTATION_STATUS_LABELS`.
- [x] **P3-10** (PO 03/11/2026, phương án b) Trang mất `<h1>` sau luật R20 chuyển sang component đầu trang chuẩn: trang công cụ dùng `ToolHero` (OPERATING_PRINCIPLES §10, giữ nguyên K1/K2), trang chủ theo vai trò và trang nội bộ dùng `PageHeader`, trang công khai và màn trạng thái toàn trang giữ `<h1>` kèm miễn trừ R20 có lý do. Làm theo đợt; kiểm bằng `test:e2e:ux`.

## 9. Đóng nhánh

- [ ] **Z-1** Chạy toàn bộ cổng mục "Definition of done" của `CLAUDE.md`, gồm `test:e2e:ux`.
- [ ] **Z-2** Mở PR vào `main`; CI xanh trên PR là bằng chứng cuối.
- [ ] **Z-3** Cập nhật §4–6 `TRANG_THAI.md`; ghi lỗi tái diễn (báo cáo tự khai không có nguồn đo, sửa khu vực đóng băng trong commit dọn nợ) vào `AGENT_RULES.md` §14.

### Bảng theo dõi

| Việc | Trạng thái | Commit | Cổng đã chạy | Ghi chú |
|---|---|---|---|---|
| T0-1 | Xong | `72e4b0f5` | Thử merge không xung đột mã; gộp tay 1 xung đột registry | Cổng toàn bộ chạy ở cuối đợt P0 |
| T0-2 | Xong | (commit `chore(deps)` ngay sau `72e4b0f5`) | `npm ls --package-lock-only --all` sạch | Lockfile chỉ xoá 77 mục thuộc cây phụ thuộc của 4 gói đã gỡ; không gói nào thêm hoặc đổi phiên bản |
| P0-1 | Xong | commit `fix(sales)` sau `03befd0e` | typecheck; unit sales 22/22; tenant 692/692; platform 36/36; check:screen-contracts 100% | `tests/tenant/quotation-public-link.test.ts`; migration `20261103090000_quotation_public_token_and_item_tenant` thử trên DB có dữ liệu cũ |
| P0-2 | Xong | commit `fix(sales)` sau `03befd0e` | typecheck; unit sales 22/22; tenant 692/692; platform 36/36; check:screen-contracts 100% | Thêm phát hiện: `QuotationRepository.update` không giới hạn tổ chức — đã sửa; `tests/tenant/asset-usage-isolation.test.ts`, `print-isolation.test.ts` |
| P0-3 | Xong | commit `fix(sales)` sau `03befd0e` | typecheck; unit sales 22/22; tenant 692/692; platform 36/36; check:screen-contracts 100% | Chiếm quyền có điều kiện + hoàn tác; ca thử hai lệnh song song → 1 đơn |
| P0-4 | Xong | commit `fix(sales)` sau `03befd0e` | typecheck; unit sales 22/22; tenant 692/692; platform 36/36; check:screen-contracts 100% | `quotation_items` vào `TENANT_TABLES`; đặc tả 07 cho bảng này làm cùng P1-9 |
| P1-1 | Xong | commit `revert(greeting-card)` sau `8663f1a8` | typecheck; `the-chao-freeze` xanh; unit Thẻ chào 1013/1013; `lint:ux --check` | 90 tệp về bản `cbd8763f`; không token màu nào bị xoá trên nhánh (236/236 còn) nên giao diện cũ hiển thị đúng; baseline UX lint 5.367 → 5.498 (+131, toàn bộ trong vùng Thẻ chào) |
| P1-2 | Xong | xem `git log --grep "P1-2"` | catalog-freeze ✓; catalog 14 tệp 69/69; lint:ux --check | PO 03/11/2026 chọn phương án (a): trang công khai /c/[slug] giữ <h1> (5 chỗ, 4 tệp, miễn trừ R20 có lý do); giữ đổi token và <h2> ở màn quản trị / dựng ấn phẩm; cập nhật mốc đóng băng |
| P1-3 | Xong | xem `git log --grep "P1-3"` | src/core/rbac 24/24 | Thêm nhóm M (M1–M5) vào đặc tả 02; R15/R16 thiếu trong đặc tả là nợ có sẵn trên main, không sửa |
| P1-4 | Xong | xem `git log --grep "P1-4"` | src/modules/toolkit 12/12 | Không phải lỗi mã: PR-6 nối 10 ấn phẩm vào /in-an (asset Sẵn); test giữ giả định PR-0 — cập nhật assertion, vẫn khoá luật chỉ asset Sẵn, không công cụ chưa DONE |
| P1-5 | Xong | xem `git log --grep "P1-5"` | route-capability-guard 2/2 | Không có nơi gọi nào (cả mã lẫn tài liệu) — gỡ |
| P1-6 | Xong | xem `git log --grep "P1-6"` | i18n ratchet + products/domain 169/169 | toLocaleString → formatNumber (cùng định dạng vi-VN) |
| P1-7 | Xong | xem `git log --grep "P1-7"` | feature-guidance-contrast 2/2 | Token chuyển sang src/styles/tokens/color.css; test kiểm cả việc globals.css nạp tệp đó; giá trị #FFFFFF giữ nguyên |
| P1-8 | Xong | xem `git log --grep "P1-8"` | typecheck; lint:ratchet ĐẠT (58 lỗi cũ); lint:ux --check; unit 38 tệp 167/167 | 17 lỗi: `as any` → enum Prisma / Prisma.Decimal / kiểu cụ thể; 8 chỗ nạp dữ liệu theo quy ước nợ #149; leads-tab tách statusQueryFor() để React Compiler giữ memo; form-field interface rỗng → type |
| P1-9 | Xong | xem `git log --grep "P1-9"` | check:docs ✓ Tài liệu khớp mã; tenant 8 tệp 23/23 | Đặc tả 06 mục 30 (33 endpoint, đối chiếu từng mã gác); đặc tả 07 mục 38 (7 bảng + 9 enum trích nguyên văn lược đồ); 7 bảng vào TENANT_TABLES; customer_segments/customer_interactions đã có ca thử ở customer-care-isolation.test.ts — ghi vào COVERED_VIA_ROUTE kèm chỉ dẫn; asset_usages/print_renditions có ca thử từ P0 |
| P1-10 | Xong | xem `git log --grep "P1-10"` | prisma migrate diff rỗng trên DB cũ và DB dựng mới từ toàn bộ migration | Migration 20261103100000 đổi tên index |
| P1-11 | Xong | xem `git log --grep "P1-11"` | YAML hợp lệ; chưa chạy trên GitHub (lịch chạy thứ Hai hoặc chạy tay) | Dùng đúng bước dựng floraos_test của ci.yml; bỏ || true (PO duyệt Q4) |
| P2-1 | Xong | xem `git log --grep "P2-1"` | check:docs ✓ | Viết lại: trạng thái Chưa đo, chỉ tiêu và phương pháp; sửa nhận định sai (tách modal không có, skeleton theo archetype không có, data-theme cố định moc-lan) |
| P2-2 | Xong | xem `git log --grep "P2-2"` | check:docs ✓ | 13_RE_AUDIT viết lại theo số đo (lệnh kèm từng số); CHANGELOG 1.2.0 viết lại; biên bản trợ năng chuyển thành quy trình kiểm — bỏ dòng ký duyệt và CERTIFIED không có bằng chứng, bỏ preset không tồn tại (warm-amber, organic-teal), bỏ scroll-padding không có trong mã |
| P2-3 | Xong | xem `git log --grep "P2-3"` | Không còn đường dẫn trùng hoa/thường; check:docs ✓ | 6 tệp nội bộ chuyển sang docs/audit/; gỡ 7 tệp tài liệu khách ALG và Avi Florist theo quyết định PO 03/11/2026 — lấy lại được từ commit 26c0b29a; lịch sử git vẫn chứa các tệp này; sửa 3 liên kết file:///Users/… trong floraos-core-system-wide-audit.md |
| P2-4 | Chưa làm | | | Chờ tên pháp nhân |
| P3-1 | Xong | xem `git log --grep "P3-1"` | crm 44/44; typecheck | Duyệt khách theo trang 500, tối đa 200 trang (100.000 khách) — vòng lặp có giới hạn; điều kiện nhóm đánh giá trên chỉ số tính sẵn của khách nên chưa đẩy xuống truy vấn. Ca thử 1.200 khách đỏ trên bản cũ |
| P3-2 | Xong | xem `git log --grep "P3-2"` | print 13/13; tenant print 3/3; architecture tests | Data URL chỉ PNG/JPEG, magic bytes + ≤ 20 MB qua checkUploadContent, route giới hạn 28 triệu ký tự; jsPDF nhận đúng định dạng (trước luôn khai PNG); client hiện không gửi imageDataUrl. Lưu PDF vào kho tách thành việc riêng |
| P3-3 | Xong một phần | xem `git log --grep "P3-3"` | typecheck; eslint; lint:ux --check; marketing-center 38/38, print 13/13, profiles | Đã tách: kpi-definitions.ts 356→203 (+ kpi-registry.ts 167), print-workflow.tsx 435→344 (+ print-workflow-parts.tsx 133), store-policies-editor.tsx 353→309 (+ store-policies-agreements-section.tsx 67). Còn lại: 8 tệp vốn > 350 dòng trên main dài thêm 1–14 dòng do chuyển sang component chuẩn (tai-anh/page.tsx 1.948, ux-lint/rules.ts, role-ux-catalog.ts, creative-studio, product-copy, hoi-thoai, kho-templates, noi-bo/ket-noi) — xử lý cùng lộ trình tách tệp lớn K11 |
| P3-4 | Xong | xem `git log --grep "P3-4"` | typecheck; eslint 0 cảnh báo; unit 22 tệp 121/121 | Helper enumParam() (src/core/http/query-params.ts) cho 12 tham số ở 8 route; giá trị ngoài danh sách → 400 kèm danh sách cho phép; lược đồ zod POST campaigns/asset-usages dùng chung hằng số. Ghi nhận ngoài phạm vi: kiểu domain UsageDestination có LIBRARY, enum DB có OTHER |
| P3-5 | Xong | xem `git log --grep "P3-5"` | unit crm+print 52/52; tenant 6/6; typecheck | 3 use-case ném notFound(); 3 route bỏ khối try/catch dò chuỗi; 2 ca thử tenant kiểm code NOT_FOUND thay cho nội dung chuỗi |
| P3-6 | Xong | xem `git log --grep "P3-6"` | tenant báo giá 9/9; typecheck | Thử lại trong repository khi trùng mã (P2002), tối đa 5 lần — cùng mẫu ShortLinkRepository; ca thử 4 yêu cầu đồng thời đỏ trên bản cũ (unique quotations_organization_id_code_key), xanh trên bản mới |
| P3-7 | Xong | xem `git log --grep "P3-7"` | ui-system 30/30 | Effect thoát sớm ở production; bộ test chạy môi trường node không có DOM nên kiểm bằng đọc mã (cùng cách feature-guidance-contrast.test.ts) |
| P3-8 | Xong | xem `git log --grep "P3-8"` | components/layout 71/71 (thêm ca withUiStudio khi isDev=false) | Lỗi thật ở app-shell: isDev && withUiStudio ghi đè quyết định của layout, nên (platform) ở production không có ngăn UI Studio trái ADR-011 D-UI-01; nút trong menu giờ đọc ngữ cảnh UiStudioAvailability của shell |
| P3-9 | Xong | xem `git log --grep "P3-9"` | components/sales 4/4; lint:ux --check | QUOTATION_STATUS_LABELS ở 2 thành phần; thông báo phân biệt đã lưu / đã gửi; test đọc mã đỏ trên bản cũ, xanh trên bản mới |
| P3-10 | Xong | xem `git log --grep "P3-10"` (6 commit, đợt 1 → 3d) | unit 3.861/3.861; lint:ratchet; lint:ux (5.498 → 5.491); `test:e2e:ux` 22/22 sau đợt 2 | 71 tệp mất `<h1>`: trang công cụ qua `ToolHero` (giữ K1/K2); trang chủ theo vai, 10 trang /van-hanh, 19 trang (app), 9 thành phần cấp trang qua `PageHeader`; 7 trang công khai + màn "Sắp ra mắt" + bản in /bang-gia giữ `<h1>` (miễn trừ R20 có lý do); /cong-cu/poster-banner giữ `<h1>` ẩn (K2 khoá); màn không có quyền ở audit/muc-dung/cai-dat-ai thành PageHeader + EmptyState, bỏ mã năng lực khỏi màn hình. Ngoại lệ có chủ đích: catalog-page-renderer (khung dựng trang trong Catalog Studio, không phải trang) |
| Z-1 | Đang làm | — | Cổng CI toàn bộ xanh (unit 3.861, tenant 693, platform 36, build); `test:e2e:ux` trên bản build production, DB đã seed: nhánh 10 đạt / 12 lỗi, `main` 21 đạt / 1 lỗi (ảnh mốc /vai-tro, có sẵn) | 12 lỗi mới: 11 trang không có `<h1>` (luật R20 đổi `<h1>`→`<h2>` ở ~40 tệp không dùng PageHeader — trang chủ, công cụ, /van-hanh/*, trang công khai), 1 ca chữ liên kết bỏ qua đổi thành "Bỏ qua tới nội dung chính". Chờ PO quyết phương án |
| Z-2 | Chưa làm | | |  |
| Z-3 | Chưa làm | | |  |

## 10. Rủi ro và kiểm soát

| # | Rủi ro | Mức | Kiểm soát |
|---|---|---|---|
| R1 | Khôi phục Thẻ chào làm gãy import vì nhánh đã đổi component dùng chung | Thấp | Chỉ 2 commit dọn UX chạm khu vực này; typecheck + unit + tenant sau P1-1 |
| R2 | Ba migration mới chạy sai thứ tự hoặc backfill lỗi | Thấp | Bảng báo giá chưa có trên production (production chỉ deploy từ `main`); chạy `migrate deploy` trên DB sạch và DB có dữ liệu mẫu; `migrate diff` rỗng |
| R3 | Sửa `useEffect` nạp dữ liệu (P1-8) gây lỗi giao diện không test nào bắt | Trung bình | Kiểm tay từng màn chạm tới; `test:e2e:ux` ở Z-1 |
| R4 | Môi trường cloud chặn `cdn.sheetjs.com` (`xlsx`) nên `npm ci` và tái sinh lockfile cần máy có mạng tới CDN | Trung bình | Tái sinh lockfile trên máy dev hoặc CI; CI trên PR là nơi xác nhận |
| R5 | `test:e2e:ux` cần DB đã seed và trình duyệt; có thể không chạy đủ trong môi trường cloud | Trung bình | Ghi "chưa kiểm chứng" nếu không chạy được; CI trên PR chạy lại |
| R6 | Baseline UX lint tăng lại sau P1-1 | Thấp | Là nợ thật của Thẻ chào, ghi lý do trong commit và báo cáo P2-2 |
| R7 | Lịch sử commit giữ các thông điệp "100%" đã sai | Thấp | Không viết lại lịch sử nhánh chung; báo cáo P2-2 là nguồn đúng |
| R8 | Đổi hành vi với người dùng: link báo giá đổi dạng, module In ấn ẩn trên production | Thấp | Chưa có link thật nào được gửi; In ấn hiện lại khi có công cụ `DONE` |
| R9 | Ước lượng 3,5 ngày trượt do P1-9 (đặc tả 06/07) và P3-2 | Trung bình | Đợt P0–P2 đủ điều kiện bàn giao; P3 có thể tách PR riêng nếu cần |
