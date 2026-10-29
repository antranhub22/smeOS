# Screen Contract — Tạo landing page cửa hàng

**Tuyến:** `/landing-page` · **Tệp chính:** `src/components/landing-page/landing-page-studio-client.tsx`, `src/components/catalog/landing-campaign-tab.tsx` · **Cập nhật:** 29/10/2026 · **Thẻ:** công cụ #08 chuyển Hoàn thiện (PO 29/10/2026)

## 1. Vai và mục đích
- Vai chính: chủ tiệm, marketing · Phạm vi: organization · Mật độ: MEDIUM · Archetype: **E — Builder** (`ux-patterns/page-archetypes.md`)
- Việc chính: tạo trang giới thiệu/chiến dịch có link chia sẻ và QR
- Câu hỏi chính: "Trang của tôi đã xuất bản và gửi khách được chưa?"

## 2. Hiện trạng (audit) và thay đổi
- API: `POST /api/v1/content-engine/landing-generate` (soạn nội dung) · `POST /api/v1/catalog-links` → `J1` (xuất bản)
- Đã sửa: luồng "AI làm cho tôi" có 2 bước "Phân tích thị giác / Tối ưu chất lượng ảnh" tự chuyển "xong" sau 0,9 s/0,7 s mà không có lời gọi nào (03c UX-016) → bỏ; AI lỗi thì dùng nội dung mẫu **và báo rõ** (UX-017); bỏ "Công cụ 08", "Bản chuẩn v3", "Landing Page Studio", "Hub"; tiêu đề trang thành `<h1>`.
- Xuất bản: chỉ báo đã xuất bản khi `POST /catalog-links` trả thành công (đã đúng từ trước).

## 3. Thứ bậc thông tin
| Lớp | Nội dung |
|---|---|
| L0 | Mục đích trang, chế độ "AI làm cho tôi" / "Tự chọn từng bước" |
| L1 | Nút chọn chế độ; xuất bản ở bước cuối |
| L2 | Dịp, sản phẩm, phong cách, các mục bật/tắt |
| L3 | Tiêu đề, ảnh hero, video, nội dung từng mục |
| SYS | Soạn nội dung, tạo slug, lưu cấu hình |

## 15. Progressive disclosure & rủi ro (03c)
Pattern: UX-P01 (đầu vào → tạo), UX-P02, UX-P05, UX-P06. Rủi ro: soạn nội dung R2 (AI), **xuất bản công khai R3** (link khách xem được). axe 390px: 0 lỗi (`tests/e2e/ux/a11y-done-tools.spec.ts`). Test bước giả: `tests/unit/ux/no-fake-progress.test.ts`.

Trường theo ngữ cảnh (03c §5c, pilot MEUX 29/10/2026):
| Trường/nhóm | Hiện khi | Khóa khi | Mặc định | Khi điều kiện đổi |
|---|---|---|---|---|
| Mục đích trang (radio) | Luôn | — | Trang giới thiệu cửa hàng | Đổi bất kỳ lúc nào trước khi soạn; giá trị gửi kèm lần soạn kế tiếp (`pageType`) |
| Đầu vào AI (ảnh, video, ghi chú) | Chế độ "AI làm cho tôi" | Đang soạn | Trống | Chuyển sang "Tự chọn từng bước": ghi chú/video giữ nguyên — hai chế độ dùng chung state của `LandingCampaignTab`, không có lệnh xóa (đọc mã; chưa có E2E) |
Review thị giác: `docs/ui-ux/MEUX_PILOT_LANDING_PAGE.md` §7.
