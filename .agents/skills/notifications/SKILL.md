---
name: notifications
description: >-
  Hệ thống thông báo 4 tầng SMEOS: danh mục sự kiện theo tầng, động cơ cascading-policy
  (kích hoạt kênh → khoá cứng theo phạm vi → ghi đè từ dưới lên), notifyOrganization,
  adapter kênh (in-app, email, Telegram; SMS/Push/Zalo là stub), deep link, SSE.
  Kích hoạt khi sửa src/modules/notification, components/notification, hoặc thêm sự kiện gửi từ use-case.
---

# Notifications

Đọc trước: `.agents/standards/smeos/06-notifications.md`, rồi `universal/06-notifications.md`; đặc tả `docs/kien-truc/NOTIFICATION_SYSTEM_ARCHITECTURE.md`.

Bắt buộc:
- Sự kiện mới khai trong `domain/events/<tầng>-events.ts`, `deepLinkTemplate` trỏ trang thật (`events-deeplinks.test.ts`).
- Gửi từ nghiệp vụ qua `notifyOrganization` — best-effort, không chặn luồng.
- Kênh mới theo `_channel-adapter.interface.ts`, escape nội dung + test. SMS/Push/Zalo hiện là stub — không báo "đã gửi".
- Động cơ của notification (`cascading-policy.ts`) tách khỏi `governance-decisions.ts`.
- Capability: F1/F2 cấu hình tổ chức, N2 nền tảng. Nối nhà cung cấp trả phí → hỏi PO.

Gate: `npm test` (cascading-policy, deeplinks, escaping, notify-organization), `npm run test:tenant`.
