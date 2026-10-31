/**
 * ZALO NOTIFICATION ADAPTER
 *
 * Kênh gửi thông báo qua Zalo OA / ZNS.
 *
 * @module notification/infra/channel-adapters
 */
import { log } from "@/core/observability/log"
import { NOT_CONFIGURED_ERROR, type INotificationChannelAdapter } from "./_channel-adapter.interface"
import type { NotificationPayload, ChannelSendResult } from "../../domain/notification-payload"

export class ZaloNotificationAdapter implements INotificationChannelAdapter {
  readonly channel = "ZALO" as const

  async send(payload: NotificationPayload): Promise<ChannelSendResult> {
    log.info("Zalo notification dispatch skipped: channel not configured", {
      userId: payload.recipient.userId,
      eventKey: payload.eventKey,
    })
    return {
      channel: "ZALO",
      success: false,
      error: NOT_CONFIGURED_ERROR,
    }
  }
}
