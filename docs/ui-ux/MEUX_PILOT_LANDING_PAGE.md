# Pilot MEUX/VDLS — `/landing-page` (Phase 5)

> Trạng thái: **ĐỀ XUẤT — chờ PO duyệt pilot** · 29/10/2026 · Chuẩn: `docs/dac-ta/ux-patterns/page-archetypes.md` (UX-028), `visual-review.md`, 03c §5c (UX-027)
> Ảnh trước: `meux-pilot/lp-before-390.png`, `meux-pilot/lp-before-1280.png` (tài khoản mới, chưa có sản phẩm). axe (WCAG 2.2 A/AA tags) ở cả 2 khổ: 0 lỗi — **không phải bằng chứng tuân thủ WCAG đầy đủ**; chưa kiểm thủ công bàn phím/zoom.

## 1. Phân loại

Archetype **E — Builder** (đầu vào → AI soạn → xem trước → xuất bản). Việc chính: "tạo trang có link + QR để gửi khách". Tệp: `src/components/landing-page/landing-page-studio-client.tsx` (152 dòng), `landing-type-selector.tsx`, `landing-guidance-card.tsx`, `src/components/catalog/landing-campaign-tab.tsx` (409 dòng — đã vượt 350, không được làm dài thêm).

## 2. Findings

| ID | Mã | Bằng chứng | Tác động | Mức | Đề xuất |
|---|---|---|---|---|---|
| LP-01 | CU-01 / IA-01 | `pageType` chọn ở `LandingTypeSelector` **không truyền đi đâu** (`LandingCampaignTab` chỉ nhận `products`, `onRefresh`); chọn loại nào kết quả cũng như nhau | Điều khiển giả — người dùng tưởng đã chọn mục đích trang | **P1** | **Cần PO chọn:** (a) nối `pageType` vào lời gọi soạn nội dung (`prompt-builder.ts` đã có tham số `pageType`) — đổi hành vi AI; hoặc (b) gỡ bộ chọn cho tới khi nối được |
| LP-02 | VD-03 / VH-01 | Viewport đầu (1280px) có 3 vùng cạnh tranh: khối giới thiệu, 4 thẻ loại trang, khối "Bạn muốn smeOS thực hiện như thế nào?" với 2 nút "Chọn chế độ này" — hành động chính nằm dưới nếp gấp; 390px phải cuộn ~1.000px mới tới | Chậm tìm việc chính | P2 | Đưa lựa chọn chế độ (AI / tự chọn) lên đầu; loại trang thành một hàng chọn gọn (segmented) cạnh nó |
| LP-03 | ID-01 / K1 | `LandingGuidanceCard` tự viết (không phải `FeatureGuidanceCard`), luôn mở, 3 dòng mô tả + 3 dấu tick lặp nội dung các thẻ bên dưới | Text wall (03a §43), lệch K1 (khối hướng dẫn phải là `FeatureGuidanceCard`, tự thu gọn) | P2 | Thay bằng `FeatureGuidanceCard` (đúng K1 — không đổi UX khóa, chỉ dùng đúng component) |
| LP-04 | ID-01 | 3 lớp tiêu đề cho cùng một ý: h1 "Tạo landing page cửa hàng" · nhãn "CHỌN MỤC ĐÍCH TRANG LANDING PAGE" · chip "TẠO LANDING PAGE CHIẾN DỊCH" + h2 | Lặp, nhiễu | P2 | Giữ h1 + một tiêu đề bước |
| LP-05 | VD-02 | Thẻ chế độ: icon lớn + emoji ⚡/🛠️ + 2 dòng tick + viền + nền; 4 thẻ loại trang có icon riêng | Trang trí dư | P3 | Bỏ emoji, giữ một icon; tick gộp thành một dòng mô tả |
| LP-06 | CO-01 / ST-01 | Lỗi tải hiện bằng `div` + emoji "⚠️" thay vì `InlineError` (không có nút thử lại) | Lỗi không khôi phục được | P2 | Dùng `InlineError` với `onRetry` |
| LP-07 | CO-01 | Cỡ chữ `text-xs/sm/base` thay vì token (`text-caption/body-sm/title`) | Lệch thang 03a §0.5 | P3 | Đổi sang token (không ảnh hưởng lint R2 hiện tại) |
| LP-08 | RESP-01 | 390px: header 3 cột ép "Về Công cụ" và "Thẻ chào & QR" xuống 3 dòng | Header vỡ dòng | P2 | Di động: nút "Về" chỉ icon có `aria-label`; "Thẻ chào & QR" vào menu `…` (K2) |

## 3. Chấm checklist (trước)

Rõ việc 1 · Phân cấp 1 · Mật độ 1 · Nhiễu 0 · Điều hướng 1 (header riêng của trang, không dùng `TabActionHeader`) · Hành động chính 0 · Theo ngữ cảnh 0 (LP-01) · Tìm thấy 2 · Trợ năng 1 (axe sạch, chưa kiểm thủ công) · Responsive 1 · Toàn vẹn nghiệp vụ 1 (LP-01).

## 4. Cấu trúc đề xuất (wireframe)

```
[h1 Tạo landing page cửa hàng]                      [Thẻ chào & QR] (…)
[FeatureGuidanceCard — tự thu gọn]
Mục đích trang: (• Cửa hàng) ( Chuỗi ) ( Chiến dịch ) ( Dịch vụ )   ← chỉ khi LP-01 = (a)
Cách tạo:  [ AI làm cho tôi — Nhanh nhất ]  [ Tự chọn từng bước ]   ← 1 nút chính
──────── bước tiếp theo của LandingCampaignTab (giữ nguyên) ────────
```

Không đổi API, schema, quyền, luồng xuất bản (R3) hay `LandingCampaignTab` (đã vượt 350 dòng). Đổi chế độ giữ dữ liệu đã nhập (UX-027) — bảng điều kiện hiển thị sẽ thêm vào Screen Contract khi làm.

## 5. Kế hoạch kiểm thử & rollback

Unit: test nối `pageType` (nếu chọn a) hoặc test không còn bộ chọn (b) · axe 390/1280px trong `a11y-done-tools.spec.ts` (đã có) · ảnh sau cùng viewport/dữ liệu để chấm lại checklist · `lint:ux --check`, typecheck, `npm test`. Rollback: một commit riêng, revert được.

## 6. Cần PO quyết

1. **LP-01:** (a) nối loại trang vào AI — đổi nội dung AI soạn; hay (b) gỡ bộ chọn?
2. Cho làm LP-02…LP-08 như wireframe trên?
3. Sau pilot: áp archetype/visual-review theo module nào trước? Đề xuất: nhóm Builder (anh-san-pham, bo-anh-san-pham, poster-banner, the-chao) → Danh sách → Cài đặt.
