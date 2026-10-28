/**
 * TELEGRAM CHANNEL ADAPTER
 *
 * Gửi thông báo tới Telegram chat của người dùng / chi nhánh.
 * Tự động chuyển đổi deep link local sang nip.io khi dev.
 *
 * @module notification/infra/channel-adapters
 */
import { log } from "@/core/observability/log"
import type { INotificationChannelAdapter } from "./_channel-adapter.interface"
import type { NotificationPayload, ChannelSendResult } from "../../domain/notification-payload"

function normalizeButtonUrl(rawUrl: string): string {
  try {
    const parsed = new URL(rawUrl)
    if (parsed.hostname === "localhost" || parsed.hostname === "127.0.0.1") {
      parsed.hostname = "127.0.0.1.nip.io"
      return parsed.toString()
    }
    return rawUrl
  } catch {
    return rawUrl
  }
}

export class TelegramNotificationAdapter implements INotificationChannelAdapter {
  readonly channel = "TELEGRAM" as const

  async send(payload: NotificationPayload): Promise<ChannelSendResult> {
    const botToken = process.env.TELEGRAM_BOT_TOKEN
    const chatId = payload.recipient.telegramChatId || process.env.TELEGRAM_DEFAULT_CHAT_ID

    if (!botToken || !chatId) {
      log.warn("Telegram adapter skipped: missing bot token or recipient chatId", {
        userId: payload.recipient.userId,
      })
      return {
        channel: "TELEGRAM",
        success: false,
        error: "Chưa cấu hình Telegram Bot Token hoặc Chat ID người nhận",
      }
    }

    try {
      const text = `<b>${payload.title}</b>\n\n${payload.message}`
      const inlineButtons: Array<{ text: string; url: string }> = []

      if (payload.deepLink) {
        const fullUrl = payload.deepLink.startsWith("http")
          ? payload.deepLink
          : `${process.env.NEXTAUTH_URL ?? "http://localhost:3100"}${payload.deepLink}`
        inlineButtons.push({
          text: "👉 Xem chi tiết",
          url: normalizeButtonUrl(fullUrl),
        })
      }

      const body: Record<string, unknown> = {
        chat_id: chatId,
        text,
        parse_mode: "HTML",
      }

      if (inlineButtons.length > 0) {
        body.reply_markup = {
          inline_keyboard: [inlineButtons],
        }
      }

      const res = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
        signal: AbortSignal.timeout(8000),
      })

      const json = await res.json() as { ok: boolean; result?: { message_id: number }; description?: string }
      if (!json.ok) {
        return {
          channel: "TELEGRAM",
          success: false,
          error: json.description ?? "Telegram API returned failure",
        }
      }

      return {
        channel: "TELEGRAM",
        success: true,
        messageId: String(json.result?.message_id),
      }
    } catch (err) {
      log.warn("Lỗi gửi Telegram notification", {
        error: err instanceof Error ? err.message : String(err),
      })
      return {
        channel: "TELEGRAM",
        success: false,
        error: err instanceof Error ? err.message : "Telegram request failed",
      }
    }
  }
}
