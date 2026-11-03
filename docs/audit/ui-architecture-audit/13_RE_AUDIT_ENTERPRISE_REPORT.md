# Đánh giá kiến trúc UI/UX sau chương trình ADR-011

> **Phạm vi:** nhánh `Hoan_Thien_Kien_Truc_He_Thong_UI_UX_Tieu_Chuan_Enterprise` sau đợt khắc phục `docs/kien-truc/REMEDIATION_ENTERPRISE_UI.md`
> **Ngày đánh giá:** 03/11/2026 · **Căn cứ:** `docs/adr/ADR-011.md`, danh mục phát hiện `11_FINDINGS_REGISTER.md`
> **Nguyên tắc:** chỉ ghi số liệu đo được bằng lệnh nêu kèm; điều chưa chạy được ghi "Chưa kiểm chứng".

## 1. Kết luận

- **Khung kiến trúc UI đạt mức có cổng kiểm tự động.** Token ngữ nghĩa có một nguồn (`src/styles/tokens/`), shell dùng chung (`AppShell`, `LiveRegionProvider`), 48 primitive trong `src/components/ui/` có test, Screen Contract phủ 111/111 trang, và các cổng ratchet trong CI (ESLint, UX lint, thuật ngữ ngành, gọi `Intl` trực tiếp) chặn nợ tăng thêm.
- **Độ phủ trên màn hình thật còn thấp.** Baseline UX lint còn 5.498 vi phạm; 1.009 `<button>` và 636 `<input>` thô ngoài `src/components/ui/`; 12/111 trang gọi trực tiếp `PageLayout`/`PageHeader`; 90 tệp nguồn vượt 350 dòng.
- **Trợ năng và hiệu năng chưa kiểm chứng.** Bộ E2E UX (`npm run test:e2e:ux`) và đo Web Vitals chưa có kết quả chạy lưu trong repo.
- **Kết luận bàn giao:** đạt điều kiện bàn giao thương mại với nợ UX được kiểm soát bằng ratchet và có lộ trình (mục 6). Chưa đạt mức "enterprise grade toàn diện" ở các miền D, F, G, J.

## 2. Cổng CI

Chạy trên nhánh khắc phục, Postgres 16 cục bộ, ngày 03/11/2026.

| Cổng | Kết quả |
|---|---|
| `typecheck`, `lint:ratchet`, `lint:ux -- --check`, `check:docs`, `check:layers`, `check:tokens-doc`, `check:template-ssot`, `check:screen-contracts`, `check:industry`, `check:schemas:creative`, `build` | Đạt |
| `test:tenant` · `test:platform` | Đạt — 692/692 · 36/36 |
| `npm test` | Đạt — 3.847 ca thử |
| `check:schemas:coordinator` · `check:schemas:content-engine` | Đỏ trên cả `main` — lỗi có sẵn, theo phiên bản `zod` của môi trường đo |
| `test:e2e:ux` (Playwright + axe) | Chưa kiểm chứng |

## 3. Theo miền kiến trúc

| Miền | Trạng thái | Bằng chứng |
|---|---|---|
| A. Kiến trúc UI | Đạt một phần | `AppShell` dùng chung, có `LiveRegionProvider`; 79/111 `page.tsx` là client component (đặc tả 04 §3 yêu cầu server component mặc định) |
| B. Design System | Đạt | Token ở `src/styles/tokens/*.css`, `check:tokens-doc` đồng bộ tài liệu; 3 preset `moc-lan`, `modern-slate`, `pure-swiss` (+ bí danh `clean-blue`); `data-theme` gắn từ server |
| C. Component | Đạt một phần | 48 primitive, 17 tệp test trong `src/components/ui/__tests__/`; chưa có `date-picker` (có `date-field`); R18 (điều khiển thô) còn 1.797 trong baseline |
| D. Chuẩn UX | Đạt một phần | Luật R13–R23 trong `scripts/ux-lint/`; 12/111 trang gọi trực tiếp `PageLayout`/`PageHeader` |
| E. Screen Contract | Đạt | `check:screen-contracts`: 32 v2 · 72 v1 · 7 miễn trừ · 0 thiếu (111 trang) |
| F. Responsive & trợ năng | Chưa kiểm chứng | Copilot là BottomSheet dưới `sm` (`floraos-global-copilot.tsx:206`); không có kết quả axe, bàn phím hay trình đọc màn hình được lưu |
| G. Kiểm thử giao diện | Đạt một phần | `tests/e2e/ux/` có 8 tệp (a11y, visual); ảnh mốc visual chỉ ở vài màn (404, vai trò); `ui-weekly.yml` chạy hằng tuần |
| H. Quản trị agent | Đạt | Tài liệu SSOT trong `00-DOCUMENTATION-REGISTRY.yaml`, `check:docs` xanh |
| I. Quản trị Design System | Đạt | `docs/design-system/CHANGELOG.md` theo SemVer; `check:tokens-doc` giữ tài liệu token khớp mã |
| J. Tuân thủ trên màn hình | Chưa đạt | Baseline UX lint 5.498 (mục 4); Thẻ chào giữ nguyên bản `main` theo quyết định PO 03/11/2026 |

## 4. Chỉ số định lượng

| Mã | Chỉ số | Giá trị đo | Lệnh |
|---|---|---|---|
| K1 | Màu thô R1 (luật mở rộng bắt 12 thang màu bí danh và chuỗi lớp trong `cn`/`cva`) | 1.408 | `npm run lint:ux` |
| K2 | Token shadcn cũ R17 | 933 | như trên |
| K3 | Điều khiển HTML thô R18 | 1.797 | như trên |
| K4 | Overlay tự chế R19 | 62 | như trên |
| K5 | Trang gọi trực tiếp `PageLayout`/`PageHeader` | 12/111 | `grep -l "PageLayout\|PageHeader"` trên `src/app/**/page.tsx` |
| K6 | Bao phủ Screen Contract | 111/111 (32 v2, 72 v1, 7 miễn trừ) | `npm run check:screen-contracts` |
| K7 | Ảnh mốc visual | Vài màn trong `tests/e2e/ux/visual.spec.ts` | đọc mã |
| K8 | Quét axe critical/serious = 0 | Chưa kiểm chứng | `npm run test:e2e:ux` |
| K9 | Kiểm thủ công WCAG 2.2 AA | Chưa kiểm chứng | `docs/design-system/accessibility-audit-12-journeys.md` là quy trình kiểm, chưa có kết quả |
| K10 | Token không dùng | Chưa đo | — |
| K11 | Tệp nguồn > 350 dòng | 90 | `wc -l` trên `src/**/*.{ts,tsx}` trừ test |
| K12 | Mâu thuẫn tài liệu và mã | 0 | `npm run check:docs` |
| K13 | Design System có phiên bản và CHANGELOG | Có | `docs/design-system/CHANGELOG.md` |
| — | Tổng baseline UX lint | 5.498 | `scripts/ux-lint-baseline.json` |

Baseline UX lint trên `main` là 120 vì bộ luật cũ hẹp hơn; con số 5.498 phản ánh luật R1 mở rộng và các luật R17–R23 mới, không phải nợ phát sinh thêm. Trong 5.498 có 131 điểm của vùng Thẻ chào được khôi phục về `main`; 880 điểm trước đây được loại khỏi baseline bằng allowlist theo glob cho `src/components/templates/**` (R1, R21) và `src/components/layout/**` (R19), không phải bằng sửa mã.

## 5. Phát hiện ưu tiên P1 trong `11_FINDINGS_REGISTER.md`

| Mã | Tình trạng | Bằng chứng |
|---|---|---|
| UI-B-01 Bảng màu bí danh né R1 | Đã chặn | R1 bắt 12 thang bí danh; vi phạm vào baseline ratchet (1.408) |
| UI-A-03 UI Studio hiện ở production | Đã khắc phục một phần | Ngăn UI Studio chỉ gắn khi dev (`app-shell.tsx:72`); nút mở trong menu vẫn hiện cho platform operator ở production và không có tác dụng (`user-menu.tsx:141`) |
| UI-B-03/04 Theme hai nguồn | Đã khắc phục | Token một nguồn, preset áp qua `data-theme` |
| UI-E-01/02 Thiếu contract ChainOS, trang công khai | Đã khắc phục | `check:screen-contracts` 0 thiếu |
| UI-F-01 Copilot tràn màn nhỏ | Đã khắc phục trong mã, chưa kiểm trên thiết bị | BottomSheet dưới `sm` |
| UI-I-01 Tài liệu UI ngoài REGISTRY | Đã khắc phục | `check:docs` xanh |

## 6. Nợ còn lại và lộ trình

| Hạng mục | Quy mô | Thước đo |
|---|---|---|
| Thay điều khiển thô và token cũ trên các khu vực nặng nhất: Phân tích thị trường (1.685), Thẻ chào (1.336 trong `components/greeting-card`), Creative Studio (293) | Vài tuần, theo khu vực | Baseline UX lint giảm theo từng PR |
| Nâng giao diện Thẻ chào trong PR riêng có PO duyệt và E2E | 2–3 ngày | `the-chao-freeze` cập nhật có biên bản |
| Tách các tệp > 350 dòng, ưu tiên tệp đang sửa | 1–2 tuần | K11 giảm dần |
| Chạy `test:e2e:ux` trên database đã seed, lưu kết quả axe | 2–3 ngày | K8 có tệp kết quả |
| Kiểm thủ công 12 hành trình theo `accessibility-audit-12-journeys.md`, lưu biên bản có người kiểm và ngày | 2–4 ngày | K9 có biên bản |
| Đo Web Vitals theo `12_PERFORMANCE_REPORT.md` | 0,5–1 ngày | Tệp Lighthouse trong repo |
