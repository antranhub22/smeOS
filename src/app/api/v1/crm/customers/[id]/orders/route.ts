/** `GET /api/v1/crm/customers/:id/orders` (Q1 + R1) — đơn đã đặt của khách, mọi nguồn (checklist ALG 4.11). */

import { handle, jsonResponse } from "@/core/http/response"
import { requireCapability } from "@/core/rbac/capabilities"
import { listCustomerOrders } from "@/modules/orders/use-cases/list-customer-orders"
import { requireTenantContext } from "@/modules/organization/use-cases/resolve-session"

export const GET = handle(async (request, context: { params: Promise<{ id: string }> }) => {
  const { ctx } = await requireTenantContext(request)
  requireCapability(ctx, "Q1")
  requireCapability(ctx, "R1")
  const { id } = await context.params
  return jsonResponse({ data: await listCustomerOrders(ctx, id) })
})

export const dynamic = "force-dynamic"
