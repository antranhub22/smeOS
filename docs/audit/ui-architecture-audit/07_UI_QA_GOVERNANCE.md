# G — Visual QA & Testing Governance Assessment

Điểm miền: **2 / PARTIAL**. Nguồn: `.github/workflows/ci.yml`, `playwright.config.ts`, `tests/e2e/ux/*`, `scripts/ux-lint*`, `scripts/ux-audit/*`, `docs/dac-ta/ux-patterns/visual-review.md`.

## G1. Visual testing

| Năng lực | Trạng thái | Bằng chứng | Khoảng trống |
|---|---|---|---|
| Screenshot testing | Đã triển khai (hẹp) | `tests/e2e/ux/visual.spec.ts` — `toHaveScreenshot`, `maxDiffPixelRatio: 0.05`, `reducedMotion` | **2 màn** (404, `/vai-tro`) × 2 khổ (390, 1280). |
| Visual regression | Đã triển khai (hẹp) | Ảnh mốc `visual.spec.ts-snapshots/*-linux.png` + `*-darwin.png` | 5% pixel cho phép là rộng (lệch padding 8px có thể lọt). Ảnh mốc phụ thuộc font Google tải lúc chạy (`ci.yml` chú thích nợ #172). |
| So sánh ảnh tham chiếu | Chỉ thủ công | `visual-review.md` §3 (thang 0–2 theo 11 chiều) | `visual-review.md` cuối: “Chưa có hạ tầng screenshot diff: không tự thêm dependency — đề xuất riêng cho PO”. |
| Responsive screenshot | Một phần | 390 + 1280 trong 2 màn; `ux:audit` chụp 390/1280 khi chạy tay | Không 360/430/768/1024/1440. |
| Component visual testing | **Không triển khai** | Không Storybook, không catalog component, không test ảnh cho `ui/*` | Đổi primitive không có lưới an toàn thị giác. |

## G2. Functional UI testing

| Loại | Trạng thái | Bằng chứng |
|---|---|---|
| Playwright | Đã triển khai | `tests/e2e/ux/` 6 spec, 14 khai báo `test(` (một khai báo lặp sinh 10 ca công cụ); `tests/e2e/creative-studio.spec.ts`, `brochure-swipe.spec.ts` (ngoài CI UX) |
| Navigation | Một phần | `navigation.spec.ts` (mốc `aria-label` của nav, số vai `/vai-tro`), `route-states.spec.ts` (404, skip-link) |
| Form interaction | **Không triển khai** (E2E) | Không spec điền/validate form |
| Modal / dialog | **Không triển khai** (E2E) | Không spec mở/đóng/bẫy focus |
| Responsive interaction | Một phần | `a11y-done-tools.spec.ts` ở 390px (chỉ axe, không thao tác) |
| Permission-based UI | Một phần | `role-homepage.spec.ts` (3 test trang chủ theo vai); quyền phía máy chủ có `test:tenant`/`test:platform` + `route-capability-guard.test.ts` (mạnh). **Không có test ma trận vai × mục nav / nút**. |
| Unit test component | Một phần | `src/components/ui/__tests__/` 5 tệp; `scripts/ux-lint/rules.test.ts`, `rules-pd.test.ts`; `icon-library.test.ts` |

## G3. Quality gates trên CI (đã đọc `ci.yml`)

| Gate | Có? | Chặn merge/deploy? | Ghi chú |
|---|---|---|---|
| Build | ✓ `npm run build` (job `web` và `e2e-ux`) | ✓ | — |
| Type check | ✓ `npm run typecheck` | ✓ | — |
| Lint | ✓ `lint:ratchet` (ESLint, không thêm lỗi mới) | ✓ | ESLint **không có plugin `jsx-a11y`** (`eslint.config.mjs`). |
| UX lint | ✓ `lint:ux -- --check` (ratchet R1–R16) | ✓ | Đã chạy trong audit: **ĐẠT** (120 → 119). R1 bị lách (B2); R1 không quét object literal (`platform-records-viewer.tsx:34-38`); R4/R8/R9/R10/R12 chỉ cảnh báo. |
| Component tests | ◐ trong `npm test` | ✓ | Ít (G2). |
| E2E | ✓ job `e2e-ux` | ✓ (`deploy.needs`) | Chỉ chạy trên PR/push vào `main`. |
| Visual regression | ✓ trong `e2e-ux` | ✓ | 2 màn. |
| Accessibility | ✓ axe trong `e2e-ux` | ✓ | 13 tuyến. |
| `ux:audit` (screenshot + axe + cuộn ngang theo kịch bản) | ✗ | ✗ | Chỉ chạy tay; kịch bản cho 4 trang. |
| Screen Contract tồn tại/cập nhật | ✗ | ✗ | Xem E5. |
| Ranh giới tầng (`check:layers`) | ✗ | ✗ | Script có nhưng không trong CI. |

Không có PR template, không có `CODEOWNERS` (`.github/` chỉ có `dependabot.yml`, `workflows/`) → **không ai bắt buộc review UI**.

## G4. Visual acceptance criteria

| Lý do từ chối đề bài | Có tiêu chí viết? | Có cổng tự động? |
|---|---|---|
| Spacing sai | ◐ heuristic `OPERATING_PRINCIPLES` §6.4 | ✗ (không token spacing) |
| Typography bất nhất | ✓ R2 + bảng 03a §5 | ◐ R2 chỉ bắt `text-[Npx]`, không bắt `text-xs/xl` |
| Màu sai | ✓ R1/R3 | ◐ bị lách bằng thang màu đổi tên |
| Hierarchy kém | ✓ VH-01, VD-03 | ✗ (R4 chỉ cảnh báo) |
| Lệch căn | ✗ | ✗ |
| Chồng lấn | ◐ RESP-01 | ◐ `ux:audit` bắt cuộn ngang, không bắt chồng lấn |
| Responsive sai | ✓ RESP-01 | ◐ 2 màn visual + `ux:audit` tay |
| Tương tác bất nhất | ◐ ST-01, ACPT-01 | ◐ R13–R16 |

`visual-review.md` §2 có thang P0–P3 và quy đổi sang BLOCKED/FAIL/WARNING/PASS — **khung từ chối tồn tại**, nhưng chỉ áp khi có người review thủ công. Một màn render được và qua CI **không** đồng nghĩa đạt thị giác — điều này đúng với hiện trạng: CI hiện không thể từ chối một màn vì lệch spacing, lệch căn hay chồng lấn.
