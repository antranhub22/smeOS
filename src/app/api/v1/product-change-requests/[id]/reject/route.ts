import { z } from "zod"

import { validationFailed } from "@/core/http/errors"
import { requireCapability } from "@/core/rbac/capabilities"
import { handle, jsonResponse } from "@/core/http/response"
import { requireTenantContext } from "@/modules/organization/use-cases/resolve-session"
import { rejectChangeRequest } from "@/modules/products/use-cases/product-change-requests"

const bodySchema = z.object({ reason: z.string().trim().min(1).max(500) })

/** `POST /product-change-requests/:id/reject` (`H3`) — từ chối đề xuất sửa, bắt buộc lý do. */
export const POST = handle(async (request, context: { params: Promise<{ id: string }> }) => {
  const { ctx } = await requireTenantContext(request)
  requireCapability(ctx, "H3")
  const parsed = bodySchema.safeParse(await request.json().catch(() => null))
  if (!parsed.success) throw validationFailed({ issues: parsed.error.issues })
  const { id } = await context.params
  return jsonResponse(await rejectChangeRequest(ctx, id, parsed.data.reason))
})
