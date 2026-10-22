import { log } from "@/core/observability/log"
import type {
  ChannelSendResult,
  EditMessagePayload,
  IStaffNotificationProvider,
  StaffChannelMessage,
} from "./channel-provider.interface"

/**
 * Chuẩn hóa URL cho Telegram Inline Button:
 * Telegram Bot API từ chối localhost/127.0.0.1 trong inline_keyboard.
 * Khi ở môi trường local dev, tự động chuyển sang `127.0.0.1.nip.io` để
 * Telegram hiển thị nút bấm chuyển tiếp native và click mở thẳng vào local máy dev.
 */
function normalizeTelegramButtonUrl(rawUrl: string): string {
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

/** URL ảnh Telegram được phép tự tải: chỉ https, không phải địa chỉ máy nội bộ. */
export function safeRemotePhotoUrl(raw: string | null | undefined): string | null {
  if (!raw) return null
  try {
    const url = new URL(raw.trim())
    if (url.protocol !== "https:") return null
    const host = url.hostname.toLowerCase()
    const privateHost =
      host === "localhost" ||
      host.endsWith(".local") ||
      host.endsWith(".internal") ||
      /^(127\.|10\.|192\.168\.|169\.254\.|0\.)/.test(host) ||
      /^172\.(1[6-9]|2\d|3[01])\./.test(host) ||
      host.startsWith("[")
    return privateHost ? null : url.toString()
  } catch {
    return null
  }
}

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

      // Tạo các nút bấm chuyển tiếp native (Inline Keyboard)
      const inlineButtons = (msg.actions ?? [])
        .filter((act) => Boolean(act.url && act.url.trim()))
        .map((act) => ({
          text: act.text,
          url: normalizeTelegramButtonUrl(act.url),
        }))

      const replyMarkup = inlineButtons.length > 0
        ? { inline_keyboard: [inlineButtons] }
        : undefined

      // Ảnh sản phẩm: chỉ chuyển URL https công khai cho Telegram tự tải. Máy chủ KHÔNG tự tải URL
      // hay đọc tệp theo đường dẫn lấy từ dữ liệu tiệm nhập — trước 22/10/2026 kiểm tra kiểu chuỗi
      // con (".onrender.com") cho phép gọi địa chỉ nội bộ và đọc tệp tuỳ ý (rà soát cụm G).
      const remotePhotoUrl = safeRemotePhotoUrl(msg.imageUrl)

      // 1. Có ảnh -> sendPhoto, Telegram tự tải từ URL
      if (remotePhotoUrl) {
        try {
          const photoRes = await fetch(`https://api.telegram.org/bot${botToken}/sendPhoto`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              chat_id: chatId,
              photo: remotePhotoUrl,
              caption: text.slice(0, 1024),
              parse_mode: "HTML",
              ...(replyMarkup ? { reply_markup: replyMarkup } : {}),
            }),
          })
          const photoData = (await photoRes.json()) as { ok: boolean; result?: { message_id: number }; description?: string }
          if (photoData.ok) {
            return {
              sent: true,
              providerMsgId: photoData.result?.message_id ? String(photoData.result.message_id) : null,
              providerChatId: chatId,
              isCaption: true,
            }
          }
          log.warn("staff_notify.telegram_remote_photo_failed, fallback to sendMessage", { error: photoData.description })
        } catch (err) {
          log.warn("staff_notify.telegram_remote_photo_err, fallback to sendMessage", { error: String(err) })
        }
      }

      // 2. Gửi tin nhắn text kèm các nút bấm native (sendMessage)
      const bodyPayload: Record<string, unknown> = {
        chat_id: chatId,
        text,
        parse_mode: "HTML",
        ...(replyMarkup ? { reply_markup: replyMarkup } : {}),
      }

      const res = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(bodyPayload),
      })

      const data = (await res.json()) as { ok: boolean; result?: { message_id: number }; description?: string }

      if (!data.ok) {
        log.warn("staff_notify.telegram_failed", { error: data.description })
        return { sent: false, error: data.description || "Lỗi gửi Telegram" }
      }

      return {
        sent: true,
        providerMsgId: data.result?.message_id ? String(data.result.message_id) : null,
        providerChatId: chatId,
      }
    } catch (error) {
      const errMsg = error instanceof Error ? error.message : String(error)
      log.error("staff_notify.telegram_exception", { error: errMsg })
      return { sent: false, error: errMsg }
    }
  }

  /**
   * Chỉnh sửa nội dung Thẻ Tiến Độ (Live Dashboard Card) thay vì gửi tin mới.
   * Sử dụng editMessageCaption (nếu là nhắn kèm ảnh) hoặc editMessageText (nếu là text thuần).
   */
  async editMessage(payload: EditMessagePayload): Promise<{ ok: boolean; error?: string }> {
    const config = payload.channelConfig as { botToken?: string } | undefined
    const botToken = config?.botToken
    if (!botToken) return { ok: false, error: "Missing botToken" }

    const inlineButtons = (payload.actions ?? [])
      .filter((act) => Boolean(act.url?.trim()))
      .map((act) => ({ text: act.text, url: normalizeTelegramButtonUrl(act.url) }))
    const replyMarkup = inlineButtons.length > 0 ? { inline_keyboard: [inlineButtons] } : undefined

    const endpoint = payload.isCaption ? "editMessageCaption" : "editMessageText"
    const bodyKey = payload.isCaption ? "caption" : "text"

    try {
      const res = await fetch(`https://api.telegram.org/bot${botToken}/${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chat_id: payload.chatId,
          message_id: Number(payload.messageId),
          [bodyKey]: payload.text.slice(0, payload.isCaption ? 1024 : 4096),
          parse_mode: "HTML",
          ...(replyMarkup ? { reply_markup: replyMarkup } : {}),
        }),
      })
      const data = (await res.json()) as { ok: boolean; description?: string }
      if (!data.ok) {
        log.warn("staff_notify.telegram_edit_failed", { error: data.description })
        const result: { ok: boolean; error?: string } = { ok: false }
        if (data.description) result.error = data.description
        return result
      }
      return { ok: true }
    } catch (err) {
      const errMsg = err instanceof Error ? err.message : String(err)
      log.error("staff_notify.telegram_edit_exception", { error: errMsg })
      return { ok: false, error: errMsg }
    }
  }
}
