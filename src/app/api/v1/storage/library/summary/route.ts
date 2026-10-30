import { handle, jsonResponse } from "@/core/http/response"
import { requireTenantContext } from "@/modules/organization/use-cases/resolve-session"
import { parseLibraryScope } from "@/modules/storage/domain/library"
import { getLibrarySummary } from "@/modules/storage/use-cases/list-library"

/**
 * GET /api/v1/storage/library/summary?scope= — loại dữ liệu người xem có quyền, số mục theo phạm vi, danh
 * sách chi nhánh (chuỗi). Không trả dữ liệu nghiệp vụ; quyền từng loại kiểm ở
 * `GET /storage/library`.
 */
export const GET = handle(async (request) => {
  const { ctx } = await requireTenantContext(request)
  const scope = parseLibraryScope(new URL(request.url).searchParams.get("scope"))
  return jsonResponse({ data: await getLibrarySummary(ctx, scope) })
})
