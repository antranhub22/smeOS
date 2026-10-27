/**
 * PLATFORM NOTIFICATION EVENTS — Dành riêng cho SaaS Mother
 *
 * Trả về tất cả NotificationEventDefinition[] đầy đủ (có roleDefaults)
 * để hook useNotificationMatrix có thể render ma trận đúng cấu trúc.
 *
 * KHÁC với /platform/notification/visibility:
 * - visibility: trả EventVisibilityRow[] (chỉ để Mother configure visibility cho tầng dưới)
 * - events: trả NotificationEventDefinition[] (để render matrix settings của Mother)
 *
 * @module api/platform/notification
 */
import { handle, jsonResponse } from "@/core/http/response"
import { requirePlatformContext } from "@/modules/platform/use-cases/resolve-platform-session"
import { getAllNotificationEvents } from "@/modules/notification/domain/events"

export const GET = handle(async (request) => {
  await requirePlatformContext(request)
  // Trả toàn bộ events — Mother thấy tất cả (không lọc theo tier visibility)
  const events = getAllNotificationEvents()
  return jsonResponse({ data: events })
})
