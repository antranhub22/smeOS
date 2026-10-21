/**
 * Lời gọi Telegram Bot API thô cho màn kết nối bot điều phối (getMe / getUpdates / sendMessage).
 * Nằm ở `adapters/` theo luật kiến trúc 4 — route không gọi thẳng nhà cung cấp.
 */

export interface TelegramBotInfo {
  id: number
  is_bot: boolean
  first_name: string
  username: string
  can_join_groups?: boolean
}

export interface TelegramChatMessage {
  chatId: string
  title: string
  type: string
  text: string
}

const TIMEOUT_MS = 8000

async function call<T>(botToken: string, method: string, body?: unknown): Promise<{ ok: boolean; result?: T; description?: string }> {
  const init: RequestInit = body
    ? { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) }
    : { method: "GET" }
  const res = await fetch(`https://api.telegram.org/bot${botToken}/${method}`, {
    ...init,
    signal: AbortSignal.timeout(TIMEOUT_MS),
  })
  return (await res.json()) as { ok: boolean; result?: T; description?: string }
}

export async function getTelegramBotInfo(botToken: string): Promise<TelegramBotInfo | null> {
  const data = await call<TelegramBotInfo>(botToken, "getMe")
  return data.ok && data.result ? data.result : null
}

/** Tin nhắn gần đây bot nhận được (tối đa 100), kèm nhóm chat và nội dung văn bản. */
export async function getRecentTelegramMessages(botToken: string): Promise<TelegramChatMessage[]> {
  const data = await call<Array<Record<string, unknown>>>(botToken, "getUpdates?limit=100")
  if (!data.ok || !Array.isArray(data.result)) return []
  const out: TelegramChatMessage[] = []
  for (const update of data.result) {
    const message = (update.message || update.channel_post) as Record<string, unknown> | undefined
    const chat = message?.chat as Record<string, unknown> | undefined
    if (!chat?.id) continue
    const id = String(chat.id)
    const title = (chat.title as string) ||
      [chat.first_name as string, chat.last_name as string].filter(Boolean).join(" ") ||
      (chat.username ? `@${chat.username as string}` : id)
    out.push({ chatId: id, title, type: (chat.type as string) || "unknown", text: String(message?.text ?? "") })
  }
  return out
}

export async function sendTelegramText(
  botToken: string,
  chatId: string,
  text: string
): Promise<{ ok: boolean; messageId?: number; error?: string }> {
  const data = await call<{ message_id: number }>(botToken, "sendMessage", { chat_id: chatId, text, parse_mode: "HTML" })
  if (!data.ok) return { ok: false, error: data.description || "Lỗi khi gửi tin nhắn Telegram" }
  return { ok: true, ...(data.result ? { messageId: data.result.message_id } : {}) }
}
