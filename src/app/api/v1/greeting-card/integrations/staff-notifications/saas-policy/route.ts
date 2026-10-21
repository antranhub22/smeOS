import { z } from "zod"
import { validationFailed } from "@/core/http/errors"
import { handle, jsonResponse } from "@/core/http/response"
import { requirePlatformCapability } from "@/core/platform/platform-capabilities"
import { requirePlatformContext } from "@/modules/platform/use-cases/resolve-platform-session"
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
  // Chính sách SaaS cho MỘT tổ chức khác nêu trong body — chỉ người vận hành nền tảng (N2).
  // Trước đây gác bằng mã R2 của tenant: ai tạo được đơn cũng sửa được kênh của mọi tổ chức
  // (rà soát 21/10/2026).
  const pctx = await requirePlatformContext(request)
  requirePlatformCapability(pctx, "N2")

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
