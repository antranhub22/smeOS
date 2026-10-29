# Báo cáo Audit Giai đoạn 1 — Progressive Disclosure & Enterprise UX

> Ngày: 29/10/2026 · Nhánh: `NangcapkientrucUX_progressiveDisclosure` (cơ sở `main` @ `731be68`)
> Chuẩn đối chiếu: `docs/dac-ta/03a-ux-constitution.md` + `docs/dac-ta/03c-ux-progressive-disclosure.md`
> Bảng chi tiết 84 màn: `docs/ui-ux/PD_AUDIT_INVENTORY.md` · Kế hoạch: `docs/ui-ux/PROGRESSIVE_DISCLOSURE_EXECUTION_PLAN.md`

## 1. Phạm vi & phương pháp

| Mục | Nội dung |
|---|---|
| Phạm vi | 84 `page.tsx` trong `src/app` (ứng dụng tiệm, nền tảng, xác thực, trang công khai) |
| Phương pháp | Quét tĩnh mã nguồn (chuỗi, import 3 tầng) + đọc tay các điểm nổi bật; đối chiếu enum `prisma/schema.prisma` |
| Mức tin cậy | **Đã xác minh** = có file:line bên dưới; **Chỉ báo** = số đếm tự động, cần xem tay khi nâng cấp từng màn |
| Không làm | Chưa chạy ứng dụng/trình duyệt, chưa đo web-vitals, chưa chạy axe, chưa thử với người dùng (xem §8) |

## 2. Tóm tắt điều hành

**Điểm tốt (đã xác minh)**
- `npm run lint:ux` hiện có **0 vi phạm** R1–R12: token màu/chữ, nhãn icon, alt ảnh đã sạch.
- **Cô lập tổ chức trên client (E5) gần như đạt:** khóa lưu trữ dữ liệu nghiệp vụ đều gắn `organization_id` — `src/components/upload/job-storage-key.ts:7`, `src/components/layout/nav-storage.ts:6`, `src/components/products/bulk-import/import-session-storage.ts:4`, `src/components/layout/nav-toolkit-shortcuts.ts:76`.
- Nội dung các hộp xác nhận hiện tại **đã nêu hậu quả rõ** (ví dụ `cai-dat/thanh-vien/_components/member-account-actions.tsx:65`) — chỉ cần chuyển sang `ConfirmDialog`, không cần viết lại câu chữ.
- Một số màn đã ghi chi phí AI cạnh nút (`catalog/quick-product-upload-modal.tsx:223`, `market-intelligence/creative-handoff-modal.tsx:640`).

**Rủi ro lớn nhất**
1. **Tiến độ giả lập** trên màn dựng video — vi phạm trực tiếp UX-016 (P0).
2. **Không có từ vựng trạng thái thống nhất:** cùng `PROCESSING` hiển thị 4 kiểu chữ khác nhau.
3. **Mã kỹ thuật và jargon lộ ra màn hình** trong Creative Studio ("P4", "Worker", "render", "job").
4. **28 hành động rủi ro cao** dùng hộp `confirm()` của trình duyệt.
5. **Màn chính chưa có Screen Contract:** Creative Studio, bộ công cụ ảnh, Landing page, Điều phối.

## 3. Issue register

| ID | Mức | Phát hiện | Bằng chứng | Luật | Đề xuất |
|---|---|---|---|---|---|
| A01 | **P0** | Thanh tiến độ tự tăng 6/3/1% khi không có dữ liệu thật; khi có job chỉ cộng +3% mỗi lần hỏi, chặn ở 88% | `src/components/video-studio/video-rendering-progress.tsx:84`, `:88-94` (bình luận "giả lập") · dùng ở `/video` | UX-016, P04 | Bỏ phần trăm; dùng `TaskStatus` "Đang xử lý" + thời gian đã chờ; chỉ hiện % khi backend trả tiến độ |
| A02 | P1 | `PROCESSING` hiển thị: "Đang chạy" / "Đang thực hiện" / "Đang làm" / "Đang xử lý" | `src/app/(app)/job/page.tsx:32`, `src/app/(app)/job/[id]/page.tsx:31`, `src/modules/orders/use-cases/export-orders.ts:29` | UX-016, UX-026 | `task-state.ts` ánh xạ `job_status` → nhãn chuẩn (bảng §4) |
| A03 | P1 | Mã kỹ thuật & jargon trên UI: "Đã render — chưa duyệt P4", "job ${id}", "Worker đang dựng video...", "Worker đang đọc lời thoại...", "Đang render" | `creative-studio/package-review-section.tsx:459`, `creative-studio/package-workspace.tsx:595`, `creative-studio/video-job-lifecycle.tsx:34`, `:166`, `creative-studio/package-revise-panels.tsx:232` | CLAUDE.md #6, 03a §39, UX-026 | Sửa nhãn theo `glossary.md`; mở rộng lint R8 để bắt "P\d", "Worker", "job " |
| A04 | P1 | Hộp `confirm()` của trình duyệt cho hành động R3: xóa tài khoản thành viên, đặt lại mật khẩu, thu hồi link khách, xóa mẫu khỏi bộ sưu tập, ngắt kết nối, tạo khóa thanh toán mới, duyệt dữ liệu bán hàng, từ chối đăng ký… | 28 điểm gọi trong 25 tệp, ví dụ `cai-dat/thanh-vien/_components/member-account-actions.tsx:37,51,65`, `greeting-card/sales/sales-session-table.tsx:43`, `greeting-card/admin/brochure-bank-sync-settings.tsx:26`, `ket-noi/page.tsx:227`, `(platform)/van-hanh/dang-ky/page.tsx:46` | UX-015, R13, P07 | Thay bằng `ConfirmDialog`; giữ nguyên câu chữ hậu quả; R3 ghi nhật ký (UX-020) |
| A05 | P1 | Hỏi chi phí AI bằng `confirm()` thay vì hiển thị cạnh nút; không màn tiệm nào hiện **lượt còn lại** cạnh CTA (số dư chỉ có ở `platform/platform-data-hub.tsx:241`) | `catalog/quick-product-upload-modal.tsx:79` | UX-019, P12 | `CostPreview` cạnh CTA: "Dùng 1 lượt · còn N" |
| A06 | P2 | Từ "credit", "Vision AI" trên nhãn người dùng | `market-intelligence/product-upload-card.tsx:354`, `catalog/quick-product-upload-modal.tsx:223` | UX-026 | Đổi thành "lượt" theo `glossary.md` |
| A07 | P2 | 15 màn ứng dụng chưa có Screen Contract, gồm công cụ chủ lực | `/creative-studio`, `/cong-cu`, `/cong-cu/anh-san-pham`, `/cong-cu/bo-anh-san-pham`, `/cong-cu/poster-banner`, `/landing-page`, `/dieu-phoi`, `/dieu-phoi/doi-tac`, `/bao-gia`, `/chat`, `/tin-nhan`, `/du-lieu`, `/cua-hang`, `/noi-bo/ket-noi`, `/dang-nhap` | 03a §37, 03c §9 | Tạo contract theo template mới (§15) trước khi nâng cấp màn đó |
| A08 | P2 | Vùng mở rộng tự viết bằng `<details>` (10 tệp) — hành vi giữ giá trị/bàn phím không đồng nhất | Chi tiết theo màn: `PD_AUDIT_INVENTORY.md` cột `<details>` | UX-017, R15, P03 | `Disclosure` dùng chung |
| A09 | P2 | 41 màn có gọi dữ liệu nhưng không dùng `EmptyState`/`Skeleton`/`InlineError` (tự xử lý hoặc thiếu) | `PD_AUDIT_INVENTORY.md` | 03a §24, P06, P08 | Xem tay khi nâng cấp từng nhóm |
| A10 | P2 | Tùy chọn hiển thị "chế độ chuyên gia" lưu theo trình duyệt, không theo người dùng/tổ chức; khóa cấu hình giao diện `smeos_ui_config` dùng chung trên máy | `dashboard/store-journey-home.tsx:16`, `src/lib/ui-system/ui-provider.tsx:21` | UX-022 (mức thấp — chỉ là tùy chọn hiển thị, không phải dữ liệu nghiệp vụ) | Gắn hậu tố tổ chức khi chạm tới các tệp này |
| A11 | P2 | Khóa `floraos_finalized_pitches_${orgKey}` rơi về `"default"` khi phiên chưa có tổ chức | `src/app/(app)/tai-anh/page.tsx:184`, `components/storage/account-storage-hub.tsx:167` | UX-022 | Không đọc/ghi khi chưa có `organization.id` (như `job-storage-key.ts`) |
| A12 | P2 | Không có cơ chế cờ tính năng trong `src/` | Không tìm thấy `featureFlag`/`feature_flag` | E9 | **[PO]** chọn cơ chế (cấu hình tổ chức sẵn có hay bảng mới) |
| A13 | P2 | Chưa có trung tâm thông báo trong ứng dụng cho tác vụ nền — `components/notification/` là ma trận cấu hình kênh, không phải hộp thông báo | `src/components/notification/notification-matrix-page.tsx` | UX-024 | Giai đoạn 5 |
| A14 | P2 | Chưa đo web-vitals; chưa có kiểm tra axe; ảnh so sánh (`toHaveScreenshot`) mới có 1 tệp | grep toàn repo | E6, E8 | Giai đoạn 2.8 |

Không phát hiện P0 về rò dữ liệu chéo tổ chức trên client.

## 4. Bảng ánh xạ trạng thái backend → UI (đầu vào `task-state.ts`)

| Nguồn | Giá trị backend | Trạng thái UI | Nhãn chuẩn |
|---|---|---|---|
| `job_status` | `PENDING` | `queued` | Đang chờ xử lý |
| | `PROCESSING` | `running` | Đang xử lý |
| | `COMPLETED` | `succeeded` | Đã xong |
| | `FAILED` | `failed` | Chưa xong được |
| | `CANCELLED` | `canceled` | Đã hủy |
| `asset_state` | `PROCESSING` / `READY` / `FAILED` / `ARCHIVED` | `running` / `succeeded` / `failed` / (không phải tác vụ — ẩn khỏi TaskStatus) | như trên |
| `video_stage` | `SCRIPT_GENERATING`, `RENDERING` | `running` | Đang viết kịch bản / Đang dựng video |
| | `SCRIPT_READY`, `RENDER_COMPLETED` | `succeeded` + **cần duyệt** | Kịch bản/Video đã xong — chờ duyệt |
| | `DRAFT`, `SCRIPT_APPROVED`, `APPROVED`, `REJECTED` | Trạng thái quy trình (không phải tác vụ) | Giữ nhãn nghiệp vụ hiện có |
| | `FAILED` | `failed` | Chưa xong được |
| Bảng chuỗi (`schema.prisma:2784`) | `PENDING`/`RUNNING`/`COMPLETED`/`FAILED` | `queued`/`running`/`succeeded`/`failed` | như trên |

Chuỗi viết thường trong component (`"done"`, `"processing"`…) phần lớn là **trạng thái cục bộ của UI** (bước wizard), sẽ chuyển sang từ vựng `idle/validating/submitting/...` khi nâng cấp từng màn. Trạng thái đơn hàng/thanh toán (`order_status`, `PAYMENT_*`) **không thuộc** máy trạng thái tác vụ — giữ nhãn nghiệp vụ.

## 5. Phân loại rủi ro hành động (mẫu cho Screen Contract §15)

| Mức | Hành động tiêu biểu đã thấy trong mã |
|---|---|
| **R3** | Xóa/đặt lại mật khẩu/khóa tài khoản thành viên · thu hồi link khách · xóa mẫu khỏi bộ sưu tập (ảnh hưởng mọi link đã gửi) · tạo khóa thanh toán mới · ngắt kết nối nền tảng · duyệt dữ liệu bán hàng · từ chối đăng ký · hủy lệnh điều phối chuỗi · bỏ qua bước để giao gấp · xóa giọng nhân bản (gỡ khỏi nhà cung cấp) |
| **R2** | Phân tích lại ảnh (tốn lượt) · tạo biến thể/video · khôi phục chính sách về mặc định · nạp dữ liệu mẫu · ẩn bộ sưu tập · mở khóa ngày lịch |
| **R1** | Đổi bộ lọc, mở chi tiết, tạo bản nháp, chọn mẫu |

## 6. Thứ tự rollout đề xuất (chờ PO duyệt)

| Thứ tự | Nhóm | Lý do | Vấn đề chính |
|---|---|---|---|
| 0 | **Pilot: Tải ảnh** (`/tai-anh`) | Luồng phổ biến nhất, nhiều trạng thái, đã có contract, đã có khóa job gắn tổ chức | A02, A05, A11 |
| 1 | **Creative Studio + Video** | Có P0 (A01) và nhiều jargon nhất (A03); chưa có contract | A01, A03, A07 |
| 2 | **Cài đặt / Thành viên / Kết nối** | Tập trung hành động R3 (A04) | A04 |
| 3 | **Catalog / Landing / Thiệp** | Nhiều `confirm()` và chuỗi trạng thái thô | A04, A07, A08 |
| 4 | **Market Intelligence + Công cụ ảnh** | Chi phí AI (A05/A06), chưa có contract | A05–A07 |
| 5 | **Đơn hàng / CRM / Điều phối** | R3 điều phối chuỗi, chưa có contract | A04, A07 |
| 6 | **Nền tảng (`/van-hanh/*`)** | Người dùng nội bộ, rủi ro người dùng cuối thấp hơn | A04 |
| 7 | **Trang công khai** (`/b`, `/bst`, `/g`, `/c`, `/s`) | Khách cuối dùng; chỉ đụng sau khi component ổn định | A08 |

**Đề xuất tách A01 làm bản sửa riêng ngay trong Giai đoạn 2** (không chờ rollout nhóm 1), vì đây là báo sai trạng thái cho người dùng.

## 7. Quyết định cần PO

1. Duyệt thứ tự rollout §6 và việc sửa A01 sớm.
2. Pilot Tải ảnh: những chặng nào trong 14 chặng journey sẽ chạy (bắt buộc theo CLAUDE.md).
3. Cơ chế cờ tính năng (A12): dùng cấu hình tổ chức sẵn có hay thêm bảng mới (đụng `prisma/schema.prisma`).
4. Kiểm tra trợ năng tự động (E8): repo **chưa có** axe — cần duyệt thêm dependency dev (`@axe-core/playwright`) hoặc chấp nhận kiểm tra tay.

## 8. Giới hạn

- **Chỉ quét tĩnh.** Chưa chạy app, chưa xem giao diện thật, chưa đo hiệu năng/axe, chưa kiểm thử với người dùng. Baseline đo hành vi (E7) và web-vitals (E6) sẽ lấy ở đầu Giai đoạn 3.
- Số đếm theo màn gồm cả component dùng chung → một vấn đề có thể xuất hiện ở nhiều màn; không cộng dồn.
- Heuristic "chưa dùng component trạng thái chung" (A09) có thể bắt cả màn đã tự xử lý tốt; cần xem tay.
- Phân loại R1–R3 ở §5 là đề xuất từ nội dung hộp xác nhận hiện có; xác nhận lại khi lập contract từng màn.
