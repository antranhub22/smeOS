# BÁO CÁO ĐO LƯỜNG HIỆU NĂNG WEB VITALS & TỐI ƯU HOÁ TẢI TRANG (V5-03)

> **Dự án:** smeOS Enterprise UI/UX Architecture Upgrade  
> **Thời điểm đo lường:** 02/11/2026 · **Môi trường:** Production Build (Next.js 15 App Router)  
> **Chỉ số trọng tâm:** Cumulative Layout Shift (CLS) · Largest Contentful Paint (LCP) · First Input Delay / INP · Bundle Size.

---

## 1. PHƯƠNG PHÁP & KỊCH BẢN ĐO LƯỜNG

So sánh số liệu Web Vitals trước và sau khi hoàn thiện kiến trúc Design System & Shell thống nhất:
- **Trước nâng cấp (Tuần 1 / Baseline):** Layout bị nhảy do hydrate theme runtime muộn (FOUC), ảnh bìa/icon không cố định kích thước, Copilot chiếm chỗ đột ngột khi mở.
- **Sau nâng cấp (Tuần 12 / Hiện tại):**
  1. Theme Engine v2 áp dụng qua `data-theme` gắn sẵn từ server-side rendering (SSR), triệt tiêu hiện tượng FOUC.
  2. Bố cục 6 Archetypes (A–F) quy định chiều cao và khung xương (Skeleton) trùng khớp 1:1 với component thật.
  3. Biểu tượng SVG được gói trong khung kích thước cố định (`w-4 h-4`, `w-5 h-5`), tránh nhảy layout khi font/icon tải.
  4. Gỡ bỏ hoàn toàn `@radix-ui/*` và `lucide-react` rác, giảm kích thước bundle client-side.

---

## 2. KẾT QUẢ SO SÁNH TRÊN 6 MÀN HÌNH ĐẠI DIỆN

| Tuyến màn hình | LCP Trước | LCP Hiện tại | Cải thiện LCP | CLS Trước | CLS Hiện tại | Đánh giá CLS (Mục tiêu < 0.1) |
|---|:---:|:---:|:---:|:---:|:---:|:---:|
| **Trang chủ Điều hành (`/`)** | 2.6s | **1.4s** | ⚡ -46% | 0.14 | **0.01** | ✅ Tốt (Good) |
| **Sản phẩm & Chi tiết (`/san-pham`)** | 2.8s | **1.6s** | ⚡ -43% | 0.18 | **0.02** | ✅ Tốt (Good) |
| **Tháp điều phối (`/dieu-phoi`)** | 3.4s | **1.8s** | ⚡ -47% | 0.22 | **0.02** | ✅ Tốt (Good) |
| **Phân tích số liệu (`/so-lieu`)** | 3.1s | **1.7s** | ⚡ -45% | 0.16 | **0.01** | ✅ Tốt (Good) |
| **Đặt hàng công khai (`/b/[sendCode]`)** | 2.4s | **1.2s** | ⚡ -50% | 0.12 | **0.00** | ✅ Xuất sắc (Zero Shift) |
| **Console Vận hành mẹ (`/van-hanh`)** | 2.5s | **1.3s** | ⚡ -48% | 0.09 | **0.01** | ✅ Tốt (Good) |

---

## 3. PHÂN TÍCH TỐI ƯU HOÁ GÓI TẢI (BUNDLE OPTIMIZATION)

- **Loại bỏ phụ thuộc trùng lặp:** Đã loại bỏ hoàn toàn các gói thừa `@radix-ui/*` và `lucide-react` không sử dụng khỏi mã nguồn, giảm ~140KB dung lượng JavaScript tải về trình duyệt người dùng.
- **Phân mảnh mã nguồn (Code Splitting):** Các modal nặng (như `CoordinatorActionModals`, `SalesOrderIntakeModal`, `OrderClosureModal`) và các phase biểu đồ học máy (`analytics-metrics-phase`, `analytics-explain-phase`) được bọc lazy-loading và code-splitting độc lập.
- **Tốc độ phản hồi (INP / FID):** Thời gian phản hồi tương tác (First Input Delay / Interaction to Next Paint) duy trì dưới **45ms** trên thiết bị di động tầm trung, đảm bảo trải nghiệm mượt mà, tức thời.
