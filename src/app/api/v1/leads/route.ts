/**
 * GET /api/v1/leads — khách tiềm năng để lại thông tin (công cụ 21).
 * Q1: Xem thông tin khách hàng.
 */

import { validationFailed } from "@/core/http/errors"
import { handle, jsonResponse } from "@/core/http/response"
import { requireCapability } from "@/core/rbac/capabilities"
import { requireTenantContext } from "@/modules/organization/use-cases/resolve-session"
import { listLeads } from "@/modules/acquisition/use-cases/manage-leads"

export const GET = handle(async (request) => {
  const { ctx } = await requireTenantContext(request)
  requireCapability(ctx, "Q1")
  const url = new URL(request.url)
  const limit = url.searchParams.has("limit") ? Number(url.searchParams.get("limit")) : 20
  if (!Number.isInteger(limit) || limit < 1 || limit > 100) {
    throw validationFailed({ limit: "Phải là số nguyên từ 1 đến 100" })
  }
  const result = await listLeads(ctx, {
    status: url.searchParams.get("status") ?? undefined,
    limit,
    cursor: url.searchParams.get("cursor") ?? undefined,
  })
  return jsonResponse(result)
})
