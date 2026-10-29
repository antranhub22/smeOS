# Screen Contract — Tạo poster và banner quảng cáo

**Tuyến:** `/cong-cu/poster-banner` · **Tệp chính:** `src/components/ad-banner-poster/poster-banner-client.tsx` · **Cập nhật:** 29/10/2026 · **Thẻ:** PD đợt A-1

## 1. Vai và mục đích
- Vai chính: chủ tiệm, marketing · Phạm vi: organization · Mật độ: MEDIUM
- Việc chính: tạo bộ ấn phẩm quảng cáo nhiều kích thước từ một nội dung

## 2. Hiện trạng (audit) và thay đổi đợt A-1
- Đợt A-1 chỉ sửa trợ năng và câu chữ, **không đổi luồng** → không cần cờ (`ux_pd_poster_banner` để dành cho lần đổi luồng sau).
- Sửa: token `--color-primary-foreground` chưa từng được khai báo → chữ tối trên nền đỏ đô 1,75:1 (A16; sửa ở `globals.css`, có lợi cho 19 tệp); `<select>` dịp cụ thể thiếu nhãn; hai nút chọn phương án thêm `aria-pressed`; bỏ "AI Provider Single-Call"; trang thiếu `<h1>` → thêm tiêu đề `sr-only` (giữ nguyên Tab Action Header, PO khoá).
- Kết quả: axe 0 lỗi critical/serious ở 390px (`tests/e2e/ux/a11y-done-tools.spec.ts`).

## 15. Progressive disclosure & rủi ro (03c)
Pattern hiện có: biểu mẫu 3 bước (UX-P02) + xem trước nhiều kích thước (UX-P05). Rủi ro: R1–R2. Ngoại lệ: không.
Việc còn lại (đổi luồng, sau khi có số đo pilot): `TaskStatus` cho lượt tạo AI, `CostPreview` cạnh nút tạo.
