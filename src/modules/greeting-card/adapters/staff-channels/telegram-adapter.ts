import fs from "fs"
import path from "path"
import { log } from "@/core/observability/log"
import type {
  ChannelSendResult,
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

      // Xử lý đính kèm ảnh sản phẩm nếu có
      let localPhotoBlob: Blob | null = null
      let remotePhotoUrl: string | null = null

      if (msg.imageUrl) {
        const img = msg.imageUrl.trim()
        if (img.startsWith("http://") || img.startsWith("https://")) {
          if (img.includes("localhost") || img.includes("127.0.0.1")) {
            try {
              const u = new URL(img)
              const rel = u.pathname.startsWith("/") ? u.pathname.slice(1) : u.pathname
              const localPath = path.join(process.cwd(), "public", rel)
              if (fs.existsSync(localPath)) {
                const buf = fs.readFileSync(localPath)
                const ext = path.extname(localPath).toLowerCase()
                const mime = ext === ".png" ? "image/png" : ext === ".webp" ? "image/webp" : "image/jpeg"
                localPhotoBlob = new Blob([buf], { type: mime })
              }
            } catch {
              // fallback
            }
          } else {
            remotePhotoUrl = img
          }
        } else {
          const rel = img.startsWith("/") ? img.slice(1) : img
          const possiblePaths = [
            path.join(process.cwd(), "public", rel),
            path.join(process.cwd(), rel),
            path.join(process.cwd(), "storage", rel),
          ]
          for (const p of possiblePaths) {
            if (fs.existsSync(p)) {
              try {
                const buf = fs.readFileSync(p)
                const ext = path.extname(p).toLowerCase()
                const mime = ext === ".png" ? "image/png" : ext === ".webp" ? "image/webp" : "image/jpeg"
                localPhotoBlob = new Blob([buf], { type: mime })
                break
              } catch {
                // fallback
              }
            }
          }
        }
      }

      // 1. Nếu có ảnh cục bộ -> gửi qua sendPhoto (FormData)
      if (localPhotoBlob) {
        try {
          const form = new FormData()
          form.append("chat_id", chatId)
          form.append("photo", localPhotoBlob, "product.jpg")
          form.append("caption", text.slice(0, 1024))
          form.append("parse_mode", "HTML")
          if (replyMarkup) {
            form.append("reply_markup", JSON.stringify(replyMarkup))
          }

          const photoRes = await fetch(`https://api.telegram.org/bot${botToken}/sendPhoto`, {
            method: "POST",
            body: form,
          })
          const photoData = (await photoRes.json()) as { ok: boolean; result?: { message_id: number }; description?: string }
          if (photoData.ok) {
            return {
              sent: true,
              providerMsgId: photoData.result?.message_id ? String(photoData.result.message_id) : null,
            }
          }
          log.warn("staff_notify.telegram_photo_failed, fallback to sendMessage", { error: photoData.description })
        } catch (err) {
          log.warn("staff_notify.telegram_photo_err, fallback to sendMessage", { error: String(err) })
        }
      }

      // 2. Nếu có ảnh từ URL internet -> gửi qua sendPhoto (JSON)
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
            }
          }
          log.warn("staff_notify.telegram_remote_photo_failed, fallback to sendMessage", { error: photoData.description })
        } catch (err) {
          log.warn("staff_notify.telegram_remote_photo_err, fallback to sendMessage", { error: String(err) })
        }
      }

      // 3. Gửi tin nhắn text kèm các nút bấm native (sendMessage)
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
      }
    } catch (error) {
      const errMsg = error instanceof Error ? error.message : String(error)
      log.error("staff_notify.telegram_exception", { error: errMsg })
      return { sent: false, error: errMsg }
    }
  }
}
