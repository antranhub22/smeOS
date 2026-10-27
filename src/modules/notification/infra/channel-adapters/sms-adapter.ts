/**
 * SMS NOTIFICATION ADAPTER
 *
 * Kênh gửi tin nhắn Brandname SMS.
 *
 * @module notification/infra/channel-adapters
 */
import { log } from "@/core/observability/log"
import type { INotificationChannelAdapter } from "./_channel-adapter.interface"
import type { NotificationPayload, ChannelSendResult } from "../../domain/notification-payload"

export class SmsNotificationAdapter implements INotificationChannelAdapter {
  readonly channel = "SMS" as const

  async send(payload: NotificationPayload): Promise<ChannelSendResult> {
    log.info("SMS notification dispatch (stub / brandname ready)", {
      userId: payload.recipient.userId,
      eventKey: payload.eventKey,
    })
    return {
      channel: "SMS",
      success: true,
    }
  }
}
