/**
 * GET /api/v1/orders/lead-queue — hàng đợi "Khách tiềm năng" chung cho Sale (lead nguồn mới + phiên Thẻ
 * chào chưa đặt). Q1: xem thông tin khách hàng (cùng mã với `/api/v1/leads`).
 */

import { handle, jsonResponse } from "@/core/http/response"
import { requireCapability } from "@/core/rbac/capabilities"
import { requireTenantContext } from "@/modules/organization/use-cases/resolve-session"
import { listLeadQueue } from "@/modules/orders/use-cases/list-lead-queue"

export const GET = handle(async (request) => {
  const { ctx } = await requireTenantContext(request)
  requireCapability(ctx, "Q1")
  return jsonResponse(await listLeadQueue(ctx))
})

export const dynamic = "force-dynamic"
