# Nguyên tắc vận hành UX — Progressive Disclosure

> Level 3 SUPPORTING · `CANONICAL` cho agent (PO 29/10/2026, PD8) · nạp qua `CLAUDE.md`.
 Mọi màn/công cụ mới hoặc sửa giao diện **phải** theo cơ chế dưới đây. Đây là bản tóm tắt bắt buộc; luật đầy đủ ở SSOT, khi lệch thì SSOT thắng:
`docs/dac-ta/03a-ux-constitution.md` · `docs/dac-ta/03c-ux-progressive-disclosure.md` (PD1–PD8, UX-015…UX-028, DoD §9) · `docs/dac-ta/ux-patterns/` (UX-P01…P12, `page-archetypes.md`, `visual-review.md`) · nhật ký audit `docs/ui-ux/MEUX_DEEP_AUDIT.md`.

## 1. Cơ chế (làm theo thứ tự)
1. **Phân loại trang** theo archetype A–F (`page-archetypes.md`) và khai trong Screen Contract.
2. **Phân tầng** mọi trường/nút theo L0–L4 + SYS (03a UX-003, 03c §2): L0 việc chính luôn thấy; tùy chọn ít dùng vào `Disclosure` (UX-P03); phần hệ thống tự làm (SYS) không hỏi người dùng.
3. **Chọn đúng cách hiển thị thêm** (03c §5b): Disclosure / Drawer / Modal / Tab / Wizard / Tooltip — không wizard cho việc làm xong trong một màn, không tooltip cho thông tin bắt buộc.
4. **Không dùng disclosure để giấu** (UX-017): lỗi, chi phí, điều kiện, rủi ro, quyền luôn hiện.
5. **Trường theo ngữ cảnh** (UX-027): chỉ hiện cấu hình của chế độ đang chọn; đổi chế độ giữ dữ liệu đã nhập.
6. **Mức rủi ro hành động** (UX-015): R3 (xuất bản link công khai, xoá, gửi khách) qua `ConfirmDialog` (`useConfirmPublish` cho link); R2 có hoàn tác hoặc xem trước chi phí.
7. **Tác vụ nền** (UX-016): trạng thái lấy từ backend qua `TaskStatus` + `task-state.ts`, không giả lập tiến trình.
8. **Dùng component chuẩn**, không tự viết: `FeatureGuidanceCard` (K1), `TabActionHeader` (K2), `EmptyState`, `InlineError` (có thử lại), `ResultPanel`, `ConfirmDialog`. K1/K2/shell là UX khoá — đổi phải PO duyệt.

## 2. Nguyên tắc nội dung (bài học audit sâu 29/10/2026)
- **Không dữ liệu giả** trên bề mặt khách thấy: không đánh giá/sao/lượt thích bịa, không cam kết (giao 2h, tươi 5 ngày, 100%…), không đồng hồ đếm ngược, không số điện thoại/địa chỉ mẫu, không ảnh kho (Unsplash) thay ảnh sản phẩm. Thiếu dữ liệu thật → ẩn khối hoặc nhắc người dùng nhập.
- **Ưu đãi chỉ từ Cài đặt → Ưu đãi** (ưu đãi đang bật, đọc ở máy chủ qua `listActiveShopPromotions`). Không mặc định %, AI không tự đặt ưu đãi/thời hạn, không nhận % từ trình duyệt.
- **Thông tin tiệm** (tên, hotline, địa chỉ, logo) lấy từ Hồ sơ tiệm; sản phẩm/giá/ảnh lấy từ dữ liệu sản phẩm thật.
- **Không tự xuất bản**: AI soạn xong → người dùng xem trước → xác nhận mới tạo link.
- **Chữ tiếng Việt tự nhiên**; không mã kỹ thuật (`#01`, `M01a`, tên model AI, "Fallback", "Critic") hay tên mẫu tiếng Anh trên màn hình.
- Ảnh/tệp xuất ra **đúng kích thước ghi trên nhãn**.

## 3. Trợ năng & thị giác (bắt buộc, không chỉ "đẹp")
- Tương phản chữ ≥ 4,5:1: dùng token `*-text` (`text-warning-text`, `text-danger-text`, `text-accent-text`…), không dùng `opacity` lên chữ (kể cả Spotlight), không `text-accent`/`text-warning` trên nền nhạt.
- Mọi ô nhập/nút có nhãn truy cập; vùng bấm ≥ 24px (di động ưu tiên 32–44px); nhóm nút chọn dùng `aria-pressed`, chỉ dùng `role="tab"` khi có tabpanel; không lồng nút trong nút.
- Không cuộn ngang ở 390px; kiểm cả 390px và 1280px.

## 4. Kiểm chứng trước khi báo xong
- Audit **mọi trạng thái**: rỗng, có dữ liệu, đang chạy, có kết quả, lỗi, hộp thoại mở/đóng, trang khách xem — chụp 390/1280px + axe (critical/serious = 0) + soát nội dung giả/ưu đãi/mã kỹ thuật.
- Gate: `npm run lint:ux -- --check` (ratchet, không tăng R1–R16), typecheck, `npm test`, `check:docs`; ghi kết quả vào nhật ký audit. axe sạch **không** đồng nghĩa đạt WCAG — ghi rõ phần kiểm thủ công chưa làm.
- Finding mức P0/P1 phải sửa trước khi báo xong; đụng UX khoá/token/quy tắc nghiệp vụ → hỏi PO, ghi vào mục "Cần PO quyết".
