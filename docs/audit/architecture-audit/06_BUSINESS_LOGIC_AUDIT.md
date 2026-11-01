# 06 — Audit kiến trúc logic nghiệp vụ

## 1. Kiểm kê logic nghiệp vụ theo miền

| Miền | Mô-đun | Quy tắc / quy trình cốt lõi (tệp domain) | Kiểm thử |
|---|---|---|---|
| Tổ chức, vai, phiên, đăng ký | `organization` | `account-approval.ts`, `session-policy.ts`, `self-approval-policy.ts`, `governance-decisions.ts`, `tool-route-entitlement.ts`, `industries/*` (plugin ngành), `role-ux-catalog.ts` | 18 unit, 116 tệp tenant nhắc tới |
| Sản phẩm, giá, danh mục | `products`, `costing`, `catalog-links`, `catalog-studio`, `product-copies` | Quản trị sản phẩm (đề xuất/duyệt), giá theo cấp, giá vốn – công thức – nguyên liệu, liên kết catalog có hạn | 31 unit + 63 tenant (products) |
| Đơn hàng đa nguồn | `orders` | `order-rules.ts` (3 bảng chuyển trạng thái: đơn, sản xuất, giao), `ingestOrder` một cổng nhận đơn, giao trước thu sau, hạn mức tự quyết, khớp chuyển khoản | 15 unit, 54 tenant |
| Điều phối & gia công | `coordinator`, `chain-partnership` | `stage-transitions.ts`, `state-mapper.ts` (stage ↔ 3 trục trạng thái đơn), SLA, nhắc mốc, quyết toán đối tác | 6 unit, 14 tenant |
| Thẻ chào (đơn hoa qua catalog/brochure) | `greeting-card` | 101 tệp domain: giá brochure, chính sách thanh toán/huỷ/đổi, đặt cọc, thu phần còn lại, khớp ngân hàng, điều phối chuỗi, ngày lễ, link chia sẻ, thông báo khách | 112 unit, 59 tenant |
| CRM, ưu đãi, thu hút khách | `crm`, `promotions`, `acquisition`, `shop-reviews` | Master index khách, đồng ý nhận tin, voucher lô/đổi, lead + short link, khôi phục đơn quá hạn thành lead | có |
| Sáng tạo nội dung & media | `creative-production`, `content-engine`, `media`, `assets`, `video-studio`, `audio-studio`, `product-image-set`, `product-photo-studio`, `ad-banner-poster`, `landing-page`, `templates` | Kế hoạch cảnh (`scene-plan-rules.ts` 902 dòng), hành trình 14 chặng, vòng đời asset, kiểm từ cấm ngành hoa | có (không đều — `ad-banner-poster`, `catalog-studio`, `product-image-set` 0 tenant test) |
| AI & đo lường | `core/ai`, `ai-governance`, `usage`, `jobs` | Định tuyến mô hình, sàn riêng tư, đánh giá, bảng giá credit (`usage/domain/pricing.ts`), hoàn credit khi Identity Guard từ chối | có |
| Thông báo | `notification` | Danh mục sự kiện 4 tầng, `cascading-policy` qua `layered-resolver`, người nhận theo vai | 7 unit, 5 tenant |
| Tích hợp | `integration-hub`, `integration`, `sso`, `proxy` | Vòng đời kết nối, retry, redact, ánh xạ đơn kênh bán | 8 unit, 2 tenant |
| Nền tảng | `platform`, `field-platform` | Console vận hành, duyệt đăng ký, trường dữ liệu động, chợ đối tác, hàng đợi lỗi | 8 + 17 unit, 10 platform test |

## 2. Ranh giới miền

- **Đúng**: domain thuần (không Prisma) được thực thi bằng test; use-case nhận repository qua dependency (`*-deps.ts`), domain có repository interface (`domain/repositories/*.interface.ts`).
- **Rò kiểu**: 8 repository interface trong `domain/` import kiểu entity từ `infra/entities` (`audit`, `content-engine`, `creative-production` ×2, `jobs`, `profiles` ×2, `usage`); 7 component `.tsx` import kiểu từ `modules/*/infra/*` (ARC-018). Không vi phạm luật "không import Prisma" ở mức runtime nhưng buộc domain/UI phụ thuộc hình dạng bảng.
- **Mô-đun thống trị**: `greeting-card` (29.083 dòng, ~20% mã mô-đun) chứa cả giá, thanh toán, điều phối chuỗi, kênh gửi tin, mẫu thông báo — một "monolith trong mô-đun". Quyết định PO 31/10 đóng băng tuyệt đối mô-đun này (`the-chao-freeze.test.ts`) → mọi hợp nhất logic trùng đều phải đi vòng (ARC-029).

## 3. Quy trình và chuyển trạng thái

### 3.1 Đơn hàng — `src/modules/orders/domain/order-rules.ts`

```
Đơn:      DRAFT → CONFIRMED → PROCESSING → DELIVERED → COMPLETED      (CANCELLED từ DRAFT/CONFIRMED/PROCESSING; DELIVERED → PROCESSING khi sự cố)
Sản xuất: WAITING ⇄ ASSIGNED → ARRANGING ⇄ QUALITY_CHECK → READY (READY → ARRANGING)
Giao:     PENDING ⇄ DISPATCHED → DELIVERING → DELIVERED | FAILED (FAILED → DELIVERING/PENDING)
```

### 3.2 Điều phối — `coordinator/domain/stage-transitions.ts` + `state-mapper.ts`

Một "stage" điều phối được ánh xạ hai chiều sang ba trục trên (`mapStageToOrderAxes`, `mapOrderAxesToStage`), có `TERMINAL_STAGES = [COMPLETED, CANCELLED]`.

### 3.3 Thẻ chào — `greeting-card/domain/greeting-card-rules.ts` và ~100 tệp chính sách

Có luồng riêng (đặt cọc, thu phần còn lại, huỷ, đổi đơn, giao lỗi, thay thế sản phẩm) trên cùng bảng `orders` (phân biệt bằng `source`; `brochureLockReason()` khoá thao tác chung lên đơn Thẻ chào).

**Đánh giá (ARC-017):** ba động cơ trạng thái cùng ghi một bảng; tính đúng phụ thuộc vào việc mọi đường ghi đi qua đúng động cơ. Không có một "máy trạng thái" duy nhất được khai báo làm SSOT; `business-reporting.ts` còn dùng tập trạng thái khác enum (`PENDING` không tồn tại, thiếu `DELIVERED`) → báo cáo doanh thu có thể bỏ sót đơn `DELIVERED`. Mức P2 (Verified ở mức kiểu; ảnh hưởng số liệu chưa đo).

## 4. Validation, tính toán, giá trị cứng

| Hạng mục | Hiện trạng | Đánh giá |
|---|---|---|
| Validation đầu vào | zod ở route (222 tệp) hoặc use-case | Tốt |
| Tính tiền đơn | Máy chủ tính (`calculateOrderTotal`, `brochure-pricing.ts`), không tin client | Tốt (TC-20/10) |
| Giới hạn giảm giá | `BUILT_IN_MOTHER_LOCKS.MAX_DISCOUNT_PERCENT = 50` | Hằng có chủ đích, đổi phải hỏi PO |
| Bảng giá credit | Hằng trong `usage/domain/pricing.ts` (D14 v1) | Chấp nhận giai đoạn đầu; cần cấu hình hoá khi có giá thật (nợ #151) |
| Ngưỡng AI | Identity Guard 0,95/0,90 chốt; các năng lực khác dùng giá trị tạm (nợ #72) | Rủi ro chất lượng |
| Ràng buộc DB | `orders_balance_vnd_check` chưa có | Toàn vẹn chỉ dựa mã |
| Thuật ngữ ngành | Plugin + ratchet `audit:industry:check` | Ratchet đang đỏ (ARC-001) |

## 5. Trùng lặp và kết dính

| Vấn đề | Chi tiết | ID |
|---|---|---|
| Gửi tin qua kênh | Thẻ chào có adapter riêng (eSMS, Zalo ZNS/OA, Messenger, WhatsApp, Telegram); mô-đun thông báo có adapter riêng (SMS/Zalo/Push stub); Hub có Telegram riêng | ARC-007 |
| Ghi sổ AI | TS gateway và worker Python mỗi bên một bản | ARC-009 |
| Quyết định theo tầng | Đã hợp nhất về `core/governance/layered-resolver.ts` (nợ #193 ✅) | Đã khắc phục |
| UI ↔ backend | Trang lớn (`tai-anh/page.tsx` 1.945 dòng, `variant-workspace.tsx` 1.753, `sales-order-intake-modal.tsx` 1.294) chứa logic trình bày + điều phối gọi API; `src/lib/feature-catalog.ts` 990 dòng, `organization/domain/industry-roadmap.ts` 893 dòng | ARC-013 |
| Vai UI ↔ vai RBAC | Hai bộ khoá vai | ARC-016 |

## 6. Quy trình xuyên mô-đun

| Quy trình | Đường đi | Ghi chú |
|---|---|---|
| Đơn từ kênh → điều phối | `integration-hub` (đơn kênh bán) / chat / nhập tay / catalog công khai → `orders/ingest-order.ts` → xác nhận cọc hoặc duyệt giao trước → hàng điều phối | Có cổng nhận đơn chung (tốt); Thẻ chào nhúng nguyên vẹn |
| Ảnh sản phẩm → nội dung | upload → `generation_jobs` → worker vision/media → asset duyệt → creative/content | Qua bảng job, không HTTP (D6-1) |
| Thanh toán chuyển khoản | SePay webhook → khớp Thẻ chào → phần chưa khớp → khớp đơn thường (`match-standard-bank-transfers.ts`, lịch nền 3) | Phụ thuộc lịch nền trong tiến trình (ARC-010) |
| Đơn quá hạn → lead | `lead-recovery-scheduler.ts` | như trên |
| Thông báo | 6 sự kiện đơn hàng gọi `notifyOrganization` | Sự kiện chuỗi/nền tảng chưa nối |

## 7. Kiểm thử logic nghiệp vụ

- Mạnh: orders, products, organization, greeting-card, storage (tenant test trên Postgres thật, có ca đua `subcontract-claim-race`, `skip-locked-claim`, `availability-double-booking`).
- Yếu: `ad-banner-poster`, `catalog-studio`, `toolkit`, `product-image-set`, `product-photo-studio`, `chain-partnership`, `ai-governance` không có tenant test nào nhắc tới; `market-intelligence` 1 unit test cho 6.149 dòng; `creative-production` 2 unit test cho 9.860 dòng.
- **Hiện trạng ở `c27f39e1`: toàn bộ bộ unit/tenant không chạy trong CI** (ARC-001) → không chứng minh được logic hiện tại đúng.

## 8. Phiên bản hoá & quản lý thay đổi quy tắc

- Quyết định nghiệp vụ ghi ở `TRANG_THAI.md` §4 (ngày + người quyết), ADR, `decision_registry` (bảng + `lint:decisions`).
- Không có phiên bản hoá quy tắc ở runtime (ví dụ chính sách giá có hiệu lực theo ngày) ngoài ma trận quản trị (`governance_matrix` ghi đè hiện hành, có audit log).
- Đóng băng mã theo đợt (16–21/10, Thẻ chào từ 31/10) dùng test kiến trúc — hiệu quả nhưng chặn tái cấu trúc.

## 9. Khoảng trống kiến trúc nghiệp vụ

1. Khai báo một SSOT máy trạng thái đơn (bảng chuyển hợp lệ cho mọi nguồn, gồm Thẻ chào) và ép mọi đường ghi qua nó; sửa `business-reporting.ts` theo enum (ARC-017).
2. Kế hoạch tách dần Thẻ chào khi hết đóng băng: kênh gửi tin → Hub/Notification; giá/thanh toán → `orders`/`promotions` (ARC-029).
3. Bổ sung tenant test cho các mô-đun 0 test có ghi dữ liệu tổ chức.
4. Thêm ràng buộc CHECK ở CSDL cho số dư/tiền (cần PO duyệt schema).
