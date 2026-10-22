import { prisma } from "@/core/tenancy/infra/prisma"

/**
 * Chat Telegram đã chứng minh thuộc tổ chức: đã nhắn mã liên kết của tổ chức cho bot điều phối
 * chung (`telegramLinkCode`). Bot chỉ nhìn thấy tin nhắn trong khoảng 24 giờ (`getUpdates`), nên
 * chat đã liên kết được nhớ lại trong `organizations.settings.telegram_linked_chat_ids` — khoá do
 * máy chủ ghi, tenant không sửa qua PATCH settings.
 *
 * Mọi lần gửi bằng bot chung chỉ đi tới chat trong danh sách này. Trước 22/10/2026 chat ID nhập từ
 * Excel chi nhánh cũng được tin, nên tiệm A gửi được tin vào nhóm của tiệm B (rà soát cụm G).
 */
export const TELEGRAM_LINKED_CHATS_SETTING_KEY = "telegram_linked_chat_ids"

type Db = typeof prisma

export async function listLinkedTelegramChatIds(organizationId: string, db: Db = prisma): Promise<string[]> {
  const org = await db.organizations.findUnique({ where: { id: organizationId }, select: { settings: true } })
  const raw = (org?.settings as Record<string, unknown> | null)?.[TELEGRAM_LINKED_CHATS_SETTING_KEY]
  return Array.isArray(raw) ? raw.filter((id): id is string => typeof id === "string" && id.length > 0) : []
}

/** Thêm chat vào danh sách đã liên kết — gộp trong một câu lệnh, không ghi đè các khoá settings khác. */
export async function rememberLinkedTelegramChats(organizationId: string, chatIds: string[], db: Db = prisma): Promise<void> {
  const ids = [...new Set(chatIds.filter((id) => id.length > 0))]
  if (ids.length === 0) return
  await db.$executeRaw`
    UPDATE "organizations"
    SET "settings" = jsonb_set(
      COALESCE("settings", '{}'::jsonb),
      ARRAY[${TELEGRAM_LINKED_CHATS_SETTING_KEY}]::text[],
      (
        SELECT COALESCE(jsonb_agg(DISTINCT x), '[]'::jsonb)
        FROM jsonb_array_elements_text(
          CASE WHEN jsonb_typeof("settings" -> ${TELEGRAM_LINKED_CHATS_SETTING_KEY}) = 'array'
            THEN "settings" -> ${TELEGRAM_LINKED_CHATS_SETTING_KEY} ELSE '[]'::jsonb END
          || to_jsonb(${ids}::text[])
        ) AS x
      )
    )
    WHERE "id" = ${organizationId}`
}
