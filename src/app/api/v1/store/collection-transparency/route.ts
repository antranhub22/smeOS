/**
 * GET /api/v1/store/collection-transparency
 *
 * Implements store collection transparency (§9.5.8):
 * Stores can view all data points the chain collects from them and the effective format.
 */

import { handle, jsonResponse } from "@/core/http/response"
import { requireTenantContext } from "@/modules/organization/use-cases/resolve-session"
import { ChainCollectionProfileRepository } from "@/modules/field-platform/infra/chain-collection-repository"
import { getStoreCollectionTransparency } from "@/modules/field-platform/use-cases/get-store-collection-transparency"
import { prisma } from "@/core/tenancy/infra/prisma"

export const GET = handle(async (request) => {
  const { ctx } = await requireTenantContext(request)
  const repo = new ChainCollectionProfileRepository()

  const url = new URL(request.url)
  let storeId = url.searchParams.get("storeId")

  if (!storeId) {
    // If storeId is not provided, pick the first active branch for this organization
    const firstBranch = await prisma.branches.findFirst({
      where: { organization_id: ctx.organizationId, is_active: true },
      select: { id: true },
    })
    storeId = firstBranch?.id ?? ""
  }

  if (!storeId) {
    return jsonResponse({
      data: {
        storeId: "",
        storeName: "Cửa hàng mặc định",
        profileVersion: 1,
        items: [],
      },
    })
  }

  const result = await getStoreCollectionTransparency(storeId, ctx.organizationId, repo)
  return jsonResponse({ data: result })
})

export const dynamic = "force-dynamic" as const
export const revalidate = 0 as const
