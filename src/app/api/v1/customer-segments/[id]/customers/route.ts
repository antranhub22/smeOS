import { notFound, validationFailed } from "@/core/http/errors"
import { handle, jsonResponse } from "@/core/http/response"
import { hasCapability, requireCapability } from "@/core/rbac/capabilities"
import { requireTenantContext } from "@/modules/organization/use-cases/resolve-session"
import { getSegmentCustomersUseCase } from "@/modules/crm/use-cases/get-segment-customers.use-case"

export const GET = handle(async (request, context) => {
  const { ctx } = await requireTenantContext(request)
  if (!hasCapability(ctx, "M4") && !hasCapability(ctx, "Q1")) {
    requireCapability(ctx, "M4")
  }

  const { id } = await (context as { params: Promise<{ id: string }> }).params
  const url = new URL(request.url)
  const search = url.searchParams.get("search") ?? undefined

  const limit = url.searchParams.has("limit") ? Number(url.searchParams.get("limit")) : 50
  const offset = url.searchParams.has("offset") ? Number(url.searchParams.get("offset")) : 0

  if (!Number.isInteger(limit) || limit < 1 || limit > 100) {
    throw validationFailed({ limit: "limit phải là số nguyên từ 1 đến 100" })
  }
  if (!Number.isInteger(offset) || offset < 0) {
    throw validationFailed({ offset: "offset phải là số nguyên không âm" })
  }

  try {
    const result = await getSegmentCustomersUseCase(ctx, {
      segmentId: id,
      search,
      limit,
      offset,
    })

    return jsonResponse({
      data: result.items,
      segment_name: result.segmentName,
      total_matched: result.totalMatched,
      limit,
      offset,
    })
  } catch (err: unknown) {
    if (err instanceof Error && err.message.includes("Không tìm thấy nhóm khách hàng")) {
      throw notFound()
    }
    throw err
  }
})

