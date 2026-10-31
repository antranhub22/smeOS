import { describe, expect, it } from "vitest"
import { SmsNotificationAdapter } from "./sms-adapter"
import { ZaloNotificationAdapter } from "./zalo-adapter"
import { WebPushNotificationAdapter } from "./web-push-adapter"
import { NOT_CONFIGURED_ERROR } from "./_channel-adapter.interface"
import type { NotificationPayload } from "../../domain/notification-payload"

const payload = {
  eventKey: "order.created",
  recipient: { userId: "u1" },
  title: "Đơn mới",
  message: "Có đơn mới",
} as unknown as NotificationPayload

describe("Kênh chưa có nhà cung cấp thật không báo gửi thành công", () => {
  for (const adapter of [new SmsNotificationAdapter(), new ZaloNotificationAdapter(), new WebPushNotificationAdapter()]) {
    it(`${adapter.channel} trả NOT_CONFIGURED`, async () => {
      const res = await adapter.send(payload)
      expect(res.success).toBe(false)
      expect(res.error).toBe(NOT_CONFIGURED_ERROR)
    })
  }
})
