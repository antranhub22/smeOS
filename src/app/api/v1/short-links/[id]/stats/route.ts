/**
 * GET /api/v1/short-links/[id]/stats?days=30 — lượt quét theo ngày, thiết bị, khách riêng, số lead.
 * J1: Tạo catalog.
 */

import { handle, jsonResponse } from "@/core/http/response"
import { requireCapability } from "@/core/rbac/capabilities"
import { requireTenantContext } from "@/modules/organization/use-cases/resolve-session"
import { getShortLinkStats } from "@/modules/acquisition/use-cases/manage-short-links"

export const GET = handle<[{ params: Promise<{ id: string }> }]>(async (request, context) => {
  const { ctx } = await requireTenantContext(request)
  requireCapability(ctx, "J1")
  const { id } = await context.params
  const days = Number(new URL(request.url).searchParams.get("days") ?? "30")
  return jsonResponse(await getShortLinkStats(ctx, id, days))
})
