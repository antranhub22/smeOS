/**
 * Khoá tích hợp theo tầng — bảng cấp nền tảng `integration_governance` (không có organization_id,
 * xem đặc tả 07). Phạm vi tầng Chuỗi là id tổ chức chuỗi, chỉ ghi được từ phiên của chính chuỗi đó.
 * `scope_id` lưu theo địa chỉ phạm vi D-T5 (`platform`, `industry:<key>`, `org:<id>`; ADR-012 T-6b) — đổi qua lại
 * với dạng domain ("GLOBAL", "industry:<key>", id tổ chức) ngay ở đây.
 */

import { fromScopeKey, storedScopeIds, toScopeKey } from "@/core/governance/scope-key"
import { prisma } from "@/core/tenancy/infra/prisma"
import type { GovernanceTier } from "@/core/governance/layered-resolver"
import { ACTIVE_CHAIN_LINK } from "@/modules/organization/infra/organization-links"
import { resolveTierChain } from "@/modules/organization/infra/tier-chain-repository"
import type { GovernanceMode, GovernanceRow, OrgGovernanceScope } from "../domain/integration-governance"

export class GovernanceRepository {
  async listForScopes(scopeIds: readonly string[]): Promise<GovernanceRow[]> {
    if (scopeIds.length === 0) return []
    const rows = await prisma.integration_governance.findMany({ where: { scope_id: { in: scopeIds.flatMap(storedScopeIds) } } })
    return rows.map((r) => ({ connectorKey: r.connector_key, tier: r.tier as GovernanceTier, scopeId: fromScopeKey(r.scope_id), mode: r.mode }))
  }

  /** ALLOW_OWN là mặc định — xoá dòng thay vì lưu, để bảng chỉ giữ khoá thật. */
  async set(input: { connectorKey: string; tier: GovernanceTier; scopeId: string; mode: GovernanceMode; updatedBy: string }) {
    const key = { connector_key: input.connectorKey, tier: input.tier, scope_id: toScopeKey(input.scopeId) }
    if (input.mode === "ALLOW_OWN") {
      await prisma.integration_governance.deleteMany({ where: { ...key, scope_id: { in: storedScopeIds(input.scopeId) } } })
      return
    }
    await prisma.integration_governance.upsert({
      where: { connector_key_tier_scope_id: key },
      create: { ...key, mode: input.mode, updated_by: input.updatedBy },
      update: { mode: input.mode, updated_by: input.updatedBy },
    })
  }

  /** Ngành (`organizations.industry_key`) và chuỗi đang liên kết ACTIVE của một tổ chức. */
  async scopeOf(organizationId: string): Promise<OrgGovernanceScope> {
    const chain = await resolveTierChain(organizationId)
    return { industryKey: chain?.industryKey ?? null, parentChainOrgId: chain?.primaryChain?.organizationId ?? null }
  }

  /** Cửa hàng đối tác ACTIVE của một chuỗi — để báo khi chuỗi đổi khoá. */
  async partnerOrgIds(chainOrgId: string): Promise<string[]> {
    const rows = await prisma.organization_links.findMany({
      where: { parent_org_id: chainOrgId, ...ACTIVE_CHAIN_LINK },
      select: { child_org_id: true },
      take: 500,
    })
    return rows.map((r) => r.child_org_id)
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
