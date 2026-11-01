import { validationFailed } from "@/core/http/errors"
import { handle, jsonResponse } from "@/core/http/response"
import { requireCapability } from "@/core/rbac/capabilities"
import { requireTenantContext } from "@/modules/organization/use-cases/resolve-session"
import { listCustomerInteractionsUseCase } from "@/modules/crm/use-cases/list-customer-interactions.use-case"
import type {
  CustomerInteractionChannel,
  CustomerInteractionDirection,
} from "@/modules/crm/domain/customer-segment"

export const GET = handle(async (request) => {
  const { ctx } = await requireTenantContext(request)
  requireCapability(ctx, "Q1")

  const url = new URL(request.url)
  const customerId = url.searchParams.get("customer_id") ?? undefined
  const channel = (url.searchParams.get("channel") as CustomerInteractionChannel) ?? undefined
  const direction = (url.searchParams.get("direction") as CustomerInteractionDirection) ?? undefined

  const limit = url.searchParams.has("limit") ? Number(url.searchParams.get("limit")) : 50
  const offset = url.searchParams.has("offset") ? Number(url.searchParams.get("offset")) : 0

  if (!Number.isInteger(limit) || limit < 1 || limit > 100) {
    throw validationFailed({ limit: "limit phải là số nguyên từ 1 đến 100" })
  }
  if (!Number.isInteger(offset) || offset < 0) {
    throw validationFailed({ offset: "offset phải là số nguyên không âm" })
  }

  const result = await listCustomerInteractionsUseCase(ctx, {
    customerId,
    channel,
    direction,
    limit,
    offset,
  })

  return jsonResponse({
    data: result.items,
    total: result.total,
    limit,
    offset,
  })
})
