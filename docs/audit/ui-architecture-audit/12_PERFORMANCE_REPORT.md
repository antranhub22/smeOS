# Hiệu năng tải trang — Web Vitals

> **Phạm vi:** giao diện smeOS (Next.js 16, App Router) · **Ngày lập:** 03/11/2026
> **Trạng thái:** Chưa đo. Tài liệu này mô tả phương pháp và chỉ tiêu; số liệu chỉ được ghi khi có tệp kết quả đo lưu trong repo.

## 1. Tình trạng số liệu

Repo chưa có kết quả đo Web Vitals nào (Lighthouse, `web-vitals` hay trace Playwright). Mọi giá trị LCP, CLS, INP và dung lượng bundle cho các tuyến dưới đây đều **chưa xác định**.

Những thay đổi kiến trúc có khả năng ảnh hưởng tới hiệu năng, cần được đo để xác nhận:

| Thay đổi | Ảnh hưởng dự kiến | Cách xác nhận |
|---|---|---|
| `data-theme="moc-lan"` gắn sẵn từ server (`src/app/layout.tsx:31`); preset khác áp phía client | Không nháy với preset mặc định; preset khác có thể nháy khi nạp | So CLS giữa preset mặc định và preset khác |
| Skeleton dùng chung `src/components/ui/skeleton.tsx` (chưa có skeleton riêng theo archetype trang) | Giảm dịch chuyển bố cục khi dữ liệu về, ở màn có dùng | CLS trên tuyến có danh sách dài |
| Gỡ `lucide-react` và 3 gói `@radix-ui` | Không đổi bundle phía client — các gói này đã không còn được import trước khi gỡ | Không cần đo; chỉ ảnh hưởng `node_modules` |
| Modal nặng chưa tách chunk — `next/dynamic` chỉ dùng ở `src/components/integrations/managed-panel.tsx` | Chưa có giảm JS tải ban đầu từ tách modal | Đo kích thước chunk từng tuyến từ `npm run build` |

## 2. Chỉ tiêu

| Chỉ số | Ngưỡng "Tốt" (Google) | Chỉ tiêu smeOS |
|---|---|---|
| LCP | ≤ 2,5 s | ≤ 2,5 s ở mạng 4G mô phỏng |
| CLS | ≤ 0,1 | ≤ 0,1 |
| INP | ≤ 200 ms | ≤ 200 ms trên thiết bị tầm trung mô phỏng |

## 3. Phương pháp đo

1. Dựng bản production: `npm run build && npm start` trên database đã seed (`npm run db:seed`).
2. Đo bằng Lighthouse CI (preset mobile, 3 lần mỗi tuyến, lấy trung vị) cho 6 tuyến đại diện: `/`, `/san-pham`, `/dieu-phoi`, `/so-lieu`, `/b/[sendCode]`, `/van-hanh`.
3. Lưu tệp kết quả JSON vào `docs/audit/ui-architecture-audit/perf/<ngày>/` và chỉ ghi số vào tài liệu này kèm đường dẫn tới tệp đó.
4. Lặp lại sau mỗi thay đổi lớn ở shell, theme hoặc tuyến công khai.
