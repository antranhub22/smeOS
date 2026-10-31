/**
 * Khoá tích hợp theo tầng — bảng cấp nền tảng `integration_governance` (không có organization_id,
 * xem đặc tả 07). Phạm vi tầng Chuỗi là id tổ chức chuỗi, chỉ ghi được từ phiên của chính chuỗi đó.
 */

import { prisma } from "@/core/tenancy/infra/prisma"
import type { GovernanceTier } from "@/core/governance/layered-resolver"
import type { GovernanceMode, GovernanceRow, OrgGovernanceScope } from "../domain/integration-governance"

export class GovernanceRepository {
  async listForScopes(scopeIds: readonly string[]): Promise<GovernanceRow[]> {
    if (scopeIds.length === 0) return []
    const rows = await prisma.integration_governance.findMany({ where: { scope_id: { in: [...scopeIds] } } })
    return rows.map((r) => ({ connectorKey: r.connector_key, tier: r.tier as GovernanceTier, scopeId: r.scope_id, mode: r.mode }))
  }

  /** ALLOW_OWN là mặc định — xoá dòng thay vì lưu, để bảng chỉ giữ khoá thật. */
  async set(input: { connectorKey: string; tier: GovernanceTier; scopeId: string; mode: GovernanceMode; updatedBy: string }) {
    const key = { connector_key: input.connectorKey, tier: input.tier, scope_id: input.scopeId }
    if (input.mode === "ALLOW_OWN") {
      await prisma.integration_governance.deleteMany({ where: key })
      return
    }
    await prisma.integration_governance.upsert({
      where: { connector_key_tier_scope_id: key },
      create: { ...key, mode: input.mode, updated_by: input.updatedBy },
      update: { mode: input.mode, updated_by: input.updatedBy },
    })
  }

  /** Ngành (organizations.settings.industry) và chuỗi đang liên kết ACTIVE của một tổ chức. */
  async scopeOf(organizationId: string): Promise<OrgGovernanceScope> {
    const [org, link] = await Promise.all([
      prisma.organizations.findUnique({ where: { id: organizationId }, select: { settings: true } }),
      prisma.chain_partnerships.findFirst({
        where: { partner_org_id: organizationId, status: "ACTIVE" },
        orderBy: { created_at: "asc" },
        select: { chain_org_id: true },
      }),
    ])
    const settings = (org?.settings as Record<string, unknown> | null) ?? {}
    const industry = typeof settings["industry"] === "string" ? (settings["industry"] as string) : null
    return { industryKey: industry, parentChainOrgId: link?.chain_org_id ?? null }
  }

  /** Cửa hàng đối tác ACTIVE của một chuỗi — để báo khi chuỗi đổi khoá. */
  async partnerOrgIds(chainOrgId: string): Promise<string[]> {
    const rows = await prisma.chain_partnerships.findMany({
      where: { chain_org_id: chainOrgId, status: "ACTIVE" },
      select: { partner_org_id: true },
      take: 500,
    })
    return rows.map((r) => r.partner_org_id)
  }

  /** Kết nối đang dùng được của chuỗi cho một đầu nối — cửa hàng kế thừa (chỉ dùng, không đọc khoá). */
  async chainConnection(chainOrgId: string, connectorKey: string): Promise<{ id: string; displayName: string } | null> {
    const row = await prisma.integration_connections.findFirst({
      where: { organization_id: chainOrgId, connector_key: connectorKey, status: { in: ["ACTIVE", "DEGRADED"] } },
      orderBy: { created_at: "asc" },
      select: { id: true, display_name: true },
    })
    return row ? { id: row.id, displayName: row.display_name } : null
  }
}

let _repo: GovernanceRepository | null = null
export function getGovernanceRepository(): GovernanceRepository {
  if (!_repo) _repo = new GovernanceRepository()
  return _repo
}
