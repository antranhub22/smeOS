import { notFound, validationFailed } from "@/core/http/errors"
import { handle, jsonResponse } from "@/core/http/response"
import { hasCapability, requireCapability } from "@/core/rbac/capabilities"
import { requireTenantContext } from "@/modules/organization/use-cases/resolve-session"
import { getCustomerSegmentUseCase } from "@/modules/crm/use-cases/get-customer-segment.use-case"
import {
  updateCustomerSegmentUseCase,
  updateCustomerSegmentInputSchema,
} from "@/modules/crm/use-cases/update-customer-segment.use-case"
import { deleteCustomerSegmentUseCase } from "@/modules/crm/use-cases/delete-customer-segment.use-case"

export const GET = handle(async (request, context) => {
  const { ctx } = await requireTenantContext(request)
  if (!hasCapability(ctx, "M4") && !hasCapability(ctx, "Q1")) {
    requireCapability(ctx, "M4")
  }

  const { id } = await (context as { params: Promise<{ id: string }> }).params
  const segment = await getCustomerSegmentUseCase(ctx, id)
  if (!segment) {
    throw notFound()
  }

  return jsonResponse({ data: segment })
})

export const PATCH = handle(async (request, context) => {
  const { ctx } = await requireTenantContext(request)
  requireCapability(ctx, "M4")

  const { id } = await (context as { params: Promise<{ id: string }> }).params

  const raw = await request.json().catch(() => null)
  if (!raw || typeof raw !== "object") {
    throw validationFailed({ body: "Dữ liệu yêu cầu không hợp lệ" })
  }

  const parsed = updateCustomerSegmentInputSchema.safeParse(raw)
  if (!parsed.success) {
    const details: Record<string, string> = {}
    for (const issue of parsed.error.issues) {
      details[issue.path.join(".")] = issue.message
    }
    throw validationFailed(details)
  }

  const updated = await updateCustomerSegmentUseCase(ctx, id, parsed.data)
  if (!updated) {
    throw notFound()
  }

  return jsonResponse({ data: updated })
})

export const DELETE = handle(async (request, context) => {
  const { ctx } = await requireTenantContext(request)
  requireCapability(ctx, "M4")

  const { id } = await (context as { params: Promise<{ id: string }> }).params
  const ok = await deleteCustomerSegmentUseCase(ctx, id)
  if (!ok) {
    throw notFound()
  }

  return jsonResponse({ success: true })
})

