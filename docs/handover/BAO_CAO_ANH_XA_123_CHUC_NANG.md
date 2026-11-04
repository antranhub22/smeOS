# Báo cáo ánh xạ 123 chức năng bàn giao ALG với mã nguồn smeOS

Đối tượng đối chiếu: *Checklist bàn giao chức năng nền tảng điện hoa cho ALG* (123 chức năng, 10 nhóm).
Đối tượng kiểm tra: mã nguồn smeOS tại commit `662a9aab` (nhánh `claude/festive-fermat-9ctmbf`), ngày kiểm tra 04/11/2026.

## 1. Phạm vi và phương pháp

- Đúng 123 chức năng, giữ nguyên mã STT của checklist. Chức năng ngoài checklist không được đánh giá.
- Tiêu chí nghiệm thu của mỗi dòng là cột "Mô tả / nội dung kiểm tra" của checklist. Mọi ý trong mô tả đều được đối chiếu.
- Bằng chứng duy nhất được chấp nhận là mã nguồn và test có thật: `đường-dẫn:dòng`. Tài liệu đặc tả, checklist đã tick, chú thích TODO không được tính là bằng chứng.
- Chuỗi kiểm tra cho mỗi chức năng: giao diện (`src/app`, `src/components`) → API (`src/app/api/v1`) → use-case/domain (`src/modules`) → lược đồ dữ liệu (`prisma/schema.prisma`) → kiểm soát quyền (`requireCapability`) và cách ly tổ chức (`requireTenantContext`) → test.

### Tiêu chí phân loại

| Trạng thái | Điều kiện |
|---|---|
| **Hoàn thiện** | Chạy được từ đầu đến cuối (giao diện → API → dữ liệu), đáp ứng mọi ý trong mô tả, có kiểm soát quyền và cách ly tổ chức, có test tự động cho hành vi cốt lõi |
| **Dang dở** | Có mã thực thi nhưng thiếu ít nhất một ý trong mô tả, hoặc thiếu test cho hành vi cốt lõi, hoặc chỉ là cấu hình/giao diện chưa nối với nghiệp vụ |
| **Chưa hoàn thành** | Không có mã thực thi cho chức năng (có thể chỉ có bảng dữ liệu hoặc hằng số chưa được dùng) |

Ký hiệu đường dẫn rút gọn: `org/` = `src/modules/organization/`, `gc/` = `src/modules/greeting-card/`, `api/` = `src/app/api/v1/`, `tt/` = `tests/tenant/`, `tp/` = `tests/platform/`, `tu/` = `tests/unit/`, `schema` = `prisma/schema.prisma`.

## 2. Tổng hợp

| Nhóm | Nội dung | Số chức năng | Hoàn thiện | Dang dở | Chưa hoàn thành |
|---|---|---:|---:|---:|---:|
| 1 | Nền tảng chung & phân quyền | 19 | 17 | 2 | 0 |
| 2 | Quản lý sản phẩm, mẫu hoa & hình ảnh | 9 | 7 | 2 | 0 |
| 3 | Tạo & quản lý báo giá | 13 | 8 | 5 | 0 |
| 4 | Tiếp nhận, quản lý & xử lý đơn hàng | 32 | 31 | 1 | 0 |
| 5 | Thẻ Chào mẫu hoa & trang khách hàng | 15 | 10 | 5 | 0 |
| 6 | Báo cáo hoạt động & tài chính | 9 | 3 | 6 | 0 |
| 7 | AI phân tích, nội dung & marketing | 3 | 1 | 2 | 0 |
| 8 | Landing page bán hàng | 1 | 1 | 0 | 0 |
| 9 | Chat nội bộ, đa chuỗi & phân quyền nâng cao | 14 | 10 | 3 | 1 |
| 10 | Quản lý credit AI, hạn mức & thuê bao SaaS | 8 | 2 | 3 | 3 |
| | **Tổng cộng** | **123** | **90** | **29** | **4** |

Tỷ lệ: Hoàn thiện 73,2% · Dang dở 23,6% · Chưa hoàn thành 3,3%.

### Bốn chức năng chưa hoàn thành

| STT | Chức năng | Lý do |
|---|---|---|
| 9.10 | Khởi tạo tổ chức & khởi tạo gói dịch vụ | Console không có chức năng tạo tổ chức, không có chỗ gán gói |
| 10.3 | Thiết lập hạn mức dịch vụ (AI, SMS, Zalo) | Không có cấu hình hạn mức tháng |
| 10.5 | Cảnh báo khi credit AI còn dưới 20% | Không có sự kiện cảnh báo credit |
| 10.8 | Cấu hình trỏ tên miền riêng | Không có mã xử lý tên miền riêng |

## 3. Chi tiết theo nhóm

### Nhóm 1 — Nền tảng chung & phân quyền (19)

| STT | Chức năng | Trạng thái | Bằng chứng | Còn thiếu |
|---|---|---|---|---|
| 1.1 | Truy cập theo tổ chức (Multi-tenant) | Hoàn thiện | `org/use-cases/resolve-session.ts:33-60,123-133` lấy `organization_id` từ bản ghi phiên phía máy chủ; 46 file test tenant kiểm 404 chéo tổ chức, ví dụ `tt/order-isolation.test.ts:34-196`, `tt/cach-ly-endpoint.test.ts:70` | — |
| 1.2 | Đăng nhập & thu hồi phiên cũ | Hoàn thiện | `org/use-cases/log-in.ts:51-63` thu hồi mọi phiên cũ trong cùng transaction; `resolve-session.ts:42` trả lý do `SESSION_SUPERSEDED`; `src/app/(app)/page.tsx` chọn màn hình theo vai (`resolveRoleUx`); `tt/single-session-per-account.test.ts:29,44` | — |
| 1.3 | Đăng xuất & vô hiệu hóa phiên tức thì | Hoàn thiện | `api/auth/logout/route.ts:6-19` thu hồi phiên và xoá cookie; `org/use-cases/log-out.ts`; `tt/single-session-per-account.test.ts:49` (token cũ trả 401) | Token SSO liên ứng dụng đã phát hành còn hiệu lực tối đa 15 phút sau đăng xuất (`logout/route.ts:8-11`) |
| 1.4 | Bắt buộc đổi mật khẩu tạm lần đầu | Hoàn thiện | `schema` `users.must_change_password` (migration `20261104090000_password_change_and_payment_confirmation`); bật khi cấp mật khẩu tạm `org/infra/staff-account-repository.ts`, `src/modules/platform/infra/account-approval-repository.ts`, `src/modules/chain-partnership/infra/prisma-partnership-repository.ts`; chặn API `org/use-cases/resolve-session.ts` (`PASSWORD_CHANGE_REQUIRED`); hộp đổi mật khẩu bắt buộc `src/components/layout/forced-password-change.tsx`; `tt/temporary-password-gate.test.ts` | — |
| 1.5 | Quản lý thông tin cửa hàng & logo an toàn | Hoàn thiện | `api/business-profile/route.ts:10-33` (đọc F1, sửa F2); `api/brand-profile/route.ts:12,30,41` (`logo_asset_id`); `src/components/profiles/business-profile-form.tsx`, `brand-profile-form.tsx`; `tt/cach-ly-endpoint.test.ts:125,157` | — |
| 1.6 | Khai báo chi nhánh & tọa độ quận/huyện | Hoàn thiện | `schema:298-330` (`chain_branches`: địa chỉ, phường/quận/tỉnh, `service_wards`, `latitude/longitude`); `api/greeting-card/chain-branches/bulk-import/route.ts:56-58`; xếp hạng theo vùng `gc/domain/chain-dispatch-engine.ts`; `tt/chain-branch-area.test.ts:31,43`, `tt/chain-branches-table.test.ts:42-93` | Khai báo theo lô Excel; không có form thêm từng chi nhánh |
| 1.7 | Khai báo dịp tặng hoa ngành chuẩn | Hoàn thiện | `api/occasions/route.ts:15-30`, `api/occasions/[id]/route.ts:17-19`; danh sách mặc định `org/infra/occasion-repository.ts:23-36`; `src/components/organization/occasions-settings-form.tsx` (thêm, sửa, bật/tắt); `tt/occasions-isolation.test.ts` (mặc định, thêm/sửa/tắt, Sale 403, tổ chức khác 404) | — |
| 1.8 | Chính sách cửa hàng (ngân hàng, phụ thu lễ) | Hoàn thiện | Ngân hàng `gc/domain/store-payment-methods.ts:142`; % cọc `gc/domain/brochure-payment-policy.ts:20-22`; phụ phí và số đơn tối đa ngày lễ `gc/domain/holiday-policy.ts:1-30`; trần đơn theo khung giờ `gc/domain/slot-capacity.ts:1-40`; `tt/greeting-card-holiday.test.ts:60,68`, `tt/greeting-card-promotion-slot.test.ts:114,130`, `tt/greeting-card-payments.test.ts:68` | — |
| 1.9 | Cấu hình trường dữ liệu linh hoạt theo shop | Dang dở | Tạo/ẩn trường chỉ qua Console nền tảng `api/platform/fields/route.ts`, `api/platform/organizations/[id]/field-overrides/route.ts`; cửa hàng chỉ đọc `api/field-config/route.ts:9`; `tp/field-registry.test.ts:47-165` (ca 165 khẳng định cửa hàng không ghi được) | Cửa hàng tự thêm/ẩn trường |
| 1.10 | Quản lý & mời thành viên | Hoàn thiện | `org/use-cases/staff-accounts.ts:29-58` tạo tài khoản kèm mật khẩu tạm, vai, chi nhánh, nhật ký; `src/app/(app)/cai-dat/thanh-vien/_components/add-staff-dialog.tsx`; `tt/staff-accounts.test.ts:46,58` | Luồng "Mời" (`org/use-cases/invite-member.ts:18-20`) chưa có bước nhận lời mời/mã mời |
| 1.11 | Điều chỉnh/gỡ thành viên & thu hồi phiên ngay | Hoàn thiện | Gỡ: `api/members/[id]/route.ts` (F4), `tu/organization/remove-member.test.ts`; đổi vai: `org/use-cases/change-member-role.ts` (chặn tự đổi vai, ghi nhật ký vai trước/sau); quyền tính lại mỗi yêu cầu `org/use-cases/resolve-session.ts`; `tt/member-role-change.test.ts` | — |
| 1.12 | 6 vai trò mặc định | Hoàn thiện | Vai hệ thống Điều hành, Điều phối, Sale, Thợ cắm hoa (`tho_cam`), Shipper (`shipper`), Kế toán (`ke_toan`) `org/domain/system-roles.ts`; bộ quyền mặc định theo PO Q7 `src/core/rbac/capability-catalog.ts` (R17 việc chế tác được giao, R18 đơn được giao đi giao, R19 xem đối soát; Kế toán không có R9/R10/R11/R16); trang chủ theo vai `org/domain/role-ux-operations.ts`, `src/app/(app)/page.tsx`, `src/components/dashboard/florist-queue-home.tsx`, `shipper-runs-home.tsx`, `accounting-workspace.tsx`; `src/core/rbac/capability-catalog.test.ts`, `org/domain/role-ux-catalog.test.ts`, `tt/system-roles.test.ts` | — |
| 1.13 | Tạo vai trò tùy chỉnh | Hoàn thiện | `org/use-cases/create-role.ts:17-38` (vai mới không có quyền); `org/use-cases/update-role-capabilities.ts:31-41` từ chối toàn bộ yêu cầu vượt trần cứng; F5 chỉ Điều hành (`src/core/rbac/capability-catalog.ts:150`), Điều hành có mọi mã trừ K1 (`:219`); `src/core/rbac/permission-resolver.test.ts:17,64`; `tt/greeting-card-transfer-confirm.test.ts:77` | — |
| 1.14 | Hiển thị giao diện & menu theo quyền | Hoàn thiện | Mục menu mang mã quyền `src/components/layout/nav/nav-chain.ts:25-98`; `src/components/layout/nav-model.test.ts:33` (Sale không thấy `/dieu-phoi`); `src/components/layout/nav-matrix.test.ts` | — |
| 1.15 | Chặn thao tác vượt quyền & ghi log vi phạm | Hoàn thiện | Chặn: `src/core/rbac/capabilities.ts`; ghi `security.access_denied` (người, đường dẫn, mã quyền, IP, thiết bị, tối đa một dòng/phút/đường dẫn) `src/core/http/request-audit.ts`, gắn ở `src/core/http/response.ts`; `tt/audit-trail.test.ts` | — |
| 1.16 | Khóa cứng quyền nhạy cảm ở tầng server | Hoàn thiện | Trần cứng Điều hành: C10, R6, R10, R11 (`src/core/rbac/capability-catalog.ts`); sổ thu: Sale/Điều phối ghi thì chờ Điều hành xác nhận `src/modules/coordinator/use-cases/record-payment.ts`, `decide-pending-payment.ts`, `api/coordinator/orders/[id]/payments/[paymentId]/decision`, cột `order_payments.status`; Thẻ Chào mặc định chỉ Điều hành xác nhận tiền `gc/domain/brochure-payment-policy.ts`, `gc/domain/brochure-workflow-policy.ts`; `tt/payment-confirmation.test.ts`, `tt/greeting-card-transfer-confirm.test.ts` | — |
| 1.17 | Nhật ký thao tác chi tiết IP/thiết bị | Hoàn thiện | Mọi thao tác ghi thành công → `api.mutation` `src/core/http/request-audit.ts`; IP/thiết bị tự điền từ ngữ cảnh yêu cầu `src/core/observability/request-context.ts`, `src/modules/audit/infra/audit-log-repository.ts`; lọc phía máy chủ theo loại thao tác, đối tượng, người, khoảng ngày `api/audit-logs/route.ts`; màn lọc `src/app/(app)/audit/page.tsx`; `tt/audit-trail.test.ts` | — |
| 1.18 | Gắn dữ liệu với tổ chức ở tầng database (RLS) | Dang dở | Mọi bảng nghiệp vụ có `organization_id` + chỉ mục; lọc ở tầng ứng dụng `src/core/tenancy/tenant-context.ts:43` (`scopedWhere`) | Không có chính sách Row Level Security của Postgres (0 lệnh `ROW LEVEL SECURITY` trong `prisma/migrations`) |
| 1.19 | Chặn truy cập chéo (404 Not Found) | Hoàn thiện | `src/core/http/errors.ts:24,53`; 127 khẳng định `toBe(404)` trong 46 file `tt/`, ví dụ `tt/order-isolation.test.ts:63-196`, `tt/cach-ly-endpoint.test.ts:70-83` | — |

### Nhóm 2 — Quản lý sản phẩm, mẫu hoa & hình ảnh (9)

| STT | Chức năng | Trạng thái | Bằng chứng | Còn thiếu |
|---|---|---|---|---|
| 2.1 | Tạo thẻ sản phẩm mẫu hoa | Hoàn thiện | `api/products/route.ts` (L2); mã để trống → máy chủ sinh mã `AUTO-` duy nhất trong tổ chức, thử lại khi trùng `src/modules/products/use-cases/create-product.ts` (quy ước `src/modules/products/domain/product-code.ts`), mã nhập trùng → 409; dịp (danh mục dịp của tiệm → `attributes.occasionCodes`) và kích thước (`attributes.dimensions`) `src/components/products/use-product-occasion-size.ts`, `create-occasion-size-card.tsx`; mô tả, màu, ảnh `src/components/products/use-create-product-form.ts`; `tt/products-create.test.ts`, `tt/products-pricing.test.ts:37,60` | — |
| 2.2 | Cập nhật thẻ sản phẩm & đồng bộ Thẻ Chào | Hoàn thiện | `api/products/[id]/route.ts:44-54` (L3); Thẻ Chào đọc sản phẩm trực tiếp qua quan hệ `gc/infra/greeting-catalog-repository.ts:15`; `tt/products-pricing.test.ts:131`, `tt/product-governance.test.ts:94` | — |
| 2.3 | Trạng thái sản phẩm (Nháp/Hoạt động/Lưu trữ) | Hoàn thiện | Enum `DRAFT/ACTIVE/PAUSED/ARCHIVED` (migration `20261104120000_product_status_paused`); lưu trữ cần L4 `api/products/[id]/route.ts`; mẫu tạm ngưng/lưu trữ không bán trên link khách `gc/domain/product-availability.ts`, `gc/use-cases/check-product-availability.ts`; mẫu đã có đơn (dòng đơn hoặc lịch đặt) không xoá vĩnh viễn được, chỉ lưu trữ `src/modules/storage/infra/trash-repository.ts` → 409; nhãn và thao tác hàng loạt "Tạm ngưng" `src/components/products/product-card.tsx`, `product-bulk-status-bar.tsx`; `tt/products-status.test.ts` | — |
| 2.4 | Biến thể kích cỡ (Nhỏ/Vừa/Lớn/VIP) | Dang dở | Giá theo phiên bản (nhóm Kích cỡ × Màu) `src/modules/products/domain/product-pricing.ts:1-40`; S/M/L/XL co giãn công thức `src/modules/products/domain/product-size-variants.ts` chỉ dùng ở `src/app/(app)/gia/pricing-calculator-card.tsx` | Lưu số lượng hoa riêng theo từng kích cỡ vào mẫu |
| 2.5 | Định mức nguyên liệu BOM | Hoàn thiện | `schema:3622-3656` (`product_recipes`, `product_recipe_items`); nhóm Hoa chính/Hoa phụ/Lá `org/domain/industries/floral.ts:23-25`; `api/costing/recipes/[productId]/route.ts:11,26`; `src/app/(app)/tinh-gia/cong-thuc`; `tt/costing-isolation.test.ts:66` | — |
| 2.6 | Nhập danh mục hàng loạt từ Excel/CSV | Hoàn thiện | `src/components/products/bulk-import/parse-product-sheet.ts:84-123` (đánh lỗi từng dòng, trùng mã), `import-preview.tsx:46,186`; `api/products/batch-import/route.ts:37-38`; `tu/products/parse-product-sheet.test.ts`, `tu/products/run-bulk-import.test.ts`, `tt/products-batch-import-images.test.ts:56-105`, `tt/product-governance.test.ts:110` | — |
| 2.7 | Duyệt đề xuất thay đổi thông tin/giá 2 bước | Hoàn thiện | `schema:872-890` (`product_change_requests`); `api/products/[id]/change-requests`; `tt/product-governance.test.ts:44,81` | — |
| 2.8 | Cấu hình khả dụng, ẩn mẫu theo ngày | Dang dở | Ngành hoa dùng chế độ tồn kho `gc/domain/product-availability-config.ts:1-30`, `gc/use-cases/check-product-availability.ts:83-100`; khoá theo ngày chỉ chạy ở chế độ lịch đặt phòng `:125,151` | Đánh dấu hết nguyên liệu theo ngày cho mẫu hoa và tự ẩn khỏi danh mục/Thẻ Chào của ngày đó |
| 2.9 | Lưu bộ nội dung tư vấn bán hàng chuẩn SEO | Hoàn thiện | `src/modules/product-copies/domain/product-copy-rules.ts:28-59,156-171` (tiêu đề ngắn, điểm nổi bật, câu chuyện, từ khoá SEO); `api/product-copies`; `src/components/sales/sales-pitch-card.tsx` (sao chép); `tt/product-copies.test.ts:152-260` | — |

### Nhóm 3 — Tạo & quản lý báo giá (13)

| STT | Chức năng | Trạng thái | Bằng chứng | Còn thiếu |
|---|---|---|---|---|
| 3.1 | Cấu hình quy tắc giá 4 nhóm (Thưởng/Sàn/Trần) | Dang dở | `src/modules/products/domain/pricing-rules.ts:6-20` (thưởng hạng đối tác, nhóm phụ phí, tỷ lệ giá tối ưu, Sàn/Trần); `api/pricing-rules/route.ts:30-32` (L6); `tt/products-pricing.test.ts:159-208` | Chiết khấu theo hạng khách Đồng/Bạc/Vàng/VIP (hạng khách chỉ dùng xếp ưu tiên `src/modules/coordinator/domain/priority-suggestion.ts:12`) |
| 3.2 | Bộ tính giá tự động (hoa + phí cắm + phụ phí) | Hoàn thiện | `gc/domain/brochure-pricing.ts:223-246` trả từng khoản: tiền hàng, mã giảm, phí giao theo khu vực, ưu đãi, phụ phí lễ; `tt/greeting-card-quote.test.ts:70-111`, `tt/greeting-card-holiday.test.ts:60`, `tt/greeting-card-promotion-slot.test.ts:81-107` | Phí cắm nằm trong giá mẫu, không tách dòng |
| 3.3 | Tính giá vốn thực tế (nguyên liệu + bao bì + thợ) | Hoàn thiện | `src/modules/costing/domain/cost-calculator.ts:11-57`; `api/costing/products/[productId]`; `src/app/(app)/tinh-gia/gia-von`; `src/modules/costing/domain/costing.test.ts:21-67` | — |
| 3.4 | Kiểm soát cảnh báo & chặn giá dưới sàn | Hoàn thiện | Sàn = giá vốn × hệ số Sàn `src/modules/costing/domain/price-floor.ts`; chặn `BELOW_FLOOR` trừ người có C10 `src/modules/costing/use-cases/price-floor-guard.ts`, áp ở báo giá đơn `src/modules/orders/use-cases/quote-order.ts`, báo giá bán hàng `src/modules/sales/use-cases/create-quotation.use-case.ts`, `update-quotation.use-case.ts`, duyệt giảm giá Thẻ Chào `gc/use-cases/discount-requests.ts`; cảnh báo ở máy tính giá `src/app/(app)/gia/pricing-calculator-card.tsx`; `tt/below-floor.test.ts`, `src/modules/costing/domain/price-floor.test.ts` | — |
| 3.5 | Quản lý ưu đãi, mã giảm giá, miễn phí ship | Hoàn thiện | `gc/domain/brochure-pricing.ts:156-181` (kiểm mã hợp lệ, % hoặc số tiền), `:228-232` (miễn phí giao); `api/vouchers/batches` (Q8); `tt/vouchers-price-lists.test.ts:42-94`, `tt/greeting-card-promotion-slot.test.ts:97` | — |
| 3.6 | Phụ phí 6 kiểu dáng, hệ số ngày lễ 1.3x & VAT | Dang dở | VAT 8%/10% `gc/domain/order-vat.ts:6-8`, `tt/greeting-card-vat.test.ts:64-90`; phụ phí lễ là số tiền cố định `gc/domain/holiday-policy.ts:27` | Phí cắm theo 6 kiểu dáng; hệ số ngày lễ 1,3 (`gc/domain/craft-fee-policy.ts:14-21` là 6 phương án phí trả bên gia công, không phải phí cắm cho khách) |
| 3.7 | Đề xuất & duyệt giảm giá sâu trình Điều hành | Hoàn thiện | `gc/domain/discount-request.ts:1-55`; `api/greeting-card/orders/[id]/discount-request`, `api/greeting-card/discount-requests/[id]/decision`; `tt/greeting-card-messages.test.ts:109-134` (duyệt → tổng tiền cập nhật, nhật ký, tổ chức khác 404) | — |
| 3.8 | Soạn & xem trước báo giá chuyên nghiệp | Dang dở | `src/components/sales/quotation/customer-quote-builder.tsx`, `quote-preview-card.tsx:70`; `api/quotations/route.ts:73-75` (R15); `src/modules/sales/use-cases/quotation.test.ts:159` | Chọn kích cỡ và phí vận chuyển trong báo giá (`quotation_items` chỉ có tên/SL/đơn giá `schema:4135-4150`) |
| 3.9 | Lưu & quản lý báo giá theo mã | Hoàn thiện | `schema:4099-4131` (`code`, `valid_until`, `customer_id`); `src/modules/sales/use-cases/quotation.test.ts:200` (tự hết hạn); `tt/quotation-public-link.test.ts:140` | Mã có dạng `BG-0001`, không phải `QUO-…` |
| 3.10 | Điều chỉnh báo giá & lưu vết phiên bản | Dang dở | `src/modules/sales/use-cases/update-quotation.use-case.ts:25-60` (sửa dòng, tính lại tổng) | Lưu các phiên bản trước |
| 3.11 | Chia sẻ báo giá qua link / file PDF A6 | Dang dở | Link công khai `src/app/bg/[token]/page.tsx`, `src/modules/sales/infra/quotation-mapper.ts:62`; `tt/quotation-public-link.test.ts:61` (không lộ ghi chú nội bộ) | Xuất ảnh/PDF A6; trang khách không có hình và thành phần (`page.tsx:92-104` chỉ bảng tên–SL–giá) |
| 3.12 | Chuyển báo giá chốt thành đơn hàng 1-click | Hoàn thiện | `api/quotations/[id]/convert/route.ts:6-8` → `src/modules/sales/use-cases/convert-quotation-to-order.use-case.ts:45`; nút "Tạo đơn" `src/components/sales/quotation/quotations-list-view.tsx:59,196`; `quotation.test.ts:236`, `tt/quotation-public-link.test.ts:128` | — |
| 3.13 | Báo giá tự động realtime trên Thẻ Chào | Hoàn thiện | `api/public/brochure/[sendCode]/quote`, `api/public/greeting-catalog/[id]/quote`; tiền cọc `gc/domain/brochure-pricing.ts:200-220`; `src/components/greeting-card/customer/order-review.tsx:50-93`; `tt/greeting-card-quote.test.ts`, `tt/greeting-card-payments.test.ts:68` | — |

### Nhóm 4 — Tiếp nhận, quản lý & xử lý đơn hàng (32)

| STT | Chức năng | Trạng thái | Bằng chứng | Còn thiếu |
|---|---|---|---|---|
| 4.1 | Tạo đơn hàng bán lẻ/chuỗi | Hoàn thiện | `src/modules/coordinator/adapters/http-schemas.ts:66-126`; `src/components/orders/create-order-modal.tsx`; `tt/coordinator.test.ts:155,309,327` | — |
| 4.2 | Tự tạo đơn từ form khách trên Thẻ Chào/Link | Hoàn thiện | `api/public/brochure/[sendCode]/order`, `api/public/greeting-catalog/[id]/order`; gắn sale theo phiên; `tt/greeting-card-checkout.test.ts:67-108`, `tt/public-catalog-order.test.ts:32`, `tt/greeting-card-session-owner.test.ts:85` | — |
| 4.3 | Danh sách/chi tiết đơn & lọc nâng cao | Hoàn thiện | `api/greeting-card/orders/route.ts` (trạng thái, thanh toán, tìm kiếm, khoảng ngày giao, chi nhánh, Sale gửi link); `api/orders/route.ts` (trạng thái, chi nhánh, khách, khoảng ngày giao gồm giờ hẹn đơn Điều phối, nhân viên bán); điều kiện dùng chung `src/modules/orders/domain/order-list-filter.ts`, `src/modules/orders/infra/order-list-where.ts`; bộ lọc trên màn `src/components/orders/order-advanced-filters.tsx` (bảng Thẻ Chào Điều hành, tab Tất cả đơn); `tt/order-filters.test.ts` | — |
| 4.4 | 3 hệ thống trạng thái độc lập | Hoàn thiện | `schema:1583-1606,1614-1616`; `order_events` `schema:1721-1736` (trục, từ, đến, người, thời điểm); `tt/coordinator.test.ts:155,479`, `tt/order-isolation.test.ts:163` | — |
| 4.5 | Quản lý khung giờ giao & sức chứa chi nhánh | Hoàn thiện | Địa chỉ 4 tầng bắt buộc `http-schemas.ts:48-55` (`tt/coordinator.test.ts:309`); sức chứa khung giờ `gc/domain/slot-capacity.ts` (`tt/greeting-card-promotion-slot.test.ts:114`); màn "Đơn cần giao" của Shipper: chỉ người nhận, SĐT, địa chỉ, khung giờ, lời thiệp `src/modules/coordinator/use-cases/shipper-runs.ts`, `api/delivery/my-runs`, gắn shipper theo số điện thoại Điều phối ghi khi điều xe (`src/modules/coordinator/domain/shipper-match.ts`), số điện thoại nhân viên `api/members/[id]/phone`; cập nhật giao dùng chung luật ảnh giao bắt buộc `src/modules/coordinator/use-cases/record-delivery-update.ts`; `tt/shipper-view.test.ts` | Shipper thuê ngoài (không có tài khoản) vẫn chỉ ghi tên + SĐT, chưa có link giao riêng |
| 4.6 | Đổi thông tin đơn giữ vết | Hoàn thiện | `schema:2975-2995` (`order_change_requests`: giá trị cũ/mới, lý do); `tt/greeting-card-order-change.test.ts:61,70,105` | — |
| 4.7 | Luồng hủy đơn & hoàn tiền duyệt 2 bước | Hoàn thiện | R6/R10 trần cứng; `tt/greeting-card-cancellation.test.ts:37-124`, `tt/greeting-card-cancellation-follow-up.test.ts:57,82`, `tt/coordinator.test.ts:587` | — |
| 4.8 | Lịch sử thao tác đơn tóm tắt | Hoàn thiện | Tab "Lịch sử đơn hàng" `src/components/greeting-card/brochure-order-detail-modal.tsx:85`; nút sao chép `src/components/greeting-card/evidence-timeline-diagram.tsx:100,145`; `tt/order-isolation.test.ts:163-185` | — |
| 4.9 | In phiếu xưởng (khổ A6) & thiệp/băng rôn | Dang dở | In phiếu thợ `src/components/greeting-card/brochure-florist-job-tab.tsx:162` (ảnh mẫu, tóm tắt hoa, lời thiệp) | Khổ A6; in băng rôn; công thức cắm đầy đủ trên phiếu; test nội dung in |
| 4.10 | Xuất danh sách đơn Excel | Hoàn thiện | `api/orders/export/route.ts` (.xlsx, R13, ghi nhật ký xuất); phạm vi sale và chi nhánh `src/modules/orders/infra/order-export-query.ts`, `src/modules/orders/use-cases/export-orders.ts`; `export-orders.test.ts`, `tt/order-export-scope.test.ts` | — |
| 4.11 | Lịch sử đơn liên quan cùng khách hàng | Hoàn thiện | Tab "Đơn đã đặt" trong chi tiết khách `src/components/crm/customer-orders-tab.tsx` (bấm mở chi tiết đơn); `api/crm/customers/[id]/orders` (Q1 + R1) → `src/modules/orders/use-cases/list-customer-orders.ts`: đơn gắn khách và đơn chưa gắn khách cùng SĐT người đặt (Thẻ Chào, Điều phối), trong phạm vi chi nhánh; `tt/customer-orders.test.ts` | — |
| 4.12 | Bảng điều phối phân cấp mức rủi ro trễ giờ | Hoàn thiện | 4 mức `src/modules/coordinator/domain/coordinator-types.ts:30`; `operation-rules.ts:164-190` (đếm phút còn lại); `src/components/coordinator/control-tower-dashboard.tsx`; `tu/coordinator/operation-rules.test.ts:81-90`, `tt/greeting-card-coordinator-board.test.ts:51,71` | — |
| 4.13 | Phân công thợ cắm & hàng đợi chế tác | Hoàn thiện | Phân công `src/modules/orders/use-cases/assign-florist.ts` (người nhận phải là thành viên đang hoạt động, giao lại thu hồi phân công cũ); "Việc của tôi" sắp theo giờ giao, công thức và ảnh mẫu, không có giá `src/modules/orders/use-cases/florist-queue.ts`, `src/modules/orders/infra/florist-queue-repository.ts`; nhận việc/báo xong `api/orders/[id]/my-work`; bảng việc chi nhánh `api/orders/my-work?scope=team` (R4); `tt/florist-queue.test.ts`, `tt/scoping-gaps-18-09.test.ts:46` | Đơn Thẻ Chào giao thợ bằng ghi chú (`gc/use-cases/update-brochure-order-status.ts:32-39`), chưa vào hàng đợi của tài khoản thợ |
| 4.14 | Theo dõi đơn thiếu thông tin | Hoàn thiện | Dò trường thiếu (địa chỉ, SĐT người nhận, lời chúc khi có thiệp) `src/modules/orders/domain/order-info-gaps.ts`; tự sinh/tự đóng/quá hạn + nhắc `src/modules/orders/use-cases/order-info-requests.ts` trên bảng `order_info_requests`; chạy sau tạo/sửa đơn `api/orders/route.ts`, `api/orders/[id]/route.ts`, `api/coordinator/orders/route.ts`; yêu cầu tay và đóng/huỷ `api/orders/[id]/info-requests`; việc "Thiếu thông tin" trong Hộp việc `gc/use-cases/missing-info-actions.ts`; khối "Thông tin cần bổ sung" trong chi tiết đơn `src/components/orders/order-info-requests.tsx`; `tt/order-info-requests.test.ts` | — |
| 4.15 | Kiểm tra chất lượng QC | Hoàn thiện | `api/coordinator/orders/[id]/qc`; `tt/coordinator.test.ts:281,537`; `tt/subcontract-customer-photo.test.ts:90` | — |
| 4.16 | AI chấm ảnh QC so với mẫu gốc | Hoàn thiện | `gc/use-cases/verify-qc-photo-ai.ts` (qua AI gateway, điểm tin cậy, kết luận, lỗi AI chuyển duyệt tay); `gc/use-cases/verify-qc-photo-ai.test.ts` | — |
| 4.17 | Bàn giao shipper & lên lịch giao lại | Hoàn thiện | Trạng thái giao `schema:1600-1606`; việc giao lại `gc/domain/inbox.ts:244`; `tt/greeting-card-delivery-failure.test.ts:66,85` | — |
| 4.18 | Ảnh xác nhận giao hàng tận tay (POD) bắt buộc | Hoàn thiện | Bắt buộc ở mọi gói, Điều hành tắt được trong Cài đặt `gc/domain/brochure-workflow-policy.ts`; đơn điều phối bắt buộc ảnh `src/modules/coordinator/domain/operation-rules.ts`, `src/modules/coordinator/use-cases/record-delivery-update.ts`; xác nhận không ảnh theo công tắc `api/coordinator/orders/[id]/confirm-delivery/route.ts`; ảnh hiện cho khách `src/components/greeting-card/customer/brochure-tracking-view.tsx`; `tt/greeting-card-coordinator-rules.test.ts`, `tu/coordinator/operation-rules.test.ts` | — |
| 4.19 | Bảng điều phối đối tác ngoài, đếm ngược | Hoàn thiện | `src/app/subcontract/[orderCode]/page.tsx`; `api/public/subcontract/[orderCode]/{upload-qc,submit-shipper,submit-delivery}`; `tt/subcontract-public-link.test.ts:65-103`, `tt/subcontract-claim-race.test.ts:70`, `tt/subcontract-state-integrity.test.ts:78-137` | — |
| 4.20 | Cổng chi nhánh cách ly đơn hàng | Hoàn thiện | R14 `capability-catalog.ts:243`; `tt/branch-portal.test.ts:75,80,93` | — |
| 4.21 | Cấu hình sức chứa tối đa theo khung giờ/lễ | Hoàn thiện | `gc/domain/slot-capacity.ts:1-40`; `tt/greeting-card-promotion-slot.test.ts:114,130`; `tt/greeting-card-holiday.test.ts:68` | — |
| 4.22 | Lập kế hoạch thanh toán cọc/còn lại tự động | Hoàn thiện | `gc/domain/payment-plan.ts:1-53` (% cọc mặc định, chính sách theo ngày giao, mã thanh toán có ngưỡng giá trị đơn); `tt/greeting-card-payment-codes.test.ts:65-117`; `gc/domain/__tests__/payment-plan.test.ts`, `payment-schedule.test.ts` | Đơn lớn áp chính sách qua mã thanh toán, không tự động theo giá trị |
| 4.23 | Mã VietQR động | Hoàn thiện | `gc/adapters/vietqr-helper.ts:25-26` (số tiền + mã đơn); `tt/greeting-card-payments.test.ts:68`, `tt/greeting-card-promotion-slot.test.ts:81` | — |
| 4.24 | Tải ảnh biên lai chuyển khoản & AI gợi ý | Hoàn thiện | `api/public/brochure/[sendCode]/payment-proof`; `gc/use-cases/process-payment-proof-job.ts`; `gc/use-cases/__tests__/process-payment-proof-job.test.ts`, `confirm-brochure-payment.test.ts`, `reject-reported-payment.test.ts` | Vai Kế toán chưa có (xem 1.12) |
| 4.25 | Điều hành "Xác nhận tiền về" mở đơn cắm | Hoàn thiện | `api/greeting-card/orders/[id]/confirm-deposit` (R11); `tt/greeting-card-transfer-confirm.test.ts:52,67`; `tt/greeting-card-payments.test.ts:68` | — |
| 4.26 | Thu phần tiền còn lại | Hoàn thiện | Thu nốt `api/greeting-card/orders/[id]/confirm-balance`; giao xong còn nợ ở trạng thái chờ thu đủ, chỉ hoàn tất khi thu đủ `gc/domain/order-settlement.ts`, `gc/infra/order-settlement.ts`, áp ở `gc/use-cases/update-brochure-order-status.ts` và hai route giao hàng chuỗi; đóng đơn điều phối còn nợ bị chặn `src/modules/coordinator/domain/operation-rules.ts`; `tt/greeting-card-coordinator-rules.test.ts`, `tt/coordinator.test.ts` | — |
| 4.27 | Ghi nhận hoàn tiền khi hủy đơn | Hoàn thiện | R10 trần cứng; `tt/greeting-card-cancellation.test.ts:53,124`, `tt/coordinator.test.ts:676` | — |
| 4.28 | Đối soát tự động ngân hàng | Hoàn thiện | `api/public/payments/sepay/route.ts:18-33` → `gc/use-cases/payment-webhook.ts`; `tt/greeting-card-bank-sync.test.ts:52-103`, `tt/order-standard-payments.test.ts:43` | — |
| 4.29 | Tự động cập nhật trang theo dõi của khách | Hoàn thiện | `src/components/greeting-card/customer/brochure-tracking-view.tsx:100` (làm mới 15 giây); `tt/greeting-card-tracking-views.test.ts:68-130` | — |
| 4.30 | Cấu hình kênh báo tin nhân viên | Hoàn thiện | `gc/use-cases/notify-staff.ts`; sự kiện và kênh `gc/domain/staff-notification-types.ts:7-20,50-56`; `gc/use-cases/background-sweep.ts:167`; `gc/use-cases/__tests__/notify-staff.test.ts:6,53,91`, `tt/telegram-linked-chats.test.ts` | — |
| 4.31 | Tự động gửi Zalo ZNS / SMS cho khách | Hoàn thiện | `gc/adapters/zalo-zns-adapter.ts`, `gc/adapters/esms-adapter.ts`; `gc/domain/customer-notifications.ts:5`; `tt/greeting-card-notifications.test.ts:55,90,107` | — |
| 4.32 | Tự động nhắc lịch giao trước 60 & 30 phút | Hoàn thiện | `src/modules/coordinator/domain/dispatch-reminder-types.ts:31-58`; `src/modules/coordinator/domain/__tests__/dispatch-reminder.test.ts`, `gc/use-cases/__tests__/process-dispatch-reminders.test.ts`, `tt/coordinator-reminders-isolation.test.ts:35,53` | Mặc định 120 và 60 phút; chỉnh được về 60 và 30 phút (R12) |

### Nhóm 5 — Thẻ Chào mẫu hoa & trang khách hàng (15)

| STT | Chức năng | Trạng thái | Bằng chứng | Còn thiếu |
|---|---|---|---|---|
| 5.1 | Tạo bộ mẫu Thẻ Chào theo chủ đề/dịp | Hoàn thiện | `schema:3101-3122`; `api/greeting-card/catalogs`; `tt/greeting-card.test.ts:33`, `tt/greeting-catalog-products-events.test.ts:52-80` | — |
| 5.2 | Chia sẻ link rút gọn gắn mã nhân viên bán | Hoàn thiện | `tt/greeting-card-share-links.test.ts:59,98,113`; `gc/domain/sales-funnel.ts` | — |
| 5.3 | Cấu hình thời hạn & thu hồi link Thẻ Chào | Hoàn thiện | `tt/greeting-card-link-lifetime.test.ts:48,55,66,84`; `api/store-share-link/revoke` | — |
| 5.4 | Tự tạo mã QR & ảnh ghép 3-4 mẫu | Dang dở | `gc/use-cases/catalog-collage.ts:10` (tối đa 3 ảnh); `api/greeting-card/catalogs/[id]/collage`; `gc/use-cases/__tests__/catalog-collage.test.ts` | Ảnh ghép 4 mẫu; mã QR trong ảnh ghép |
| 5.5 | Công tắc cấu hình ẩn/hiện giá & thành phần | Dang dở | `gc/domain/display-fields.ts:8,12`; `api/greeting-card/display-settings/route.ts`; `tu/greeting-card/display-fields.test.ts` | Tắt hiển thị giá (giá là trường bắt buộc); công tắc thông tin giảm giá |
| 5.6 | Bảng bán hàng realtime theo dõi hành vi khách | Hoàn thiện | `gc/domain/sales-funnel.ts:1-30`; `src/components/greeting-card/tracking/views/kanban-view.tsx:28` (làm mới 30 giây); `tu/greeting-card/sale-kanban.test.ts`, `tt/greeting-card-scope.test.ts:101` | — |
| 5.7 | Màn hình "Hộp thư việc hôm nay" ưu tiên | Hoàn thiện | `gc/domain/inbox.ts:15-312`; `src/components/greeting-card/inbox/inbox-panel.tsx`; `tt/greeting-card-coordinator-rules.test.ts:111`, `tu/greeting-card/single-store-vs-chain-workflow.test.ts:280` | — |
| 5.8 | Cấu hình phân quyền xem đơn Sale | Hoàn thiện | `api/greeting-card/sale-visibility/route.ts:15-24`; `tt/greeting-card-scope.test.ts:78-101`, `tt/greeting-card-sale-scope-actions.test.ts:58,67` | — |
| 5.9 | Khách xem mẫu hoa (vuốt, thả tim) | Dang dở | Mẫu vuốt `src/components/greeting-card/customer/templates/swipe-brochure-engine.tsx:79-82` (lọc giá); thả tim `tt/greeting-catalog-hearts.test.ts:42,62`; `tests/e2e/brochure-swipe.spec.ts` | Lọc theo màu trong mẫu vuốt (chỉ có ở mẫu bảng màu riêng) |
| 5.10 | Đặt hoa trực tiếp từ Thẻ Chào | Hoàn thiện | `src/components/greeting-card/customer/variant-step-picker.tsx`, `brochure-order-form.tsx`; `tt/greeting-card-checkout.test.ts:67`, `tt/greeting-card-order-policies.test.ts:64-83` | — |
| 5.11 | Nút "Nhắn tư vấn mẫu này" gắn mã sản phẩm | Hoàn thiện | `gc/domain/collection-browse.ts:69-72`; `gc/use-cases/submit-product-inquiry.test.ts` | — |
| 5.12 | Trang khách xem tiến độ cắm & ảnh thành phẩm | Hoàn thiện | `gc/use-cases/get-brochure-tracking.ts:143-170` (không trả ghi chú nội bộ/giá vốn, che thông tin khi chưa xác minh); `tt/greeting-card-hardening.test.ts` | — |
| 5.13 | Khách duyệt ảnh QC thành phẩm trong 10 phút | Hoàn thiện | `gc/domain/balance-collection.ts:13,44`; `tt/greeting-card-coordinator-rules.test.ts:99`, `tt/subcontract-customer-photo.test.ts:102,120` | — |
| 5.14 | Đề xuất thay loại hoa thiếu qua link duyệt | Dang dở | `gc/use-cases/substitute.ts:42-77` (đổi cả mẫu sang mẫu khác cùng bộ sưu tập, kèm lý do); `tt/greeting-card-substitute.test.ts:65,78,104` | Thay một loại hoa phụ kèm ảnh hoa thay thế do tiệm chụp |
| 5.15 | Màn hình cảm ơn, mã giảm giá & đặt lại đơn | Dang dở | `src/components/greeting-card/customer/customer-thank-you-card.tsx`; đặt thêm đơn `tt/greeting-card-reorder-photos.test.ts:89` | Tặng mã giảm giá cho đơn kế tiếp; test màn cảm ơn |

### Nhóm 6 — Báo cáo hoạt động & tài chính (9)

| STT | Chức năng | Trạng thái | Bằng chứng | Còn thiếu |
|---|---|---|---|---|
| 6.1 | Báo cáo tổng hợp đơn hàng & tỷ lệ hủy/trễ | Dang dở | `src/modules/orders/domain/business-reporting.ts:40-105`; `src/app/(app)/so-lieu/page.tsx:73`; `business-reporting.test.ts:53-83` | Chọn kỳ thời gian; tỷ lệ đơn trễ; trang chỉ tính trên tối đa 100 đơn gần nhất |
| 6.2 | Báo cáo doanh thu thực thu vs dự kiến | Dang dở | Tổng doanh thu `business-reporting.ts:22`; số còn phải thu `gc/domain/tracking-views.ts:237` | Báo cáo tách thực thu/dự kiến; bấm số liệu xem danh sách đơn |
| 6.3 | Báo cáo sản phẩm bán chạy & tông màu ưa thích | Dang dở | Xếp hạng theo số đơn và doanh thu `business-reporting.ts:18-22`; mẫu nhiều tim `gc/domain/catalog-channel.ts:14` | Thống kê màu sắc, phong cách |
| 6.4 | Báo cáo phễu chuyển đổi Thẻ Chào & Sale | Hoàn thiện | `api/greeting-card/stats/route.ts` (theo sale); `gc/use-cases/catalog-channel-events.ts:31` (theo kênh và từng bộ sưu tập); `tt/greeting-card-scope.test.ts:101`, `gc/domain/__tests__/link-expiry-and-funnel.test.ts` | — |
| 6.5 | Báo cáo hiệu suất (Sale/Thợ/Shipper) | Dang dở | Doanh số theo Sale `gc/domain/sales-funnel.ts` (`revenueVnd`) | Sản lượng theo thợ; tỷ lệ giao đúng giờ theo shipper |
| 6.6 | Báo cáo đối chiếu thu tiền: sổ thu vs ngân hàng | Dang dở | `schema:2916-2918` (`payment_method`); `src/components/greeting-card/admin/unmatched-payments-panel.tsx`; sheet "Sổ thu tiền" trong file xuất | Báo cáo dòng tiền theo hình thức thu đối chiếu sao kê |
| 6.7 | Báo cáo truy vết lịch sử đơn giải quyết khiếu nại | Hoàn thiện | `src/components/greeting-card/evidence-timeline-diagram.tsx:100-145`; `tt/greeting-card-tracking-views.test.ts:68,96` | — |
| 6.8 | Xuất báo cáo tài chính ra Excel (.xlsx) | Hoàn thiện | `src/modules/orders/use-cases/export-orders.ts:83-238` (4 sheet: Đơn hàng, Chi tiết SP, Sổ thu tiền, Thẻ Chào); `export-orders.test.ts:29,108`; `tu/architecture/export-audit.test.ts`, `export-capability.test.ts` | — |
| 6.9 | Báo cáo tiêu thụ hạn mức AI theo kỳ | Dang dở | `api/usage/summary/route.ts` (G8) → `src/modules/usage/use-cases/get-usage-summary.ts`, `src/modules/usage/infra/usage-repository.ts:108-121` | Lọc theo kỳ (đang tính toàn thời gian); so với gói đã đăng ký; test |

### Nhóm 7 — AI phân tích, nội dung & marketing (3)

| STT | Chức năng | Trạng thái | Bằng chứng | Còn thiếu |
|---|---|---|---|---|
| 7.1 | AI nhận diện ảnh mẫu (loại hoa, cành, màu) | Hoàn thiện | `api/vision/analyses` (sửa trước khi duyệt, duyệt tạo sản phẩm); `src/modules/usage/domain/pricing.ts:32` (1 credit); `tt/vision-analyses.test.ts:64-230` | — |
| 7.2 | Bộ nội dung marketing tự động từ 1 ảnh | Dang dở | Phân tích ảnh → thẻ sản phẩm (`tt/vision-analyses.test.ts:170`); nội dung bán hàng `src/modules/product-copies/domain/product-copy-rules.ts:28-59`; thẻ A6 chỉ trong thư viện mẫu `src/app/(app)/kho-templates` | Luồng tự động một bước từ 1 ảnh; đề xuất giá vốn; bài viết Facebook/Zalo; đóng gói Thẻ Chào A6 |
| 7.3 | Màn hình kiểm tra sẵn sàng sản phẩm ra thị trường | Dang dở | `src/modules/products/domain/product-readiness.ts:55-90` (ảnh, danh mục, giá/BOM); `product-readiness.test.ts` | Tiêu chí bài viết; chặn đưa ra bán khi chưa đủ (API sản phẩm không gọi kiểm tra này) |

### Nhóm 8 — Landing page bán hàng (1)

| STT | Chức năng | Trạng thái | Bằng chứng | Còn thiếu |
|---|---|---|---|---|
| 8.1 | Trình dựng Landing Page bộ sưu tập / sự kiện | Hoàn thiện | `src/components/catalog/landing-campaign-tab.tsx:113,197-210` (AI sinh nội dung, xuất bản `/c/[slug]`); `src/app/c/[slug]/page.tsx:11-27` + `opengraph-image.tsx` (SEO); `api/public/catalog/[slug]/order`; `tt/catalog-links.test.ts`, `tt/public-catalog-order.test.ts:32`, `src/modules/landing-page/domain/landing-rules.test.ts` | — |

### Nhóm 9 — Chat nội bộ, đa chuỗi & phân quyền nâng cao (14)

| STT | Chức năng | Trạng thái | Bằng chứng | Còn thiếu |
|---|---|---|---|---|
| 9.1 | Trao đổi / chat nội bộ trên từng đơn | Hoàn thiện | `api/greeting-card/messages` (+ `/read`); `api/internal-chat`; `schema:3435` (`last_read_at`); không có API xoá tin; `tt/greeting-card-messages.test.ts:64,90,101`, `tt/internal-chat-isolation.test.ts:48-79` | Thợ cắm chưa có vai tài khoản (xem 1.12) |
| 9.2 | Hồ sơ thương hiệu | Hoàn thiện | `schema:772-795`; AI đọc `src/modules/product-copies/adapters/product-copy-adapter.ts:23,99`, `src/modules/content-engine/infra/read-shop-context.ts:63`; `tt/cach-ly-endpoint.test.ts:157` | — |
| 9.3 | Hồ sơ kinh doanh | Dang dở | `schema:744-763` (tên pháp lý, SĐT, địa chỉ, mô tả); `read-shop-context.ts:55-70` | Trường thông điệp, khách mục tiêu |
| 9.4 | Thư viện tài nguyên & thùng rác 30 ngày | Hoàn thiện | `src/modules/storage/domain/trash-types.ts:29`; `api/storage/trash/[id]/restore`; `tt/storage-trash.test.ts:51-68`, `tt/storage-lifecycle.test.ts:45-63` | — |
| 9.5 | Quản lý kết nối Webhook/API key | Hoàn thiện | `api/integration-tokens` (cấp, thu hồi, `[id]/rotate`), F9 trần cứng; `tt/integration.test.ts:78`, `src/modules/integration/use-cases/__tests__/integration-use-cases.test.ts:120` | — |
| 9.6 | Quản lý tác vụ nền & chạy lại tác vụ lỗi | Hoàn thiện | `api/jobs/[id]/{cancel,retry,events}`; `src/modules/jobs/use-cases/scan-stuck-jobs.ts`; `tt/job-retry-backoff.test.ts:35,45`, `tp/dead-letter-jobs.test.ts:45,60` | — |
| 9.7 | Cấu hình chính sách & trần chi phí AI tháng | Dang dở | `schema:1202-1218` (`allowed_models`, `cost_ceiling` mỗi lượt, `privacy_floor`); lọc nội dung `api/content-guard/validate`; `tt/ai-policy.test.ts:41-125` | Trần chi phí AI theo tháng |
| 9.8 | Console quản trị nền tảng đa cửa hàng | Dang dở | `src/app/(platform)/van-hanh/to-chuc`, `suc-khoe`; `api/platform/health`; `tp/system-health-queue.test.ts:47` | Doanh thu thuê bao |
| 9.9 | Luồng thẩm định & duyệt đăng ký tổ chức mới | Hoàn thiện | `org/use-cases/sign-up.ts`; `api/platform/registrations/[userId]/decision`; `tp/registration-approval.test.ts:47-77`, `tt/registration-approval.test.ts:30-59` | — |
| 9.10 | Khởi tạo tổ chức & khởi tạo gói dịch vụ | Chưa hoàn thành | `api/platform/organizations/route.ts` chỉ có GET; `organizations.credit_plan` không có chỗ ghi trong ứng dụng (`src/core/entitlements/entitlement-service.ts:130` chỉ đọc) | Toàn bộ chức năng |
| 9.11 | Duyệt 2 bước cho thao tác nhạy cảm | Hoàn thiện | Phiếu duyệt: đổi thông tin/giá mẫu (2.7), huỷ đơn (4.7), giảm giá (3.7); giá dưới sàn chỉ có hiệu lực khi Điều hành duyệt/lập `src/modules/costing/use-cases/price-floor-guard.ts`; ghi thu chờ xác nhận (1.16); `tt/below-floor.test.ts`, `tt/payment-confirmation.test.ts`, `tt/product-governance.test.ts` | — |
| 9.12 | Cơ chế chặn tự nâng quyền chính mình | Hoàn thiện | Tự duyệt mặc định tắt `org/domain/self-approval-policy.ts`; chốt chung `org/use-cases/assert-not-self-approval.ts` ở giảm giá, huỷ đơn, đề xuất sửa mẫu, giao trước thu sau, xác nhận sổ thu; không tự đổi vai (1.11), không thao tác trên tài khoản của mình `org/use-cases/staff-accounts.ts`; vai tuỳ chỉnh không vượt trần cứng (1.13); `tt/self-approval.test.ts`, `tt/member-role-change.test.ts` | — |
| 9.13 | Cách ly phân quyền dữ liệu theo chi nhánh | Hoàn thiện | `src/core/tenancy/branch-scope.ts` (nhân viên gắn chi nhánh, không có F7); áp ở đơn đa nguồn, bảng việc, hàng đợi điều phối, xuất Excel, đơn điều phối, danh sách/bảng/phễu Thẻ Chào, sản phẩm và tồn kho; đơn mới mang chi nhánh người tạo, đơn Thẻ Chào mang chi nhánh Sale `gc/infra/sale-branch.ts`; chi nhánh gia công thấy đơn của mình (R14); `tt/branch-scope.test.ts`, `tt/branch-portal.test.ts` | — |
| 9.14 | Đăng nhập 1 lần (SSO 15 phút) | Hoàn thiện | `src/modules/sso/domain/sso-claims.ts:31`; `tt/integration-sso.test.ts:50-106` | — |

### Nhóm 10 — Quản lý credit AI, hạn mức & thuê bao SaaS (8)

| STT | Chức năng | Trạng thái | Bằng chứng | Còn thiếu |
|---|---|---|---|---|
| 10.1 | Xem số dư credit AI & lịch sử tiêu thụ | Hoàn thiện | `src/modules/usage/domain/pricing.ts:31-80` (ảnh 1, tối ưu 2, video 5); `api/usage`, `api/usage/summary`; `src/app/(app)/muc-dung/page.tsx:57,142`; `tt/retry-recharge-credit.test.ts:50-79` | — |
| 10.2 | Hoàn 100% credit AI khi tác vụ bị lỗi | Hoàn thiện | `src/modules/usage/domain/refund-policy.ts`; `src/modules/usage/use-cases/refund-job.ts:80`; `refund-policy.test.ts:13-18`, `tt/partial-refund.test.ts:83,143` | — |
| 10.3 | Thiết lập hạn mức dịch vụ (trần AI, SMS, Zalo) | Chưa hoàn thành | `src/modules/usage/domain/quota.ts:1-17` chỉ trừ credit; AI dừng khi hết credit (`tt/retry-recharge-credit.test.ts:79`) | Hạn mức tháng cho AI, SMS, Zalo và thông báo khi chạm hạn mức |
| 10.4 | Ghi nhận chi phí thật (USD/VND) đo lợi nhuận | Dang dở | `src/core/ai/gateway.ts:214-225` ghi `cost_usd`; `src/modules/ai-governance/use-cases/list-ai-requests.ts:95-116` | Quy đổi VND; chi phí SMS/ZNS; so với credit đã thu và lợi nhuận nền tảng |
| 10.5 | Cảnh báo khi credit AI còn dưới 20% | Chưa hoàn thành | Không sự kiện nào về credit trong `src/modules/notification/domain/events` | Toàn bộ chức năng |
| 10.6 | Admin nạp / hoàn / tặng credit khuyến mãi | Dang dở | Nạp qua script `scripts/nap-credit.ts:86` → `org/infra/organization-repository.ts:117-130` | Màn hình Console nạp, hoàn, tặng credit (`src/components/platform/vietqr-topup-modal.tsx` không gọi API) |
| 10.7 | Quản lý & thu phí thuê bao SaaS | Dang dở | Gói định nghĩa tĩnh `src/modules/platform/domain/vietqr-billing.ts:31-64`; quyền theo gói `src/core/entitlements/entitlement-service.ts:9-130`; `vietqr-billing.test.ts`, `entitlement-service.test.ts` | Gán gói cho tổ chức, theo dõi kỳ gia hạn tháng/năm, thu phí |
| 10.8 | Cấu hình trỏ tên miền riêng (Custom Domain) | Chưa hoàn thành | Không có mã xử lý tên miền riêng (`src/proxy.ts` không đọc host) | Toàn bộ chức năng |

## 4. Kết quả chạy test

Các test được dẫn làm bằng chứng ở mục 3 đều thuộc các bộ test dưới đây. Mã nguồn được kiểm tra trùng với `main` tại `07f3a088`.

| Bộ test | Lệnh | Nơi chạy | Kết quả |
|---|---|---|---|
| Unit | `npm test` | Máy kiểm tra, Postgres 16 cục bộ | 640/640 file, 3894/3894 test đạt |
| Unit, cách ly tổ chức, cách ly nền tảng, typecheck, lint, build | job `web` (`npm test`, `npm run test:tenant`, `npm run test:platform`, `npm run build`) | GitHub Actions, commit `efa4166c` | Đạt |
| Worker Python | job `worker` | GitHub Actions | Đạt |
| E2E giao diện | job `e2e-ux` | GitHub Actions | Đạt |
| Bảo mật | job `security`, CodeQL (`analyze`) | GitHub Actions | Đạt |

Không có test nào bị bỏ qua hay tắt để có kết quả trên.
