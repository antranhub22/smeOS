import type { TenantContext } from "@/core/tenancy"
import {
  getRecentTelegramMessages,
  type TelegramChatMessage,
} from "@/modules/greeting-card/adapters/staff-channels/telegram-bot-api"
import { telegramLinkCode } from "@/modules/greeting-card/infra/telegram-link-code"
import { listLinkedTelegramChatIds, rememberLinkedTelegramChats } from "@/modules/greeting-card/infra/telegram-linked-chats"

export interface LinkedTelegramChat {
  id: string
  title: string
  type: string
}

/** Nhóm đã nhắn đúng mã liên kết của tổ chức — chỉ những nhóm này mới hiện cho tổ chức đó. */
export function chatsWithLinkCode(messages: TelegramChatMessage[], linkCode: string): LinkedTelegramChat[] {
  const byId = new Map<string, LinkedTelegramChat>()
  for (const m of messages) {
    if (!m.text.toUpperCase().includes(linkCode)) continue
    byId.set(m.chatId, { id: m.chatId, title: m.title, type: m.type })
  }
  return [...byId.values()]
}

/**
 * Chat Telegram mà tổ chức được phép xem và gửi qua bot chung của nền tảng: chat vừa nhắn mã liên
 * kết của tổ chức (được nhớ lại vào danh sách đã liên kết) cộng các chat đã liên kết trước đó.
 * Chat ID nhập tay hoặc từ Excel chi nhánh KHÔNG tự được tin (rà soát 22/10/2026, cụm G).
 */
export async function resolveTelegramDispatchAccess(ctx: TenantContext, botToken: string) {
  const linkCode = telegramLinkCode(ctx.organizationId)
  const messages = await getRecentTelegramMessages(botToken)
  const linkedChats = chatsWithLinkCode(messages, linkCode)
  await rememberLinkedTelegramChats(ctx.organizationId, linkedChats.map((c) => c.id))
  const allowedChatIds = new Set(await listLinkedTelegramChatIds(ctx.organizationId))
  return { linkCode, linkedChats, allowedChatIds }
}
