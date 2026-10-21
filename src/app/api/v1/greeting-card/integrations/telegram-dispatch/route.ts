import { z } from "zod"
import { unprocessable, validationFailed } from "@/core/http/errors"
import { handle, jsonResponse } from "@/core/http/response"
import { requireCapability } from "@/core/rbac/capabilities"
import { requireTenantContext } from "@/modules/organization/use-cases/resolve-session"
import { GREETING_CARD_CAPABILITY } from "@/modules/greeting-card/domain/greeting-card-capabilities"
import { getTelegramBotInfo, sendTelegramText } from "@/modules/greeting-card/adapters/staff-channels/telegram-bot-api"
import { resolveTelegramDispatchAccess } from "@/modules/greeting-card/use-cases/telegram-dispatch-link"

const testSchema = z.object({
  chatId: z.string().min(1),
  message: z.string().max(1000).optional(),
})

function dispatchBotToken(): string | undefined {
  return process.env.TELEGRAM_DISPATCH_BOT_TOKEN || process.env.TELEGRAM_STAFF_BOT_TOKEN
}

/**
 * GET /api/v1/greeting-card/integrations/telegram-dispatch
 * Trạng thái bot + mã liên kết của tổ chức + các nhóm ĐÃ nhắn mã đó. Bot là bot chung của nền
 * tảng nên không bao giờ trả danh sách mọi nhóm mà bot thấy (rà soát 21/10/2026, H1).
 */
export const GET = handle(async (request) => {
  const { ctx } = await requireTenantContext(request)
  requireCapability(ctx, GREETING_CARD_CAPABILITY.integrationManage)

  const botToken = dispatchBotToken()
  if (!botToken) {
    return jsonResponse({ data: { configured: false, bot: null, linkCode: null, recentChats: [] } })
  }

  try {
    const [bot, access] = await Promise.all([getTelegramBotInfo(botToken), resolveTelegramDispatchAccess(ctx, botToken)])
    return jsonResponse({ data: { configured: true, bot, linkCode: access.linkCode, recentChats: access.linkedChats } })
  } catch {
    return jsonResponse({
      data: { configured: true, bot: null, linkCode: null, recentChats: [], error: "Không kết nối được Telegram lúc này" },
    })
  }
})

/**
 * POST /api/v1/greeting-card/integrations/telegram-dispatch
 * Gửi tin thử — chỉ tới nhóm đã liên kết hoặc đã cấu hình cho chi nhánh của chính tổ chức.
 */
export const POST = handle(async (request) => {
  const { ctx } = await requireTenantContext(request)
  requireCapability(ctx, GREETING_CARD_CAPABILITY.integrationManage)

  const parsed = testSchema.safeParse(await request.json().catch(() => ({})))
  if (!parsed.success) throw validationFailed({ issues: parsed.error.issues })

  const botToken = dispatchBotToken()
  if (!botToken) throw validationFailed({ token: "Chưa cấu hình TELEGRAM_DISPATCH_BOT_TOKEN trên máy chủ" })

  const { allowedChatIds } = await resolveTelegramDispatchAccess(ctx, botToken)
  if (!allowedChatIds.has(parsed.data.chatId)) {
    throw unprocessable("Nhóm này chưa liên kết với cửa hàng của bạn. Hãy gửi mã liên kết vào nhóm rồi quét lại.")
  }

  const text = parsed.data.message ||
    "🌸 <b>[TEST ĐIỀU PHỐI CHUỖI smeOS]</b>\n\nKết nối thành công giữa hệ thống smeOS và Nhóm chat Chi nhánh!\n\n<i>Mọi đơn hàng gia công mới sẽ tự động được gửi tới nhóm này.</i>"

  const sent = await sendTelegramText(botToken, parsed.data.chatId, text)
  if (!sent.ok) {
    return jsonResponse({ data: { success: false, error: sent.error } }, { status: 400 })
  }
  return jsonResponse({ data: { success: true, messageId: sent.messageId } })
})
