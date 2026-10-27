/**
 * 4-TIER CASCADING CRAFT FEE & SUBCONTRACTING POLICY RESOLVER
 *
 * Chuẩn hóa chính sách Phí gia công & Thợ làm thay theo 4 tầng phân cấp:
 * Mother (Bảo vệ thợ: Sàn tiền công tối thiểu, trần khấu trừ phạt lỗi)
 * -> Industry Profile (Biểu phí mặc định theo ngành từ `IndustryCraftFeeSpec`)
 * -> Chain (Chuỗi ban hành biểu phí khoán thợ & hoa hồng đối tác đồng nhất)
 * -> Store (Tiệm tùy biến phụ cấp ca gấp / hỗ trợ thợ tại chỗ)
 */

import {
  resolveCascadingGovernance,
  type HardLock,
  type TierConfigEntry,
} from "@/core/governance/cascading-resolver"
import { getIndustryPlugin } from "@/modules/organization/domain/industry-profile"
import {
  type CraftFeePolicy,
  defaultCraftFeePolicy,
} from "./craft-fee-policy"

export interface ResolveCascadingCraftFeeInput {
  storeOrgId: string
  chainOrgId?: string | null | undefined
  industryKey?: string | null | undefined

  /** Khóa cứng từ Mother hoặc Chuỗi (ví dụ: Trần phạt lỗi tối đa 30%, hoặc khoán cố định toàn chuỗi) */
  hardLocks?: HardLock<Partial<CraftFeePolicy>>[] | undefined

  /** Dữ liệu cấu hình từng tầng */
  storeCraftFeeRaw?: Partial<CraftFeePolicy> | null | undefined
  chainCraftFeeRaw?: Partial<CraftFeePolicy> | null | undefined
}

export interface CascadingCraftFeeResult {
  effectivePolicy: CraftFeePolicy
  feeLabel: string
  decidedBy: string
  isLocked: boolean
  lockReason?: string | undefined
}

export function resolveCascadingCraftFee(
  input: ResolveCascadingCraftFeeInput
): CascadingCraftFeeResult {
  const {
    storeOrgId,
    chainOrgId,
    industryKey,
    hardLocks = [],
    storeCraftFeeRaw,
    chainCraftFeeRaw,
  } = input

  const plugin = getIndustryPlugin(industryKey)
  const spec = plugin.craftFee ?? {
    feeLabel: "Phí gia công",
    defaultPercent: 50,
    minVnd: 50_000,
    maxVnd: 500_000,
    partnerPercent: 65,
    complexityLabels: { EASY: "Dễ", MEDIUM: "Vừa", HARD: "Khó" },
    laborByComplexityVnd: { EASY: 30_000, MEDIUM: 50_000, HARD: 100_000 },
    peakDays: [
      { monthDay: "03-08", label: "Quốc tế Phụ nữ" },
      { monthDay: "10-20", label: "Phụ nữ Việt Nam" },
      { monthDay: "02-14", label: "Valentine" },
    ],
  }

  const industryFallback = defaultCraftFeePolicy(spec)

  const craftLocks = hardLocks
    .filter((l) => l.key === "CRAFT_FEE" || l.key === "SUBCONTRACT_FEE")
    .map((l) => ({
      key: "CRAFT_FEE",
      tier: l.tier,
      scopeId: l.scopeId,
      locked: l.locked,
      reason: l.reason,
      enforcedConfig: l.enforcedConfig
        ? ({ ...industryFallback, ...l.enforcedConfig } as Record<string, unknown>)
        : undefined,
    }))

  const storeEntry: TierConfigEntry<Record<string, unknown>> | null =
    storeCraftFeeRaw && Object.keys(storeCraftFeeRaw).length > 0
      ? {
          key: "CRAFT_FEE",
          tier: "STORE",
          scopeId: storeOrgId,
          enabled: true,
          config: { ...industryFallback, ...storeCraftFeeRaw } as Record<string, unknown>,
        }
      : null

  const chainEntry: TierConfigEntry<Record<string, unknown>> | null =
    chainCraftFeeRaw && Object.keys(chainCraftFeeRaw).length > 0
      ? {
          key: "CRAFT_FEE",
          tier: "CHAIN",
          scopeId: chainOrgId ?? "CHAIN_UNKNOWN",
          enabled: true,
          config: { ...industryFallback, ...chainCraftFeeRaw } as Record<string, unknown>,
        }
      : null

  const res = resolveCascadingGovernance<Record<string, unknown>>({
    key: "CRAFT_FEE",
    storeScopeId: storeOrgId,
    chainScopeId: chainOrgId,
    industryScopeId: industryKey,
    hardLocks: craftLocks,
    storeOverride: storeEntry,
    chainOverride: chainEntry,
    systemFallback: industryFallback as unknown as Record<string, unknown>,
  })

  return {
    effectivePolicy: res.config as unknown as CraftFeePolicy,
    feeLabel: spec.feeLabel,
    decidedBy: res.decidedBy,
    isLocked: res.isLocked,
    lockReason: res.lockReason,
  }
}
