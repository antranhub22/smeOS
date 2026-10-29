import { handle, jsonResponse } from "@/core/http/response"
import { requireTenantContext } from "@/modules/organization/use-cases/resolve-session"
import { getLibrarySummary } from "@/modules/storage/use-cases/list-library"

/**
 * GET /api/v1/storage/library/summary — loại dữ liệu người xem có quyền, danh
 * sách chi nhánh (chuỗi). Không trả dữ liệu nghiệp vụ; quyền từng loại kiểm ở
 * `GET /storage/library`.
 */
export const GET = handle(async (request) => {
  const { ctx } = await requireTenantContext(request)
  return jsonResponse({ data: await getLibrarySummary(ctx) })
})
