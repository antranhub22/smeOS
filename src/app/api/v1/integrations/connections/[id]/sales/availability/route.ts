/** POST /api/v1/integrations/connections/:id/sales/availability — đẩy còn/hết hàng cho mọi tin đã đăng (W3). */

import { handle, jsonResponse } from "@/core/http/response"
import { requireTenantContext } from "@/modules/organization/use-cases/resolve-session"
import { syncAvailability } from "@/modules/integration-hub/use-cases/sales-channel"

export const POST = handle(async (req, context: { params: Promise<{ id: string }> }) => {
  const { ctx } = await requireTenantContext(req)
  const { id } = await context.params
  return jsonResponse({ updated: await syncAvailability(ctx, id) })
})
