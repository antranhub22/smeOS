import { validationFailed } from "@/core/http/errors"
import { requireCapability } from "@/core/rbac/capabilities"
import { handle, jsonResponse } from "@/core/http/response"
import { requireTenantContext } from "@/modules/organization/use-cases/resolve-session"
import { listChangeRequests } from "@/modules/products/use-cases/product-change-requests"

const STATUSES = ["PENDING", "APPROVED", "PARTIAL", "REJECTED", "EXPIRED"] as const

/** `GET /product-change-requests?status=PENDING` (`H3`) — hàng chờ duyệt đề xuất sửa của cả tổ chức. */
export const GET = handle(async (request) => {
  const { ctx } = await requireTenantContext(request)
  requireCapability(ctx, "H3")
  const status = new URL(request.url).searchParams.get("status") ?? "PENDING"
  if (!STATUSES.includes(status as (typeof STATUSES)[number])) throw validationFailed({ status: `Phải là một trong: ${STATUSES.join(", ")}` })
  return jsonResponse({ data: await listChangeRequests(ctx, { status }) })
})
