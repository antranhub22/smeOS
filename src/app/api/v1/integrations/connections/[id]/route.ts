/** DELETE /api/v1/integrations/connections/:id — ngắt kết nối, xoá khoá đã lưu (W2). */

import { handle, jsonResponse } from "@/core/http/response"
import { requireTenantContext } from "@/modules/organization/use-cases/resolve-session"
import { disconnectConnection } from "@/modules/integration-hub/use-cases/manage-connection"

export const DELETE = handle(async (req, context: { params: Promise<{ id: string }> }) => {
  const { ctx } = await requireTenantContext(req)
  const { id } = await context.params
  await disconnectConnection(ctx, id)
  return jsonResponse({ ok: true })
})
