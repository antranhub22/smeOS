/**
 * GET /api/v1/chain/stores-data/[storeId]
 *
 * Returns hierarchical domain folder data for a specific store.
 */

import { requireCapability } from "@/core/rbac/capabilities"
import { handle, jsonResponse } from "@/core/http/response"
import { requireTenantContext } from "@/modules/organization/use-cases/resolve-session"
import { getStoreFolderData } from "@/modules/field-platform/use-cases/get-store-folder-data"
import { notFound } from "@/core/http/errors"

export const GET = handle(async (request, context) => {
  const { ctx } = await requireTenantContext(request)
  requireCapability(ctx, "F1")
  const params = await (context as { params: Promise<{ storeId: string }> }).params
  const storeId = params.storeId

  const result = await getStoreFolderData(storeId, ctx.organizationId)
  if (!result) {
    throw notFound()
  }

  return jsonResponse({ data: result })
})

export const dynamic = "force-dynamic" as const
export const revalidate = 0 as const
