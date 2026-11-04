# Hiệu năng tải trang — Web Vitals

> **Phạm vi:** giao diện smeOS (Next.js 16, App Router) · **Lần đo:** 04/11/2026, commit `8a0ac5e7`
> **Tệp kết quả:** [`perf/2026-11-04/web-vitals-8a0ac5e7.json`](perf/2026-11-04/web-vitals-8a0ac5e7.json) — từng lần đo, trung vị, cấu hình mô phỏng. Lần đo trước khi render phía máy chủ trang `/san-pham` (commit `7ef1b830`): [`perf/2026-11-04/web-vitals.json`](perf/2026-11-04/web-vitals.json).
> **Loại số liệu:** số đo phòng thí nghiệm (lab) trên bản build production chạy cục bộ; không phải số đo người dùng thật.

## 1. Kết quả

Trung vị 3 lần đo mỗi tuyến, bộ đệm trình duyệt tắt, tài khoản cửa hàng có dữ liệu seed (6 sản phẩm có ảnh, một link gửi bộ sưu tập). `/van-hanh` đo bằng tài khoản có quyền vận hành nền tảng.

**Di động** — 390×844, CPU chậm 4×, mạng 4G mô phỏng (RTT 150 ms, 1,6 Mbps xuống, 750 kbps lên):

| Tuyến | LCP | CLS | TBT | INP | JS tải |
|---|---|---|---|---|---|
| `/` | 1.924 ms | 0 | 442 ms | 24 ms | 528 KB |
| `/san-pham` | 1.720 ms | 0 | 757 ms | 40 ms | 510 KB |
| `/dieu-phoi` | 1.904 ms | 0 | 595 ms | 32 ms | 591 KB |
| `/so-lieu` | 1.860 ms | 0,015 | 573 ms | 24 ms | 463 KB |
| `/b/[sendCode]` | 1.480 ms | 0 | 434 ms | 48 ms | 494 KB |
| `/van-hanh` | 1.836 ms | 0 | 362 ms | 24 ms | 495 KB |

**Máy tính** — 1280×800, không giới hạn CPU và mạng:

| Tuyến | LCP | CLS | TBT | INP | JS tải |
|---|---|---|---|---|---|
| `/` | 320 ms | 0 | 0 ms | < 16 ms | 528 KB |
| `/san-pham` | 456 ms | 0 | 20 ms | < 16 ms | 510 KB |
| `/dieu-phoi` | 544 ms | 0,003 | 32 ms | < 16 ms | 591 KB |
| `/so-lieu` | 348 ms | 0,008 | 0 ms | < 16 ms | 463 KB |
| `/b/[sendCode]` | 320 ms | 0 | 0 ms | 24 ms | 494 KB |
| `/van-hanh` | 316 ms | 0 | 0 ms | < 16 ms | 469 KB |

INP ghi "< 16 ms" khi tương tác chuẩn không sinh mục Event Timing nào vượt ngưỡng ghi nhận 16 ms của trình duyệt (trường `inpMs: null` trong tệp JSON).

## 2. Đối chiếu chỉ tiêu

| Chỉ số | Chỉ tiêu | Kết quả |
|---|---|---|
| LCP | ≤ 2,5 s ở 4G mô phỏng | Đạt 6/6 tuyến (cao nhất 1,92 s) |
| CLS | ≤ 0,1 | Đạt 6/6 tuyến (cao nhất 0,015) |
| INP | ≤ 200 ms | Đạt 6/6 tuyến (cao nhất 48 ms, một tương tác chuẩn) |

**`/san-pham`: 5,26 s → 1,72 s trên di động.** `page.tsx` là server component tải sẵn trang đầu danh sách bằng chính `requireTenantContext` và `listProducts` mà `GET /api/v1/products?limit=100` dùng (cùng kiểm phiên, khoá công cụ, năng lực `L1`), truyền cho phần client `san-pham-client.tsx`; HTML đầu tiên đã có thẻ sản phẩm, ảnh 4 thẻ đầu tải ngay với độ ưu tiên cao. Bộ lọc, tìm kiếm và tải thêm vẫn gọi API ở client.

**TBT trên di động 362–757 ms ở mọi tuyến**, tương ứng 460–590 KB JS tải ban đầu ở CPU chậm 4×. Phần chung lớn nhất là shell và chunk dùng chung (một chunk 174 KB). Tách modal nặng bằng `next/dynamic` và giảm client component ở shell là hướng giảm.

## 3. Phương pháp đo

1. Dựng bản production: `npm run build && npm run start` trên database đã chạy `npm run db:seed`.
2. Đo: `npx tsx scripts/measure-web-vitals.ts --runs 3 --grant-platform --out docs/audit/ui-architecture-audit/perf/<ngày>`, với `PERF_EMAIL`/`PERF_PASSWORD` của tài khoản có dữ liệu. Script dùng Playwright và `PerformanceObserver` của Chromium, không cần thư viện thêm:
   - LCP: mục `largest-contentful-paint` cuối cùng trước tương tác đầu tiên;
   - CLS: cửa sổ phiên lớn nhất (khoảng cách ≤ 1 s, độ dài ≤ 5 s);
   - TBT: tổng phần vượt 50 ms của long task sau FCP;
   - INP: thời lượng lớn nhất của các tương tác có `interactionId`; tương tác chuẩn là một lần nhấp vào `<h1>` sau khi trang tải xong.
3. Lưu tệp JSON vào `perf/<ngày>/`; tài liệu này chỉ ghi số có trong tệp đó.
4. Đo lại sau mỗi thay đổi lớn ở shell, theme hoặc tuyến công khai, và trên máy chủ staging khi có.
