import { z } from "zod"
import { handle, jsonResponse } from "@/core/http/response"
import { requirePlatformContext } from "@/modules/platform/use-cases/resolve-platform-session"
import {
  getPlatformChannelActivations,
  updatePlatformChannelActivation,
} from "@/modules/notification/use-cases/manage-platform-policy"

const patchChannelSchema = z.object({
  channel: z.string().min(1),
  activated: z.boolean(),
})

export const GET = handle(async (request) => {
  await requirePlatformContext(request)
  const activations = await getPlatformChannelActivations()
  return jsonResponse({ data: activations })
})

export const PATCH = handle(async (request) => {
  const platform = await requirePlatformContext(request)
  const body = patchChannelSchema.parse(await request.json())

  await updatePlatformChannelActivation({
    channel: body.channel,
    activated: body.activated,
    updatedBy: platform.userId,
  })

  return jsonResponse({ success: true, channel: body.channel, activated: body.activated })
})
