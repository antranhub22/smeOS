/** GET /api/v1/integrations/connections/:id/events?status=&limit= — nhật ký sự kiện (W1, tối đa 100). */

import { z } from "zod"
import { handle, jsonResponse } from "@/core/http/response"
import { validationFailed } from "@/core/http/errors"
import { requireTenantContext } from "@/modules/organization/use-cases/resolve-session"
import { listConnectionEvents } from "@/modules/integration-hub/use-cases/connection-events"

const query = z.object({
  status: z.enum(["PENDING", "DONE", "FAILED", "DEAD"]).optional(),
  limit: z.coerce.number().int().min(1).max(100).optional(),
})

export const GET = handle(async (req, context: { params: Promise<{ id: string }> }) => {
  const { ctx } = await requireTenantContext(req)
  const { id } = await context.params
  const parsed = query.safeParse(Object.fromEntries(new URL(req.url).searchParams))
  if (!parsed.success) throw validationFailed({ query: "Tham số lọc không hợp lệ" })
  const events = await listConnectionEvents(ctx, {
    connectionId: id,
    ...(parsed.data.status ? { status: parsed.data.status } : {}),
    ...(parsed.data.limit ? { limit: parsed.data.limit } : {}),
  })
  return jsonResponse({ events })
})
