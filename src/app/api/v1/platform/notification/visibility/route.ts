import { z } from "zod"
import { handle, jsonResponse } from "@/core/http/response"
import { requirePlatformContext } from "@/modules/platform/use-cases/resolve-platform-session"
import {
  getVisibilityMatrix,
  updateEventVisibility,
} from "@/modules/notification/use-cases/manage-event-visibility"
import type { NotificationSubTier } from "@/modules/notification/domain/events/_contract"

const patchVisibilitySchema = z.object({
  eventKey: z.string().min(1),
  tier: z.enum(["INDUSTRY", "CHAIN", "STORE"]),
  visible: z.boolean(),
})

export const GET = handle(async (request) => {
  await requirePlatformContext(request)
  const matrix = await getVisibilityMatrix()
  return jsonResponse({ data: matrix })
})

export const PATCH = handle(async (request) => {
  const platform = await requirePlatformContext(request)
  const body = patchVisibilitySchema.parse(await request.json())

  await updateEventVisibility({
    eventKey: body.eventKey,
    tier: body.tier as NotificationSubTier,
    visible: body.visible,
    updatedBy: platform.userId,
  })

  return jsonResponse({ success: true, updated: body })
})
