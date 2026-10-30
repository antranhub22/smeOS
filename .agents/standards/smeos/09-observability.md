# SMEOS · 09 · Giám sát & truy vết (đối chiếu code 30/10/2026)

Áp dụng của [universal/09](../universal/09-observability.md). Ràng buộc gốc: D19 "không thêm hạ tầng" — log JSON ra `stdout`, không SDK. Thêm công cụ theo dõi lỗi/metrics/trace là **dependency + nhà cung cấp mới → PO duyệt**.

## 1. Đang có
| Thành phần | Vị trí | Ghi chú |
|---|---|---|
| Logger có cấu trúc | `src/core/observability/log.ts` (`log.debug/info/warn/error`, ngữ cảnh `organizationId`, `workspaceId`, `userId`, `jobId`, `feature`) | Che khoá cấm (`password`, `secret`, `token`, `apiKey`…) |
| Hook lỗi server | `src/instrumentation.ts` (`onRequestError`) → `core/observability/request-error.ts` (`reportRequestError`) | Chỉ log, chưa gửi công cụ ngoài |
| Sức khoẻ | `/api/health` → `core/observability/system-health.ts` (DB, Redis; `SLOW_DATABASE_MS = 1000`), 503 khi DB lỗi, `no-store`; Render `healthCheckPath: /api/health` | Một endpoint cho cả liveness lẫn readiness |
| Sự kiện job | worker ghi `job_events` (`event`, `payload` JSON) | Theo dõi tiến trình từng job |
| Log nghiệp vụ có tên ổn định | vd. `landing_content.generated`, `rate_limit.redis_fallback`, `catalog_content.generated` | — |
| Sổ AI | gateway ghi mô hình, chi phí, kết quả (`ai-governance`) | Dữ liệu cho chi phí AI theo tenant |

## 2. Trạng thái
| Mục chuẩn | Trạng thái | Việc cần làm (xem ROADMAP E1) |
|---|---|---|
| Log JSON + che khoá | ✅ | — |
| `request_id` xuyên web → job → worker | ✅ `src/proxy.ts` gắn `x-request-id` (request + phản hồi); `handle()` chạy trong `request-context.ts` (AsyncLocalStorage) nên `log` tự thêm `requestId`; `generation_jobs.request_id`; worker in `job.claimed` (`workers/shared/job_trace.py`) | Route không bọc `handle()` chưa có `requestId` trong log |
| Không `console.*` trong mã sản phẩm | 🔴 31 tệp còn `console.*`; ESLint chưa có `no-console` | Ratchet `no-console` (giống `i18n-direct-intl-ratchet`) |
| Công cụ theo dõi lỗi | 🔴 chưa có | Chọn nhà cung cấp (PO) → adapter trong `instrumentation.ts` |
| Metrics RED / hàng đợi / kênh / chi phí AI | 🔴 chưa có số đo; chỉ có dữ liệu thô trong DB | Bước 1: màn vận hành đọc từ DB (`job_events`, sổ AI); bước 2: exporter |
| Readiness tách liveness | 🟡 một endpoint | `/api/health/ready` |
| Worker heartbeat | 🟡 chỉ có quét job treo 15 phút (`markStuckAsFailed`) | Heartbeat từng worker |
| Log worker Python cùng định dạng | 🟡 chưa thống nhất trường | Helper log JSON trong `workers/shared/` |
| SLO + cảnh báo + runbook | 🔴 chưa có | 3–5 SLO trong `docs/handover/OPERATIONS_RUNBOOK.md` |

## 3. Quy tắc cho agent (áp dụng ngay)
1. Dùng `log` của `core/observability/log.ts`; không thêm `console.*` mới.
2. Đặt `event` dạng `module.hanh_dong`, không nhúng giá trị động; truyền `organizationId`, `jobId` qua ngữ cảnh.
3. Không log nội dung khách, email, số điện thoại, prompt đầy đủ.
4. Không thêm SDK giám sát khi PO chưa chọn nhà cung cấp.
