/**
 * Đọc cây tổ chức — MỘT nơi duy nhất (ADR-012 D-T4, bước T-1).
 *
 * Trước đây 4 bản tự truy vấn `chain_partnerships` để tìm chuỗi cha của một cửa hàng đối tác
 * (ma trận quản trị ×2, Integration Hub, thư viện thương hiệu). Luật chọn chuỗi cha đặt ở đây:
 * liên kết ACTIVE sớm nhất. Bước T-2 đổi luật này sang cạnh `is_primary` của `organization_links`
 * mà nơi gọi không phải sửa.
 */
import { prisma } from "@/core/tenancy/infra/prisma"
import { organizationTierOf } from "@/core/governance/tier-of"

import type { DbClient } from "./db-client"

/** Chuỗi cha chính của một tổ chức đối tác, kèm cấu hình của chuỗi (ma trận quản trị đọc từ đây). */
export interface PrimaryChainLink {
  readonly chainOrgId: string
  readonly chainName: string
  readonly chainSettings: unknown
}

export interface TierChain {
  readonly organizationId: string
  /** Tầng dữ liệu của tổ chức — Mẹ và Ngành không phải tổ chức tenant (`organizationTierOf`). */
  readonly tier: "CHAIN" | "STORE"
  /** Khoá plugin ngành (`organizations.settings.industry`) — ADR-012 T-6 chuyển thành cột. */
  readonly industryKey: string | null
  readonly primaryChain: { readonly organizationId: string; readonly name: string } | null
}

export async function findPrimaryChainLink(organizationId: string, db: DbClient = prisma): Promise<PrimaryChainLink | null> {
  const link = await db.chain_partnerships.findFirst({
    where: { partner_org_id: organizationId, status: "ACTIVE" },
    orderBy: [{ created_at: "asc" }, { id: "asc" }],
    select: { chain_org_id: true, chain_organization: { select: { name: true, settings: true } } },
  })
  if (!link) return null
  return { chainOrgId: link.chain_org_id, chainName: link.chain_organization.name, chainSettings: link.chain_organization.settings }
}

/** `null` khi tổ chức không tồn tại. */
export async function resolveTierChain(organizationId: string, db: DbClient = prisma): Promise<TierChain | null> {
  const [org, link] = await Promise.all([
    db.organizations.findUnique({ where: { id: organizationId }, select: { type: true, settings: true } }),
    findPrimaryChainLink(organizationId, db),
  ])
  if (!org) return null
  const settings = (org.settings as Record<string, unknown> | null) ?? {}
  const industry = settings["industry"]
  return {
    organizationId,
    tier: organizationTierOf(org.type),
    industryKey: typeof industry === "string" ? industry : null,
    primaryChain: link ? { organizationId: link.chainOrgId, name: link.chainName } : null,
  }
}
