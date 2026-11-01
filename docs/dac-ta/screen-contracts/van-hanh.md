---
id: SCR-MOTHER-van-hanh
tier: MOTHER
module: platform
route: /van-hanh
archetype: A
snapshots:
  - 390x844
  - 1280x800
acceptance:
  - Bảng điều khiển trung tâm người vận hành nền tảng (Platform Admin)
  - Áp dụng chủ đề giao diện hiện đại modern-slate (Slate & Indigo)
  - Tối đa 1 nút chính theo K2
  - Hiển thị đầy đủ số liệu sức khỏe hạ tầng, tổ chức và credit
  - Đầy đủ 6 trạng thái UI và chuẩn WCAG 2.2 AA
---

# Screen Contract — Bảng Điều Khiển Vận Hành Nền Tảng (SaaS Mother)

**Mã màn:** `SCR-MOTHER-van-hanh` · **Tuyến:** `/van-hanh` · **Tầng:** `MOTHER` · **Bố cục (Archetype):** `A` (Bảng điều khiển)

## 1. Vai & Mục đích
- **Vai chính (03b):** `platform_admin` (Người vận hành nền tảng SaaS).
- **Phạm vi dữ liệu:** `platform` (Xuyên tổ chức, cấp hệ thống mẹ).
- **Mục tiêu chính:** Giám sát tổng quan tình trạng sức khỏe hạ tầng, số lượng tổ chức hoạt động, phát hiện job nền và theo dõi credit toàn hệ thống.
- **Câu hỏi cốt lõi:** "Toàn hệ thống có bao nhiêu tổ chức, có sự cố nào cần xử lý và tài nguyên dùng ra sao?"
- **Mật độ thông tin (Density):** `compact`

## 2. Cấu trúc Bố cục & Thứ bậc (Visual Hierarchy)
- **Header:** `PageHeader` với huy hiệu phạm vi "Vận hành Nền tảng • Toàn hệ thống" và theme `modern-slate`.
- **Vùng làm việc:** `DashboardLayout` hiển thị lưới KPI 4 khối và các phân hệ điều hành.
- **Khối chức năng chính:**
  1. L0 (Thiết yếu): Tổng số tổ chức, tổ chức mới 7 ngày, số job lỗi/treo, tổng credit tiêu thụ.
  2. L1 (Hành động): Nút chuyển nhanh sang Tổ chức, Sức khỏe hệ thống, Mức dùng, Chợ đối tác.
  3. L2 (Bổ trợ): Hướng dẫn vận hành hệ thống mẹ, nhật ký kiểm toán gần nhất.

## 3. Hành động cấp trang (Actions)
- **Hành động chính (Primary CTA):** Nút "Kiểm tra sức khoẻ hệ thống" hoặc "Làm mới số liệu".
- **Hành động phụ (Secondary):** "Xem nhật ký kiểm toán", "Quản lý tổ chức".

## 4. Đặc tả 6 Trạng thái Giao diện (States)
1. **Đang tải (Loading):** `SkeletonBlock` mô phỏng lưới KPI 4 thẻ và danh sách phân hệ.
2. **Rỗng (Empty):** Khi chưa có số liệu thống kê.
3. **Lỗi (Error):** Hộp cảnh báo màu đỏ với thông điệp lỗi rõ ràng và nút thử lại.
4. **Không có quyền (Forbidden):** Tự động chuyển hướng về `/` nếu không có quyền `platform_admin`.
5. **Dữ liệu một phần (Partial):** Hiển thị số liệu cache khi hệ thống giám sát đang lấy dữ liệu mới.
6. **Thành công (Success):** Toàn bộ chỉ số KPI hiển thị tức thời, trực quan.

## 5. Quy chuẩn Trợ năng & Responsive (A11y & Responsive)
- Responsive từ di động 1 cột đến màn hình lớn 4 cột cân đối.
- Hỗ trợ thao tác hoàn toàn bằng bàn phím và tương phản chuẩn WCAG 2.2 AA.
