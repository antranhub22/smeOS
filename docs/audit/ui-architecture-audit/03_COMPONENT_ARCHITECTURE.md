# C — Component Architecture Assessment

Điểm miền: **2− / PARTIAL**. SSOT khai báo: `src/components/ui/` (43 tệp), `src/components/journey/`, `src/components/templates/shared/`. Tài liệu: `docs/ui-ux/COMPONENT_CONTRACTS.md` (5 contract), `COMPONENT_INVENTORY.md`, 03a §30.

## Mức sử dụng thật của `src/components/ui/*` (số tệp import `@/components/ui/<tên>`)

| Component | Tệp dùng | Dòng | Nhận xét |
|---|---:|---:|---|
| `icons` | 690 | 123 | Cổng icon Phosphor; có test cấm `lucide-react` — **mẫu tốt** |
| `button` | 371 | 47 | Nhưng còn **1.078** thẻ `<button>` thô |
| `card` | 142 | 61 | Nhưng **1.025** chuỗi `rounded-(lg\|xl\|2xl) border … bg-(surface\|white)` tự dựng |
| `badge` | 129 | 24 | API lệch tài liệu (B4) |
| `skeleton` | 90 | 17 | Tốt |
| `inline-error` | 58 | 33 | Tốt |
| `dialog` | 47 | 97 | Nhưng **71** tệp có `fixed inset-0` tự chế (38 không có `role="dialog"`/`aria-modal`) |
| `input` | 45 | 35 | Nhưng **654** `<input>` thô vs 118 `<Input>` |
| `info-tip` | 44 | 50 | — |
| `empty-state` | 37 | 48 | — |
| `confirm-dialog` | 22 | 140 | R13 còn 21 `window.confirm` (ux-lint) |
| `disclosure` | 15 | 67 | R15 còn 10 `<details>` tự viết |
| `tab-header` (`TabActionHeader`, K2) | 11 | 258 | 7 tệp tự viết `role="tablist"` |
| `page-header` | 8 | 50 | 105 `page.tsx` |
| `select` (Radix) | 3 | 149 | **200** `<select>`/`<textarea>` thô |
| `tooltip` (Radix) | 4 | 25 | Song song `info-tip` |
| `page-container` | 3 | 29 | — |
| `table` | **0** | 85 | Tạo trong “Phase 2”, chưa từng dùng; 44 tệp tự viết `<table>` |
| `inline-source-picker` | **0** | 287 | Không ai import |
| `preview-notice` | 0 (chỉ test) | 17 | — |

Lệnh: `for f in src/components/ui/*.tsx; do n=$(basename $f .tsx); grep -rlE "components/ui/$n[\"']" src | grep -v "$f" | wc -l; done`

## C1. Primitive

| Primitive | Trạng thái | Ghi chú |
|---|---|---|
| Button | Đã triển khai, dùng chưa hết | 7 variant, 6 size (`button.tsx:9-26`). **Không có `loading`/`aria-busy`**, không có `asChild` cho link. Bo góc cố định `rounded-xl` (không theo preset). |
| Icon | Đã triển khai & kiểm chứng | `icons.tsx`, `app-icon.tsx`, test `icon-library.test.ts`. |
| Input / Textarea | Một phần | `Input` có `hasError` nhưng **không gắn `aria-invalid`/`aria-describedby`** (0 thuộc tính `aria` trong `input.tsx`); `InlineError` không tự liên kết với ô nhập. **Không có `Textarea`.** |
| Select | Có nhưng bất nhất | Radix Select (3 tệp) vs `<select>` thô (nhiều). |
| Checkbox / Radio / Switch | **Không triển khai** | 69 tệp `type="checkbox"`, 18 tệp `type="radio"`, 5 tệp `role="switch"` tự viết. |
| Badge | Có nhưng bất nhất | Hex cứng `bg-[#FBEAEC]`; `success` dùng `text-primary`. |
| Avatar | **Không triển khai** | 4 tệp tự viết. |
| Tooltip | Có nhưng bất nhất | `tooltip.tsx` (Radix, 4 tệp) và `info-tip.tsx` (44 tệp) — hai cơ chế, không có quy tắc chọn. |
| Separator | Đã triển khai | 2 tệp. |

## C2. Composite

| Composite | Trạng thái | Ghi chú |
|---|---|---|
| Card | Đã triển khai, dùng chưa hết | Compound `CardHeader/Title/…` có; vi phạm luật “không tự viết div viền” rất phổ biến. |
| Search bar / Filter | **Không triển khai** (component) | UX-P09 chỉ có 7 dòng luật; mỗi danh sách tự dựng. |
| Dropdown menu | **Không triển khai** | 0 tệp `DropdownMenu`; menu `…` của K2 nằm trong `tab-header.tsx`. |
| Date picker | **Không triển khai** | 13 tệp `type="date"` gốc trình duyệt. |
| Dialog / Modal | Có nhưng bất nhất | `@base-ui/react` Dialog chuẩn; 71 tệp overlay tự chế. |
| Drawer / Bottom sheet | **Không triển khai** (component) | 9 tệp tên “Drawer” tự viết (`mobile-nav-drawer`, `ui-studio-drawer`…); 03c §5b quy định khi nào dùng Drawer nhưng không có component. |
| Table / Pagination | Không triển khai (thực tế) | `Table` 0 nơi dùng; Pagination 1 tệp. |
| Tabs | Có nhưng bất nhất | `TabActionHeader` vs tablist tự viết. |
| Navigation menu | Đã triển khai | `components/layout/nav/*`. |
| Form group / Field | **Không triển khai** | Không có `FormField` (label + control + help + error). 692 `<label>` tự viết. |
| Toast | **Không triển khai** | Skill `ui-development` §7 yêu cầu Toast; 0 component; 4 tệp tự viết. |

## C3. Business components

Có thư mục theo module (`orders/`, `products/`, `crm/`, `dashboard/`, `coordinator/`…), nhưng:

- **Không có tầng “business component dùng chung”** (Order/Product/Customer/Store Card, Status chip). Ví dụ trạng thái: `ProductStatusBadge` (products), bảng màu trạng thái tự định nghĩa trong `platform-records-viewer.tsx:34-38` (dùng `text-emerald-600`, `text-blue-600` — R1 **không bắt** vì nằm trong object literal, không trong `className`), `voucher-batches-client.tsx`, `price-lists-client.tsx`, `toolkit-card.tsx`.
- KPI: `ui/stat-tile.tsx` (5 tệp) song song `PlatformOverviewMetrics`, `ToolkitStats`, `SalesFunnelStats`, `ChannelFunnelStats` tự dựng.
- Approval: `stage-gate-approval-bar.tsx` (5 tệp) — có; luồng duyệt khác (`/duyet`, `/van-hanh/phe-duyet`) tự dựng.
- Kích thước: **54 tệp `.tsx` vượt 350 dòng** (vd. `tai-anh/page.tsx` 1.945, `variant-workspace.tsx` 1.753, `upload-wizard.tsx` 1.458) — vi phạm `CLAUDE.md` NN#7, cản trở tái sử dụng.

## C4. Component contracts

`COMPONENT_CONTRACTS.md` chỉ có **5 contract** (Button, Card, Input, Table, PageContainer/PageHeader). Đối chiếu 11 trường đề bài:

| Trường | Button | Card | Input | Table | Page* | 38 component còn lại |
|---|---|---|---|---|---|---|
| Purpose | ✓ | ✓ | ✓ | ✓ | ✓ | ✗ |
| Props | ✓ (thiếu `xs`/`lg`?) — code có `lg`, doc không | ✗ | ✓ | ✗ | ✗ | JSDoc rải rác |
| Variants / sizes | ✓ | ✓ | ✓ | ✗ | ✗ | ✗ |
| States (hover/focus/disabled/loading/error) | ✗ | một phần | `hasError` | hover | ✗ | ✗ |
| Interaction / keyboard | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ |
| Responsive | một phần (touch) | ✗ | ✗ | ✓ (`overflow-x-auto`) | ✓ padding | ✗ |
| Accessibility | ✓ (icon cần `aria-label`) | ✗ | ✓ (label) | ✗ | ✗ | ✗ |
| Usage / prohibited | ✓ (1 primary/màn) | ✓ (cấm div viền) | ✓ | ✗ | ✓ | ✗ |
| Dependencies | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ |

Lệch contract ↔ code: Button doc nói `size="sm"` dùng cho toolbar (h-11, 44px) nhưng trang thật override `h-9` (`/dieu-phoi/page.tsx:58`); Table contract mô tả component không ai dùng; Badge contract (Inventory) sai API.

## C5. Component governance

| Câu hỏi | Trả lời | Bằng chứng |
|---|---|---|
| Single source of truth? | **Một phần** | `ui/` là nơi chuẩn, nhưng SSOT tài liệu ở `docs/ui-ux/` không có trong REGISTRY và lệch code. |
| Trùng lặp? | **Có, nhiều** | Số liệu bảng đầu; ux-lint R12 (component trùng tên) chỉ bắt **tên** trùng, không bắt markup trùng. |
| Nhất quán giữa tầng? | Một phần | `(platform)` và `(app)` dùng cùng `ui/`, nhưng màn Mother dùng thang màu `cool/blush` nhiều (`platform-data-hub.tsx`, `platform-records-viewer.tsx`). |
| Quy trình tạo mới | Có (lời) | Skill `ui-development` §2: “kiểm tra có sẵn → tái dùng → nếu chưa có tạo reusable + cập nhật SSOT → không rõ hỏi PO”; 03a §30. Không có template, checklist hay review bắt buộc. |
| Quy trình sửa | Không có | Không có quy tắc semver/tương thích ngược ngoài câu “Zero Breaking Changes” trong `UI_FOUNDATION_ARCHITECTURE.md` §3. |
| Deprecated được đánh dấu? | **Không** | 0 `@deprecated` trong `src/components`; token shadcn cũ, `Table` không dùng, `dark:` không kích hoạt — không cái nào được đánh dấu. |
| Test component | Thiếu | `src/components/ui/__tests__/` 5 tệp (app-icon, info-tip, preview-notice, PD kit, shared-airy); **không có test cho Button, Card, Dialog, Input, Select, Table, TabActionHeader**. Không Storybook/catalog trực quan. |

**Tác động:** sửa một primitive (vd. bo góc nút, focus ring) **không lan** được tới ~1.000 nút/ô nhập tự viết; mỗi tầng/agent mới sẽ tạo thêm bản sao.
