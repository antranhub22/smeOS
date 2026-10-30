# Nâng cấp Bước 4 — Thu hút khách hàng (công cụ 12, 13, 21, 25, 54 + Kết nối quảng cáo Facebook)

Status `DRAFT` · chờ PO duyệt · 30/10/2026. Tài liệu rà soát + đề xuất; chưa thay đổi mã nguồn.
Phạm vi lấy từ `src/modules/toolkit/domain/growth-modules.ts:48-50` (module `acquisition`) và
`growth-module-roadmap.ts:29` (Facebook Ads ở giai đoạn 2).

## 1. Hiện trạng thực tế (đối chiếu mã nguồn, không theo checklist)

| # | Công cụ | Catalog ghi | Thực tế trong code | Kết luận |
|---|---|---|---|---|
| 12 | QR code cửa hàng & sản phẩm | IN_PROGRESS 20% | `src/core/media/qr-engine.ts` (thư viện `qrcode`: PNG/SVG, màu, EC level `M`). Dùng trong catalog, landing, danh thiếp, video QR hồ sơ. Không có logo giữa mã, khung, QR động, thống kê quét. | **Có nền** — QR tĩnh dùng được, chưa phải công cụ độc lập |
| 13 | Link bán hàng | PLANNED 0% | Không có module/route "sales link". Gần nhất: `catalog-links` (link BST, slug, thu hồi) và trang sản phẩm công khai. | **Chưa có** — tái dùng được `catalog-links` |
| 21 | Form thu lead | FOUNDATION 30% | `POST /api/v1/public/catalog/[slug]/lead` lưu SĐT vào `catalog_links.filters.leads` (JSON). CRM có `product-inquiry` (tạo khách + hội thoại). | **Có bản thô, có lỗi** — xem §2 |
| 25 | Điểm thu hút qua QR | FOUNDATION 20% | Chỉ là QR (#12) trỏ tới landing/catalog. Không có khái niệm "điểm đặt", không thống kê theo vị trí. | **Chưa có** phần riêng |
| 54 | Kết nối kênh bán hàng `/ket-noi` | Trang có sẵn | `src/app/(app)/ket-noi/page.tsx` gọi proxy `SOCIALFLOW` (`/api/v1/proxy/api/accounts…`): kết nối/kiểm tra/ngắt Facebook Fanpage, Instagram, LinkedIn, TikTok. Phụ thuộc dịch vụ SocialFlow bên ngoài. | **Đã xây** (đăng bài), chưa có tình trạng token/hết hạn hiển thị đầy đủ |
| — | Kết nối quảng cáo Facebook | Roadmap GĐ2 | Không có Marketing API, ad account, Pixel/CAPI. `content-engine/domain/ad-performance-analytics.ts` chỉ tính chỉ số từ dữ liệu nhập. | **Chưa có** |

## 2. Lỗi/rủi ro phát hiện khi rà (cần sửa trước khi bàn giao)

1. **Lead lưu trong JSON `filters`** (`catalog-link-repository.ts:160-179`): đọc-rồi-ghi → hai khách gửi cùng lúc sẽ mất lead (lost update); mảng tăng vô hạn; PII (SĐT) nằm trong cột cấu hình, không vào CRM, không xoá theo yêu cầu khách được.
2. **Route công khai không chặn spam**: không dùng `src/core/http/rate-limit.ts`, không honeypot/captcha, không kiểm SĐT Việt Nam (chỉ `min(8)`), trong khi `product-inquiry.ts` đã có regex `VN_PHONE`.
3. **Vi phạm kiến trúc**: route import thẳng `CatalogLinkRepository` (infra) thay vì qua use-case (AGENT_RULES — route → use-case → repository).
4. **Không có đồng ý (consent)** khi thu SĐT — cần theo Nghị định 13/2023/NĐ-CP về bảo vệ dữ liệu cá nhân.
5. Catalog trạng thái lệch: #12 ghi 20% nhưng QR đã dùng nhiều nơi; #54 không ghi trạng thái/tiến độ.

## 3. Chuẩn thị trường (các SaaS cùng chức năng)

| Chức năng | SaaS tham chiếu | Tiêu chuẩn thương mại phổ biến |
|---|---|---|
| QR (#12, #25) | QR Code Generator Pro, Beaconstac/Uniqode, Bitly QR | QR **động** (đổi đích không in lại), logo + khung + màu thương hiệu, xuất SVG/PDF in ấn, thống kê quét theo thời gian/thiết bị/thành phố/**điểm đặt**, UTM tự gắn, quản lý hàng loạt, tắt/hết hạn mã, kiểm độ tương phản quét được |
| Link bán hàng (#13) | Shopify Buy Button/Checkout link, Stripe Payment Links, Haravan/Sapo link sản phẩm | Link ngắn có thương hiệu, chọn phiên bản/số lượng, thanh toán (VietQR/COD), hết hạn, giới hạn tồn kho, ảnh xem trước OG cho Zalo/Facebook, thống kê click→đơn |
| Form lead (#21) | HubSpot Forms, Typeform, Jotform, Getfly/Bitrix24 | Trình dựng form có trường tuỳ biến, chống spam (rate-limit, honeypot, Turnstile), consent rõ ràng, ghi UTM/nguồn, tự tạo khách + **phân công người phụ trách** (round-robin), thông báo tức thì (Zalo/Telegram/email), chống trùng theo SĐT, xuất CSV, nhúng iframe/script, webhook |
| Kết nối kênh (#54) | Buffer, Hootsuite, Sprout Social | OAuth chính thức, hiển thị hạn token + cảnh báo trước khi hết, làm mới tự động, nhật ký đăng thất bại + thử lại có giới hạn, phân quyền ai được kết nối |
| Facebook Ads | Meta Ads Manager, AdEspresso, Madgicx | OAuth Meta (quyền `ads_read`, `ads_management`), chọn ad account, đồng bộ chỉ số (chi tiêu, CPM, CTR, CPL, ROAS) hằng ngày, **Lead Ads webhook → CRM**, Pixel + **Conversions API** (gửi sự kiện đơn hàng server-side, băm SĐT/email SHA-256), Custom Audience từ khách đã đồng ý, App Review của Meta |

Chuẩn "enterprise grade" chung: cách ly tenant (404 khi khác tenant), audit log, mã hoá token khi lưu, giới hạn tốc độ + retry có trần, quan sát (log/metric), xuất/xoá dữ liệu cá nhân, tài liệu bàn giao + runbook.

## 4. Đề xuất nâng cấp (ưu tiên theo giai đoạn)

### P0 — Sửa nền, bắt buộc trước bàn giao (không cần dependency mới)
- **#21**: chuyển lead sang CRM qua use-case `capture-lead` tái dùng `product-inquiry` (tạo/khớp khách theo SĐT + hội thoại kênh `STOREFRONT_CATALOG`), bỏ ghi vào `filters`. Thêm rate-limit theo IP+slug, honeypot, regex `VN_PHONE`, ô consent bắt buộc lưu kèm thời điểm. Test: trùng SĐT, spam, link đã thu hồi → 404.
- Sửa route import infra → use-case.
- Cập nhật trạng thái thật trong `toolkit-catalog.ts`.

### P1 — Đạt chuẩn thương mại (cần PO duyệt schema)
- **Bảng mới** `short_links` (QR/link động: `organization_id`, `code`, `target_url`, `kind` QR|SALES_LINK, `placement_label`, `utm`, `expires_at`, `is_active`) và `link_events` (lượt quét/click, thiết bị, thời điểm; không lưu IP thô — băm). Một route chuyển hướng `/r/[code]` ghi sự kiện rồi redirect.
  - #12: logo giữa mã (EC level `H`), khung + chữ mời, xuất SVG/PDF in, mẫu theo thương hiệu cửa hàng.
  - #25: mỗi "điểm đặt" (quầy, bàn, tờ rơi, xe giao) là một mã động → thống kê theo vị trí, so sánh hiệu quả.
  - #13: link bán hàng 1 sản phẩm: chọn phiên bản, VietQR/COD (tái dùng `chat-order-checkout`), OG preview, hết hạn, thống kê click→đơn.
- **Bảng** `leads` riêng (trạng thái NEW→CONTACTED→WON/LOST, `assignee_id`, `source`, `utm`) + phân công round-robin + thông báo qua module `notification`. Trình dựng form cơ bản (5–8 loại trường), mã nhúng.
- **#54**: hiển thị hạn token, cảnh báo sắp hết hạn, nhật ký đăng lỗi; đánh giá việc phụ thuộc SocialFlow (SLA, nơi lưu token).

### P2 — Kết nối quảng cáo Facebook (cần PO duyệt provider/paid API + Meta App Review)
- Adapter `adapters/meta-marketing` (SDK chỉ trong `adapters/`), token mã hoá bằng `integration/infra/token-crypto.ts`.
- Worker đồng bộ insights hằng ngày (bounded retry, tôn trọng rate-limit của Graph API) → đổ vào `ad-performance-analytics` đã có.
- Lead Ads webhook (xác thực chữ ký `X-Hub-Signature-256`) → cùng luồng `leads` của P1.
- Conversions API: gửi sự kiện `Purchase`/`Lead` server-side, chỉ cho khách đã đồng ý, dữ liệu băm.
- Capability mới (ví dụ nhóm "Quảng cáo": xem chỉ số / kết nối tài khoản quảng cáo) — trần ADMIN cho kết nối.

## 5. Quyết định PO cần đưa ra

1. Duyệt thay đổi `prisma/schema.prisma` (bảng `short_links`, `link_events`, `leads`) cho P1.
2. Captcha: chỉ honeypot + rate-limit (miễn phí) hay thêm Cloudflare Turnstile (dependency/provider mới)?
3. Facebook Ads: tự đăng ký Meta App + App Review (2–6 tuần) hay mở rộng SocialFlow?
4. Tiếp tục phụ thuộc SocialFlow cho #54 hay đưa OAuth Meta về lõi?
