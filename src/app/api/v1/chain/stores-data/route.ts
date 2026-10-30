/**
 * GET /api/v1/chain/stores-data
 *
 * Returns list of store card summaries for the Consolidated Chain Data Hub (/du-lieu).
 */

import { requireCapability } from "@/core/rbac/capabilities"
import { handle, jsonResponse } from "@/core/http/response"
import { requireTenantContext } from "@/modules/organization/use-cases/resolve-session"
import { getChainStoresData } from "@/modules/field-platform/use-cases/get-chain-stores-data"

export const GET = handle(async (request) => {
  const { ctx } = await requireTenantContext(request)
  requireCapability(ctx, "F1")
  const result = await getChainStoresData(ctx.organizationId)
  return jsonResponse({ data: result })
})

export const dynamic = "force-dynamic" as const
export const revalidate = 0 as const
