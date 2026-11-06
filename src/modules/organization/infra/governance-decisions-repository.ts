/**
 * Lưu/đọc quyết định ma trận quản trị theo tầng.
 * - Tầng tổ chức: `organizations.settings.governance_matrix.<SYSTEM>` (chỉ đổi đúng nhánh đó, một câu lệnh).
 * - Tầng Mẹ: `platform_settings` khoá `governance_matrix:<SYSTEM>`.
 * - Tầng Chuỗi của một cửa hàng: tổ chức chuỗi có quan hệ đối tác ACTIVE với cửa hàng.
 */
import type { Prisma } from "@/generated/prisma/client"
import { matrixRecords } from "@/core/governance/decision-record"
import { syncDecisionScope } from "@/core/governance/infra/decision-log"
import { organizationTierOf } from "@/core/governance/tier-of"
import { prisma } from "@/core/tenancy/infra/prisma"

import { findPrimaryChainLink } from "./tier-chain-repository"
import {
  decisionsFromSettings,
  parseDecisions,
  withBuiltInLocks,
  type GovernanceDecisions,
  type GovernanceSystem,
  type PolicyGovernanceUpper,
  type PolicySystem,
  type UpperLayer,
} from "../domain/governance-decisions"

const motherKey = (system: GovernanceSystem) => `governance_matrix:${system}`

export async function getOrgGovernance(organizationId: string, system: GovernanceSystem): Promise<GovernanceDecisions> {
  const org = await prisma.organizations.findUnique({ where: { id: organizationId }, select: { settings: true } })
  return decisionsFromSettings(org?.settings, system)
}

/** Ghi kép (ADR-012 T-7a): cùng giao dịch đưa `governance_decisions` của phạm vi `org:<id>` về đúng tập vừa lưu. */
export async function saveOrgGovernance(
  organizationId: string,
  system: GovernanceSystem,
  decisions: GovernanceDecisions,
  decidedBy: string | null = null,
): Promise<boolean> {
  const value = JSON.stringify(decisions)
  return prisma.$transaction(async (tx) => {
    const updated = await tx.$executeRaw`
    UPDATE organizations
    SET settings = (CASE WHEN jsonb_typeof(settings) = 'object' THEN settings ELSE '{}'::jsonb END)
      || jsonb_build_object('governance_matrix',
           (CASE WHEN jsonb_typeof(settings->'governance_matrix') = 'object' THEN settings->'governance_matrix' ELSE '{}'::jsonb END)
           || jsonb_build_object(${system}::text, ${value}::jsonb)),
        updated_at = NOW()
    WHERE id = ${organizationId}`
    if (updated !== 1) return false
    const org = await tx.organizations.findUnique({ where: { id: organizationId }, select: { type: true } })
    const tier = organizationTierOf(org?.type)
    const scope = `org:${organizationId}`
    await syncDecisionScope(tx, { system: `matrix:${system}`, scope }, matrixRecords({ system, tier, scope, decisions, decidedBy }), decidedBy)
    return true
  })
}

export async function getMotherGovernance(system: GovernanceSystem): Promise<GovernanceDecisions> {
  const row = await prisma.platform_settings.findUnique({ where: { key: motherKey(system) } })
  return parseDecisions(row?.value)
}

export async function saveMotherGovernance(system: GovernanceSystem, decisions: GovernanceDecisions, updatedBy: string | null): Promise<void> {
  const value = decisions as unknown as Prisma.InputJsonValue
  await prisma.$transaction(async (tx) => {
    await tx.platform_settings.upsert({
      where: { key: motherKey(system) },
      create: { key: motherKey(system), value, updated_by: updatedBy },
      update: { value, updated_by: updatedBy },
    })
    // Ghi kép (ADR-012 T-7a)
    const scope = "platform"
    await syncDecisionScope(tx, { system: `matrix:${system}`, scope }, matrixRecords({ system, tier: "MOTHER", scope, decisions, decidedBy: updatedBy }), updatedBy)
  })
}

/** Các tầng trên của tổ chức, thứ tự từ cao xuống: Mẹ, rồi Chuỗi (nếu tổ chức là đối tác của một chuỗi). */
export async function getUpperLayers(organizationId: string, system: GovernanceSystem, includeChain: boolean): Promise<UpperLayer[]> {
  const layers: UpperLayer[] = withBuiltInLocks(system, [{ tier: "MOTHER", decisions: await getMotherGovernance(system) }])
  if (!includeChain) return layers
  const link = await findPrimaryChainLink(organizationId)
  if (link) layers.push({ tier: "CHAIN", decisions: decisionsFromSettings(link.chainSettings, system) })
  return layers
}

/**
 * Tầng trên của nhiều ma trận cùng lúc (2 truy vấn) — dùng ở luồng bán hàng công khai, nơi mỗi lần
 * tải trang/báo giá cần cả Ưu đãi, Cam kết và Chính sách.
 */
export async function getPolicyGovernanceUpper(organizationId: string, systems: readonly PolicySystem[]): Promise<PolicyGovernanceUpper> {
  const [motherRows, link] = await Promise.all([
    prisma.platform_settings.findMany({ where: { key: { in: systems.map(motherKey) } } }),
    findPrimaryChainLink(organizationId),
  ])
  const out: PolicyGovernanceUpper = {}
  for (const system of systems) {
    const mother = motherRows.find((r) => r.key === motherKey(system))
    const layers: UpperLayer[] = withBuiltInLocks(system, [{ tier: "MOTHER", decisions: parseDecisions(mother?.value) }])
    if (link) layers.push({ tier: "CHAIN", decisions: decisionsFromSettings(link.chainSettings, system) })
    out[system] = layers
  }
  return out
}
