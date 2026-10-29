# Kế hoạch thực thi — Nâng cấp kiến trúc UX Progressive Disclosure & Enterprise

> Trạng thái: **ĐÃ DUYỆT** (PO, 29/10/2026) · Nhánh: `NangcapkientrucUX_progressiveDisclosure`
> Chuẩn: `docs/dac-ta/03a-ux-constitution.md` + `docs/dac-ta/03c-ux-progressive-disclosure.md` · Pattern: `docs/dac-ta/ux-patterns/`
> Đánh giá gốc: `docs/ui-ux/PROGRESSIVE_DISCLOSURE_KIT_ASSESSMENT.md`

## 0. Nguyên tắc thực thi
- **Không vẽ lại giao diện thị giác.** Preset `moc-lan`/`modern-slate`/`pure-swiss`, token, `FeatureGuidanceCard`, `TabActionHeader` giữ nguyên.
- **Chỉ ánh xạ ở tầng UI.** Không đổi giá trị trạng thái trong schema/API.
- **Mỗi bước một PR**, không tăng baseline lint, không có lỗi gate mới so với `main` (CLAUDE.md DoD).
- **Cờ tính năng** cho mọi màn nâng cấp (E9) — tắt được theo tổ chức.
- Mục ghi **[PO]** phải dừng lại xin duyệt trước khi làm.

## Giai đoạn 0 — Chuẩn & tài liệu ✅ (nhánh này)
| Việc | Đầu ra | Trạng thái |
|---|---|---|
| Phán quyết PD1–PD4, UX-015…026, R13–R16, DoD | `docs/dac-ta/03c-ux-progressive-disclosure.md` | Xong |
| Thư viện pattern P01–P12, từ điển, sổ ngoại lệ | `docs/dac-ta/ux-patterns/` | Xong |
| Screen Contract thêm §15 | `docs/dac-ta/screen-contracts/_TEMPLATE.md` | Xong |
| Trỏ 03a §0.2 sang 03c; REGISTRY | `03a`, `00-DOCUMENTATION-REGISTRY.yaml` | Xong |
| Lưu trữ bộ kit gốc | `docs/archive/historical/SMEOS_UX_Progressive_Disclosure_Kit/` | Xong |

**Exit gate:** `npm run check:docs` xanh.

## Giai đoạn 1 — Audit toàn bộ (chỉ đọc, ~84 màn `page.tsx`)
| Việc | Đầu ra |
|---|---|
| 1.1 Inventory màn × pattern × component đang dùng | `docs/ui-ux/PD_AUDIT_INVENTORY.md` |
| 1.2 Bảng phân tầng L0–L4/SYS cho trường/nút chính từng màn | §15 trong Screen Contract của màn đã có; màn chưa có → danh sách cần tạo |
| 1.3 Gắn mức rủi ro R1–R3 cho mọi hành động có hậu quả; liệt kê 26 file dùng `confirm()` | Issue register |
| 1.4 Liệt kê giá trị trạng thái tác vụ theo từng API/worker → bảng ánh xạ | Đầu vào cho `task-state.ts` |
| 1.5 Kiểm tra E5: khóa `localStorage`/cache không gắn tổ chức (bắt đầu từ `smeos_ui_config`) | Issue register (P0 nếu rò chéo tổ chức) |
| 1.6 Baseline: lint:ux, axe trên luồng cốt lõi, web-vitals nếu đo được | Số liệu nền |
| 1.7 Xếp hạng màn: P0/P1/P2 + đề xuất thứ tự rollout | Báo cáo audit |

**Exit gate:** báo cáo có bằng chứng file/line; **[PO]** duyệt thứ tự rollout.

## Giai đoạn 2 — Nền tảng component & công cụ (không đổi màn nào)
| Việc | Tệp | Test |
|---|---|---|
| 2.1 Máy trạng thái + hàm ánh xạ backend→UI | `src/lib/ui-system/task-state.ts` | Unit: mọi giá trị backend từ 1.4 |
| 2.2 `TaskStatus` | `src/components/ui/task-status.tsx` | Unit + `aria-live` |
| 2.3 `ConfirmDialog` (dựa `dialog.tsx`) | `src/components/ui/confirm-dialog.tsx` | Unit: Esc, focus, chống bấm kép |
| 2.4 `Disclosure` | `src/components/ui/disclosure.tsx` | Unit: bàn phím, giữ giá trị |
| 2.5 `ResultPanel` | `src/components/ui/result-panel.tsx` | Unit |
| 2.6 `EntitlementGate`, `CostPreview` (P11, P12) | `src/components/ui/` | Unit; dữ liệu quota/capability lấy từ API sẵn có |
| 2.7 Lint R13–R16 dạng ratchet, khóa baseline | `scripts/ux-lint.ts` | Unit cho từng luật |
| 2.8 axe trong E2E luồng cốt lõi (E8) | `tests/e2e/` | Dùng công cụ có sẵn trong repo; **[PO]** nếu phải thêm dependency |
| 2.9 Cờ tính năng theo tổ chức (E9) | theo cơ chế sẵn có | **[PO]** nếu cần bảng/cột mới (`prisma/schema.prisma`) |

**Exit gate:** typecheck, lint:ratchet, lint:ux --check, `npm test` xanh; không đổi API public component cũ.

## Giai đoạn 3 — Pilot: Tải ảnh → xử lý → kết quả
- Phạm vi: `/tai-anh`, `src/components/upload/upload-wizard.tsx`, P01 + P04 + P05 + P06 + P12.
- **[PO] bắt buộc trước khi bắt đầu:** xác nhận các chặng trong 14 chặng journey sẽ chạy (quy định CLAUDE.md cho tính năng tải ảnh).
- Đo trước/sau (E7): tỷ lệ hoàn thành, bỏ ngang, thời gian hoàn thành, retry, lỗi axe, LCP/INP/CLS.
- Bật bằng cờ cho 1–2 tổ chức thử.

**Exit gate:** acceptance criteria P01 đạt; E2E UX xanh; báo cáo `docs/ui-ux/PD_PILOT_REPORT.md`; **[PO]** quyết rollout / sửa / dừng.

## Giai đoạn 4 — Rollout theo nhóm (mỗi nhóm một PR, có cờ)
1. Creative Studio (ảnh, video, biến thể, âm thanh)
2. Catalog / Landing / QR
3. Market Intelligence
4. Đơn hàng / CRM / Khách hàng (nhiều hành động R3 → `ConfirmDialog`, nhật ký)
5. Nội dung & lịch đăng, Hội thoại
6. Cài đặt, Tổ chức, Nền tảng (quyền/gói → P11)

Mỗi nhóm: cập nhật Screen Contract §15 → áp component → xóa vi phạm R13–R15 → hạ baseline lint → E2E + axe → bật cờ dần.

## Giai đoạn 5 — Enterprise bổ sung & quản trị
| Việc | Đề xuất | Ghi chú |
|---|---|---|
| Nhật ký hành động R3 + mã hỗ trợ | E3 / UX-020 | **[PO]** nếu cần bảng audit mới |
| Trung tâm thông báo cho tác vụ nền | E12 / UX-024 | Tận dụng `src/components/notification/` |
| Dữ liệu/kết quả mẫu lần dùng đầu | E11 / UX-023 | |
| Trợ giúp tại chỗ trong `FeatureGuidanceCard` | E13 / UX-025 | Không đổi cấu trúc (K1) |
| Lint R16 theo `glossary.md` | E14 / UX-026 | |
| Bảng điểm UX từng màn trong CI | E15 | **[PO]** — thay đổi CI |
| Quy trình phiên bản component dùng chung | E16 | |
| Lịch audit lại hàng quý | 03c §8, kit §8.6 | |

## Theo dõi
| Giai đoạn | Trạng thái | PR |
|---|---|---|
| 0 Chuẩn & tài liệu | Xong | nhánh `NangcapkientrucUX_progressiveDisclosure` |
| 1 Audit | Chưa bắt đầu | — |
| 2 Nền tảng | Chưa bắt đầu | — |
| 3 Pilot | Chờ PO xác nhận chặng | — |
| 4 Rollout | — | — |
| 5 Enterprise & quản trị | — | — |
