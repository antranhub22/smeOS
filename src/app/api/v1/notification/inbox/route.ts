import { handle, jsonResponse } from "@/core/http/response"
import { requireTenantContext } from "@/modules/organization/use-cases/resolve-session"
import { listUserInbox } from "@/modules/notification/use-cases/manage-inbox"

export const GET = handle(async (request) => {
  const { ctx, resolved } = await requireTenantContext(request)
  const url = new URL(request.url)
  const page = parseInt(url.searchParams.get("page") ?? "1", 10)
  const limit = parseInt(url.searchParams.get("limit") ?? "20", 10)
  const unreadOnly = url.searchParams.get("unreadOnly") === "true"

  const result = await listUserInbox(resolved.user.id, ctx.organizationId, {
    page,
    limit,
    unreadOnly,
  })

  return jsonResponse({
    data: result.items,
    pagination: {
      page,
      limit,
      total: result.total,
      unreadCount: result.unreadCount,
    },
  })
})
