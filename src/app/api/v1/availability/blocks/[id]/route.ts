import { handle, jsonResponse } from "@/core/http/response"
import { notFound } from "@/core/http/errors"
import { requireTenantContext } from "@/modules/organization/use-cases/resolve-session"
import { requireCapability } from "@/core/rbac/capabilities"
import { removeManualBlock } from "@/modules/availability/use-cases/manage-manual-block"

/**
 * DELETE /api/v1/availability/blocks/[id]
 * Xóa block thủ công (mở lại phòng/ngày).
 */
export const DELETE = handle<[{ params: Promise<{ id: string }> }]>(async (request, context) => {
  const { ctx } = await requireTenantContext(request)
  requireCapability(ctx, "L3")

  const { id } = await context.params
  const removed = await removeManualBlock(ctx.organizationId, id)
  if (!removed) throw notFound()

  return jsonResponse({ success: true })
})

export const dynamic = "force-dynamic"
