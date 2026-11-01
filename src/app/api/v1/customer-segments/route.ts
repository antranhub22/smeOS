import { validationFailed } from "@/core/http/errors"
import { handle, jsonResponse } from "@/core/http/response"
import { hasCapability, requireCapability } from "@/core/rbac/capabilities"
import { requireTenantContext } from "@/modules/organization/use-cases/resolve-session"
import {
  createCustomerSegmentUseCase,
  createCustomerSegmentInputSchema,
} from "@/modules/crm/use-cases/create-customer-segment.use-case"
import { listCustomerSegmentsUseCase } from "@/modules/crm/use-cases/list-customer-segments.use-case"
import type { CustomerSegmentKind } from "@/modules/crm/domain/customer-segment"

export const GET = handle(async (request) => {
  const { ctx } = await requireTenantContext(request)
  if (!hasCapability(ctx, "M4") && !hasCapability(ctx, "Q1")) {
    requireCapability(ctx, "M4")
  }

  const url = new URL(request.url)
  const kind = (url.searchParams.get("kind") as CustomerSegmentKind) ?? undefined
  const search = url.searchParams.get("search") ?? undefined

  const limit = url.searchParams.has("limit") ? Number(url.searchParams.get("limit")) : 50
  const offset = url.searchParams.has("offset") ? Number(url.searchParams.get("offset")) : 0

  if (!Number.isInteger(limit) || limit < 1 || limit > 100) {
    throw validationFailed({ limit: "limit phải là số nguyên từ 1 đến 100" })
  }
  if (!Number.isInteger(offset) || offset < 0) {
    throw validationFailed({ offset: "offset phải là số nguyên không âm" })
  }

  const result = await listCustomerSegmentsUseCase(ctx, {
    kind,
    search,
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

export const POST = handle(async (request) => {
  const { ctx } = await requireTenantContext(request)
  requireCapability(ctx, "M4")

  const raw = await request.json().catch(() => null)
  if (!raw || typeof raw !== "object") {
    throw validationFailed({ body: "Dữ liệu yêu cầu không hợp lệ" })
  }

  const parsed = createCustomerSegmentInputSchema.safeParse(raw)
  if (!parsed.success) {
    const details: Record<string, string> = {}
    for (const issue of parsed.error.issues) {
      details[issue.path.join(".")] = issue.message
    }
    throw validationFailed(details)
  }

  const segment = await createCustomerSegmentUseCase(ctx, parsed.data)

  return jsonResponse({ data: segment }, { status: 201 })
})

