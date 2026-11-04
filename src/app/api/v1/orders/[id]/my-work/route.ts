/** `POST /api/v1/orders/:id/my-work` (R17) — thợ nhận việc (`START`) hoặc báo xong (`FINISH`) việc giao cho mình. */

import { z } from "zod"

import { handle, jsonResponse } from "@/core/http/response"
import { requireCapability } from "@/core/rbac/capabilities"
import { requireTenantContext } from "@/modules/organization/use-cases/resolve-session"
import { FLORIST_ACTIONS } from "@/modules/orders/domain/florist-work"
import { reportFloristWork } from "@/modules/orders/use-cases/florist-queue"

const bodySchema = z.object({ action: z.enum(FLORIST_ACTIONS as ["START", "FINISH"]) })

export const POST = handle(async (request, { params }: { params: Promise<{ id: string }> }) => {
  const { ctx } = await requireTenantContext(request)
  requireCapability(ctx, "R17")
  const { id } = await params
  const { action } = bodySchema.parse(await request.json())
  return jsonResponse(await reportFloristWork(ctx, id, action))
})
