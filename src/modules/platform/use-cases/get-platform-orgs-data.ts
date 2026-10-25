/**
 * SMEOS Platform Admin — Get All Organizations Data (Platform-Level Hub)
 *
 * Tương tự get-chain-stores-data.ts nhưng ở tầng Platform:
 * - Không có organization_id context — xuyên tổ chức
 * - Chỉ gọi qua PlatformContext (N1 capability required)
 * - Dữ liệu thu thập: profile, products, branches, usage, members
 */

import { prisma } from "@/core/tenancy/infra/prisma"
import type { PlatformContext } from "@/core/platform/platform-context"
import { requirePlatformCapability } from "@/core/platform/platform-capabilities"

export interface PlatformOrgDataSummary {
  readonly id: string
  readonly name: string
  readonly slug: string
  readonly type: string
  readonly industryKey: string | null
  readonly creditBalance: number
  readonly createdAt: string
  readonly memberCount: number
  readonly branchCount: number
  readonly productCount: number
  readonly orderCount: number
  readonly generationJobCount: number
  readonly spreadsheetCount: number
  readonly hasBusinessProfile: boolean
  readonly hasBrandProfile: boolean
  readonly readinessScore: number
  readonly lastActivityAt: string | null
}

export interface GetPlatformOrgsDataResult {
  readonly total: number
  readonly orgs: readonly PlatformOrgDataSummary[]
}

export async function getPlatformOrgsData(
  pctx: PlatformContext
): Promise<GetPlatformOrgsDataResult> {
  requirePlatformCapability(pctx, "N1")

  const orgs = await prisma.organizations.findMany({
    orderBy: { created_at: "desc" },
    include: {
      _count: {
        select: {
          memberships: true,
          branches: true,
        },
      },
      business_profile: { select: { id: true } },
      brand_profile: { select: { id: true } },
      workspaces: { select: { kind: true } },
    },
  })

  const orgIds = orgs.map((o) => o.id)

  // Batch: product counts per org
  const productGroups = await prisma.products.groupBy({
    by: ["organization_id"],
    where: { organization_id: { in: orgIds } },
    _count: { _all: true },
  })
  const productCountMap = new Map(productGroups.map((r) => [r.organization_id, r._count._all]))

  // Batch: order counts per org
  const orderGroups = await prisma.orders.groupBy({
    by: ["organization_id"],
    where: { organization_id: { in: orgIds } },
    _count: { _all: true },
  })
  const orderCountMap = new Map(orderGroups.map((r) => [r.organization_id, r._count._all]))

  // Batch: generation job counts per org
  const jobGroups = await prisma.generation_jobs.groupBy({
    by: ["organization_id"],
    where: { organization_id: { in: orgIds } },
    _count: { _all: true },
  })
  const jobCountMap = new Map(jobGroups.map((r) => [r.organization_id, r._count._all]))

  // Batch: uploaded spreadsheets per org
  const sheetGroups = await prisma.assets.groupBy({
    by: ["organization_id"],
    where: {
      organization_id: { in: orgIds },
      mime_type: {
        in: [
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
          "application/vnd.ms-excel",
          "text/csv",
        ],
      },
    },
    _count: { _all: true },
  })
  const sheetCountMap = new Map(sheetGroups.map((r) => [r.organization_id, r._count._all]))

  // Batch: most recent order/product date per org (last activity)
  const recentOrders = await prisma.orders.findMany({
    where: { organization_id: { in: orgIds } },
    orderBy: { created_at: "desc" },
    select: { organization_id: true, created_at: true },
    distinct: ["organization_id"],
  })
  const lastActivityMap = new Map(recentOrders.map((r) => [r.organization_id, r.created_at]))

  const result: PlatformOrgDataSummary[] = orgs.map((org) => {
    const hasBusinessProfile = !!org.business_profile
    const hasBrandProfile = !!org.brand_profile

    // Readiness score: based on profile completeness
    let score = 20 // Base for existing
    if (hasBusinessProfile) score += 25
    if (hasBrandProfile) score += 20
    if ((productCountMap.get(org.id) ?? 0) > 0) score += 20
    if ((org._count.branches ?? 0) > 0) score += 15

    const settings = org.settings as Record<string, unknown> | null
    const industryKey =
      typeof settings?.industry_key === "string" ? settings.industry_key : null

    return {
      id: org.id,
      name: org.name,
      slug: org.slug,
      type: org.type,
      industryKey,
      creditBalance: org.credit_balance,
      createdAt: org.created_at.toISOString(),
      memberCount: org._count.memberships,
      branchCount: org._count.branches,
      productCount: productCountMap.get(org.id) ?? 0,
      orderCount: orderCountMap.get(org.id) ?? 0,
      generationJobCount: jobCountMap.get(org.id) ?? 0,
      spreadsheetCount: sheetCountMap.get(org.id) ?? 0,
      hasBusinessProfile,
      hasBrandProfile,
      readinessScore: score,
      lastActivityAt: lastActivityMap.get(org.id)?.toISOString() ?? null,
    }
  })

  return {
    total: result.length,
    orgs: result,
  }
}
