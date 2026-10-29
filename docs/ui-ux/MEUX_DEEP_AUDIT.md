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

## Tiếp theo
#09 catalog → #05 poster (tùy biến, kho mẫu, xem phóng to) → #01/#02 (sau khi chọn ảnh, kết quả) → #04 → #03 (4 tab) → #49 → #14 → #31–#35.
