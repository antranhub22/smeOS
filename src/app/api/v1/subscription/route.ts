/** GET /api/v1/subscription (`D1`) — gói thuê bao và hoá đơn của cửa hàng, checklist ALG 10.7. */
import { handle, jsonResponse } from "@/core/http/response"
import { requireTenantContext } from "@/modules/organization/use-cases/resolve-session"
import { getMySubscription } from "@/modules/subscription/use-cases/get-my-subscription"

export const GET = handle(async (request) => {
  const { ctx } = await requireTenantContext(request)
  return jsonResponse({ data: await getMySubscription(ctx) })
})

export const dynamic = "force-dynamic" as const
export const revalidate = 0 as const
