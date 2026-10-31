/** GET /api/v1/integrations/connections/:id/sales — tin đăng và đơn gần đây của một kết nối kênh bán (W1). */

import { handle, jsonResponse } from "@/core/http/response"
import { requireTenantContext } from "@/modules/organization/use-cases/resolve-session"
import { getSalesChannel } from "@/modules/integration-hub/use-cases/sales-channel"

export const GET = handle(async (req, context: { params: Promise<{ id: string }> }) => {
  const { ctx } = await requireTenantContext(req)
  const { id } = await context.params
  return jsonResponse(await getSalesChannel(ctx, id))
})
