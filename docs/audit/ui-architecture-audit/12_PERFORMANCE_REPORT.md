# Hiệu năng tải trang — Web Vitals

> **Phạm vi:** giao diện smeOS (Next.js 16, App Router) · **Lần đo:** 04/11/2026, commit `7ef1b830`
> **Tệp kết quả:** [`perf/2026-11-04/web-vitals.json`](perf/2026-11-04/web-vitals.json) — từng lần đo, trung vị, cấu hình mô phỏng.
> **Loại số liệu:** số đo phòng thí nghiệm (lab) trên bản build production chạy cục bộ; không phải số đo người dùng thật.

## 1. Kết quả

Trung vị 3 lần đo mỗi tuyến, bộ đệm trình duyệt tắt, tài khoản cửa hàng có dữ liệu seed (6 sản phẩm có ảnh). `/van-hanh` đo bằng tài khoản có quyền vận hành nền tảng.

**Di động** — 390×844, CPU chậm 4×, mạng 4G mô phỏng (RTT 150 ms, 1,6 Mbps xuống, 750 kbps lên):

| Tuyến | LCP | CLS | TBT | INP | JS tải |
|---|---|---|---|---|---|
| `/` | 1.824 ms | 0 | 633 ms | 32 ms | 527 KB |
| `/san-pham` | **5.264 ms** | 0 | 619 ms | 32 ms | 509 KB |
| `/dieu-phoi` | 1.908 ms | 0 | 612 ms | 40 ms | 591 KB |
| `/so-lieu` | 1.956 ms | 0,015 | 623 ms | 48 ms | 462 KB |
| `/van-hanh` | 1.908 ms | 0 | 677 ms | 40 ms | 494 KB |
| `/b/[sendCode]` | Chưa đo — dữ liệu seed chưa có link gửi bộ sưu tập | | | | |

**Máy tính** — 1280×800, không giới hạn CPU và mạng:

| Tuyến | LCP | CLS | TBT | INP | JS tải |
|---|---|---|---|---|---|
| `/` | 412 ms | 0 | 0 ms | < 16 ms | 527 KB |
| `/san-pham` | 796 ms | 0 | 0 ms | < 16 ms | 509 KB |
| `/dieu-phoi` | 408 ms | 0,003 | 12 ms | < 16 ms | 591 KB |
| `/so-lieu` | 504 ms | 0,008 | 3 ms | < 16 ms | 462 KB |
| `/van-hanh` | 544 ms | 0 | 13 ms | < 16 ms | 468 KB |

INP ghi "< 16 ms" khi tương tác chuẩn không sinh mục Event Timing nào vượt ngưỡng ghi nhận 16 ms của trình duyệt (trường `inpMs: null` trong tệp JSON).

## 2. Đối chiếu chỉ tiêu

| Chỉ số | Chỉ tiêu | Kết quả |
|---|---|---|
| LCP | ≤ 2,5 s ở 4G mô phỏng | Đạt 4/5 tuyến; `/san-pham` 5,3 s |
| CLS | ≤ 0,1 | Đạt 5/5 tuyến (cao nhất 0,015) |
| INP | ≤ 200 ms | Đạt 5/5 tuyến (cao nhất 48 ms, một tương tác chuẩn) |

**`/san-pham` trên di động.** Trang là client component: danh sách sản phẩm gọi `/api/v1/products` sau khi JS tải và chạy xong (yêu cầu bắt đầu ở ~4,7 s), ảnh sản phẩm bắt đầu tải ở ~5,2 s và mất ~0,2 s. LCP là ảnh sản phẩm đầu tiên trong lưới. Hướng xử lý: render trang đầu danh sách phía server (đặc tả 04 §3 — server component mặc định) và tải ảnh trong khung nhìn đầu tiên với độ ưu tiên cao thay vì `loading="lazy"`.

**TBT trên di động 612–677 ms ở mọi tuyến**, tương ứng 460–590 KB JS tải ban đầu ở CPU chậm 4×. Phần chung lớn nhất là shell và chunk dùng chung (một chunk 174 KB). Tách modal nặng bằng `next/dynamic` và giảm client component ở shell là hướng giảm.

## 3. Phương pháp đo

1. Dựng bản production: `npm run build && npm run start` trên database đã chạy `npm run db:seed`.
2. Đo: `npx tsx scripts/measure-web-vitals.ts --runs 3 --grant-platform --out docs/audit/ui-architecture-audit/perf/<ngày>`, với `PERF_EMAIL`/`PERF_PASSWORD` của tài khoản có dữ liệu. Script dùng Playwright và `PerformanceObserver` của Chromium, không cần thư viện thêm:
   - LCP: mục `largest-contentful-paint` cuối cùng trước tương tác đầu tiên;
   - CLS: cửa sổ phiên lớn nhất (khoảng cách ≤ 1 s, độ dài ≤ 5 s);
   - TBT: tổng phần vượt 50 ms của long task sau FCP;
   - INP: thời lượng lớn nhất của các tương tác có `interactionId`; tương tác chuẩn là một lần nhấp vào `<h1>` sau khi trang tải xong.
3. Lưu tệp JSON vào `perf/<ngày>/`; tài liệu này chỉ ghi số có trong tệp đó.
4. Đo lại sau mỗi thay đổi lớn ở shell, theme hoặc tuyến công khai, và trên máy chủ staging khi có.
