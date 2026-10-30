# 09 · Giám sát & truy vết (observability)

Mục tiêu: **biết lỗi trước khách**, trả lời được "đơn/ảnh/job X của tổ chức Y hỏng ở đâu" trong vài phút.

## 1. Ba tín hiệu
| Tín hiệu | Bắt buộc |
|---|---|
| **Log có cấu trúc** | Một dòng JSON/sự kiện, ra `stdout`. Trường chuẩn: `ts`, `level`, `event` (tên ổn định `module.hành_động`), `request_id`, `organization_id`, `user_id`, `job_id`, `feature`, `duration_ms`. **Che khoá cấm** (password, token, secret, apiKey, cookie…) và không ghi dữ liệu cá nhân khách cuối. Cùng định dạng ở web và worker ngôn ngữ khác. |
| **Số đo (metrics)** | RED cho mỗi route nhóm (Rate, Errors, Duration p50/p95/p99); hàng đợi job (độ dài, tuổi job già nhất, tỉ lệ lỗi theo loại); kênh ngoài (gửi/thất bại); **chi phí AI theo tenant**; pool DB. |
| **Truy vết (traces)** | Một `request_id` sinh ở cổng vào (hoặc nhận từ header tin cậy), đi theo mọi log, **ghi vào job** khi enqueue và được worker đọc lại. Chuẩn W3C `traceparent` khi có công cụ trace. |

## 2. Lỗi
- Mọi lỗi không bắt ở server đi qua **một hook** (vd. `onRequestError`) → log `error` + công cụ theo dõi lỗi (gom nhóm, cảnh báo lần đầu, phiên bản phát hành).
- Lỗi nghiệp vụ dự kiến (4xx) **không** là lỗi hệ thống — không cảnh báo.
- Gửi lên công cụ ngoài: che dữ liệu như log; gắn `organization_id`, `release`, không gắn email/điện thoại.

## 3. Sức khoẻ
- `/health` (liveness) nhẹ, không phụ thuộc ngoài. `/health/ready` (readiness) kiểm DB, cache, hàng đợi; trả 503 khi chưa sẵn sàng; `no-store`.
- Worker phát nhịp tim (heartbeat) định kỳ; job "đang chạy" quá lâu bị coi là treo.

## 4. Cảnh báo & SLO
- Đặt **SLO** cho hành trình chính (vd. tạo đơn, trang khách, phân tích ảnh): tỉ lệ thành công + độ trễ p95.
- Cảnh báo theo **ngân sách lỗi**, không theo từng lỗi lẻ. Mỗi cảnh báo có người nhận và runbook.
- Bảng điều khiển tối thiểu: RED web, hàng đợi job, kênh ngoài, chi phí AI, DB.

## 5. Quy tắc code
1. Không `console.*` trong mã sản phẩm — dùng logger chung (lint chặn).
2. Tên `event` ổn định, không nhúng giá trị động.
3. Use-case dài/nhiều bước ghi `duration_ms`.
4. Thêm phụ thuộc giám sát (SDK) chỉ ở `adapters/`/`instrumentation`, không rải trong module.

## 6. Checklist sẵn sàng
- [ ] request_id xuyên web → job → worker
- [ ] Công cụ theo dõi lỗi nối hook lỗi
- [ ] Metrics RED + hàng đợi + chi phí AI
- [ ] Readiness kiểm DB/cache/queue; worker heartbeat
- [ ] 3–5 SLO + cảnh báo + runbook
