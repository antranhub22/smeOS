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
      let text = `<b>${msg.title}</b>\n\n${msg.message}`
      const bodyPayload: Record<string, unknown> = {
        chat_id: chatId,
        text,
        parse_mode: "HTML",
      }

      // Telegram Bot API yêu cầu button URL phải là https hoặc domain công khai (cấm localhost/127.0.0.1)
      const validButtonActions = (msg.actions ?? []).filter((act) => {
        try {
          const parsed = new URL(act.url)
          return parsed.protocol === "https:" || (parsed.protocol === "http:" && !["localhost", "127.0.0.1"].includes(parsed.hostname))
        } catch {
          return false
        }
      })

      // Với các link localhost (môi trường dev/test), chèn link trực tiếp vào text để nhận được trong Telegram
      const textOnlyActions = (msg.actions ?? []).filter((act) => !validButtonActions.includes(act))
      if (textOnlyActions.length > 0) {
        text += "\n\n" + textOnlyActions.map((a) => `👉 <b>${a.text}</b>:\n${a.url}`).join("\n")
        bodyPayload.text = text
      }

      if (validButtonActions.length > 0) {
        bodyPayload.reply_markup = {
          inline_keyboard: [
            validButtonActions.map((act) => ({
              text: act.text,
              url: act.url,
            })),
          ],
        }
      }

      let res = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(bodyPayload),
      })

      let data = (await res.json()) as { ok: boolean; result?: { message_id: number }; description?: string }
      if (!data.ok && data.description?.includes("Wrong HTTP URL") && bodyPayload.reply_markup) {
        delete bodyPayload.reply_markup
        bodyPayload.text = text + "\n\n" + (msg.actions ?? []).map((a) => `👉 <b>${a.text}</b>:\n${a.url}`).join("\n")
        res = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(bodyPayload),
        })
        data = (await res.json()) as { ok: boolean; result?: { message_id: number }; description?: string }
      }

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
