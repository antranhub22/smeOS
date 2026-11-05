# Kế hoạch hoàn thiện 54 chức năng bàn giao ALG

Căn cứ: `docs/handover/BAO_CAO_ANH_XA_123_CHUC_NANG.md` (mã nguồn tại `07f3a088`). 54 chức năng cần hoàn thiện gồm 48 chức năng dang dở và 6 chức năng chưa hoàn thành. Kế hoạch này xác định việc cần làm cho từng chức năng, thứ tự thực hiện, các điểm PO chốt trước khi thi công, tiêu chí nghiệm thu và cách cập nhật báo cáo ánh xạ.

## 1. Nguyên tắc thực hiện

1. Mỗi chức năng là một đơn vị giao nộp: một nhánh, một PR, gồm mã + test + tài liệu trong cùng commit (Conventional Commits). Chức năng có thay đổi lược đồ kèm migration `prisma migrate dev`.
2. Một chức năng chỉ chuyển sang **Hoàn thiện** khi đạt đủ: chạy từ giao diện đến dữ liệu, đáp ứng mọi ý trong cột mô tả của checklist, có `requireCapability` và cách ly tổ chức (404 chéo tổ chức), có test tự động cho hành vi cốt lõi, CI xanh.
3. Cổng bắt buộc theo `CLAUDE.md`: `npm run typecheck && npm run lint:ratchet`, `npm run lint:ux -- --check` (khi sửa `.tsx`), `npm test`, `npm run test:tenant`, `npm run test:platform`, `npm run check:docs`, `npm run build`, `npm run test:e2e:ux` (màn hình mới). Không thêm lỗi mới so với `main`.
4. Route mới gác bằng mã năng lực; mã năng lực mới khai trong `src/core/rbac/capability-catalog.ts` kèm vai mặc định và trần cứng.
5. Mọi lời gọi AI đi qua `callCapability` (`src/core/ai/gateway.ts`); không gọi trực tiếp nhà cung cấp.
6. Giao diện dùng tiếng Việt tự nhiên, token ngữ nghĩa, không hiện mã kỹ thuật; tuân thủ `docs/design-system/README.md` và Progressive Disclosure.
7. Tệp mới ≤ 350 dòng; tệp đang vượt ngưỡng không được phình thêm.
8. Sau khi PR merge, cập nhật dòng tương ứng trong báo cáo ánh xạ (trạng thái, bằng chứng `file:dòng`, test).

## 2. Điểm PO chốt trước khi thi công

| Mã | Nội dung cần chốt | Chức năng chịu ảnh hưởng | Thời điểm cần chốt | Quyết định |
|---|---|---|---|---|
| Q1 | Mở khoá Thẻ Chào (`tests/unit/architecture/the-chao-freeze.test.ts`) cho từng PR được liệt kê; mốc băm cập nhật sau khi PO duyệt PR | 2.8, 3.1, 3.4, 3.6, 4.3, 4.9, 4.14, 4.18, 4.26, 5.4, 5.5, 5.9, 5.14, 5.15, 9.11 | Trước Đợt 1 | Mở khoá |
| Q2 | Thay đổi lược đồ CSDL theo danh sách mục 6 | 1.4, 2.3, 3.8, 3.10, 9.3, 10.3, 10.4, 10.6, 10.7, 10.8, 1.18 | Trước đợt chứa chức năng | Đã duyệt `users.must_change_password`, `order_payments.status` (1.4, 1.16), giá trị `PAUSED` cho `product_status` (2.3), lược đồ 3.8, 3.10, `field_definitions.owner_organization_id` (1.9), và các bảng Đợt 4: `subscriptions`, `subscription_invoices`, `credit_transactions`, `usage_limits`, `provider_cost_entries` |
| Q3 | Quyền thu tiền R9: (a) trần cứng Điều hành, hoặc (b) Sale/Điều phối chỉ "ghi nhận chờ xác nhận", Điều hành xác nhận mới vào sổ thu | 1.16 | Trước Đợt 1 | Phương án (b): Sale/Điều phối ghi nhận chờ xác nhận, Điều hành xác nhận mới vào sổ thu |
| Q4 | Tắt mặc định công tắc tự duyệt (`cho_phep_tu_duyet = false`) | 9.12 | Trước Đợt 1 | Tắt mặc định |
| Q5 | Ảnh giao hàng bắt buộc ở mọi gói chính sách | 4.18 | Trước Đợt 1 | Bắt buộc mặc định; Điều hành cửa hàng được tắt yêu cầu ảnh giao trong Cài đặt |
| Q6 | Vòng đời đơn: giao xong còn nợ ở trạng thái "Đã giao — chờ thu đủ", chỉ "Hoàn tất" khi số dư bằng 0 | 4.26 | Trước Đợt 1 | Áp dụng |
| Q7 | Bộ quyền mặc định cho ba vai mới: Thợ cắm hoa, Shipper, Kế toán | 1.12, 4.5, 4.13, 6.5, 6.6 | Trước Đợt 2 | Thợ cắm hoa: chỉ việc được giao, công thức, ảnh mẫu, báo xong, tải ảnh thành phẩm · Shipper: chỉ đơn được giao, thông tin người nhận (không giá), cập nhật giao, ảnh giao · Kế toán: xem đơn, sổ thu, đối soát, xuất Excel, báo cáo, mức dùng; không xác nhận tiền |
| Q8 | Danh sách 6 kiểu dáng, đơn giá phí cắm từng kiểu, hệ số ngày lễ mặc định, cách hiện phí cắm trên báo giá | 3.6 | Trước Đợt 3 | 6 kiểu dáng, đơn giá mặc định (cửa hàng sửa được): bó hoa cầm tay 80.000đ, hộp hoa 120.000đ, giỏ hoa 150.000đ, bình hoa 180.000đ, lẵng/kệ khai trương 300.000đ, hoa sự kiện/cưới 500.000đ · hệ số ngày lễ ×1,5 (cửa hàng sửa được) · phí cắm gộp vào giá mẫu khách thấy, tách riêng trong sổ nội bộ; giá niêm yết đã gồm phí cắm — ngày lễ cộng phần chênh phí cắm × (hệ số − 1); mẫu chưa gắn kiểu dáng giữ nguyên giá · lược đồ 3.8 (`quotations.shipping_fee`, `quotation_items.variant_label`) và 3.10 (`quotation_revisions`) đã duyệt |
| Q9 | Gói thuê bao: giá theo năm, chu kỳ gia hạn, kênh thu phí (VietQR + đối soát SePay), xử lý quá hạn | 10.7, 9.8, 9.10 | Trước Đợt 4 | Chu kỳ tháng và năm; hết kỳ chưa thanh toán thì chuyển ngay sang chỉ xem dữ liệu (không ân hạn), thanh toán xong mở lại; hoá đơn VietQR, SePay tự đối soát theo mã hoá đơn trong nội dung chuyển khoản, Console xác nhận tay khoản lệch; giá từng gói nhập ở Console, lưu theo từng thuê bao; khoá API SePay cấp qua biến môi trường, chưa có khoá thì tắt đối soát tự động |
| Q10 | Đơn vị hạn mức tháng cho AI (credit), SMS (tin), Zalo ZNS (tin) và giá vốn tham chiếu | 10.3, 10.4 | Trước Đợt 4 | Mọi dịch vụ quy đổi về credit, một số dư chung; tỷ lệ 1 tin SMS / 1 tin ZNS ra credit lưu ở Console; credit tặng theo gói hết hạn cuối tháng, credit cửa hàng tự nạp giữ lại; báo Điều hành ở 80% hạn mức, dừng ở 100%; giá vốn tham chiếu (tỷ giá USD→VND, giá mỗi tin) nhập ở Console |
| Q11 | Hạ tầng tên miền riêng: dịch vụ cấp chứng chỉ và cách thêm tên miền trên Render (thay đổi `render.yaml` hoặc API Render) | 10.8 | Trước Đợt 4 | Hoãn 10.8 sang đợt sau |
| Q12 | Các chặng của hành trình 14 chặng được chạy khi người dùng tải ảnh | 5.14, 7.2 | Trước Đợt 6 | 5.14: chặng 01 Tải ảnh, 02 Nhận diện, 09 Chủ shop duyệt — không sinh nội dung, không trừ credit · 7.2: chặng 01, 02, 06 (nội dung và ảnh), 08 Kiểm tra, 09 Duyệt, 10 Đăng; bỏ 03–05 và 11–14 |
| Q13 | Phạm vi và lộ trình Row Level Security (bảng nào, chế độ `FORCE`, ngân sách hiệu năng) | 1.18 | Trước Đợt 7 | Bật RLS theo đợt: trước tiên orders, order_payments, customers, quotations, credit_transactions, sau đó các bảng có `organization_id` còn lại; chế độ `FORCE`; worker và nền tảng dùng vai CSDL riêng; mỗi truy vấn không chậm thêm quá 10% đo trên bộ test tenant |

## 3. Lộ trình

| Đợt | Mục tiêu | Chức năng | Công (ngày) | Phụ thuộc |
|---|---|---|---:|---|
| 1 | An toàn, phân quyền, toàn vẹn tài chính | 1.4, 1.7, 1.11, 1.15, 1.16, 1.17, 3.4, 4.10, 4.18, 4.26, 9.11, 9.12, 9.13 | 22 | Q1–Q6 |
| 2 | Vai trò và vận hành đơn | 1.12, 2.1, 2.3, 2.4, 2.8, 4.3, 4.5, 4.9, 4.11, 4.13, 4.14 | 28,5 | Đợt 1, Q7 |
| 3 | Giá và báo giá | 1.9, 3.1, 3.6, 3.8, 3.10, 3.11 | 15,5 | Đợt 1 (3.4), Q8 |
| 4 | Thương mại SaaS, credit, hạn mức | 9.7, 9.8, 9.10, 10.3, 10.4, 10.5, 10.6, 10.7, 10.8 | 30,5 | Q9–Q11 |
| 5 | Báo cáo | 6.1, 6.2, 6.3, 6.5, 6.6, 6.9 | 12,5 | Đợt 2 (vai mới), Đợt 4 (6.9) |
| 6 | Thẻ Chào, marketing, AI | 5.4, 5.5, 5.9, 5.14, 5.15, 7.2, 7.3, 9.3 | 16 | Q12 |
| 7 | Cách ly dữ liệu tầng CSDL | 1.18 | 10 | Q13, mọi đợt trước |
| | **Tổng** | **54** | **135** | |

Công tính theo ngày công kỹ sư, gồm viết test và tài liệu, chưa gồm thời gian PO nghiệm thu. Đợt 3 và Đợt 4 chạy song song được với Đợt 2 khi có hai nhóm. Đợt 5 bắt đầu sau khi vai Thợ/Shipper/Kế toán (1.12) đã vào `main`.

## 4. Chi tiết từng chức năng

Ký hiệu: `org/` = `src/modules/organization/`, `gc/` = `src/modules/greeting-card/`, `api/` = `src/app/api/v1/`, `tt/` = `tests/tenant/`, `tp/` = `tests/platform/`. Cột **Khoá**: TC = vùng mã Thẻ Chào bị khoá (Q1); DB = có thay đổi lược đồ (Q2).

### Đợt 1 — An toàn, phân quyền, toàn vẹn tài chính

| STT | Việc cần làm | Khu vực mã | Khoá | Nghiệm thu và test | Công |
|---|---|---|---|---|---:|
| 1.4 | Thêm cờ `must_change_password` cho `users`; bật khi tạo tài khoản bằng mật khẩu tạm và khi đặt lại mật khẩu, tắt khi tự đổi. `requireTenantContext` trả `PASSWORD_CHANGE_REQUIRED` cho mọi API trừ đổi mật khẩu, `auth/me`, đăng xuất; layout `(app)` mở bắt buộc hộp đổi mật khẩu | `prisma/schema.prisma`, `org/use-cases/staff-accounts.ts`, `org/use-cases/resolve-session.ts`, `src/components/layout/change-password-dialog.tsx` | DB | `tt/staff-accounts.test.ts`: tài khoản mật khẩu tạm gọi API nghiệp vụ → 403 `PASSWORD_CHANGE_REQUIRED`; đổi xong → 200; e2e đăng nhập lần đầu | 2 |
| 1.7 | Bổ sung test API và cách ly cho dịp tặng hoa; thêm ẩn/hiện dịp (`is_active`) trên form | `api/occasions`, `src/components/organization/occasions-settings-form.tsx` | — | `tt/occasions-isolation.test.ts`: tạo/sửa/đọc; tổ chức khác → 404; thiếu F2 → 403 | 0,5 |
| 1.11 | Ghi nhật ký khi đổi vai; chặn đổi vai của chính mình; test | `org/use-cases/change-member-role.ts`, `api/members/[id]/role/route.ts` | — | `tt/staff-accounts.test.ts`: đổi vai có dòng `audit_logs`, quyền mới hiệu lực ở yêu cầu kế tiếp, tự đổi → 422, tổ chức khác → 404 | 1 |
| 1.15 | `requireCapability` đính `organizationId`/`userId` vào lỗi; `handle()` ghi `audit_logs` hành động `security.access_denied` (đường dẫn, mã năng lực, IP, thiết bị), giới hạn tần suất ghi theo người dùng | `src/core/rbac/capabilities.ts`, `src/core/http/response.ts`, `src/modules/audit` | — | Test unit `response.test.ts`; `tt/security-denied-log.test.ts`: Sale gọi API Điều hành → 403 và có đúng một dòng nhật ký | 1,5 |
| 1.16 | Áp phương án Q3 cho R9; rà soát mọi mã liên quan tiền (thu, hoàn, giảm dưới sàn, xác nhận chuyển khoản) đều trần cứng Điều hành | `src/core/rbac/capability-catalog.ts`, `src/modules/orders/use-cases/confirm-order-payment.ts`, `src/modules/coordinator/use-cases/record-payment.ts` | TC (mã Thẻ Chào dùng chung) | `src/core/rbac/capability-catalog.test.ts` khẳng định danh sách mã tiền đều có trần cứng; `tt/order-standard-payments.test.ts`, `tt/coordinator.test.ts` theo phương án đã chốt | 1 |
| 1.17 | Mở rộng ngữ cảnh yêu cầu (`runWithRequestId`) mang IP và thiết bị; `recordAuditLog` tự điền. Ghi nhật ký mọi thao tác ghi (POST/PUT/PATCH/DELETE) qua `handle()`. API `audit-logs` lọc phía máy chủ theo người, hành động, đối tượng, khoảng ngày; giao diện lọc tương ứng | `src/core/observability`, `src/modules/audit`, `api/audit-logs/route.ts`, `src/app/(app)/audit/page.tsx` | — | `tt/audit-logs.test.ts`: thao tác ghi bất kỳ sinh dòng có IP/thiết bị; lọc đúng; tổ chức khác không thấy | 3 |
| 3.4 | Tính giá sàn (giá vốn × hệ số sàn) khi báo giá, lưu đơn, duyệt giảm giá, chuyển báo giá thành đơn; dưới sàn → lưu bị chặn và tạo yêu cầu duyệt `BELOW_FLOOR` trong `order_approval_requests`; chỉ người có C10 duyệt; giao diện cảnh báo trước khi lưu | `src/modules/products/domain/price-guard.ts`, `src/modules/orders/use-cases/quote-order.ts`, `src/modules/sales/use-cases`, `gc/use-cases/discount-requests.ts` | TC | `price-guard.test.ts` đổi thành chặn; `tt/below-floor-approval.test.ts`: Sale lưu dưới sàn → 409 + yêu cầu duyệt, Điều hành duyệt → lưu được, tổ chức khác → 404 | 2,5 |
| 4.10 | Áp phạm vi xem của người xuất (sale "chỉ khách của mình", chi nhánh được giao) vào truy vấn xuất | `src/modules/orders/use-cases/export-orders.ts` | — | `export-orders.test.ts` + `tt/order-export-scope.test.ts`: Sale được cấp R13 chỉ nhận đơn của mình | 1 |
| 4.18 | Áp Q5: ảnh giao bắt buộc ở mọi gói chính sách mặc định; Điều hành cửa hàng tắt được yêu cầu này trong Cài đặt (công tắc ảnh người nhận); khi công tắc bật, không đóng đơn nếu thiếu ảnh và luồng điều phối không nhận tên người ký thay ảnh | `gc/domain/brochure-workflow-policy.ts`, `gc/use-cases/update-brochure-order-status.ts`, `src/modules/coordinator/domain/operation-rules.ts` | TC | `tt/greeting-card-coordinator-rules.test.ts`: không ảnh → không đóng đơn; `tu/coordinator/operation-rules.test.ts` | 1 |
| 4.26 | Áp Q6: giao xong còn nợ → `DELIVERED`, chỉ chuyển `COMPLETED` khi `balance_vnd = 0` (khi xác nhận thu nốt); `closeCoordinatorOrder` kiểm số dư | `gc/use-cases/update-brochure-order-status.ts`, `gc/use-cases/confirm-brochure-payment.ts`, `src/modules/coordinator/use-cases/operations.ts` | TC | `tt/greeting-card-payments.test.ts`: giao xong còn nợ không hoàn tất, thu đủ → hoàn tất; `tt/coordinator.test.ts` đóng đơn còn nợ → 422 | 2 |
| 9.11 | Gom mọi thao tác nhạy cảm về một luồng phiếu duyệt: đổi giá niêm yết (kể cả của Điều hành khi tổ chức bật "duyệt 2 người"), huỷ đơn đã cọc, giảm dưới sàn (dùng 3.4) | `src/modules/products/use-cases/product-change-requests.ts`, `src/modules/orders` | TC | `tt/sensitive-approvals.test.ts`: ba loại thao tác chỉ có hiệu lực sau duyệt | 1,5 |
| 9.12 | Áp Q4; chặn người tạo tự duyệt yêu cầu của chính mình ở mọi use-case duyệt (giảm giá, huỷ, đổi sản phẩm, giao trước thu sau); chặn gán vai Điều hành cho người khác khi người thao tác không phải chủ tổ chức | `org/domain/self-approval-policy.ts`, các use-case duyệt | TC | `tt/self-approval.test.ts`: tự duyệt → 422 ở từng luồng | 1 |
| 9.13 | Dùng phạm vi `BRANCH` của `CapabilityScope`: nhân viên có `membership.branch_id` và vai khác Điều hành chỉ đọc đơn, doanh số, tồn kho của chi nhánh đó; trưởng chi nhánh chỉ quản lý cơ sở của mình | `src/core/rbac/permission-resolver.ts`, `src/modules/orders/infra/order-repository.ts`, `src/modules/products/infra`, các use-case báo cáo | — | `tt/branch-scope.test.ts`: nhân viên chi nhánh A không thấy đơn/tồn kho chi nhánh B (404) | 4 |

### Đợt 2 — Vai trò và vận hành đơn

| STT | Việc cần làm | Khu vực mã | Khoá | Nghiệm thu và test | Công |
|---|---|---|---|---|---:|
| 1.12 | Thêm vai hệ thống `tho_cam`, `shipper`, `ke_toan` với bộ quyền theo Q7; trang chủ theo vai (Hàng đợi chế tác, Giao hàng, Đối soát); gieo vai cho tổ chức hiện có | `org/domain/system-roles.ts`, `src/core/rbac/capability-catalog.ts`, `org/domain/role-ux-catalog.ts`, `org/use-cases/ensure-system-roles.ts` | — | `capability-catalog.test.ts`, `role-ux-catalog.test.ts`; `tt/system-roles.test.ts`: tổ chức mới có đủ 6 vai, mỗi vai đúng quyền | 3 |
| 2.1 | Mã sản phẩm sinh phía máy chủ khi để trống (dùng quy ước `product-code.ts`); thêm chọn dịp (từ bảng `occasions`) và kích thước vào form tạo | `src/modules/products/use-cases/create-product.ts`, `src/components/products/use-create-product-form.ts`, `create-general-card.tsx` | — | `tt/products-pricing.test.ts`: tạo không mã → mã tự sinh duy nhất; dịp và kích thước đọc lại được | 1,5 |
| 2.3 | Thêm trạng thái `PAUSED` (Tạm ngưng); thêm xoá mẫu chỉ khi chưa có đơn, mẫu đã có đơn chỉ được lưu trữ; Thẻ Chào và danh mục ẩn mẫu tạm ngưng | `prisma/schema.prisma` (enum), `api/products/[id]/route.ts`, `src/modules/products/use-cases/update-product.ts` | DB | `tt/products-status.test.ts`: xoá mẫu có đơn → 409, mẫu chưa có đơn → xoá được, tạm ngưng không hiện ở danh mục | 2 |
| 2.4 | Mỗi phiên bản kích cỡ lưu số cành/BOM riêng trong `attributes.pricing.options[]`; phiếu thợ và giá vốn đọc theo phiên bản khách chọn | `src/modules/products/domain/product-pricing.ts`, `product-size-variants.ts`, form giá | — | `product-pricing.test.ts`; `tt/products-pricing.test.ts`: lưu và đọc lại số cành theo size | 2 |
| 2.8 | Áp `manualBlockedDates` cho mọi chế độ khả dụng; danh mục và Thẻ Chào lọc mẫu theo ngày giao khách chọn; trang "Khả dụng" khai theo ngày | `gc/domain/product-availability-config.ts`, `gc/use-cases/check-product-availability.ts`, `gc/use-cases/brochure-product-mapper.ts`, `src/app/(app)/san-pham/kha-dung` | TC | `tt/availability-by-date.test.ts`: mẫu khoá ngày 14/02 không hiện và không đặt được cho ngày đó, ngày khác vẫn đặt | 3 |
| 4.3 | Thêm lọc ngày giao (khoảng), nhân viên bán, chi nhánh cho danh sách đơn Thẻ Chào và đơn đa nguồn; giao diện bộ lọc | `api/greeting-card/orders/route.ts`, `api/orders/route.ts`, repository tương ứng | TC | `tt/order-filters.test.ts`: từng bộ lọc trả đúng tập đơn | 1,5 |
| 4.5 | Vai Shipper (1.12) có màn "Đơn cần giao" chỉ hiện người nhận, SĐT, địa chỉ, khung giờ, lời thiệp; shipper ngoài dùng link ký riêng như link gia công; không trả giá vốn, tổng tiền | `src/modules/orders`, trang mới `src/app/(app)/giao-hang`, `api/delivery` | — | `tt/shipper-view.test.ts`: phản hồi không có trường giá/ghi chú nội bộ; shipper tổ chức khác → 404 | 4 |
| 4.9 | Mẫu in phiếu xưởng khổ A6 (`@page size: A6`) có ảnh mẫu, công thức cắm theo phiên bản, lời thiệp; mẫu in băng rôn; `GET orders/[id]/print` trả ảnh và BOM | `src/modules/orders/use-cases/get-order-printout.ts`, `gc/…/brochure-florist-job-tab.tsx`, thành phần in mới | TC | `tt/print-isolation.test.ts` mở rộng nội dung; e2e in phiếu | 3 |
| 4.11 | Tab "Đơn đã đặt" trong chi tiết khách: danh sách đơn (mọi nguồn) theo `customer_id` và SĐT, bấm mở chi tiết | `src/components/crm/customer-detail-modal.tsx`, `api/orders/route.ts` | — | `tt/customer-orders.test.ts`: chỉ đơn của khách và của tổ chức mình | 1,5 |
| 4.13 | "Việc của tôi" cho Thợ cắm: đơn được giao (`order_assignments.assignee_id = người đăng nhập`), sắp theo giờ giao; nhận việc, báo xong; danh sách việc của chi nhánh cho trưởng chi nhánh | `src/modules/orders/infra/order-repository.ts`, `api/orders/workbench`, trang `src/app/(app)/che-tac` | — | `tt/florist-queue.test.ts`: thợ chỉ thấy việc giao cho mình; tổ chức khác → 404 | 3 |
| 4.14 | Dùng bảng `order_info_requests`: tạo yêu cầu bổ sung (trường thiếu, hỏi ai, hạn), tự sinh khi đơn thiếu địa chỉ/SĐT người nhận/lời chúc, đóng khi đủ; việc "Thiếu thông tin" trong Hộp việc; nhắc khi quá hạn | `src/modules/orders/use-cases/order-info-requests.ts` (mới), `api/orders/[id]/info-requests`, `gc/domain/inbox.ts` | TC | `tt/order-info-requests.test.ts`: đơn thiếu SĐT → có yêu cầu mở; bổ sung → tự đóng; cách ly 404 | 4 |

### Đợt 3 — Giá và báo giá

| STT | Việc cần làm | Khu vực mã | Khoá | Nghiệm thu và test | Công |
|---|---|---|---|---|---:|
| 1.9 | Cửa hàng tự tạo trường riêng và ẩn trường tuỳ chọn trong phạm vi sàn của nền tảng (không hạ trường lõi bắt buộc); mã năng lực mới cho cấu hình trường; màn hình Cài đặt → Trường dữ liệu | `src/modules/field-platform/use-cases/create-custom-field.ts`, `set-org-override.ts`, `api/field-config` (thêm PUT/POST), `src/app/(app)/cai-dat` | — | Sửa `tp/field-registry.test.ts:165`; `tt/field-config-tenant.test.ts`: cửa hàng thêm/ẩn được, không tắt được trường lõi bắt buộc, không ảnh hưởng tổ chức khác | 3 |
| 3.1 | Khoá quy tắc giá `customer_tier_discount` (Đồng/Bạc/Vàng/VIP theo enum `customer_tier`) và `peak_hour_surcharge`; áp khi báo giá có khách xác định; hiện từng khoản | `src/modules/products/domain/pricing-rules.ts`, `pricing.ts`, `api/pricing-rules`, nơi tính báo giá | TC (báo giá Thẻ Chào) | `pricing-rules.test.ts`; `tt/products-pricing.test.ts`: khách VIP nhận đúng chiết khấu | 2 |
| 3.6 | Phí cắm theo 6 kiểu dáng (Q8) thành dòng riêng; nhân hệ số ngày lễ (mặc định 1,3) vào phí cắm; VAT 8/10% cộng sau | `src/modules/products/domain`, `gc/domain/brochure-pricing.ts`, `gc/domain/holiday-policy.ts` | TC | `brochure-pricing.test.ts`; `tt/greeting-card-holiday.test.ts`: phí cắm ngày lễ = đơn giá × 1,3 | 3 |
| 3.8 | Báo giá chọn phiên bản kích cỡ cho từng dòng và nhập phí vận chuyển; tổng tính lại | `prisma/schema.prisma` (`quotation_items.variant_label`, `quotations.shipping_fee`), `src/modules/sales`, `customer-quote-builder.tsx` | DB | `quotation.test.ts`; `tt/quotation-isolation.test.ts` | 2,5 |
| 3.10 | Bảng `quotation_revisions` lưu ảnh chụp mỗi lần sửa (dòng, tổng, người sửa, thời điểm); xem lịch sử trong chi tiết báo giá | `prisma/schema.prisma`, `src/modules/sales/use-cases/update-quotation.use-case.ts` | DB | `tt/quotation-revisions.test.ts`: sửa 2 lần → 2 phiên bản đọc lại đúng; tổ chức khác → 404 | 2 |
| 3.11 | Trang `/bg/[token]` hiện ảnh mẫu và thành phần hoa (không giá vốn); xuất PNG/PDF khổ A6 bằng `html-to-image` + `jspdf` (đã có trong dự án) | `src/app/bg/[token]/page.tsx`, `src/modules/sales/infra/quotation-mapper.ts`, `quote-preview-card.tsx` | — | `tt/quotation-public-link.test.ts`: có ảnh, thành phần, không có giá vốn; e2e tải PDF | 3 |

### Đợt 4 — Thương mại SaaS, credit, hạn mức

| STT | Việc cần làm | Khu vực mã | Khoá | Nghiệm thu và test | Công |
|---|---|---|---|---|---:|
| 10.7 | Bảng `subscriptions` (gói, chu kỳ MONTHLY/YEARLY, kỳ hiện tại, trạng thái) và `subscription_invoices`; gán/đổi gói từ Console; hoá đơn kỳ mới, thu qua VietQR, đối soát SePay; nhắc gia hạn, xử lý quá hạn theo Q9; `entitlement-service` đọc gói từ `subscriptions` | `prisma/schema.prisma`, `src/modules/platform`, `src/core/entitlements/entitlement-service.ts`, `src/app/(platform)/van-hanh` | DB | `tp/subscriptions.test.ts`: gán gói, sinh hoá đơn, thanh toán gia hạn kỳ, quá hạn khoá tính năng theo gói | 6 |
| 9.10 | Console tạo tổ chức mới: thông tin cửa hàng, ngành, gói (10.7), tài khoản chủ tiệm với mật khẩu tạm (1.4); dùng lại phần dựng tổ chức của `sign-up.ts` | `api/platform/organizations/route.ts` (POST), `src/modules/platform`, `src/app/(platform)/van-hanh/to-chuc` | — | `tp/create-organization.test.ts`: thiếu mã năng lực → 403; tạo xong chủ tiệm đăng nhập được, có gói, có nhật ký nền tảng | 3 |
| 9.8 | Màn tổng quan Console: số cửa hàng theo trạng thái, doanh thu thuê bao theo kỳ (từ `subscription_invoices`), sức khoẻ hệ thống | `api/platform/overview`, `src/app/(platform)/van-hanh` | — | `tp/platform-overview.test.ts`: số liệu khớp dữ liệu mẫu | 1,5 |
| 10.6 | Bảng `credit_transactions` (TOPUP, REFUND, GIFT, USAGE) làm sổ cái credit; Console nạp/hoàn/tặng có lý do, ghi nhật ký nền tảng; nối `vietqr-topup-modal.tsx` với API nạp; giữ `scripts/nap-credit.ts` đi qua cùng use-case | `prisma/schema.prisma`, `org/infra/organization-repository.ts`, `api/platform/credits` | DB | `tp/credit-ledger.test.ts`: số dư = tổng giao dịch; không có mã năng lực → 403 | 3 |
| 10.3 | Bảng `usage_limits` (tổ chức × dịch vụ AI/SMS/ZNS × tháng); kiểm trước khi gọi AI (`usage-repository`), trước khi gửi SMS/ZNS (adapter); chạm hạn mức → dừng, báo Điều hành; Console và Cài đặt hiện hạn mức | `prisma/schema.prisma`, `src/modules/usage`, `gc/adapters/esms-adapter.ts`, `gc/adapters/zalo-zns-adapter.ts` | DB, TC | `tt/usage-limits.test.ts`: vượt hạn mức AI → 422 `QUOTA_EXCEEDED`; SMS thứ N+1 không gửi; có thông báo | 4 |
| 10.5 | Sự kiện thông báo `CREDIT_LOW` (số dư < 20% credit đã nạp kỳ gần nhất hoặc hạn mức tháng) và `USAGE_LIMIT_NEAR`; phát sau mỗi lần trừ, một lần mỗi kỳ | `src/modules/notification/domain/events`, `src/modules/usage` | — | `tt/credit-low-notification.test.ts`: chạm ngưỡng phát đúng một lần | 1,5 |
| 10.4 | Bảng `provider_cost_entries` ghi chi phí thật của SMS/ZNS; tỷ giá USD→VND cấu hình ở Console; báo cáo nền tảng: chi phí thật, credit đã thu, biên lợi nhuận theo tháng và theo tổ chức | `prisma/schema.prisma`, `src/core/ai/gateway.ts` (đọc `cost_usd` sẵn có), `src/app/(platform)/van-hanh/muc-dung` | DB | `tp/platform-margin.test.ts`: biên lợi nhuận = credit quy đổi − chi phí | 3 |
| 9.7 | Trần chi phí AI theo tháng cho từng tổ chức (credit/tháng); `callCapability` từ chối khi vượt; chọn nhà cung cấp ưu tiên (đã có `allowed_models`); bộ lọc từ cấm áp ở gateway cho mọi đầu ra văn bản | `src/core/ai/gateway.ts`, `src/modules/ai-governance`, `api/ai-policy` | — | `tt/ai-policy.test.ts`: vượt trần tháng → từ chối, không trừ credit; đầu ra có từ cấm bị lọc | 2,5 |
| 10.8 | Bảng `custom_domains` (tên miền, mã xác minh TXT, trạng thái); xác minh DNS; `src/proxy.ts` ánh xạ host → tổ chức cho trang danh mục và Thẻ Chào; cấp chứng chỉ theo Q11 | `prisma/schema.prisma`, `src/proxy.ts`, `api/custom-domains`, Cài đặt | DB | `tt/custom-domains.test.ts`: chưa xác minh không phục vụ; host của tổ chức A không mở dữ liệu tổ chức B | 6 |

### Đợt 5 — Báo cáo

Toàn bộ báo cáo dựng ở module mới `src/modules/reporting` (truy vấn tổng hợp phía máy chủ, có kỳ thời gian, có phạm vi chi nhánh/sale từ 9.13), API `api/reports/*` gác bằng mã năng lực báo cáo, trang `src/app/(app)/bao-cao`.

| STT | Việc cần làm | Khu vực mã | Khoá | Nghiệm thu và test | Công |
|---|---|---|---|---|---:|
| 6.1 | Số đơn theo ngày/tuần/tháng, tỷ lệ hoàn tất, huỷ, trễ (giao sau khung giờ hẹn theo `order_events`) | `src/modules/reporting`, `api/reports/orders` | — | `tt/reports-orders.test.ts`: số liệu khớp bộ đơn mẫu; tổ chức khác không lẫn | 2 |
| 6.2 | Doanh thu dự kiến (tổng đơn chưa huỷ) và thực thu (tổng `order_payments` trừ hoàn) theo kỳ; bấm số liệu mở danh sách đơn đã lọc | `src/modules/reporting`, `api/reports/revenue` | — | `tt/reports-revenue.test.ts` | 2 |
| 6.3 | Xếp hạng mẫu theo số lượng và giá trị; tỷ trọng màu chủ đạo và phong cách từ thuộc tính sản phẩm | `src/modules/reporting` | — | `tt/reports-products.test.ts` | 1,5 |
| 6.5 | Doanh số theo Sale; sản lượng theo thợ (`order_assignments` + hoàn tất); tỷ lệ giao đúng giờ theo shipper (vai 1.12, 4.5) | `src/modules/reporting` | — | `tt/reports-performance.test.ts` | 2,5 |
| 6.6 | Dòng tiền theo hình thức thu (VietQR/chuyển khoản, tiền mặt, thẻ); đối chiếu với giao dịch ngân hàng nhận qua SePay (khớp, lệch, chưa khớp) theo ngày | `src/modules/reporting`, đọc `order_payments` và giao dịch ngân hàng | — | `tt/reports-cashflow.test.ts`: tổng theo hình thức; khoản chưa khớp hiện đúng | 3 |
| 6.9 | Lượt dùng AI và credit theo kỳ, so với hạn mức gói (10.3, 10.7) | `src/modules/usage/use-cases/get-usage-summary.ts` (thêm kỳ), `src/app/(app)/muc-dung` | — | `tt/usage-summary.test.ts`: lọc theo tháng, có hạn mức gói | 1,5 |

### Đợt 6 — Thẻ Chào, marketing, AI

| STT | Việc cần làm | Khu vực mã | Khoá | Nghiệm thu và test | Công |
|---|---|---|---|---|---:|
| 5.4 | Ảnh ghép 3–4 mẫu tuỳ số mẫu, kèm mã QR link Thẻ Chào (sinh bằng `src/core/media/qr-engine.ts`) | `gc/use-cases/catalog-collage.ts`, `src/components/greeting-card/og/catalog-collage-image.tsx` | TC | `catalog-collage.test.ts`: 4 mẫu → 4 ô; có QR trỏ đúng link | 1,5 |
| 5.5 | Cho phép tắt hiển thị giá (khách thấy "Liên hệ báo giá", vẫn đặt được theo chính sách) và công tắc thông tin giảm giá | `gc/domain/display-fields.ts`, trang khách | TC | `display-fields.test.ts`; `tt/greeting-card-storefront.test.ts`: tắt giá → phản hồi công khai không có giá | 1 |
| 5.9 | Thêm lọc màu vào mẫu vuốt (dùng chung dữ liệu màu của mẫu bảng màu) | `src/components/greeting-card/customer/templates/swipe-brochure-engine.tsx` | TC | Test unit bộ lọc; e2e `brochure-swipe.spec.ts` thêm bước lọc màu | 1 |
| 5.14 | Thay một loại hoa phụ: tiệm chụp ảnh hoa thay thế, ghi lý do; khách đồng ý/không trên điện thoại; công thức cắm của đơn cập nhật dòng hoa đó | `gc/use-cases/substitute.ts`, trang khách, kho ảnh | TC, Q12 | `tt/greeting-card-substitute.test.ts`: đề xuất thay hoa có ảnh, khách đồng ý → BOM đơn đổi đúng dòng | 3 |
| 5.15 | Màn cảm ơn phát mã giảm giá dùng một lần gắn khách (`issueVoucherBatch` dạng một mã); lưu thông tin người đặt cho lần sau (theo đồng ý của khách) | `src/components/greeting-card/customer/customer-thank-you-card.tsx`, `src/modules/promotions` | TC | `tt/thank-you-voucher.test.ts`: hoàn tất đơn → đúng một mã, dùng được ở đơn sau, không dùng được bởi khách khác | 2 |
| 7.2 | Luồng một bước "Từ 1 ảnh": phân tích ảnh → thẻ sản phẩm nháp → nội dung bán hàng → đề xuất giá vốn từ BOM × đơn giá nguyên liệu → bài đăng Facebook/Zalo (content-engine) → thẻ A6 Thẻ Chào; theo dõi bằng job, trừ credit từng bước, hoàn khi lỗi | `src/modules/journey`, `src/modules/product-copies`, `src/modules/costing`, `src/modules/content-engine` | Q12 | `tt/one-image-kit.test.ts` (AI giả lập): một ảnh sinh đủ 5 đầu ra; lỗi giữa chừng hoàn credit | 5 |
| 7.3 | Thêm tiêu chí "có bài viết đã duyệt"; chặn chuyển `ACTIVE` khi chưa sẵn sàng (trả danh sách thiếu) | `src/modules/products/domain/product-readiness.ts`, `src/modules/products/use-cases/update-product.ts` | — | `product-readiness.test.ts`; `tt/products-readiness.test.ts`: chưa đủ → 422 kèm lý do | 1,5 |
| 9.3 | Thêm trường thông điệp thương hiệu và khách mục tiêu vào hồ sơ kinh doanh; đưa vào ngữ cảnh AI | `prisma/schema.prisma`, `api/business-profile`, `src/modules/content-engine/infra/read-shop-context.ts`, `business-profile-form.tsx` | DB | `tt/cach-ly-endpoint.test.ts` mở rộng; test ngữ cảnh AI có hai trường | 1 |

### Đợt 7 — Cách ly dữ liệu tầng CSDL

| STT | Việc cần làm | Khu vực mã | Khoá | Nghiệm thu và test | Công |
|---|---|---|---|---|---:|
| 1.18 | Bật Row Level Security cho mọi bảng có `organization_id` theo Q13; chính sách `organization_id = current_setting('app.current_org')`; client Prisma đặt `set_config` trong transaction theo `TenantContext`; vai CSDL riêng cho nền tảng/worker; đo hiệu năng trước/sau | `prisma/migrations`, `src/core/tenancy/infra/prisma.ts`, các repository dùng transaction | DB | `tt/rls.test.ts`: truy vấn thô không đặt tổ chức → 0 dòng; đặt tổ chức A không đọc được B; toàn bộ `test:tenant` và `test:platform` xanh | 10 |

## 5. Rủi ro và biện pháp

| Rủi ro | Ảnh hưởng | Biện pháp |
|---|---|---|
| Mở khoá Thẻ Chào làm hỏng luồng đang chạy ổn định | Đơn khách lỗi | Mỗi PR chạm Thẻ Chào chạy đủ test `tt/greeting-card-*` và e2e; PO duyệt trước khi cập nhật mốc băm |
| Đổi vòng đời đơn (4.26) và ảnh bắt buộc (4.18) làm đơn cũ kẹt | Đơn đã giao không hoàn tất | Migration dữ liệu: đơn cũ đã giao đủ tiền chuyển `COMPLETED`, còn nợ hiện ở danh sách chờ thu |
| Ghi nhật ký mọi thao tác (1.15, 1.17) làm tăng tải ghi | Chậm API | Ghi ngoài transaction chính qua hàng đợi, giới hạn tần suất cho lần bị chặn; chỉ mục theo `organization_id, created_at` đã có |
| RLS (1.18) làm chậm truy vấn hoặc chặn worker | Sự cố diện rộng | Làm cuối cùng, bật theo nhóm bảng, đo trên bản sao dữ liệu, có cờ tắt khẩn cấp |
| Tên miền riêng (10.8) phụ thuộc hạ tầng bên ngoài | Chậm tiến độ | Tách phần xác minh và ánh xạ host (làm được ngay) khỏi phần cấp chứng chỉ (theo Q11) |
| Gói thuê bao (10.7) đổi cách tính quyền theo gói | Khoá nhầm tính năng của khách | Migration gán gói hiện hành cho mọi tổ chức trước khi `entitlement-service` đọc bảng mới |

## 6. Thay đổi lược đồ CSDL

| Chức năng | Thay đổi |
|---|---|
| 1.4 | `users.must_change_password Boolean @default(false)` |
| 2.3 | Enum `product_status` thêm `PAUSED` |
| 3.8 | `quotations.shipping_fee Decimal`, `quotation_items.variant_label String?` |
| 3.10 | Bảng `quotation_revisions` (`organization_id`, `quotation_id`, `version`, `snapshot Json`, `created_by`, `created_at`) |
| 9.3 | `business_profiles.brand_message String?`, `business_profiles.target_customers Json?` |
| 10.3 | Bảng `usage_limits` (`organization_id`, `service`, `period`, `limit`, `used`) |
| 10.4 | Bảng `provider_cost_entries` (`organization_id`, `provider`, `service`, `cost_usd`, `cost_vnd`, `occurred_at`) |
| 10.6 | Bảng `credit_transactions` (`organization_id`, `kind`, `amount`, `balance_after`, `reason`, `actor_id`, `created_at`) |
| 10.7 | Bảng `subscriptions`, `subscription_invoices` |
| 10.8 | Bảng `custom_domains` (`organization_id`, `hostname` duy nhất, `verification_token`, `status`, `verified_at`) |
| 1.18 | Migration bật RLS và chính sách trên các bảng có `organization_id` |

Mọi bảng mới có `organization_id` + `@@index([organization_id])` (trừ bảng cấp nền tảng), mỗi thay đổi kèm migration và chạy `npm run db:deploy` khi triển khai.

## 7. Theo dõi tiến độ

| Đợt | Số chức năng | Đã hoàn thiện |
|---|---:|---:|
| 1 | 13 | 13 |
| 2 | 11 | 11 |
| 3 | 6 | 6 |
| 4 | 9 | 5 |
| 5 | 6 | 0 |
| 6 | 8 | 0 |
| 7 | 1 | 0 |
| **Tổng** | **54** | **35** |

Đợt 2 hoàn thiện đủ 11/11 chức năng. Phần mở rộng còn theo dõi: link giao riêng cho shipper thuê ngoài (4.5), đưa đơn Thẻ Chào vào hàng đợi của tài khoản thợ (4.13), giá vốn theo phiên bản (2.4), ẩn mẫu bị khoá khỏi danh sách trên link theo ngày khách chọn trước (2.8). Shipper nội bộ được gắn đơn theo số điện thoại Điều phối ghi khi điều xe; Điều hành nhập số điện thoại nhân viên ở màn Thành viên.

Đợt 3 hoàn thiện đủ 6/6 chức năng: phí chế tác theo kiểu dáng và hệ số ngày lễ (3.6), phiên bản và phí vận chuyển trên báo giá (3.8), lịch sử phiên bản báo giá (3.10), link báo giá có ảnh mẫu và tải PNG/PDF A6 (3.11), ưu đãi hạng khách và phụ phí giờ cao điểm (3.1), trường dữ liệu do cửa hàng cấu hình (1.9, mã năng lực `D18`, migration `20261105120000_field_definition_owner`).

Khi mọi đợt hoàn tất, báo cáo ánh xạ đạt 123/123 chức năng Hoàn thiện và checklist bàn giao ALG đủ điều kiện nghiệm thu.
