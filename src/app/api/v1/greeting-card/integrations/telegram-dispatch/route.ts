import { z } from "zod"
import { validationFailed } from "@/core/http/errors"
import { handle, jsonResponse } from "@/core/http/response"
import { requireCapability } from "@/core/rbac/capabilities"
import { requireTenantContext } from "@/modules/organization/use-cases/resolve-session"
import { GREETING_CARD_CAPABILITY } from "@/modules/greeting-card/domain/greeting-card-capabilities"

const testSchema = z.object({
  chatId: z.string().min(1),
  message: z.string().optional(),
})

/**
 * GET /api/v1/greeting-card/integrations/telegram-dispatch
 * Kiểm tra trạng thái Bot và tự động quét các chat/nhóm đã nhắn tin cho Bot gần đây.
 */
export const GET = handle(async (request) => {
  const { ctx } = await requireTenantContext(request)
  requireCapability(ctx, GREETING_CARD_CAPABILITY.integrationManage)

  const botToken = process.env.TELEGRAM_DISPATCH_BOT_TOKEN || process.env.TELEGRAM_STAFF_BOT_TOKEN
  if (!botToken) {
    return jsonResponse({
      data: {
        configured: false,
        bot: null,
        recentChats: [],
      },
    })
  }

  try {
    // 1. Kiểm tra thông tin Bot (getMe)
    const meRes = await fetch(`https://api.telegram.org/bot${botToken}/getMe`)
    const meData = (await meRes.json()) as { ok: boolean; result?: Record<string, unknown> }

    // 2. Lấy danh sách tin nhắn/nhóm gần đây (getUpdates)
    const updatesRes = await fetch(`https://api.telegram.org/bot${botToken}/getUpdates?limit=20`)
    const updatesData = (await updatesRes.json()) as { ok: boolean; result?: Array<Record<string, unknown>> }

    const recentChatsMap = new Map<string, { id: string; title: string; type: string }>()
    if (updatesData.ok && Array.isArray(updatesData.result)) {
      for (const update of updatesData.result) {
        const message = (update.message || update.channel_post || update.my_chat_member) as Record<string, unknown> | undefined
        const chat = (message?.chat as Record<string, unknown> | undefined)
        if (chat && chat.id) {
          const idStr = String(chat.id)
          const title = (chat.title as string) ||
            [(chat.first_name as string), (chat.last_name as string)].filter(Boolean).join(" ") ||
            (chat.username ? `@${chat.username as string}` : idStr)
          recentChatsMap.set(idStr, {
            id: idStr,
            title,
            type: (chat.type as string) || "unknown",
          })
        }
      }
    }

    return jsonResponse({
      data: {
        configured: true,
        bot: meData.ok ? meData.result : null,
        recentChats: Array.from(recentChatsMap.values()),
      },
    })
  } catch (err) {
    return jsonResponse({
      data: {
        configured: true,
        bot: null,
        recentChats: [],
        error: err instanceof Error ? err.message : String(err),
      },
    })
  }
})

/**
 * POST /api/v1/greeting-card/integrations/telegram-dispatch
 * Gửi một tin nhắn thử nghiệm đến Chat ID chi nhánh.
 */
export const POST = handle(async (request) => {
  const { ctx } = await requireTenantContext(request)
  requireCapability(ctx, GREETING_CARD_CAPABILITY.integrationManage)

  const body = await request.json().catch(() => ({}))
  const parsed = testSchema.safeParse(body)
  if (!parsed.success) {
    throw validationFailed({ issues: parsed.error.issues })
  }

  const botToken = process.env.TELEGRAM_DISPATCH_BOT_TOKEN || process.env.TELEGRAM_STAFF_BOT_TOKEN
  if (!botToken) {
    throw validationFailed({ token: "Chưa cấu hình TELEGRAM_DISPATCH_BOT_TOKEN trên máy chủ" })
  }

  const text = parsed.data.message ||
    "🌸 <b>[TEST ĐIỀU PHỐI CHUỖI smeOS]</b>\n\nKết nối thành công giữa hệ thống smeOS và Nhóm chat Chi nhánh!\n\n<i>Mọi đơn hàng gia công mới sẽ tự động được gửi tới nhóm này.</i>"

  const res = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      chat_id: parsed.data.chatId,
      text,
      parse_mode: "HTML",
    }),
  })

  const data = (await res.json()) as { ok: boolean; description?: string; result?: { message_id: number } }
  if (!data.ok) {
    return jsonResponse({
      data: {
        success: false,
        error: data.description || "Lỗi khi gửi tin nhắn Telegram",
      },
    }, { status: 400 })
  }

  return jsonResponse({
    data: {
      success: true,
      messageId: data.result?.message_id,
    },
  })
})
