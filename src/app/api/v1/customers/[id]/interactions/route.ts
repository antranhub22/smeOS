import { notFound, validationFailed } from "@/core/http/errors"
import { handle, jsonResponse } from "@/core/http/response"
import { hasCapability, requireCapability } from "@/core/rbac/capabilities"
import { requireTenantContext } from "@/modules/organization/use-cases/resolve-session"
import { listCustomerInteractionsUseCase } from "@/modules/crm/use-cases/list-customer-interactions.use-case"
import {
  recordCustomerInteractionUseCase,
  recordCustomerInteractionInputSchema,
} from "@/modules/crm/use-cases/record-customer-interaction.use-case"
import type {
  CustomerInteractionChannel,
  CustomerInteractionDirection,
} from "@/modules/crm/domain/customer-segment"

export const GET = handle(async (request, context) => {
  const { ctx } = await requireTenantContext(request)
  requireCapability(ctx, "Q1")

  const { id } = await (context as { params: Promise<{ id: string }> }).params
  const url = new URL(request.url)
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
    customerId: id,
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

export const POST = handle(async (request, context) => {
  const { ctx } = await requireTenantContext(request)
  if (!hasCapability(ctx, "M4") && !hasCapability(ctx, "Q1")) {
    requireCapability(ctx, "M4")
  }

  const { id } = await (context as { params: Promise<{ id: string }> }).params

  const raw = await request.json().catch(() => null)
  if (!raw || typeof raw !== "object") {
    throw validationFailed({ body: "Dữ liệu yêu cầu không hợp lệ" })
  }

  const parsed = recordCustomerInteractionInputSchema.safeParse({
    ...raw,
    customerId: id,
  })
  if (!parsed.success) {
    const details: Record<string, string> = {}
    for (const issue of parsed.error.issues) {
      details[issue.path.join(".")] = issue.message
    }
    throw validationFailed(details)
  }

  try {
    const interaction = await recordCustomerInteractionUseCase(ctx, parsed.data)
    return jsonResponse({ data: interaction }, { status: 201 })
  } catch (err: unknown) {
    if (err instanceof Error && err.message.includes("Không tìm thấy khách hàng")) {
      throw notFound()
    }
    throw err
  }
})

