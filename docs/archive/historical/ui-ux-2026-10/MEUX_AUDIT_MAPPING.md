# MEUX Supplemental Kit — Audit & Mapping (Phase 1–2)

> Trạng thái: **ĐÃ DUYỆT** (PO 29/10/2026, câu 1–3 §6) · Phase 4 đã tích hợp: 03c PD6, §5b, §5c (UX-027), §7b, §9; `ux-patterns/page-archetypes.md` (UX-028), `ux-patterns/visual-review.md`, bảng chọn pattern trong `ux-patterns/README.md`, `_TEMPLATE.md`. Bản gốc: `docs/archive/historical/SMEOS_MEUX_Supplemental_Kit/` · Nguồn: `SMEOS_MEUX_Upgraded_Supplemental_Kit` (01–10, MASTER_PROMPT_VI)
> 03a không bị sửa thân (tệp đã vượt 350 dòng): phần mở rộng nằm ở 03c + tài liệu SUPPORTING, theo đúng cơ chế 03a §0.2.

## 1. Kết luận chính

1. **Không tạo bộ chuẩn song song.** Phần lớn MEUX (01–05, 07–08) đã có trong 03a/03c — thường chi tiết hơn và đã gắn lint/test. Kit nên được tích hợp như **phần mở rộng thị giác/bố cục** của 03a, không phải tài liệu "MEUX" riêng.
2. **Khoảng trống thật** nằm ở 3 chỗ: (a) mẫu bố cục theo loại trang (page archetypes A–F), (b) quy tắc bề mặt/shell thị giác (VDLS §2–3) và checklist so sánh tham chiếu (10), (c) quy tắc UI theo ngữ cảnh khi đổi chế độ (CU-01: giữ dữ liệu, khai điều kiện hiển thị) và bảng chọn pattern disclosure (drawer/modal/tabs/wizard/tooltip).
3. **Một xung đột cần PO quyết** (thang mức độ): kit dùng P0–P3; repo dùng PASS/WARNING/FAIL/BLOCKED (03a §35) + ratchet R1–R16. Đề xuất: giữ đầu ra lint hiện tại, thêm P0–P3 chỉ cho finding audit thủ công, có bảng quy đổi.
4. **Ảnh tham chiếu SePay chưa có trong repo/phiên** (ảnh gửi kèm là ảnh CI). VDLS dùng được mà không cần ảnh; muốn chấm VD-05 thì cần ảnh.

## 2. Source of truth hiện tại

| Lĩnh vực | Tài liệu / mã | Cấp |
|---|---|---|
| Chuẩn UX toàn cục (nguyên tắc UX-001…014, L0–L4, mật độ, content budget, trạng thái, responsive, token, a11y, Screen Contract, anti-pattern) | `docs/dac-ta/03a-ux-constitution.md` (2.100 dòng) | L3 CANONICAL |
| Progressive disclosure, rủi ro R1–R3, task status, E1–E16, lint R13–R16, ngoại lệ, DoD | `docs/dac-ta/03c-ux-progressive-disclosure.md` | L3 CANONICAL |
| Bản đồ màn, điều hướng (`nav-model.ts`), shell desktop/mobile | `docs/dac-ta/03-ux-architecture.md` | L3 CANONICAL |
| UX theo vai | `docs/dac-ta/03b-role-ux.md` | L3 CANONICAL |
| Thư viện pattern P01–P12, glossary, sổ ngoại lệ | `docs/dac-ta/ux-patterns/` | L3 SUPPORTING |
| Hợp đồng từng màn (§15 PD) | `docs/dac-ta/screen-contracts/` + `_TEMPLATE.md` | L3 SUPPORTING |
| Token màu/cỡ chữ | `src/app/globals.css` (03a §0.5) | mã |
| Component chuẩn | `src/components/ui/` (Disclosure, ConfirmDialog, TaskStatus, EmptyState, InlineError, TabActionHeader, EntitlementGate, ResultPanel, CostPreview…) | mã |
| Lint UX | `scripts/ux-lint/` R1–R16, ratchet `scripts/ux-lint-baseline.json` (132) | CI |
| A11y | `tests/e2e/ux/*.spec.ts` + axe (critical/serious, 390px) | CI |
| Luật agent | `CLAUDE.md`, `.agents/AGENT_RULES.md` | CANONICAL |

## 3. Mapping

`Topic | Existing rule | Status | Proposed change | Target document | Rationale | Risk | Approval`

| Topic | Existing rule | Status | Proposed change | Target | Rationale | Risk | Approval |
|---|---|---|---|---|---|---|---|
| 01 P1 Task-first | 03a UX-001, UX-002 | Keep | Không đổi | — | Đã đủ, có ví dụ theo vai | — | No |
| 01 P2 Hierarchy before decoration | 03a UX-007, §40 | Extend | Thêm câu "cấu trúc/khoảng cách trước viền/bóng" | 03a §08 | Bổ sung ý chưa nói rõ | Thấp | No |
| 01 P3 Progressive disclosure | 03a UX-004 + 03c §1–5, UX-017 | Keep | Không đổi | — | 03c chặt hơn (cấm giấu, Disclosure giữ giá trị) | — | No |
| 01 P4 / 03 §5 Contextual UI, đổi chế độ không mất dữ liệu | 03a IA-004 (giữ ngữ cảnh), chưa có quy tắc đổi chế độ | **Missing** | Thêm UX-027 "Contextual fields": khai điều kiện hiện/khóa/mặc định/xử lý giá trị cũ khi đổi chế độ; cột mới trong Screen Contract §15 | 03c §5b + `_TEMPLATE.md` | Lỗ hổng thật (vd. AI/thủ công) | Thấp | No |
| 01 P5 / 02 Mật độ | 03a UX-005, UX-006 content budget, §43 text wall | Keep | Ghi heuristics kit (≥3 câu, ≥3 tầng container, >7 lựa chọn) là heuristic nội bộ, không lint cứng | 03a §07 | Trùng ý, thêm số liệu kiểm | Thấp | No |
| 01 P6 / 04 Component & token | 03a §29–31, R1–R3, R12 | Keep | Thêm "component decision record" vào §30 | 03a §30 | Kit có mẫu ghi quyết định | Thấp | No |
| 01 P7 / 05 A11y & responsive | 03a §28, §32, WCAG 2.2 §53; axe E2E | Keep | Thêm câu "scanner ≠ bằng chứng tuân thủ đầy đủ; báo cáo kiểm tra thủ công" | 03a §32 | Tránh tuyên bố quá mức | Thấp | No |
| 01 P8 Measure | 03c E-chuẩn (sự kiện đo pattern), 03a §50 | Keep | — | — | — | — | No |
| 03 §2 Chọn pattern (drawer/modal/tabs/wizard/tooltip) | 03a có Modal budget; `ux-patterns/` chưa có bảng chọn | **Missing** | Thêm bảng "Chọn pattern hiển thị" | `ux-patterns/README.md` | Hướng dẫn quyết định còn thiếu | Thấp | No |
| 03 §4 Landing page | `screen-contracts/landing-page.md` (đã PD đợt trước) | Keep | Dùng làm pilot (§5) | — | — | — | No |
| 06 Audit rules IA-01…MEAS-01 | 03a §35 + R1–R16 | Consolidate | Bảng quy đổi mã kit → luật/tài liệu hiện có; thêm mẫu finding | 03a §35 | Tránh hai hệ mã | Thấp | No |
| 06 Severity P0–P3 | 03a §35 PASS/WARNING/FAIL/BLOCKED; ratchet | **Conflict** | Giữ PASS…BLOCKED cho lint; P0–P3 cho audit thủ công; P0/P1 ⇒ BLOCKED/FAIL | 03a §35 | Hai thang chồng nhau | Trung bình | **Yes** |
| 06 VD-01…VD-05 | 03a §41 card explosion, §40; chưa có VD | **Missing** | Thêm VD-01…05 như luật review thủ công (không lint tự động) | 03a §40–41 | Kit yêu cầu không lint heuristic chưa kiểm false-positive | Thấp | No |
| 07 Acceptance & rollout | 03c §9 DoD, 03a §33–34, pilot→rollout đợt PD | Extend | Thêm mục 2A (nghiệm thu thị giác) vào DoD | 03c §9 | — | Thấp | No |
| 08 Agent protocol | CLAUDE.md, AGENT_RULES, 03a §46–48, §58 | Keep | Thêm liên kết tới protocol pha (Audit→Handover) trong §46 | 03a §46 | Đã có, chỉ dẫn nguồn | Thấp | No |
| 09 VDLS shell/top bar | 03-ux-architecture §3 (Sidebar w-60, BottomNav), `TabActionHeader` K2 | Keep/Extend | Ghi nhận shell hiện có đạt VDLS 2.1; thêm quy tắc page header 1 dòng mô tả | 03a §08 | Không đổi shell (PO-locked) | Thấp | No |
| 09 VDLS bề mặt (card/border/shadow) | 03a §41 | Extend | Thêm quy tắc "không đồng thời nền + viền đậm + bóng", "không card lồng card" | 03a §41 | — | Thấp | No |
| 09 Page archetypes A–F | 03a content budget chỉ Dashboard/Detail/Modal | **Missing** | Thêm mục archetype A–F; Screen Contract khai archetype | 03a §06 mới + `_TEMPLATE.md` | Khoảng trống lớn nhất | Thấp | No |
| 10 Visual reference checklist | Không có | **Missing** | Thêm `ux-patterns/visual-review.md` (thang 0/1/2/N/A, 11 chiều) | `ux-patterns/` | Công cụ review mới | Thấp | No |
| Tên gọi "MEUX" | — | Revise | Không đặt tên chuẩn riêng; ghi "bổ sung MEUX 29/10/2026" trong changelog 03a §62 | 03a §62 | Một source of truth | Thấp | **Yes** |

## 4. Rủi ro & giới hạn

- Không có thay đổi mã, schema, quyền, API ở bước tích hợp tài liệu.
- Quy tắc định lượng của kit sẽ ghi là **heuristic nội bộ**.
- Không thêm dependency (visual regression/screenshot testing): đề xuất riêng nếu PO muốn.
- `FeatureGuidanceCard` và `TabActionHeader` là UX khóa bởi PO — VDLS không được dùng để đổi chúng.

## 5. Đề xuất pilot (Phase 5)

Trang: **`/landing-page`** (archetype E — Builder), đúng gợi ý của kit, đã có Screen Contract và axe xanh. Việc pilot: chấm checklist 10 trước/sau ở 390px và 1280px, khai archetype + bảng điều kiện hiển thị (UX-027), đề xuất chỉnh bề mặt/copy; không rollout rộng trước khi PO duyệt kết quả pilot.

## 6. Cần PO quyết

1. Thang mức độ: giữ PASS/WARNING/FAIL/BLOCKED cho lint + P0–P3 cho audit thủ công (đề xuất) — đồng ý?
2. Không dùng tên "MEUX" làm chuẩn riêng; tích hợp vào 03a/03c/ux-patterns — đồng ý?
3. Cho phép thực hiện Phase 4 (tích hợp tài liệu theo bảng §3) và Phase 5 (pilot `/landing-page`)?
4. Cung cấp ảnh tham chiếu SePay nếu muốn chấm VD-05.
