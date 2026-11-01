---
id: SCR-MOTHER-to-chuc
tier: MOTHER
module: platform
route: /van-hanh/to-chuc
archetype: B
snapshots:
  - 390x844
  - 1280x800
acceptance:
  - Danh sách toàn bộ tổ chức (doanh nghiệp, chuỗi, cửa hàng) xuyên hệ thống
  - Áp dụng chủ đề giao diện hiện đại modern-slate
  - Bảng dữ liệu có phân trang, tìm kiếm và liên kết chi tiết tổ chức
  - Đầy đủ 6 trạng thái UI và chuẩn WCAG 2.2 AA
---

# Screen Contract — Danh Sách Tổ Chức Nền Tảng (SaaS Mother)

**Mã màn:** `SCR-MOTHER-to-chuc` · **Tuyến:** `/van-hanh/to-chuc` · **Tầng:** `MOTHER` · **Bố cục (Archetype):** `B` (Danh sách)

## 1. Vai & Mục đích
- **Vai chính (03b):** `platform_admin`.
- **Phạm vi dữ liệu:** `platform` (Danh sách tổ chức toàn hệ thống).
- **Mục tiêu chính:** Tra cứu, quản lý và kiểm tra tình trạng số dư credit, thành viên của các tổ chức SME.
- **Câu hỏi cốt lõi:** "Hiện có những tổ chức nào đang hoạt động và số dư ra sao?"
- **Mật độ thông tin (Density):** `compact`

## 2. Cấu trúc Bố cục & Thứ bậc (Visual Hierarchy)
- **Header:** `PageHeader` tiêu đề "Tổ chức", mô tả và huy hiệu phạm vi.
- **Vùng làm việc:** `ListLayout` với bảng danh sách doanh nghiệp có cấu trúc rõ ràng.
- **Khối chức năng chính:**
  1. L0 (Thiết yếu): Tên tổ chức, slug, loại hình (Đơn lẻ / Chuỗi), số thành viên, số dư credit.
  2. L1 (Hành động): Nút xem chi tiết tổ chức `/van-hanh/to-chuc/[id]`.
  3. L2 (Bổ trợ): Ô tìm kiếm tổ chức theo tên/slug, phân trang.

## 3. Hành động cấp trang (Actions)
- **Hành động chính (Primary CTA):** Tìm kiếm và lọc danh sách tổ chức.
- **Hành động phụ (Secondary):** Làm mới danh sách.

## 4. Đặc tả 6 Trạng thái Giao diện (States)
1. **Đang tải (Loading):** `SkeletonBlock` dạng bảng 4 hàng.
2. **Rỗng (Empty):** `EmptyState` khi chưa có tổ chức nào đăng ký.
3. **Lỗi (Error):** Báo lỗi không thể tải danh sách tổ chức từ `/api/v1/platform/organizations`.
4. **Không có quyền (Forbidden):** Yêu cầu quyền năng lực `N1`.
5. **Dữ liệu một phần (Partial):** Bảng hiển thị một phần khi mạng chậm.
6. **Thành công (Success):** Danh sách tổ chức hiển thị đầy đủ, phân biệt rõ loại hình tổ chức.

## 5. Quy chuẩn Trợ năng & Responsive (A11y & Responsive)
- Hỗ trợ cuộn ngang trên thiết bị di động, cố định cột đầu tiên.
- Tuân thủ chuẩn tương phản màu sắc và hỗ trợ đọc màn hình.
