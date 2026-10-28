/**
 * Lưu/đọc quyết định ma trận quản trị theo tầng.
 * - Tầng tổ chức: `organizations.settings.governance_matrix.<SYSTEM>` (chỉ đổi đúng nhánh đó, một câu lệnh).
 * - Tầng Mẹ: `platform_settings` khoá `governance_matrix:<SYSTEM>`.
 * - Tầng Chuỗi của một cửa hàng: tổ chức chuỗi có quan hệ đối tác ACTIVE với cửa hàng.
 */
import type { Prisma } from "@/generated/prisma/client"
import { prisma } from "@/core/tenancy/infra/prisma"
import {
  decisionsFromSettings,
  parseDecisions,
  type GovernanceDecisions,
  type GovernanceSystem,
  type UpperLayer,
} from "../domain/governance-decisions"

const motherKey = (system: GovernanceSystem) => `governance_matrix:${system}`

export async function getOrgGovernance(organizationId: string, system: GovernanceSystem): Promise<GovernanceDecisions> {
  const org = await prisma.organizations.findUnique({ where: { id: organizationId }, select: { settings: true } })
  return decisionsFromSettings(org?.settings, system)
}

export async function saveOrgGovernance(organizationId: string, system: GovernanceSystem, decisions: GovernanceDecisions): Promise<boolean> {
  const value = JSON.stringify(decisions)
  const updated = await prisma.$executeRaw`
    UPDATE organizations
    SET settings = (CASE WHEN jsonb_typeof(settings) = 'object' THEN settings ELSE '{}'::jsonb END)
      || jsonb_build_object('governance_matrix',
           (CASE WHEN jsonb_typeof(settings->'governance_matrix') = 'object' THEN settings->'governance_matrix' ELSE '{}'::jsonb END)
           || jsonb_build_object(${system}::text, ${value}::jsonb)),
        updated_at = NOW()
    WHERE id = ${organizationId}`
  return updated === 1
}

export async function getMotherGovernance(system: GovernanceSystem): Promise<GovernanceDecisions> {
  const row = await prisma.platform_settings.findUnique({ where: { key: motherKey(system) } })
  return parseDecisions(row?.value)
}

export async function saveMotherGovernance(system: GovernanceSystem, decisions: GovernanceDecisions, updatedBy: string | null): Promise<void> {
  const value = decisions as unknown as Prisma.InputJsonValue
  await prisma.platform_settings.upsert({
    where: { key: motherKey(system) },
    create: { key: motherKey(system), value, updated_by: updatedBy },
    update: { value, updated_by: updatedBy },
  })
}

/** Các tầng trên của tổ chức, thứ tự từ cao xuống: Mẹ, rồi Chuỗi (nếu tổ chức là đối tác của một chuỗi). */
export async function getUpperLayers(organizationId: string, system: GovernanceSystem, includeChain: boolean): Promise<UpperLayer[]> {
  const layers: UpperLayer[] = [{ tier: "MOTHER", decisions: await getMotherGovernance(system) }]
  if (!includeChain) return layers
  const link = await prisma.chain_partnerships.findFirst({
    where: { partner_org_id: organizationId, status: "ACTIVE" },
    orderBy: { created_at: "asc" },
    select: { chain_organization: { select: { settings: true } } },
  })
  if (link) layers.push({ tier: "CHAIN", decisions: decisionsFromSettings(link.chain_organization.settings, system) })
  return layers
}
