# Kế hoạch hoàn thiện Nhóm 6 — Tính giá và tối ưu lợi nhuận (công cụ #31–#35)

> Trạng thái: **ĐỀ XUẤT — chờ PO duyệt** · Ngày: 29/10/2026 · Cơ sở: `main` @ `27319ba`
> Chuẩn áp dụng: `docs/dac-ta/03a-ux-constitution.md` + `docs/dac-ta/03c-ux-progressive-disclosure.md` + `docs/dac-ta/ux-patterns/`
> Mục tiêu nhóm (toolkit): "Biết rõ chi phí, định giá có căn cứ và chuẩn bị nguyên liệu đúng nhu cầu"

## 1. Hiện trạng thật (đã đọc mã, có bằng chứng)

| # | Công cụ | Toolkit ghi | Thực tế trong mã |
|---|---|---|---|
| 31 | Công thức & định mức nguyên liệu | PLANNED 0% | BOM chỉ có **số lượng** do AI đọc từ ảnh (`products.attributes.bom`, `product_analyses`), chuẩn hoá ở `src/modules/products/domain/bom.ts`. Không có màn nhập/sửa công thức, không gắn với danh mục nguyên liệu. |
| 32 | Bảng giá nguyên liệu | IN_PROGRESS 50% | **Không có bảng nguyên liệu, không lưu đơn giá, không lịch sử giá, không nhà cung cấp.** `costVnd` chỉ là trường tuỳ chọn trong BOM, không màn nào cho nhập (chỉ luồng nhập Avi Gift). Con số 50% không đúng. |
| 33 | Tính giá vốn | IN_PROGRESS 45%, trỏ `/bao-gia` | `/bao-gia` **không tính giá vốn**: là màn "Thẻ báo giá" dùng 5 sản phẩm mẫu cài cứng (ảnh Unsplash) và **giả lập AI phân tích ảnh bằng `setTimeout` 1,2 s** trả kết quả cố định (`src/app/(app)/bao-gia/page.tsx:166-174`). Có sẵn: hàm `bomMaterialCostVnd()` (`bom.ts:116`), chính sách phí gia công theo độ khó (`craft-fee-policy`, mã `D16`). |
| 34 | Đề xuất giá bán & lợi nhuận | IN_PROGRESS 40%, trỏ `/bao-gia` | Máy tính giá thật nằm ở `/gia` (`pricing-calculator-card.tsx`, dùng `quotePrice()` + sàn/trần `price-guard.ts`), nhưng **giá vốn phải gõ tay** và chỉ cho **một** mức giá, hướng đối tác (thưởng theo hạng). Chưa có mô phỏng nhiều kịch bản. |
| 35 | Dự toán & nhu cầu mua nguyên liệu | PLANNED 0% | `order_items.metadata` có lưu BOM của mẫu lúc đặt — dùng được để cộng dồn. Tồn kho chỉ ở mức **sản phẩm** (`product_inventory`), không có tồn **nguyên liệu**. |

**Ràng buộc kiến trúc phải giữ:**
- `REQ-BND-007/008` (`docs/spec/requirements.md`): *định mức chuẩn (master) chỉ tồn tại ở Industry Pack; Store OS chỉ đọc.* → Công thức của **cửa hàng** là dữ liệu riêng của tổ chức (không phải "định mức chuẩn"); Industry Pack chỉ cung cấp **gợi ý** (đơn vị, vai trò cấu phần — `IndustryTerminology.defaultMeasurementUnits`, `defaultComponentRoles`).
- Tenancy: mọi bảng mới có `organization_id` + `@@index([organization_id])`; truy cập chéo tổ chức → 404.
- Quyền theo mã năng lực: tận dụng `L1/L3` (sản phẩm), `L5/L6` (quy tắc giá), `D16` (định mức tiền công).

## 2. Kiến trúc đích — một luồng thống nhất thay vì 5 màn rời

```text
#32 Nguyên liệu & đơn giá ──▶ #31 Công thức từng mẫu ──▶ #33 Giá vốn ──▶ #34 Giá bán & lợi nhuận
        ▲                                                                      │
        └──────────── #35 Dự toán mua (đơn hàng × công thức − tồn) ◀──────────┘
```

**Không gian làm việc `/tinh-gia`** ("Giá vốn & định giá") — mỗi công cụ là một tab có URL riêng (`/tinh-gia/nguyen-lieu`, `/cong-thuc`, `/gia-von`, `/gia-ban`, `/du-toan`) để toolkit trỏ đúng từng công cụ. `/gia` (cấu hình quy tắc giá) giữ nguyên, được liên kết từ tab Giá bán.

### 2.1. Dữ liệu (cần PO duyệt — thay đổi `prisma/schema.prisma` + migration)

| Bảng | Trường chính | Phục vụ |
|---|---|---|
| `materials` | organization_id, name, unit, category, unit_cost_vnd, supplier_name?, on_hand_qty?, reorder_qty?, active | #32, #35 |
| `material_price_history` | organization_id, material_id, unit_cost_vnd, effective_at, source (`MANUAL`/`IMPORT`/`PURCHASE`), created_by | #32 (lịch sử, cảnh báo biến động) |
| `product_recipes` | organization_id, product_id, variant_id?, version, labor_minutes?, waste_percent, note, updated_by | #31 |
| `product_recipe_items` | organization_id, recipe_id, material_id, quantity, role | #31, #33, #35 |

Cấu hình chi phí **không cần bảng mới**: thêm khoá vào `pricing_rules` có sẵn — `labor_rate_per_hour`, `overhead_percent`, `default_packaging_vnd`, `price_change_alert_percent`, `target_margin_percent`.

### 2.2. Domain thuần (`src/modules/costing/domain/`, không import Prisma — có unit test)
- `computeProductCost(recipe, materialPrices, costConfig)` → `{ materialVnd, laborVnd, packagingVnd, overheadVnd, wasteVnd, totalVnd, missingPrices[] }` — **thiếu đơn giá thì báo thiếu, không đoán**.
- `priceScenarios(costVnd, { marginTargets[], competitorVnd?, floorCeiling, rounding })` → mỗi kịch bản: giá, lợi nhuận, biên %, cảnh báo dưới sàn/trên trần/lỗ — dùng lại `quotePrice`/`checkPriceGuard`.
- `aggregateMaterialNeeds(orders, recipes, stock)` → danh sách mua: nguyên liệu, cần, tồn, phải mua, chi phí ước tính, đơn liên quan.
- `detectPriceChanges(history, thresholdPercent)` → cảnh báo biến động giá.

## 3. Thiết kế UX theo Progressive Disclosure (03c)

| Công cụ | L0–L1 (hiện ngay) | L2 (theo ngữ cảnh) | L3/L4 ("Tùy chỉnh thêm") | SYS | Pattern | Rủi ro |
|---|---|---|---|---|---|---|
| #32 Nguyên liệu | Danh sách + ô tìm + "Thêm nguyên liệu"; cảnh báo giá đổi mạnh | Lịch sử giá 1 nguyên liệu, sản phẩm bị ảnh hưởng | Nhà cung cấp, mức đặt lại, nhập Excel | Ghi lịch sử mỗi lần đổi giá, tính lại giá vốn | P02, P09, P10, P08 (dữ liệu mẫu lần đầu) | Đổi giá R2 (ảnh hưởng giá vốn mọi mẫu → hiện số mẫu bị ảnh hưởng trước khi lưu) |
| #31 Công thức | Chọn mẫu → bảng thành phần (điền sẵn từ BOM AI) + giá vốn tạm tính | Thành phần chưa khớp nguyên liệu → gợi ý ghép | Hao hụt %, thời gian làm, phiên bản | Ghép tên BOM ↔ nguyên liệu, lưu phiên bản | P02, P03, P05 | R1 (nháp) / R2 (lưu đè phiên bản) |
| #33 Giá vốn | Giá vốn 1 mẫu + "Đủ dữ liệu / còn thiếu N đơn giá" | Bảng phân rã nguyên liệu/công/bao bì/chi phí chung | Đơn giá công, % chi phí chung | Tính lại khi giá nguyên liệu đổi | P05, P06, P08 | R1 |
| #34 Giá bán | 3 kịch bản (an toàn / đề xuất / cạnh tranh) với lợi nhuận & biên | Cảnh báo dưới sàn/lỗ, so giá đối thủ | Biên mục tiêu, cách làm tròn, giá cao điểm | Áp sàn/trần, làm tròn | P05, P03, P07 | **Áp giá vào sản phẩm R3** → `ConfirmDialog` + nhật ký |
| #35 Dự toán mua | Chọn khoảng ngày → "Cần mua" + tổng tiền | Đơn hàng tạo ra nhu cầu từng nguyên liệu | Tồn an toàn, gộp theo nhà cung cấp | Cộng dồn đơn × công thức − tồn | P05, P09, P10 | "Đánh dấu đã mua" R2 (cập nhật tồn + lịch sử giá, có hoàn tác) |

Áp dụng chung: không mã kỹ thuật trên màn, `<h1>` mỗi trang, trạng thái thật (`TaskStatus` khi tính lại nhiều mẫu), không số giả (thiếu đơn giá → ghi "chưa có giá", không mặc định), `EntitlementGate` khi thiếu quyền `L6`, axe 0 lỗi ở 390px.

## 4. Lộ trình triển khai

| Đợt | Nội dung | Đầu ra | Cổng nghiệm thu |
|---|---|---|---|
| **0. Quyết định PO** | Chốt mục 6 | Phán quyết ghi vào 03c/ADR | PO duyệt |
| **1. Nền dữ liệu** | 4 bảng + migration; repository tenant-scoped; API `materials`, `recipes` (capability) | Schema + `tests/tenant/*` (cô lập tổ chức) | `test:tenant`, `test:platform` xanh; route guard |
| **2. #32 Nguyên liệu** | Danh sách, thêm/sửa, lịch sử giá, cảnh báo biến động, nhập Excel | `/tinh-gia/nguyen-lieu` | P02/P09/P10; axe; unit `detectPriceChanges` |
| **3. #31 Công thức** | Màn công thức theo mẫu, điền sẵn từ BOM AI, ghép nguyên liệu, phiên bản | `/tinh-gia/cong-thuc` | Unit ghép tên; axe |
| **4. #33 Giá vốn** | Tính giá vốn đủ cấu phần; hiện trên trang sản phẩm; tự điền vào máy tính `/gia` | `/tinh-gia/gia-von` | Unit `computeProductCost` (thiếu giá ⇒ báo thiếu) |
| **5. #34 Giá bán** | 3 kịch bản, sàn/trần, áp giá vào sản phẩm (R3) | `/tinh-gia/gia-ban` | Unit `priceScenarios`; `ConfirmDialog`; nhật ký |
| **6. #35 Dự toán mua** | Cộng dồn đơn × công thức − tồn, xuất danh sách, đánh dấu đã mua | `/tinh-gia/du-toan` | Unit `aggregateMaterialNeeds`; tenant test |
| **7. Hoàn thiện** | Screen Contract §15 cả 5 màn, thêm vào `a11y-done-tools.spec.ts`, toolkit #31–#35 → DONE 100% | PR | Mọi gate CLAUDE.md xanh |

Thứ tự 2 → 3 → 4 → 5 → 6 là bắt buộc vì mỗi công cụ dùng dữ liệu của công cụ trước. Mỗi đợt một PR, merge được độc lập; màn chưa xong ẩn khỏi toolkit (`href: null`) để không lộ màn dở.

## 5. Việc sửa ngay, độc lập với Nhóm 6
- `/bao-gia` đang **giả lập AI** (`setTimeout` + kết quả cố định) và dùng **sản phẩm mẫu cài cứng** khi API trả rỗng — vi phạm 03c UX-016 trên một màn đang chạy. Đề xuất: bỏ giả lập, dùng `/api/v1/market-intelligence/vision-extract` thật hoặc ẩn nút tải ảnh; rỗng thì `EmptyState`. Màn này thuộc công cụ báo giá (#15/#16), không thuộc #33/#34 — toolkit #33/#34 đang trỏ nhầm vào đây.
- Sửa `statusNote`/`progress` của #32–#34 trong `toolkit-catalog.ts` cho đúng thực tế ngay khi bắt đầu Đợt 1.

## 6. Quyết định cần PO

1. **Duyệt thay đổi schema** (mục 2.1): 4 bảng mới + migration. (CLAUDE.md: bắt buộc hỏi PO.)
2. **Diễn giải REQ-BND-007/008**: công thức của cửa hàng là dữ liệu riêng của tổ chức; Industry Pack chỉ gợi ý đơn vị/vai trò. Đồng ý?
3. **Phạm vi #32**: chỉ ghi *tên* nhà cung cấp (đơn giản, nhanh) hay quản lý nhà cung cấp đầy đủ (bảng riêng, liên hệ, so giá)? Đề xuất: tên trước, đầy đủ sau.
4. **Phạm vi #35**: có quản lý **tồn nguyên liệu** (nhập/xuất) hay chỉ dự toán từ đơn và tồn nhập tay? Đề xuất: tồn nhập tay + "đánh dấu đã mua".
5. **Quyền**: dùng lại `L5/L6` (quy tắc giá) và `L3` (sản phẩm) hay tạo mã mới riêng cho nguyên liệu? Đề xuất: dùng lại, không thêm mã.
6. **Áp giá vào sản phẩm (#34)**: cho Điều hành (`L6`) áp trực tiếp, hay tạo đề xuất chờ duyệt? Đề xuất: áp trực tiếp có `ConfirmDialog` + nhật ký.
7. **`/bao-gia`**: sửa giả lập ngay (mục 5) trong đợt này hay tách riêng?
