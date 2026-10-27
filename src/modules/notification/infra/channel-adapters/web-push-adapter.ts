/**
 * WEB PUSH CHANNEL ADAPTER
 *
 * Kênh gửi thông báo Web Push.
 *
 * @module notification/infra/channel-adapters
 */
import { log } from "@/core/observability/log"
import type { INotificationChannelAdapter } from "./_channel-adapter.interface"
import type { NotificationPayload, ChannelSendResult } from "../../domain/notification-payload"

export class WebPushNotificationAdapter implements INotificationChannelAdapter {
  readonly channel = "PUSH" as const

  async send(payload: NotificationPayload): Promise<ChannelSendResult> {
    log.info("WebPush adapter dispatch (stub / queue ready)", {
      userId: payload.recipient.userId,
      eventKey: payload.eventKey,
    })
    return {
      channel: "PUSH",
      success: true,
    }
  }
}
