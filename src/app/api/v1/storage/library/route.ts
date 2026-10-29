import { handle, jsonResponse } from "@/core/http/response"
import { requireTenantContext } from "@/modules/organization/use-cases/resolve-session"
import { parseLibraryScope } from "@/modules/storage/domain/library"
import { listLibrary } from "@/modules/storage/use-cases/list-library"

/**
 * GET /api/v1/storage/library?type=&scope=all|hq|<branchId>&q=&from=<ISO>&cursor=
 * Kho dữ liệu v2 — mã quyền theo từng `type` (`domain/library.ts`).
 */
export const GET = handle(async (request) => {
  const { ctx } = await requireTenantContext(request)
  const url = new URL(request.url)
  const fromRaw = url.searchParams.get("from")
  const from = fromRaw ? new Date(fromRaw) : null
  const data = await listLibrary(ctx, {
    type: url.searchParams.get("type") ?? "",
    scope: parseLibraryScope(url.searchParams.get("scope")),
    q: url.searchParams.get("q")?.trim() || null,
    from: from && !Number.isNaN(from.getTime()) ? from : null,
    cursor: url.searchParams.get("cursor"),
  })
  return jsonResponse({ data })
})
