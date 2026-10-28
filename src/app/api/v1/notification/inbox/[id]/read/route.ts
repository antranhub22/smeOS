import { handle, jsonResponse } from "@/core/http/response"
import { requireTenantContext } from "@/modules/organization/use-cases/resolve-session"
import { markInboxItemRead } from "@/modules/notification/use-cases/manage-inbox"

type RouteContext = { params: Promise<{ id: string }> }

export const PATCH = handle(async (request, context: RouteContext) => {
  const { ctx, resolved } = await requireTenantContext(request)
  const { id } = await context.params

  const success = await markInboxItemRead(id, resolved.user.id, ctx.organizationId)
  return jsonResponse({ success, id })
})
