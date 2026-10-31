/**
 * Hạn mức "giao trước, thu sau" Sale tự quyết. GET — R1 · PUT — F2 (sửa cài đặt tổ chức, trần cứng Điều hành).
 * Body PUT `{ allowSelfDecide?, selfDecideMaxVnd?, minCompletedOrders?, collectDueDays? }`.
 */

import { handle, jsonResponse } from "@/core/http/response"
import { requireCapability } from "@/core/rbac/capabilities"
import { requireTenantContext } from "@/modules/organization/use-cases/resolve-session"
import { getDeliverBeforePaySettings, updateDeliverBeforePaySettings } from "@/modules/orders/use-cases/deliver-before-pay-settings"

export const GET = handle(async (request) => {
  const { ctx } = await requireTenantContext(request)
  requireCapability(ctx, "R1")
  return jsonResponse(await getDeliverBeforePaySettings(ctx))
})

export const PUT = handle(async (request) => {
  const { ctx } = await requireTenantContext(request)
  requireCapability(ctx, "F2")
  const body: unknown = await request.json().catch(() => null)
  return jsonResponse(await updateDeliverBeforePaySettings(ctx, body ?? {}))
})

export const dynamic = "force-dynamic"
