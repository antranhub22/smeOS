import { handle, jsonResponse } from "@/core/http/response"
import { requireTenantContext } from "@/modules/organization/use-cases/resolve-session"
import { getPlatformChannelActivations } from "@/modules/notification/use-cases/manage-platform-policy"

export const GET = handle(async (request) => {
  await requireTenantContext(request)
  const activations = await getPlatformChannelActivations()
  return jsonResponse({ data: activations })
})
