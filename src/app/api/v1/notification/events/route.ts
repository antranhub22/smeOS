import { handle, jsonResponse } from "@/core/http/response"
import { requireTenantContext } from "@/modules/organization/use-cases/resolve-session"
import { getDefaultVisibleEvents } from "@/modules/notification/domain/events"
import type { NotificationTier } from "@/modules/notification/domain/events/_contract"
import { getNotificationPreferenceRepository } from "@/modules/notification/infra/notification-preference-repository"

export const GET = handle(async (request) => {
  const { ctx } = await requireTenantContext(request)
  const url = new URL(request.url)
  const tierParam = (url.searchParams.get("tier") as NotificationTier) || "STORE"

  // 1. Lấy danh sách events hiển thị mặc định cho tầng này
  const defaultEvents = getDefaultVisibleEvents(tierParam)

  // 2. Kiểm tra nếu SaaS Mother có override visibility trong DB
  const repo = getNotificationPreferenceRepository()
  const dbVisibility = await repo.getEventVisibilityMap()

  // 3. Lọc lại theo DB visibility nếu có override
  const visibleEvents = defaultEvents.filter((evt) => {
    const override = dbVisibility[evt.key]
    if (tierParam !== "MOTHER" && override && override[tierParam] !== undefined) {
      return override[tierParam]
    }
    return true
  })

  return jsonResponse({ data: visibleEvents })
})
