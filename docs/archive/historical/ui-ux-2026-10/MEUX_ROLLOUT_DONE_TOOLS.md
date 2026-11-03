# Áp MEUX/VDLS cho công cụ Hoàn thiện — đợt 1 (29/10/2026)

> PO duyệt thứ tự: Builder → Danh sách → Cài đặt (`MEUX_PILOT_LANDING_PAGE.md` §6.3). Chuẩn: `docs/dac-ta/ux-patterns/page-archetypes.md`, `visual-review.md`, 03c §5c.
> Cách kiểm: ảnh 390px + 1280px trước/sau cùng tài khoản mới, axe (critical/serious, WCAG 2.2 A/AA tags). axe sạch ≠ tuân thủ WCAG đầy đủ; chưa kiểm thủ công bàn phím/zoom.

| # | Màn | Archetype | Findings | Mức | Đã làm |
|---|---|---|---|---|---|
| 01 | `/cong-cu/anh-san-pham` | E | Đã gọn từ đợt PD (một h1, hướng dẫn thu gọn, vùng tải là việc chính) | — | Không đổi |
| 02 | `/cong-cu/bo-anh-san-pham` | E | Như #01 | — | Không đổi |
| 05 | `/cong-cu/poster-banner` | E | Ảnh Unsplash cài sẵn báo "Đã nạp ảnh thành công"; hotline "0901 234 567" + địa chỉ "123 Đường Trung Tâm" cài sẵn → **ấn phẩm tải về mang thông tin giả**; "Lưu mẫu chuỗi" báo đã lưu nhưng không lưu gì; chọn mẫu gán ảnh mẫu làm ảnh sản phẩm | **P0** | Ảnh rỗng tới khi người dùng tải (ảnh demo chỉ khi bấm "Dùng thử ảnh mẫu demo"); tên/hotline/địa chỉ từ hồ sơ cửa hàng (`useTenantProfile`); gỡ nút lưu giả; test chặn tái phát (`no-fake-progress.test.ts`) |
| 05 | — | E | Thẻ phong cách cắt chữ ("Hiện đ…"); lưới xem trước 3 cột quá hẹp (nút gãy 2 dòng); emoji, nút IN HOA "(1-CHẠM)" | P2 | Lưới 3 cột thẻ phong cách, `line-clamp-2`; xem trước 2 cột; bỏ emoji/in hoa |
| 05 | — | E | 390px tràn ngang (trang rộng 554px): cụm nút `TabActionHeader` không đủ chỗ | P1 | "Kho Template" vào menu `…` (vẫn có liên kết trong form) — hết tràn; không sửa component dùng chung |
| 03 | `/tai-anh?tab=m01c` | B | Trạng thái rỗng chỉ tới tab "Phân tích ảnh mới" — tab thật tên "Nhận diện ảnh"; "Product Master" lộ trên màn | P2 | Sửa chữ đúng tên tab; "kho sản phẩm" |
| 03 | — | — | Huy hiệu "Kịch bản" trong `TabActionHeader` tương phản 2,25:1 (cần 4,5:1) | P1 | PO duyệt PD7: tone `accent` → token `selected` (7,15:1) |
| 04 | `/noi-dung` | E | "Máy nội dung tiếp thị", "Content Engine (P27)", "Product Master", "Studio 5 Tone giọng" (R16/thuật ngữ kỹ thuật); rỗng không có đường đi tiếp | P2 | Chữ nghiệp vụ ("Viết bài", "Giọng văn", "Sản phẩm trong kho"); rỗng có liên kết "Thêm sản phẩm" |
| 09 | `/catalog` | E | Cùng kiểu thẻ chế độ như landing cũ: chip in hoa, tiêu đề lặp, emoji | P2 | Dọn giống pilot (một tiêu đề bước, bỏ emoji, thu nhỏ icon). 390px: 1.302 → 991px |
| 14 | `/the-chao?quick=true` | D (dialog) | Biểu mẫu dày nhưng là bộ lọc thật của việc chọn mẫu | P3 | Không đổi đợt này |
| 49 | `/market-intelligence` | A | Tiêu đề "smeOS Intelligence Engine" + "v2.0 Omnichannel" + mô tả cấu trúc "1. … 2. … 3."; rỗng nói "xem toàn bộ 0 cơ hội" + nút "Xem tất cả (0)" | P2 | Tiêu đề "Xu hướng & cơ hội thị trường", mô tả một dòng theo việc; khi chưa có dữ liệu: "Chưa có tín hiệu thị trường — bấm Làm mới", ẩn nút vô nghĩa |

Kết quả axe sau: 0 lỗi critical/serious ở mọi màn trên, trừ huy hiệu `TabActionHeader` (có sẵn từ trước, chờ PO).
Chưa làm (đợt sau theo thứ tự đã duyệt): nhóm Danh sách ngoài công cụ (đơn hàng, sản phẩm, khách hàng) → Cài đặt (`/ket-noi`, `/cai-dat-ai`, `/cai-dat`).
