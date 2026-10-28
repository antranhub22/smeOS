import { handle, jsonResponse } from "@/core/http/response"
import { requireTenantContext } from "@/modules/organization/use-cases/resolve-session"
import { markAllInboxItemsRead } from "@/modules/notification/use-cases/manage-inbox"

export const POST = handle(async (request) => {
  const { ctx, resolved } = await requireTenantContext(request)
  const count = await markAllInboxItemsRead(resolved.user.id, ctx.organizationId)
  return jsonResponse({ success: true, count })
})
