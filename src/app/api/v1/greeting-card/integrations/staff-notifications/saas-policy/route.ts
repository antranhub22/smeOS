import { z } from "zod"
import { validationFailed } from "@/core/http/errors"
import { handle, jsonResponse } from "@/core/http/response"
import { requireCapability } from "@/core/rbac/capabilities"
import { requireTenantContext } from "@/modules/organization/use-cases/resolve-session"
import { GREETING_CARD_CAPABILITY } from "@/modules/greeting-card/domain/greeting-card-capabilities"
import { STAFF_NOTIFY_CHANNELS } from "@/modules/greeting-card/domain/staff-notification-types"
import { updateSaasAllowedNotificationChannels } from "@/modules/greeting-card/use-cases/staff-notification-settings"

const saasPolicySchema = z.object({
  targetOrganizationId: z.string().uuid(),
  allowedChannels: z.array(z.enum(STAFF_NOTIFY_CHANNELS)),
})

/**
 * PUT /api/v1/greeting-card/integrations/staff-notifications/saas-policy
 * SaaS Platform Admin cấp phép danh sách kênh thông báo cho từng tiệm cụ thể.
 */
export const PUT = handle(async (request: Request) => {
  const { ctx } = await requireTenantContext(request)
  // Chỉ Platform Admin hoặc tài khoản quản trị hệ thống có quyền cấu hình chính sách SaaS
  requireCapability(ctx, GREETING_CARD_CAPABILITY.manage)

  const body = await request.json().catch(() => null)
  const parsed = saasPolicySchema.safeParse(body)
  if (!parsed.success) {
    throw validationFailed({ issues: parsed.error.issues })
  }

  const result = await updateSaasAllowedNotificationChannels(
    parsed.data.targetOrganizationId,
    parsed.data.allowedChannels
  )

  return jsonResponse({ data: result })
})
