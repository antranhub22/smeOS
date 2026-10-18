import { log } from "@/core/observability/log"
import type {
  ChannelSendResult,
  IStaffNotificationProvider,
  StaffChannelMessage,
} from "./channel-provider.interface"

export class TelegramStaffAdapter implements IStaffNotificationProvider {
  readonly channel = "TELEGRAM" as const

  async sendMessage(msg: StaffChannelMessage): Promise<ChannelSendResult> {
    const config = msg.channelConfig as { botToken?: string; defaultChatId?: string; chatMap?: Record<string, string> } | undefined
    const botToken = config?.botToken
    const chatId = (config?.chatMap && config.chatMap[msg.recipientId]) || config?.defaultChatId

    if (!botToken || !chatId) {
      return {
        sent: false,
        error: "Chưa cấu hình Telegram Bot Token hoặc Chat ID",
      }
    }

    try {
      const text = `<b>${msg.title}</b>\n\n${msg.message}`
      const res = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chat_id: chatId,
          text,
          parse_mode: "HTML",
        }),
      })

      const data = (await res.json()) as { ok: boolean; result?: { message_id: number }; description?: string }
      if (!data.ok) {
        log.warn("staff_notify.telegram_failed", { error: data.description })
        return { sent: false, error: data.description || "Lỗi gửi Telegram" }
      }

      return {
        sent: true,
        providerMsgId: data.result?.message_id ? String(data.result.message_id) : null,
      }
    } catch (error) {
      const errMsg = error instanceof Error ? error.message : String(error)
      log.error("staff_notify.telegram_exception", { error: errMsg })
      return { sent: false, error: errMsg }
    }
  }
}
