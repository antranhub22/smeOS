/** POST /api/v1/integrations/connections/:id/test — kiểm tra kết nối ngay (W3). */

import { handle, jsonResponse } from "@/core/http/response"
import { requireTenantContext } from "@/modules/organization/use-cases/resolve-session"
import { testConnection } from "@/modules/integration-hub/use-cases/manage-connection"

export const POST = handle(async (req, context: { params: Promise<{ id: string }> }) => {
  const { ctx } = await requireTenantContext(req)
  const { id } = await context.params
  return jsonResponse({ connection: await testConnection(ctx, id) })
})
