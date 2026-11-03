# Báo cáo Pilot — Tạo ảnh sản phẩm chuyên nghiệp (`/cong-cu/anh-san-pham`)

> Giai đoạn 3 của `PROGRESSIVE_DISCLOSURE_EXECUTION_PLAN.md` · Ngày: 29/10/2026 · Nhánh `NangcapkientrucUX_progressiveDisclosure`
> Phạm vi theo PO V3: Chặng 01 (tải ảnh) + Chặng 02 + bước tạo ảnh. Bật bằng cờ `ux_pd_anh_san_pham`; tắt cờ → giao diện cũ.
> Screen Contract: `docs/dac-ta/screen-contracts/cong-cu-anh-san-pham.md`

## 1. Kết quả chính

| Hạng mục | Trước | Sau (cờ bật) | Bằng chứng |
|---|---|---|---|
| Công cụ chạy trọn luồng | **Không** — client đọc `data.jobId`/`data.status`, API trả `{ job_id }` và kết quả phẳng → không bao giờ ra kết quả | Có — đọc đúng hợp đồng (sửa cả bản cũ) | `product-photo-flow-logic.ts`, test `product-photo-flow-logic.test.ts` |
| Lỗi trợ năng serious/critical (axe, 390px) | 1 (A15) ở trạng thái đầu; chữ cảnh báo 3:1 sau khi chọn ảnh; vùng tải ảnh mờ mà không `disabled` | **0** ở trạng thái đầu và sau khi chọn ảnh | `tests/e2e/ux/a11y-pilot-anh-san-pham.spec.ts` (đã chạy, đạt) |
| Chi phí trước khi bấm (UX-019) | Không có | "Dự kiến dùng 3 credit · còn N"; khoá nút nếu không đủ | Thao tác thật trên máy chủ dev |
| Trạng thái tác vụ (UX-016) | Spinner chung | `TaskStatus`: Đang chờ xử lý → Đang xử lý → Đã xong / Chưa xong được; "Đã chờ N giây"; không phần trăm giả | Thao tác thật: bấm tạo → "Đang chờ xử lý · Đã chờ 3 giây" |
| Vòng hỏi trạng thái | Không giới hạn, không dừng khi rời trang | Tối đa 5 phút, dừng khi rời trang; quá hạn báo thật, không đoán | `MAX_POLLS`, test |
| Mở lại trang khi đang xử lý | Mất tác vụ | Tiếp tục theo dõi (khoá nhớ gắn tổ chức) | `photoJobStorageKey` |
| Báo "đã lưu" | `alert()` | Thông báo tại chỗ + liên kết Kho dữ liệu, chỉ sau khi backend báo xong | `product-photo-studio-flow.tsx` |
| Bấm trùng | Có thể tạo hai job | Khoá bằng `busyRef` + nút `disabled`; idempotency key ngẫu nhiên an toàn | `use-product-photo-job.ts` |
| Mã kỹ thuật/jargon | "Công cụ 01", "AI Provider", "upscale" | Đã bỏ | ảnh chụp, lint R16 |

## 2. Chưa đo được (cần dữ liệu thật)
- Tỷ lệ hoàn thành, bỏ ngang, thời gian hoàn thành, retry (E7): cần bật cờ cho 1–2 tổ chức thật và có worker xử lý ảnh chạy. Môi trường kiểm thử ở đây không có worker nên job dừng ở "Đang chờ xử lý" — đúng hành vi, nhưng chưa thấy màn kết quả với ảnh thật.
- LCP/INP/CLS (E6): chưa đo trên bản build production.

## 3. Phát hiện ngoài phạm vi (ghi lại, không sửa)
- `tests/e2e/ux/a11y.spec.ts` "trang chủ (/)" đang đỏ do chữ cảnh báo `#c97a2e` trên nền `#fbf1e4` (2,98:1) — thuộc trang chủ, nhánh này không sửa tệp nào của trang chủ.
- Token `text-warning` (không có hậu tố `-text`) không đạt 4,5:1 cho chữ nhỏ — dùng `text-warning-text` cho chữ (áp ở rollout đợt A).
- Menu Console có mục "Cấu hình nền tảng" `/van-hanh/cau-hinh` nhưng trang chưa tồn tại (404) — nay đã có trang, chứa bật/tắt cờ rollout.

## 4. Đề xuất cho PO
1. Bật cờ `ux_pd_anh_san_pham` cho 1–2 tổ chức thật ở `/van-hanh/cau-hinh`, chạy 1 tuần để đo E7.
2. Song song bắt đầu rollout đợt A-1 (Bộ ảnh sản phẩm, Poster & banner) dùng lại đúng các component của pilot.
