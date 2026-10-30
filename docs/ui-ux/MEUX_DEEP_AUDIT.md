# Audit sâu MEUX/VDLS — mọi trạng thái của công cụ Hoàn thiện

> Bắt đầu 29/10/2026 theo yêu cầu PO "audit sâu để đảm bảo toàn bộ công cụ hoàn thành 100%". Chuẩn: `docs/dac-ta/ux-patterns/page-archetypes.md`, `visual-review.md`, 03c.
> Cách làm: tài khoản mới + **dữ liệu mẫu** (4 sản phẩm có ảnh, 4 phân tích đã duyệt, 2 đơn CONFIRMED giao ngày mai, hồ sơ cửa hàng có hotline/địa chỉ), Playwright đi qua từng bước, ảnh 390px + 1280px, axe (critical/serious, WCAG 2.2 A/AA tags), đo tràn ngang. axe sạch ≠ tuân thủ WCAG đầy đủ; chưa kiểm thủ công bàn phím/zoom/đọc màn hình.

## #08 Tạo landing page — 16 trạng thái

AI: nhập đầu vào, kết quả · Tự chọn: bước 1–4, xuất bản (bước 5) · **trang công khai `/c/<slug>`**. Sau sửa: 16/16 axe sạch, không tràn ngang.

| ID | Mức | Finding | Đã làm |
|---|---|---|---|
| D08-01 | **P0** | Xuất bản luôn gửi slug cố định `campaign-20-10`; slug duy nhất toàn hệ thống (URL `/c/<slug>`) → **chỉ cửa hàng đầu tiên trên hệ thống xuất bản được**, mọi tiệm khác nhận "Không thể xuất bản chiến dịch." | Không gửi slug — server tự sinh slug không trùng; URL dùng slug server trả về. Kiểm thật: 201 + `/c/trao-yeu-thuong-…` |
| D08-02 | **P0** | Trang công khai luôn có 3 **đánh giá 5 sao viết cứng** gắn "đã xác minh" | Bỏ dữ liệu cứng; mục đánh giá chỉ hiện khi có đánh giá thật (hiện chưa có nguồn → ẩn) |
| D08-03 | **P1** | Nội dung mẫu + mẫu trang công khai cam kết thay cửa hàng: "hoàn tiền 100%, 1 đổi 1", "giao 90–120 phút / 2h", "tươi 3–5 ngày", "nhập khẩu Hà Lan, Ecuador", "florist 7 năm", "VAT đầy đủ", "100% ảnh thật" | Câu trung tính, không con số/cam kết khi tiệm chưa khai; chính sách → "liên hệ tiệm" |
| D08-04 | **P1** | Đồng hồ "Ưu đãi đặt sớm 02 : 14 : 35" là chuỗi cố định (khẩn cấp giả) trên trang công khai | Gỡ |
| D08-05 | **P1** | Trang công khai ghi "Tiệm hoa smeOS" (tên nền tảng) thay tên tiệm — nội dung mẫu dựng trước khi hồ sơ tải xong | Màn cha tải hồ sơ trước, truyền `shopName` |
| D08-06 | **P1** | Xuất bản công khai (R3) không có xác nhận; 3 nút "Xuất bản" cùng lúc ở bước 4 | Một nút, qua `ConfirmDialog` (`use-confirm-publish.tsx`) |
| D08-07 | **P1** | 390px: nút chính luồng AI bị cắt chữ ("tích & Tự động thiết") | Xếp chồng trên di động, nút rộng, nhãn ngắn |
| D08-08 | P1 | Lỗi xuất bản đọc `data.message` — API trả `{ error: { message } }` nên lý do thật không bao giờ hiện | Đọc `error.message` |
| D08-09 | P1 | Thẻ "Đã đồng bộ vào AI Chatbot" — không module nào đọc `catalog_links` | Gỡ khẳng định sai |
| D08-10 | P2 | Thanh bước: tương phản thiếu (opacity), nút bước không tên trên di động, thuật ngữ "Archetype/Section/Storytelling" | Bỏ opacity, `aria-label` + `aria-current`, chữ nghiệp vụ |
| D08-11 | P2 | Tên phong cách tiếng Anh (Minimal Luxury, Bento Showcase 2026, Trending…); chip "CHUẨN DUAL-SOURCE"; emoji | Tên tiếng Việt (id giữ nguyên), bỏ chip/emoji |
| D08-12 | P2 | Trang công khai: nút gọi chỉ icon không tên; "Giá niêm yết" mờ thiếu tương phản; chữ preview `/70`, `/80` | `aria-label`, bỏ độ mờ |
| D08-13 | P2 | #09 catalog: thiếu slug thì bịa link `/c/catalog` | Báo lỗi thay vì bịa link |

Test chặn tái phát: `tests/unit/ux/no-fake-progress.test.ts` (slug, xác nhận xuất bản, đánh giá giả, cam kết, đồng hồ giả); `landing-content-generator.test.ts` cập nhật theo câu chữ mới.

**Cần PO quyết (chưa đổi):** nội dung mẫu và prompt AI mặc định ghi **"Giảm 10%"** khi cửa hàng không nhập ưu đãi (`discountPercent ?? 10`) — tức trang công khai hứa giảm giá mà tiệm chưa đặt. Đề xuất: không ưu đãi khi tiệm không nhập.

## #09 Tạo catalog — 20 trạng thái

AI: nhập, chọn phong cách, sẵn sàng, đã xuất bản · **trang công khai** · Tự chọn: bước 1–4 · quản lý. Sau sửa: 20/20 axe sạch, không tràn ngang.

| ID | Mức | Finding | Đã làm |
|---|---|---|---|
| D09-01 | **P1** | Chế độ "AI làm cho tôi" **tự xuất bản link công khai** khi đang dựng — trước khi người dùng xem lại (thẻ chế độ hứa "Bạn kiểm tra và chỉnh trước khi chia sẻ") | Dựng bản xem trước (tải PDF để xem), xuất bản chỉ khi bấm "Xuất bản catalog" + xác nhận |
| D09-02 | **P1** | Luồng tự chọn: xuất bản xong bị đưa về màn chọn chế độ → **không bao giờ thấy link/QR** vừa tạo | Giữ wizard ở bước 4 |
| D09-03 | **P1** | Xuất bản catalog (R3) không xác nhận | `useConfirmPublish` |
| D09-04 | P1 | "Tích hợp Chatbot AI — tư vấn 24/7 bằng catalog này" — không có tích hợp | Gỡ |
| D09-05 | P2 | Mã "T1" hiện làm tên phong cách; tên mẫu/phong cách tiếng Anh ("Signature Collection", "Bento 2026 đang trending"…); trang công khai hiện "EDITORIAL HIGH-FASHION • EDITORIAL MAGAZINE"; khẩu hiệu "smeOS 2026" trên catalog của tiệm | Tên tiếng Việt (id giữ nguyên), `templateDisplayName`, bỏ nhãn kỹ thuật trên trang công khai |
| D09-06 | P2 | Tên catalog "Bộ sưu tập: Mẫu kho: Bó hồng đỏ Ohara..." | Bỏ phần ô nhập tự ghép, chỉ "…" khi cắt |
| D09-07 | P2 | Hai nút chính ở trạng thái kết quả; lưới 4 cột bước 4 làm gãy nút ("Sao chép" bị cắt); "Copy", "(Next Best Actions)" | Một nút chính; lưới 2 cột; chữ tiếng Việt |
| D09-08 | P2 | Chấm chuyển trang xem trước 8px (WCAG 2.5.8 target-size); ô link chỉ đọc không nhãn | Vùng nhấn 24px + `aria-current`; `aria-label` |

## #05 Poster & banner — 12 trạng thái + kiểm ảnh xuất

Đã tải ảnh, đã tạo, tùy biến chi tiết, kho mẫu, xem phóng to, menu `…` (390/1280px) + tải thật 2 định dạng. Sau sửa: 12/12 axe sạch; ảnh xuất đo được **1080×1080** và **1920×1080**.

| ID | Mức | Finding | Đã làm |
|---|---|---|---|
| D05-01 | **P1** | Ảnh tải về chụp khung xem trước ×2 (~440–680px) trong khi nhãn ghi "1080 × 1080 px", "1920 × 1080 px" | Dựng ở bề rộng thiết kế cố định (`ScaledFrame`), xuất với `pixelRatio` theo kích thước đích (A4: 1240px) |
| D05-02 | **P1** | Chữ trên ấn phẩm bị cắt: tên tiệm, tiêu đề, **hotline "0283 555 …"**, địa chỉ; banner 16:9 mất tiêu đề và nút | Bố cục cố định không phụ thuộc cột; dòng liên hệ không cắt; tiêu đề 2 dòng; 16:9 chiếm hai cột |
| D05-03 | **P1** | Ưu đãi/thời hạn tự in lên ấn phẩm khi tiệm chưa nhập ("Tặng kèm băng rôn", "GIẢM ĐẾN 50%", "Chỉ áp dụng trong hôm nay", "hàng trăm quà tặng độc quyền", "✦ TUYỂN CHỌN ĐẶC QUYỀN ✦") | Ưu đãi/thời hạn rỗng tới khi người dùng nhập (mẫu trong kho người dùng chủ động chọn vẫn giữ); bỏ khẩu hiệu cố định |
| D05-04 | P2 | Nhãn trường "(Headline)", "(Subheadline)", "Badge", "(CTA)"; emoji 📞 trên ấn phẩm | Chữ tiếng Việt |

Còn mở (đề xuất PO): ảnh minh họa trong kho mẫu là ảnh stock máy ảnh/tai nghe/đồng hồ (Unsplash) — lệch ngành hoa, và là tài nguyên ngoài. Luồng "AI vẽ bố cục mới" có thể tự đề xuất ưu đãi trong nội dung AI — chưa có kiểm tra sự thật như landing.

## #01 Ảnh sản phẩm, #02 Bộ ảnh — 8 trạng thái (+ gửi job)

Đã chọn ảnh, mở tùy chọn (390/1280px), gửi tạo. Không có AI thật ở môi trường kiểm → không xem được ảnh kết quả; trạng thái sau gửi hiện đúng "Đã chờ N giây" (không tiến độ giả), mở lại trang khôi phục job đang chạy và khóa nút gửi. 8/8 axe sạch.

| ID | Mức | Finding | Đã làm |
|---|---|---|---|
| D01-01 | P2 | Lựa chọn phông nền/tỉ lệ/gói bộ ảnh chỉ phân biệt bằng màu viền, không `aria-pressed` | `aria-pressed` + dấu ✓ |

## #04 Nội dung bán hàng — 8 trạng thái

Chọn sản phẩm, kết quả bài viết (AI không chạy → nội dung mẫu), tab tải ảnh, hộp giọng văn. Sau sửa: 8/8 axe sạch.

| ID | Mức | Finding | Đã làm |
|---|---|---|---|
| D04-01 | **P1** | Đọc sai hợp đồng `GET /api/v1/products` (`master_image_url`, `pricing.selling_price`; API trả `masterImageUrl`, `price_vnd`) → ảnh và giá sản phẩm không bao giờ có | Đọc đúng trường; xem trước hiện ảnh thật |
| D04-02 | **P1** | Khi AI không chạy: "🛡️ Offline Fallback" + "Điểm duyệt Critic: 0.0/10"; khi chạy: tên model/"GPU Metal" | Một dòng "AI chưa chạy được — đang dùng nội dung mẫu, nên chỉnh lại trước khi đăng"; điểm chất lượng chỉ khi có AI |
| D04-03 | P2 | Xem trước bài đăng: "128" lượt thích, "16 bình luận • 5 chia sẻ", dấu xác minh, tên "Cửa hàng trực tuyến"; 7 nút giả bấm không làm gì | Bỏ số liệu/dấu giả; tên tiệm thật; nút minh họa thành `span` trang trí |
| D04-04 | P2 | Ô tải ảnh `role=button` lồng nút khác; cảnh báo thiếu tương phản + emoji; khung cuộn giọng văn không focus được; "AI Vision", "Social Publishing", "Copy nhanh Zalo", emoji kênh | Sửa tương ứng |

## #03 Thẻ chào / tư vấn khách (`/tai-anh`) — 12 trạng thái

4 tab (Nhận diện ảnh, Bài giới thiệu, Tư vấn khách, Kho ảnh) + đã chọn ảnh + mở một mẫu đã duyệt. Sau sửa: 12/12 axe sạch.

| ID | Mức | Finding | Đã làm |
|---|---|---|---|
| D03-01 | **P1** | Thẻ chào **gửi khách** in quà tặng/cam kết "mặc định hệ thống" tiệm chưa hề khai: "nước dưỡng Chrysal", "thiệp/banner", "100% hàng mới nhập", "giao 60–90 phút", "bảo hành đổi mới", "giấy gói Hàn Quốc" — cả trên thẻ A6 và kịch bản Zalo | Mặc định rỗng; mục quà tặng/cam kết/quy cách/kích thước chỉ hiện khi tiệm khai |
| D03-02 | **P1** | Chọn mẫu đã duyệt → thẻ ghi "Sản phẩm thiết kế cao cấp" thay tên thật, không mã SP; dùng `raw` bỏ qua bản người dùng đã sửa (`edited`) | Dùng `edited ?? raw` + tên/mã sản phẩm thật |
| D03-03 | **P1** | Lỗi lộ mã nội bộ "Cổng AI không chạy được: HET_DUONG_DU_PHONG" (3 use-case) | "AI chưa chạy được lúc này — hãy thử lại sau ít phút" |
| D03-04 | P2 | Giá trống hiện "—"; kích thước "~ × cm" | "Liên hệ để báo giá"; ẩn kích thước khi chưa có |
| D03-05 | P2 | Thẻ phân tích và ô tải ảnh `role=button` lồng nút; tiêu đề `text-accent` và hộp lỗi thiếu tương phản | Một điều khiển; token đạt tương phản |

Ngoài phạm vi (đề xuất task riêng): `text-accent` dùng làm chữ ở ~35 nơi khác ngoài công cụ Hoàn thiện, cùng lỗi tương phản 2,25:1 — cần token chữ riêng, PO duyệt.

## #49 Xu hướng thị trường — 10 trạng thái

Quét từ khóa (trống, đang chạy), cài đặt lịch quét, tiêu chí vĩ mô, làm mới. Sau sửa: axe sạch ở mọi trạng thái của công cụ.

| ID | Mức | Finding | Đã làm |
|---|---|---|---|
| D49-01 | P1 | 6 ô nhập/thanh trượt/select trong "Tiêu chí vĩ mô" và 2 ô giờ + 2 checkbox lịch quét không có nhãn truy cập; checkbox 16px (target-size) | `aria-label`; checkbox 24px |
| D49-02 | P2 | `text-cool-400` (71 chỗ) và tab con thiếu tương phản; "Khung giờ chạy cron" | Token `text-text-muted`/`text-primary`; "Giờ quét tự động" |

Ghi chú: nút "Cài Đặt & Biểu Mẫu" mở `/cai-dat` (hồ sơ cửa hàng) — trang đó còn 8 lỗi tương phản + 2 ô thiếu nhãn, thuộc nhóm Cài đặt của đợt rollout sau.

## #14 Thẻ chào & catalog nhanh — `/the-chao?quick=true`

Trạng thái kiểm: mở, lọc, tạo link (hộp thoại), sau khi đóng, trang khách.

| ID | Mức | Finding | Đã làm |
|---|---|---|---|
| D14-01 | P1 | Ô link chỉ đọc và ô lời nhắn trong hộp chia sẻ không có nhãn | `aria-label` |
| D14-02 | P1 | Admin thanh toán brochure dùng `role="tab"` nhưng không có tabpanel | Nhóm nút `aria-pressed` |
| D14-03 | P2 | Tên 20 mẫu giao diện bằng tiếng Anh ("Editorial Luxury"…) | Tên tiếng Việt (`greeting-template-catalog.ts`) |
| D14-04 | P2 | Nhãn mã kỹ thuật "#01…#12" trên thẻ mẫu (chữ 7px, tương phản thấp) | Bỏ nhãn |
| D14-05 | P2 | Chấm chọn sản phẩm 6px, nút trước/sau 24px sát nhau (target-size) | Vùng bấm 24px cho chấm; nút 32px ở di động |
| D14-07 | P2 | Nút "Làm mới" bị co trong hàng nút ở 390px sau khi đóng hộp chia sẻ (target-size, phát hiện bằng `npm run ux:audit -- the-chao`) | `shrink-0`; kịch bản `the-chao` là kiểm tra hồi quy |
| D14-06 | P1 | Khối chưa tới lượt (`opacity-60`, chuẩn Spotlight PO 23/10) làm chữ dưới 4,5:1 — axe 27–39 lỗi | **Chưa sửa — cần PO** (chuẩn Spotlight bị khóa trong Screen Contract) |

## #31–#35 Giá vốn & định giá — `/tinh-gia/*`

Trạng thái kiểm: 5 tab ở 390/1280px, chọn mẫu → bản nháp công thức từ ảnh, dự toán có đơn chưa có công thức.

| ID | Mức | Finding | Đã làm |
|---|---|---|---|
| D31-01 | P1 | Hộp cảnh báo `text-warning` trên `bg-warning-bg` dưới 4,5:1 (dự toán, giá vốn, nguyên liệu, công thức, đề xuất sản phẩm) | `text-warning-text` |

Ghi chú (chưa đổi, cần PO): dự toán khi mọi đơn đều chưa có công thức vẫn hiện "Tồn kho đã đủ cho các đơn này" — dễ hiểu nhầm.

## #11 · #51 · #64 Module Thương hiệu — `/ho-so`, `/ho-so/danh-thiep`, `/ch/:slug` (30/10/2026)

Kịch bản `scripts/ux-audit/scenarios/thuong-hieu.mjs`. Trạng thái kiểm ở 390/1280px: hồ sơ trống, danh thiếp khi hồ sơ chưa đủ, hồ sơ đủ, hộp xác nhận tạo link, đã có link, trang khách xem, danh thiếp, tải thật 4 tệp (PDF/PNG/PNG/vCF), hộp xác nhận ngừng, link đã ngừng, link sai.

| ID | Mức | Finding | Đã làm |
|---|---|---|---|
| D11-01 | P1 | Trang khách: `<dl>` bọc `dt/dd` trong `div` lồng hai cấp — axe `definition-list`, `dlitem` | Mỗi cặp là `div > dt + dd`, icon nằm trong `dt` kèm nhãn ẩn |
| D64-01 | P1 | Danh thiếp 390px cuộn ngang 1081px — ô lưới giữ bề rộng thẻ in 1063px | `min-w-0` cho khung xem trước, lưới một cột trên di động |
| D64-02 | P2 | PDF in nặng 4 MB do ảnh không nén | Nén ảnh khi ghép PDF: còn ≈106 KB |

Kiểm lại: 23/24 trạng thái sạch. Còn lại (cần PO, không sửa ở đây): nút xác nhận tông `danger` của `ConfirmDialog` dùng chung — chữ trắng trên nền đỏ dưới 4,5:1 ở 390px (`thuong-hieu-xac-nhan-ngung`); đụng token/biến thể nút dùng toàn app.
Chưa kiểm thủ công: bàn phím, phóng to 200%, trình đọc màn hình; logo từ kho lưu trữ thật (ở audit dùng ảnh cùng nguồn) — nếu kho chặn CORS, danh thiếp xuất không logo và báo cho người dùng.

## #45 Bộ nhận diện thương hiệu — `/ho-so/thu-vien-thuong-hieu` (30/10/2026)

Kịch bản `scripts/ux-audit/scenarios/thu-vien-thuong-hieu.mjs`. Trạng thái kiểm ở 390/1280px: trống, hộp thêm, có tài nguyên + mục đã lưu trữ, hộp phiên bản mới, chế độ chuỗi (hộp xác nhận chia sẻ, nhãn "Đang chia sẻ"). Khối "Từ chuỗi" phía cửa hàng thành viên kiểm bằng `tests/tenant/brand-library.test.ts`, chưa chụp ảnh.

| ID | Mức | Finding | Đã làm |
|---|---|---|---|
| D45-01 | P1 | Ô chọn tệp hiện chữ mặc định tiếng Anh của trình duyệt ("Choose File") | Ẩn ô gốc, nhãn "Chọn ảnh" + tên tệp đã chọn, có viền khi nhận phím |

Kiểm lại: 10/12 sạch. Còn lại ngoài phạm vi: số đếm `0/5` (`text-text-muted/60`) trên thanh lối tắt công cụ ở chế độ chuỗi dưới 4,5:1 — `toolkit-shortcuts-group.tsx` / `toolkit-picker.tsx`, có từ trước.
Chưa kiểm thủ công: bàn phím, phóng to 200%, trình đọc màn hình; tải ảnh thật lên kho (audit chỉ dùng loại văn bản).

## Kết luận
Đã audit sâu xong toàn bộ công cụ Hoàn thiện.

### PO quyết 29/10/2026 — đã làm
| Mục | Đã làm |
|---|---|
| D14-06 Spotlight | Khối chưa chọn không còn `opacity-60`: chỉ nền trong suốt + viền nhạt, chữ giữ tương phản; Screen Contract `the-chao.md` cập nhật. axe `/the-chao` 0 lỗi ở mọi trạng thái |
| Ưu đãi landing page | Bỏ mặc định "Giảm 10%": % giảm lấy ở máy chủ từ ưu đãi tiệm đang bật (`listActiveShopPromotions`), không nhận từ trình duyệt; không bật → khối đăng ký không hứa giảm giá, prompt cấm tự đặt ưu đãi |
| Ảnh kho poster | Bỏ ảnh Unsplash và nút "ảnh mẫu demo"; ô xem trước dùng ảnh sản phẩm tiệm đã chọn |
| Ưu đãi poster | AI và mẫu chỉ in ưu đãi tiệm đang bật (`enforceShopPromotion`); ô "Ưu đãi của tiệm" là danh sách chọn + link Cài đặt; bỏ ưu đãi/thời hạn soạn sẵn trong kho mẫu |
| Dự toán | Không còn báo "Tồn kho đã đủ" khi các mẫu chưa có công thức (`noPurchaseMessage`) |

### Còn lưu lại
- `/cai-dat`: 8 lỗi tương phản + 2 ô thiếu nhãn — làm ở đợt rollout nhóm Cài đặt (PO 29/10/2026).
- Hồ sơ tiệm chưa lưu chính sách thì bộ ưu đãi mặc định (gồm "Giảm 10%") được coi là đang bật — tiệm tắt trong Cài đặt → Ưu đãi.
- Ngoài phạm vi: `generate-banner-copy` gọi LLM trực tiếp, chưa qua `callCapability`.

## /van-hanh/suc-khoe — Sức khoẻ hệ thống (30/10/2026, ROADMAP E1.6)

Kịch bản `scripts/ux-audit/scenarios/suc-khoe.mjs` (hàng đợi rỗng; có việc chờ + lỗi), 390/1280px, axe sạch, không cuộn ngang.

| ID | Mức | Finding | Đã làm |
|---|---|---|---|
| SK-01 | P2 | Không thấy được worker nào đang chạy, hàng đợi từng loại việc dài bao nhiêu | Thêm khối "Bộ xử lý nền" và bảng "Hàng đợi theo loại việc" (tên tiếng Việt, `<th scope>`, cuộn ngang trong thẻ ở 390px) |
| SK-02 | P2 | Khối "Job theo trạng thái" (có từ trước) hiện mã `FAILED`, `PENDING` | Chưa sửa — ngoài phạm vi E1.6 |

Chưa kiểm: bàn phím, zoom 200%, đọc màn hình.

## /van-hanh/hang-doi-loi — Hàng đợi lỗi (30/10/2026, ROADMAP E5.2)

Kịch bản `scripts/ux-audit/scenarios/hang-doi-loi.mjs` (rỗng; có 2 job lỗi; hộp xác nhận chạy lại), 390/1280px, axe sạch, không cuộn ngang.

| ID | Mức | Finding | Đã làm |
|---|---|---|---|
| HDL-01 | P2 | Câu trạng thái rỗng khẳng định "mọi việc đều đã tự chạy lại thành công" — không kiểm chứng được | Đổi thành mô tả trung tính khi nào việc hiện ở đây |
| HDL-02 | P3 | Thanh bên tô "Tổng quan nền tảng" vì trang chưa có mục menu | Chưa sửa — thêm mục menu là shell khoá, cần PO |

Chưa kiểm: bàn phím, zoom 200%, đọc màn hình.

