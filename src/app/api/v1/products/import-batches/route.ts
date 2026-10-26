import { requireCapability } from "@/core/rbac/capabilities"
import { handle, jsonResponse } from "@/core/http/response"
import { requireTenantContext } from "@/modules/organization/use-cases/resolve-session"
import { listImportBatches } from "@/modules/products/use-cases/product-import-batches"

/** `GET /products/import-batches` (`H3`) — 10 lô nhập Excel gần nhất, kèm còn hoàn tác được không. */
export const GET = handle(async (request) => {
  const { ctx } = await requireTenantContext(request)
  requireCapability(ctx, "H3")
  return jsonResponse({ data: await listImportBatches(ctx) })
})
