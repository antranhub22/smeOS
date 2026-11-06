/**
 * Lưu/đọc quyết định ma trận quản trị theo tầng.
 * - Đọc (ADR-012 T-7b): bảng `governance_decisions`, phạm vi `org:<id>` (tổ chức) hoặc `platform` (Mẹ).
 * - Ghi: nơi lưu cũ (`organizations.settings.governance_matrix.<SYSTEM>`, `platform_settings` khoá
 *   `governance_matrix:<SYSTEM>`) + ghi kép bảng mới cùng giao dịch (T-7a) — nơi lưu cũ giữ tới T-7c để quay lui được.
 * - Tầng Chuỗi của một cửa hàng: chuỗi cha chính (`findPrimaryChainLink`).
 */
import type { Prisma } from "@/generated/prisma/client"
import { matrixRecords } from "@/core/governance/decision-record"
import { currentDecisions, syncDecisionScope } from "@/core/governance/infra/decision-log"
import { organizationTierOf } from "@/core/governance/tier-of"
import { prisma } from "@/core/tenancy/infra/prisma"

import { findPrimaryChainLink } from "./tier-chain-repository"
import {
  decisionsFromRecords,
  withBuiltInLocks,
  type GovernanceDecisions,
  type GovernanceSystem,
  type PolicyGovernanceUpper,
  type PolicySystem,
  type UpperLayer,
} from "../domain/governance-decisions"

const motherKey = (system: GovernanceSystem) => `governance_matrix:${system}`

const MOTHER_SCOPE = "platform"
const orgScope = (organizationId: string) => `org:${organizationId}`
const matrixSystem = (system: GovernanceSystem) => `matrix:${system}` as const

async function readMatrix(system: GovernanceSystem, scope: string): Promise<GovernanceDecisions> {
  return decisionsFromRecords(await currentDecisions(prisma, { systems: [matrixSystem(system)], scopes: [scope] }), system)
}

export async function getOrgGovernance(organizationId: string, system: GovernanceSystem): Promise<GovernanceDecisions> {
  return readMatrix(system, orgScope(organizationId))
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
  return readMatrix(system, MOTHER_SCOPE)
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
  if (link) layers.push({ tier: "CHAIN", decisions: await readMatrix(system, orgScope(link.chainOrgId)) })
  return layers
}

/**
 * Ma trận của nhiều hệ thống cùng lúc (2 truy vấn) cho luồng bán hàng công khai, nơi mỗi lần tải trang/báo giá cần cả
 * Ưu đãi, Cam kết và Chính sách: tầng trên (Mẹ, Chuỗi) và quyết định riêng của tiệm (`own`).
 */
export async function getPolicyGovernanceUpper(organizationId: string, systems: readonly PolicySystem[]): Promise<PolicyGovernanceUpper> {
  const link = await findPrimaryChainLink(organizationId)
  const chainScope = link ? orgScope(link.chainOrgId) : null
  const records = await currentDecisions(prisma, {
    systems: systems.map(matrixSystem),
    scopes: [MOTHER_SCOPE, orgScope(organizationId), ...(chainScope ? [chainScope] : [])],
  })
  const inScope = (scope: string) => records.filter((r) => r.scope === scope)
  const own: Partial<Record<PolicySystem, GovernanceDecisions>> = {}
  const out: PolicyGovernanceUpper = { own }
  for (const system of systems) {
    const layers: UpperLayer[] = withBuiltInLocks(system, [{ tier: "MOTHER", decisions: decisionsFromRecords(inScope(MOTHER_SCOPE), system) }])
    if (chainScope) layers.push({ tier: "CHAIN", decisions: decisionsFromRecords(inScope(chainScope), system) })
    out[system] = layers
    own[system] = decisionsFromRecords(inScope(orgScope(organizationId)), system)
  }
  return out
}
