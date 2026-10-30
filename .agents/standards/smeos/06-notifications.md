# SMEOS · 06 · Thông báo (đối chiếu code 30/10/2026)

Áp dụng của [universal/06](../universal/06-notifications.md). Nguồn: ma trận 4 tầng 27/10 (`7c3f058`, `666b370`, `4fcd5a7`), khoá theo phạm vi + escape (`b4eba22`, AUD-014…025), capability F1/F2/N2 (`61859c8`), gửi theo sự kiện đơn (`1c625c5`, `afcf5a6`, AUD-041). Đặc tả: `docs/kien-truc/NOTIFICATION_SYSTEM_ARCHITECTURE.md`.

## 1. Bản đồ code (`src/modules/notification/`)
| Thành phần | Vị trí |
|---|---|
| Hợp đồng sự kiện (độc lập) | `domain/events/_contract.ts` (`NotificationTier`, `NotifyChannel`, nhóm, ưu tiên) |
| Danh mục sự kiện | `domain/events/{mother,industry,chain,store,store-order,store-operation}-events.ts` |
| Động cơ phân giải | `domain/cascading-policy.ts` (Gate 1 kích hoạt kênh → Gate 2 khoá cứng → bottom-up) — **riêng của notification**, khác `governance-decisions.ts` |
| Người nhận | `domain/notification-recipients.ts`, `infra/notification-recipient-repository.ts` |
| Gửi | `use-cases/dispatch-notification.ts`, `notify-organization.ts` (trần 50 người, không ném lỗi) |
| Nơi gọi | `orders/use-cases/create-order.ts`, `cancel-order.ts`, `assign-florist.ts`, `update-order-progress.ts` |
| Bảng | `notification_channel_activations`, `notification_event_visibility`, `notification_hard_locks`, `notification_org_policies`, … (có `organization_id` + index, `b62e5d5`) |
| Kênh | `infra/channel-adapters/` |
| Thời gian thực | `adapters/notification-sse-adapter.ts` (hub trong bộ nhớ) |

## 2. Trạng thái
| Mục | Trạng thái | Cưỡng chế |
|---|---|---|
| Phân giải 4 tầng, khoá theo phạm vi | ✅ | `cascading-policy.test.ts` |
| Deep link trỏ trang có thật | ✅ | `events-deeplinks.test.ts` |
| Escape nội dung kênh | ✅ | `channel-adapters-escaping.test.ts` |
| Gửi thật: In-app, Email (`core/notifications/email-service.ts`), Telegram | ✅ | — |
| SMS, Web Push, Zalo ZNS | 🟡 **stub** — chỉ ghi log | — |
| Sự kiện đang gửi: đơn mới, xác nhận, chế tác xong, đã giao, huỷ, giao việc chế tác | ✅ | `notify-organization.test.ts` |
| Sự kiện chuỗi / nền tảng / khách hàng | 🟡 chưa nối | nợ #185 (b) |
| SSE nhiều instance | 🟡 trong bộ nhớ một tiến trình | nợ #185 (b) |
| Tầng của người xem ma trận | 🔴 hàm riêng `resolveNotificationViewerTier` | nợ #194 |

## 3. Quy tắc cho agent
1. Sự kiện mới → khai trong tệp `*-events.ts` của đúng tầng, có `deepLinkTemplate` trỏ trang thật (test kiểm).
2. Gửi từ use-case nghiệp vụ → `notifyOrganization(...)`; không `await` để chặn luồng, không để lỗi lan ra.
3. Kênh mới → adapter trong `infra/channel-adapters/` theo `_channel-adapter.interface.ts`, escape nội dung, test escape. Nối nhà cung cấp trả phí → hỏi PO.
4. Không dùng `governance-decisions.ts` cho thông báo và ngược lại — hai động cơ tách biệt có chủ đích cho tới khi PO quyết hợp nhất (#193).
5. Đọc/ghi cấu hình thông báo: capability F1/F2 (tổ chức), N2 (nền tảng).
