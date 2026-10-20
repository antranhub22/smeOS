import { z } from "zod"
import { validationFailed } from "@/core/http/errors"
import { handle, jsonResponse } from "@/core/http/response"
import { requireCapability } from "@/core/rbac/capabilities"
import { requireTenantContext } from "@/modules/organization/use-cases/resolve-session"
import { GREETING_CARD_CAPABILITY } from "@/modules/greeting-card/domain/greeting-card-capabilities"
import { STAFF_NOTIFY_CHANNELS, STAFF_NOTIFY_EVENTS } from "@/modules/greeting-card/domain/staff-notification-types"
import {
  getStaffNotificationSettings,
  updateStaffNotificationSettings,
} from "@/modules/greeting-card/use-cases/staff-notification-settings"

const updateSchema = z.object({
  enabled: z.boolean(),
  channels: z.array(z.enum(STAFF_NOTIFY_CHANNELS)),
  events: z.record(z.enum(STAFF_NOTIFY_EVENTS), z.boolean()).optional(),
  credentials: z.record(z.string(), z.unknown()).optional(),
})

/**
 * GET /api/v1/greeting-card/integrations/staff-notifications
 * Đọc cấu hình thông báo nhân viên & danh sách kênh được SaaS cho phép.
 */
export const GET = handle(async (request: Request) => {
  const { ctx } = await requireTenantContext(request)
  requireCapability(ctx, GREETING_CARD_CAPABILITY.integrationManage)

  const settings = await getStaffNotificationSettings(ctx)
  return jsonResponse({ data: settings })
})

/**
 * PUT /api/v1/greeting-card/integrations/staff-notifications
 * Shop Admin cập nhật cấu hình kênh thông báo nhân viên.
 */
export const PUT = handle(async (request: Request) => {
  const { ctx } = await requireTenantContext(request)
  requireCapability(ctx, GREETING_CARD_CAPABILITY.integrationManage)

  const body = await request.json().catch(() => null)
  const parsed = updateSchema.safeParse(body)
  if (!parsed.success) {
    throw validationFailed({ issues: parsed.error.issues })
  }

  const result = await updateStaffNotificationSettings(ctx, {
    enabled: parsed.data.enabled,
    channels: parsed.data.channels,
    ...(parsed.data.events ? { events: parsed.data.events } : {}),
    ...(parsed.data.credentials ? { credentials: parsed.data.credentials } : {}),
  })
  return jsonResponse({ data: result })
})
