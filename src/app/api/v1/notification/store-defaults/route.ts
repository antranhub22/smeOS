import { z } from "zod"
import { handle, jsonResponse } from "@/core/http/response"
import { requireTenantContext } from "@/modules/organization/use-cases/resolve-session"
import {
  getStoreNotificationDefaults,
  updateStoreNotificationDefault,
} from "@/modules/notification/use-cases/manage-store-defaults"
import type { NotifyChannel } from "@/modules/notification/domain/events/_contract"

const patchStoreDefaultSchema = z.object({
  eventKey: z.string().min(1),
  channel: z.enum([
    "APP_INBOX",
    "EMAIL",
    "PUSH",
    "TELEGRAM",
    "ZALO",
    "SMS",
    "WHATSAPP",
    "MESSENGER",
  ]),
  roleKey: z.string().min(1),
  enabled: z.boolean(),
  scheduleStart: z.string().optional(),
  scheduleEnd: z.string().optional(),
})

export const GET = handle(async (request) => {
  const { ctx } = await requireTenantContext(request)
  const url = new URL(request.url)
  const roleKey = url.searchParams.get("roleKey") ?? undefined

  const defaults = await getStoreNotificationDefaults(ctx.organizationId, roleKey)
  return jsonResponse({ data: defaults })
})

export const PATCH = handle(async (request) => {
  const { ctx } = await requireTenantContext(request)
  const body = patchStoreDefaultSchema.parse(await request.json())

  await updateStoreNotificationDefault({
    organizationId: ctx.organizationId,
    eventKey: body.eventKey,
    channel: body.channel as NotifyChannel,
    roleKey: body.roleKey,
    enabled: body.enabled,
    scheduleStart: body.scheduleStart ?? undefined,
    scheduleEnd: body.scheduleEnd ?? undefined,
  })

  return jsonResponse({ success: true, updated: body })
})
