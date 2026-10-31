/** `GET /api/v1/orders/approval-requests?status=&limit=` (R1) — yêu cầu duyệt theo đơn (giao trước, thu sau). */

import { validationFailed } from "@/core/http/errors"
import { handle, jsonResponse } from "@/core/http/response"
import { requireCapability } from "@/core/rbac/capabilities"
import { requireTenantContext } from "@/modules/organization/use-cases/resolve-session"
import { listApprovalRequests } from "@/modules/orders/use-cases/deliver-before-pay"

export const GET = handle(async (request) => {
  const { ctx } = await requireTenantContext(request)
  requireCapability(ctx, "R1")
  const url = new URL(request.url)
  const limit = url.searchParams.has("limit") ? Number(url.searchParams.get("limit")) : 50
  if (!Number.isInteger(limit) || limit < 1 || limit > 100) throw validationFailed({ limit: "Phải là số nguyên từ 1 đến 100" })
  return jsonResponse(await listApprovalRequests(ctx, { status: url.searchParams.get("status") ?? undefined, limit }))
})

export const dynamic = "force-dynamic"
