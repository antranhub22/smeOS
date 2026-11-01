# E — Screen Contract Coverage Report

Điểm miền: **2− / PARTIAL**. Nơi lưu: `docs/dac-ta/screen-contracts/` — 45 contract + `_TEMPLATE.md` + `README.md`. REGISTRY dòng 539 (`SUPPORTING`). Agent được yêu cầu dùng: `CLAUDE.md` (SSOT/Screen Contracts cập nhật cùng commit), `OPERATING_PRINCIPLES.md` §5.1/§5.7, skill `ui-development` dòng 226, `AGENTS.md` dòng 575.

## E1. Mẫu contract so với 20 trường đề bài

| # | Trường | Mẫu `_TEMPLATE.md` | Ghi chú |
|---|---|---|---|
| 1 | Screen ID | ✗ | Chỉ có tên tệp/tuyến; không mã ổn định để test/tài liệu tham chiếu. |
| 2 | Screen name | ✓ | Tiêu đề. |
| 3 | Application layer | ◐ | §1 “Phạm vi: organization \| branch \| platform” — **không theo 4 tầng** (Mother/Ngành/Chain/Store). |
| 4 | Module | ✗ | Có “Thẻ” (mã việc) thay vì module. |
| 5 | Business purpose | ✓ | “Việc chính”, “Câu hỏi chính”. |
| 6 | Target user | ✓ | Vai chính/phụ (03b). |
| 7 | Permissions | ✓ | §10 “năng lực”. |
| 8 | Layout type | ✓ | Archetype A–F (bổ sung 29/10). |
| 9 | Component deps | ✓ | §11. |
| 10 | Data requirements | ✓ | §10. |
| 11 | API dependencies | ✓ | §2. |
| 12 | User actions | ✓ | §4 (1 chính, ≤2 phụ, menu `…`). |
| 13 | Interaction rules | ◐ | §15 PD/rủi ro; không có hành vi bàn phím/cử chỉ. |
| 14–17 | Loading / Empty / Error / Success | ✓ | §6 (thêm “không quyền”, “một phần”). |
| 18 | Responsive | ✓ | §7 — chỉ 390/768/1280, không 360/430/1024/1440. |
| 19 | Accessibility | ✓ | §8. |
| 20 | Acceptance criteria | ◐ | §13 QA Matrix PASS/WARNING/FAIL theo chiều; không có tiêu chí kiểm được (Given/When/Then hoặc ảnh mốc bắt buộc). |

**Kết luận:** mẫu tốt (15 ✓, 3 ◐, 2 ✗), vượt mức “danh sách tên màn”.

## E2. Độ phủ tuyến

Đơn vị đo: **nhóm tuyến cấp 1** (54 nhóm từ 105 `page.tsx`). Có contract trùng tên: 31; có contract con: `cong-cu` (3 contract `cong-cu-*`), `uu-dai` (`ma-giam-gia.md`). → **~33/54 (61%)**; tính theo `page.tsx` thì thấp hơn nhiều (vd. `/van-hanh` có 19 trang, 1 contract; README đặt quy ước `van-hanh-<trang>.md` nhưng **không tệp nào tồn tại**).

| Tầng | Nhóm tuyến | Có contract | Thiếu |
|---|---|---|---|
| SaaS Mother (`(platform)/van-hanh/*`, 19 trang) | 1 | `van-hanh.md` (14 mục) + `_journey-home-platform.md` | 18 trang con (to-chuc, nganh, phe-duyet, marketplace, suc-khoe, ma-tran-*…) |
| SaaS Ngành | 0 trang riêng | — | Không áp dụng (chưa có bề mặt UI, xem A2) |
| ChainOS (`/dieu-phoi`, `/dieu-phoi/doi-tac`) | 2 | **0** (chỉ nhắc trong `_dieu-huong.md`, `_journey-home-network.md`) | **UI-E-01 (P1)** — tầng ChainOS không có contract cho màn điều phối cốt lõi |
| StoreOS (`(app)`) | ~45 | 30 | `cua-hang`, `bao-gia`, `chat`, `tin-nhan`, `tich-hop`, `du-lieu`, `creative-studio`, `noi-bo`, các trang con `cai-dat/*`, `san-pham/[id]`, `tinh-gia/*`… |
| Khách xem (công khai) | 11 (`b`, `bst`, `c`, `ch`, `g`, `s`, `chia-se`, `subcontract`, `xem-truoc-trang`, `dang-ky-thanh-cong`, `chinh-sach-bao-mat`) | **0** | **UI-E-02 (P1)** — bề mặt khách cuối thấy (nơi `OPERATING_PRINCIPLES` §2 cấm dữ liệu giả) không có contract |
| Auth (`/dang-nhap`) | 1 | 0 | — |

## E3. Mức tuân thủ mẫu của 45 contract hiện có

Đếm bằng từ khoá (chỉ báo, không thay đọc tay):

| Nội dung | Số contract có |
|---|---:|
| Responsive (từ “responsive”/“390”) | 41/45 |
| Trợ năng (“trợ năng”/“aria”/“axe”) | 41/45 |
| API (`/api/v1`) | 37/45 |
| QA Matrix / PASS | 36/45 |
| Trạng thái rỗng (“rỗng”) | 34/45 |
| **Archetype A–F khai báo** | **6/45** (`bang-gia`, `don-hang`, `kho-du-lieu`, `landing-page`, `ma-giam-gia`, `thu-hut-khach`) |

Số mục `##` dao động 3–18 (`cong-cu-poster-banner.md` 3 mục, `landing-page.md` 4, `tinh-gia.md` 4 so với 15 của mẫu) → nhiều contract mới (29/10) là **bản rút gọn**, thiếu L0–L4, content budget, trạng thái.

## E4. Độ cập nhật

| Contract | Ngày ghi trong tệp | Commit cuối contract | Commit cuối trang | Commit trang sau contract |
|---|---|---|---|---:|
| `san-pham.md` | 26/09/2026 | 2026-10-23 | 2026-10-31 | 4 |
| `khach-hang.md` | 26/09/2026 | 2026-10-23 | 2026-10-31 | 3 |
| `duyet.md` | 26/09/2026 | 2026-10-23 | 2026-10-30 | 3 |
| `vai-tro.md` | 26/09/2026 | 2026-10-23 | 2026-10-30 | 4 |
| `don-hang.md` | 31/10/2026 | 2026-10-31 | 2026-10-31 | 3 (cùng ngày) |
| `van-hanh.md` | 30/10/2026 | 2026-11-01 | 2026-11-01 | 0 |

Lệnh: `git log --oneline --since=<ngày contract> -- "src/app/(app)/<tuyến>"`. Có trôi dạt (**UI-E-03, P2**): luật “cập nhật contract cùng commit” không có cổng kiểm; trạng thái QA trong `README.md` §4 (vd. `_journey-home-store.md` **PASS**) là tự khai.

## E5. Cơ chế kiểm (validation)

- `scripts/check-docs.mjs`: **không** đọc `screen-contracts/` (chỉ đối chiếu 06/07, tenant, tài liệu agent).
- Không có test/script nào tham chiếu `screen-contracts` (`grep -rl screen-contracts tests scripts` → rỗng).
- `scripts/ux-audit/scenarios/` có kịch bản cho 4 trang (`the-chao`, `landing-page`, `poster-banner`, `tinh-gia`) — không liên kết máy-đọc-được với contract.

**Tác động:** Screen Contract hiện là **tài liệu khuyến nghị**, không phải hợp đồng thực thi. Agent có thể tạo màn mới không contract mà CI vẫn xanh; contract cũ không bị phát hiện khi trang đổi.

## E6. Agent có được yêu cầu theo contract không?

Có, ở 4 nơi (`CLAUDE.md`, `OPERATING_PRINCIPLES` §5, skill `ui-development`, `AGENTS.md` dòng 575) — nhưng diễn đạt khác nhau (“đọc contract”, “đã có Screen Contract chưa?”, “phải có Screen Contract”), README contracts giới hạn bắt buộc chỉ khi “sửa bố cục…theo quy trình T5.SOP”. Không có câu “thiếu contract → dừng”. Đánh giá: **có hướng dẫn, chưa có cưỡng chế**.
