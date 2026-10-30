/** POST /api/v1/integrations/events/:id/replay — đưa sự kiện lỗi về hàng chờ xử lý lại (W5). */

import { handle, jsonResponse } from "@/core/http/response"
import { requireTenantContext } from "@/modules/organization/use-cases/resolve-session"
import { replayEvent } from "@/modules/integration-hub/use-cases/connection-events"

export const POST = handle(async (req, context: { params: Promise<{ id: string }> }) => {
  const { ctx } = await requireTenantContext(req)
  const { id } = await context.params
  await replayEvent(ctx, id)
  return jsonResponse({ ok: true })
})
