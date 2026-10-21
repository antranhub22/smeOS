import type { TenantContext } from "@/core/tenancy"
import {
  getRecentTelegramMessages,
  type TelegramChatMessage,
} from "@/modules/greeting-card/adapters/staff-channels/telegram-bot-api"
import { telegramLinkCode } from "@/modules/greeting-card/infra/telegram-link-code"
import { OrganizationRepository } from "@/modules/organization/infra/organization-repository"

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

/** Chat ID đã cấu hình cho chi nhánh trong `settings.chain_branches` của chính tổ chức. */
export function configuredBranchChatIds(settings: unknown): string[] {
  const branches = (settings as { chain_branches?: unknown } | null)?.chain_branches
  if (!Array.isArray(branches)) return []
  return branches
    .map((b) => (b as { channels?: { telegramChatId?: unknown } })?.channels?.telegramChatId)
    .filter((id): id is string => typeof id === "string" && id.trim().length > 0)
}

/**
 * Nhóm Telegram mà tổ chức được phép xem và gửi thử qua bot chung của nền tảng: nhóm đã nhắn
 * mã liên kết của tổ chức, cộng nhóm đã cấu hình cho chi nhánh của chính tổ chức đó.
 * Trước đây trả về mọi nhóm mà bot thấy — tức là nhóm của tất cả tenant (rà soát 21/10/2026, H1).
 */
export async function resolveTelegramDispatchAccess(ctx: TenantContext, botToken: string) {
  const linkCode = telegramLinkCode(ctx.organizationId)
  const [messages, organization] = await Promise.all([
    getRecentTelegramMessages(botToken),
    new OrganizationRepository().current(ctx),
  ])
  const linkedChats = chatsWithLinkCode(messages, linkCode)
  const allowedChatIds = new Set([...linkedChats.map((c) => c.id), ...configuredBranchChatIds(organization?.settings)])
  return { linkCode, linkedChats, allowedChatIds }
}
