# Đánh giá bộ SMEOS UX Progressive Disclosure Kit — khả năng áp dụng toàn hệ thống

> Trạng thái: **ĐÃ DUYỆT** (PO 29/10/2026 — toàn bộ đề xuất) · Ngày đánh giá: 28/10/2026
> Kết quả: chuẩn `docs/dac-ta/03c-ux-progressive-disclosure.md`, pattern `docs/dac-ta/ux-patterns/`, kế hoạch `docs/ui-ux/PROGRESSIVE_DISCLOSURE_EXECUTION_PLAN.md`
> Đối tượng đánh giá: `docs/archive/historical/SMEOS_UX_Progressive_Disclosure_Kit/` (v1.0; `patterns/` đã chuyển sang `docs/dac-ta/ux-patterns/`)
> Đối chiếu với: `docs/dac-ta/03a-ux-constitution.md` (CANONICAL), `docs/dac-ta/03-ux-architecture.md`,
> `docs/dac-ta/screen-contracts/`, `docs/ui-ux/COMPONENT_CONTRACTS.md`, `scripts/ux-lint.ts`, `src/components/ui/`.

## 1. Kết luận ngắn

| Câu hỏi | Trả lời |
|---|---|
| Áp dụng cho toàn bộ công cụ SMEOS được không? | **Được**, nhưng **không áp dụng nguyên văn như một chuẩn riêng**. Phải hợp nhất vào Hiến pháp UX (03a) đang là CANONICAL. |
| Có đồng bộ, tương thích không? | **Tương thích ~80% về tinh thần**, trùng lặp nhiều với 03a. Có **4 điểm xung đột** phải xử lý trước (mục 3). |
| Có giá trị gì mới? | Có — kit lấp đúng các **khoảng trống thực thi** mà 03a chưa có: phân loại rủi ro, máy trạng thái tác vụ nền, thư viện pattern theo luồng, ma trận phân lớp từng trường, quản lý ngoại lệ (mục 4). |
| Cách làm đúng | Coi kit là **nguồn nguyên liệu**: lấy phần mới → đưa vào 03a + pattern specs + component dùng chung + UX Lint; bỏ phần trùng; không tạo `docs/ux-standard/` song song (mục 5–6). |

Nếu áp dụng kit **song song** với 03a, hệ thống sẽ có **hai chuẩn UX, hai thang L0–L4/L1–L4 khác nghĩa** — chính là điều cả hai tài liệu cùng cấm (03a §29, kit §4.2 "không tạo design system thứ hai").

## 2. Những gì trùng khớp (không cần thêm gì)

| Chủ đề | Kit | Đã có trong repo |
|---|---|---|
| Phân tầng thông tin, ẩn nâng cao | 02 §2.1 | 03a UX-003, UX-004 |
| Một hành động chính | P02 | 03a UX-010 + PO K2 (`TabActionHeader` ≤1 primary, ≤2 phụ) + lint R4 |
| Ngôn ngữ nghiệp vụ, không jargon | P08 | 03a §39, UX-009 + lint R8 + CLAUDE.md #6 |
| Đủ trạng thái (loading/empty/error…) | 04 §4.4 | 03a §24 (còn đầy đủ hơn: Permission Restricted, No Access, Partial Data) + lint R9/R10 |
| Thông báo lỗi giúp phục hồi | UX-P06 | 03a §25 |
| Tìm trước khi tạo component | 04 §4.7 | 03a §30 (SEARCH→REUSE→EXTEND→COMPOSE→CREATE) + lint R12 |
| WCAG 2.2 AA, keyboard, alt, nhãn icon | 05 §5.2 | 03a §32 + lint R5/R6/R7 |
| Mobile-first | P10 | 03-ux-architecture §17 (khổ chuẩn 390px) |
| Versioning major/minor/patch | 08 §8.4 | 03a §62 |
| Quy trình 5 giai đoạn audit→rollout | 08 §8.2 | Đã chạy cho UI foundation: `docs/ui-ux/AUDIT_FINDINGS.md`, `PHASE_3_PILOT_REPORT.md`, `PHASE_3_ROLLOUT_REPORT.md` |

→ Kit **không đưa ra nguyên tắc nào trái với 03a**. 03a mạnh hơn ở phần thi hành tự động (UX Lint ratchet, Screen Contract, Role UX 14 vai); kit mạnh hơn ở phần **luồng tác vụ** (upload → xử lý → kết quả).

## 3. Điểm xung đột / không tương thích — phải chốt trước khi áp dụng

### X1. Hai thang phân tầng cùng ký hiệu nhưng khác nghĩa (nghiêm trọng)

| | L0 | L1 | L2 | L3 | L4 |
|---|---|---|---|---|---|
| **03a** | Essential | Actionable | Context | Detail | Advanced/Technical (vẫn **hiển thị** khi mở) |
| **Kit** | — | Essential | Contextual | Advanced | **System-managed** (không hiển thị, hệ thống tự làm) |

Cùng nhãn "L2", "L4" nhưng nghĩa khác → agent và dev sẽ phân loại sai. **Đề xuất:** giữ thang L0–L4 của 03a làm chuẩn duy nhất; đổi tầng L4 của kit thành khái niệm riêng **"SYS — hệ thống tự xử lý"** (không phải một tầng hiển thị), và ánh xạ: kit L1 = 03a L0+L1, kit L2 = 03a L2, kit L3 = 03a L3/L4.

### X2. Vị trí tài liệu
Kit yêu cầu tạo `docs/ux-standard/`. Cấu trúc SSOT hiện hành (03a §0.2) đã chốt vị trí UX trong `docs/dac-ta/`. **Đề xuất:** không tạo thư mục mới; nội dung đưa vào 03a và `docs/dac-ta/ux-patterns/` (mục 5).

### X3. Tên sản phẩm và công cụ
- Kit dùng "SMEOS"; tài liệu CANONICAL dùng "FloraOS" (repo đang chuyển dần sang smeOS — xem `FINAL_COMPLETION_REPORT.md`). Cần PO chốt một tên trong tài liệu chuẩn.
- `ANTIGRAVITY_MASTER_PROMPT.md` viết riêng cho công cụ Antigravity; file `master prompt` (không đuôi) là bản trùng nội dung dạng chữ thô. Quy trình agent của repo đi qua `CLAUDE.md` + skills, nên prompt này chỉ nên giữ làm tham khảo, không làm chuẩn.

### X4. Thứ bậc khi xung đột
Kit không nói nó đứng ở đâu so với tài liệu khác. Theo CLAUDE.md/Constitution, chuẩn mới phải có vị trí rõ. **Đề xuất:** phần hợp nhất trở thành một phần của 03a (Level 3, CANONICAL); các pattern spec là Level 3 SUPPORTING; thư mục kit gốc chuyển về `docs/archive/` sau khi hợp nhất.

## 4. Phần giá trị mới của kit (khoảng trống của hệ thống hiện tại)

Các khoảng trống dưới đây đều có **bằng chứng trong mã nguồn** (đo ngày 28/10/2026 trên `main` @ `731be68`):

| # | Khoảng trống | Bằng chứng trong repo | Phần kit lấp vào |
|---|---|---|---|
| G1 | **Không có từ vựng trạng thái tác vụ nền thống nhất** | Trong `src/**/*.tsx` cùng tồn tại `"done"` (26), `"completed"` (9), `"running"` (23), `"processing"` (5), `"pending"` (21) cho cùng khái niệm; mỗi màn tự viết trạng thái (`journey-processing-state.tsx`, `research-status-banner.tsx`, `upload-wizard.tsx`, `job/page.tsx`…) | 04 §4.5 máy trạng thái `idle→validating→submitting→queued→running→succeeded/failed/canceled`; quy tắc "không suy ra thành công từ timeout"; UX-P04 |
| G2 | **Không có chuẩn xác nhận theo mức rủi ro** | 26 file `.tsx` dùng `confirm(` của trình duyệt; `ui/` không có `ConfirmDialog` | 01 §1.4 phân loại rủi ro Thấp/Trung bình/Cao; UX-P07 |
| G3 | **Không có component "Tùy chỉnh thêm" dùng chung** | 10 file tự dùng `<details>`; `ui/` không có `Disclosure`/`Collapsible` | UX-P03 Progressive Settings + 07 §7.3 tiêu chí nghiệm thu |
| G4 | **Chưa có pattern theo luồng** (upload→tạo→kết quả, smart form, bulk) | 03a mô tả theo màn/thành phần, chưa có đặc tả luồng tái sử dụng | `patterns/*.md` (5 pattern chi tiết) + UX-P01…P10 |
| G5 | **Phân tầng mới ở cấp màn, chưa ở cấp từng trường/nút** | Screen Contract (`_TEMPLATE.md`) không có bảng phân tầng từng trường | `templates/disclosure-matrix.csv` |
| G6 | **Chưa có sổ ngoại lệ UX** | 03a §61 có change control, không có mẫu ngoại lệ có hạn | 08 §8.3 |
| G7 | **Chưa có quy tắc "không giấu"** | 03a chỉ nói ẩn bớt | 01 §1.3: không dùng disclosure để giấu phí, rủi ro, quyền riêng tư, trạng thái thanh toán |

## 5. Kiến trúc chuẩn hóa đề xuất (một chuẩn duy nhất)

```text
CLAUDE.md / AGENT_RULES           ← agent phải tuân thủ (dẫn link, không lặp nội dung)
        │
docs/dac-ta/03a-ux-constitution.md   CANONICAL — luật (thêm mục mới, xem 5.1)
        │
docs/dac-ta/ux-patterns/             SUPPORTING — đặc tả luồng chuẩn (từ kit/patterns)
   ├── README.md                     chỉ mục + bảng "công cụ nào dùng pattern nào"
   ├── upload-generate.md   background-task.md   result-panel.md
   ├── smart-form.md        error-recovery.md    progressive-settings.md
   └── confirmation.md      empty-state.md       search-filter.md   bulk-actions.md
        │
docs/dac-ta/screen-contracts/<man>.md   mỗi màn khai báo: pattern dùng, bảng phân tầng, mức rủi ro hành động
        │
src/components/ui/                   component dùng chung thực thi pattern
   ├── task-status.tsx  (+ src/lib/ui-system/task-state.ts — máy trạng thái + ánh xạ từ backend)
   ├── confirm-dialog.tsx  (theo mức rủi ro)
   ├── disclosure.tsx      ("Tùy chỉnh thêm", giữ giá trị khi đóng/mở)
   └── result-panel.tsx    (kết quả + hành động tiếp theo)
        │
scripts/ux-lint.ts                   luật tự động mới (ratchet, như R1–R12)
```

### 5.1. Bổ sung vào 03a (không viết lại phần đang có)
1. **UX-015 — Hành động theo mức rủi ro** (từ kit 01 §1.4 + UX-P07).
2. **UX-016 — Trạng thái tác vụ nền là sự thật từ backend** (kit 04 §4.5, UX-P04, 07 §7.4).
3. **UX-017 — Không dùng disclosure để giấu** (kit 01 §1.3).
4. Mở rộng **UX-003**: thêm khái niệm **SYS** (hệ thống tự xử lý) và bảng ánh xạ với kit (X1).
5. Mở rộng **§30/§37**: Screen Contract thêm cột "pattern sử dụng" + bảng phân tầng từng trường (G5).
6. Mở rộng **§61**: sổ ngoại lệ UX có ID, người duyệt, hạn xem lại (G6).

### 5.2. Luật UX Lint mới đề xuất (ratchet, không chặn mã cũ)
| Mã | Luật | Lấp khoảng trống |
|---|---|---|
| R13 | Gọi `window.confirm`/`confirm(` trong `.tsx` → dùng `ConfirmDialog` | G2 |
| R14 | Chuỗi trạng thái tác vụ ngoài từ vựng chuẩn (`"done"`, `"processing"`…) trong component → dùng `task-state.ts` | G1 |
| R15 | `<details>` tự viết cho cài đặt → dùng `Disclosure` | G3 |

### 5.3. Quy tắc cho mọi công cụ mới (Definition of Done bổ sung)
Mọi công cụ/màn mới chỉ được coi là xong khi:
- Screen Contract khai báo **pattern** đang dùng (từ `ux-patterns/`) và **bảng phân tầng** cho trường/nút chính.
- Mỗi hành động có hậu quả được gắn **mức rủi ro**; mức Cao bắt buộc `ConfirmDialog`.
- Tác vụ chạy lâu dùng `TaskStatus` + máy trạng thái chuẩn, có test ánh xạ trạng thái backend.
- Không tăng baseline UX Lint (R1–R15).
- Ngoại lệ (nếu có) được ghi vào sổ ngoại lệ.

## 6. Lộ trình triển khai đề xuất

| Bước | Việc | Đầu ra | Cần PO duyệt |
|---|---|---|---|
| 1 | Chốt 4 xung đột X1–X4 | Phán quyết PO (như K1–K3) | **Có** |
| 2 | Hợp nhất luật vào 03a + tạo `docs/dac-ta/ux-patterns/` + cập nhật REGISTRY; chuyển kit gốc về `docs/archive/` | Tài liệu chuẩn duy nhất | **Có** (03a là CANONICAL) |
| 3 | Xây `task-state.ts`, `TaskStatus`, `ConfirmDialog`, `Disclosure`, `ResultPanel` trong `ui/` kèm test | Component dùng chung | Không (không thêm dependency) |
| 4 | Pilot 1 luồng đại diện: **Tải ảnh → xử lý → kết quả** (`/tai-anh`, `upload-wizard.tsx`) — luồng phổ biến nhất và có nhiều trạng thái nhất | Báo cáo trước/sau | **Có** — CLAUDE.md yêu cầu hỏi PO khi đụng tính năng tải ảnh (chặng nào trong 14 chặng chạy) |
| 5 | Thêm R13–R15 vào `scripts/ux-lint.ts` dạng ratchet; khóa baseline | Lint tự động | Không |
| 6 | Rollout theo nhóm công cụ: Creative Studio → Catalog/Landing → Market Intelligence → Đơn hàng/CRM → Cài đặt | Mỗi nhóm một PR, mỗi PR không tăng baseline | Theo từng nhóm |

Phần **không làm**: đại tu toàn bộ giao diện một lần; đổi `FeatureGuidanceCard` và `TabActionHeader` (UX khóa bởi PO); thay đổi schema/API để đổi tên trạng thái backend (chỉ ánh xạ ở tầng UI).

## 7. Rủi ro

| Rủi ro | Giảm thiểu |
|---|---|
| Hai chuẩn song song gây phân loại sai | Hợp nhất vào 03a, lưu trữ kit gốc (X1, X4) |
| Đổi trạng thái trên diện rộng làm hỏng màn đang chạy | Chỉ thêm lớp ánh xạ ở UI; giữ giá trị backend; test cho từng ánh xạ |
| Lint mới làm đỏ CI | Dùng ratchet như R1–R3, chỉ chặn vi phạm mới |
| Thay `confirm()` đổi hành vi người dùng quen | Làm theo nhóm công cụ, có e2e cho luồng xóa/xuất bản |

## 8. Giới hạn của đánh giá này
- Đánh giá dựa trên **đọc tài liệu và quét mã tĩnh**; chưa chạy ứng dụng, chưa kiểm thử với người dùng thật.
- Các con số ở mục 4 là số lần xuất hiện chuỗi trong `src/**/*.tsx`, dùng để chỉ ra mức phân mảnh, không phải số màn bị lỗi.
- `CLAUDE.md` tham chiếu `.agents/AGENT_RULES.md` và `.claude/skills/`, nhưng hai đường dẫn này **không tồn tại** trong repo hiện tại — nên kiểm tra riêng.

## 9. Bổ sung để đạt commercial / production-ready / enterprise (đã duyệt)

| Nhóm | Mã | Đề xuất | Luật trong 03c |
|---|---|---|---|
| Enterprise bắt buộc | E1 | Hiển thị theo quyền và gói | UX-018, UX-P11 |
| | E2 | Minh bạch chi phí AI | UX-019, UX-P12 |
| | E3 | Nhật ký hành động R3 + mã hỗ trợ | UX-020 |
| | E4 | Hoàn tác & tự lưu nháp | UX-021 |
| | E5 | Cô lập tổ chức trên client | UX-022 |
| Production-ready | E6 | Ngân sách hiệu năng LCP/INP/CLS | §6.2 |
| | E7 | Đo hành vi theo pattern | §6.2 |
| | E8 | axe + ảnh so sánh + 3 preset ở 390px | §6.1 |
| | E9 | Rollout bằng cờ tính năng | §6.1 |
| | E10 | Mạng yếu, idempotency | UX-016, §6.2 |
| Commercial | E11 | Lần dùng đầu có dữ liệu mẫu | UX-023 |
| | E12 | Trung tâm thông báo | UX-024 |
| | E13 | Trợ giúp tại chỗ | UX-025 |
| | E14 | Từ điển thuật ngữ + lint R16 | UX-026 |
| Quản trị | E15 | Bảng điểm UX từng màn trong CI | §6.4 |
| | E16 | Phiên bản component dùng chung | §6.4 |
