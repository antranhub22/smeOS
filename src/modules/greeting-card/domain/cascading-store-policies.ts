/**
 * 4-TIER CASCADING STORE POLICIES RESOLVER
 *
 * Tích hợp kiến trúc 4 tầng phân cấp vào Ưu đãi (Promotions), Cam kết (Commitments)
 * và Chính sách / Thỏa thuận (Agreements).
 *
 * Đảm bảo Zero-ORM, tuân thủ Clean Architecture và SRP < 350 dòng.
 */

import {
  resolveCascadingGovernance,
  type GovernanceTier,
  type HardLock,
  type TierConfigEntry,
} from "@/core/governance/cascading-resolver"
import {
  type StorePoliciesConfig,
  type PromotionItem,
  type CommitmentItem,
  type AgreementItem,
  type PublicAppliedPolicies,
  getIndustryDefaultPromotions,
  getIndustryDefaultCommitments,
  getIndustryDefaultAgreements,
} from "./store-policy"
import { promotionPricingOf } from "./promotion-pricing"

export interface ResolveCascadingStorePoliciesInput {
  storeOrgId: string
  chainOrgId?: string | null | undefined
  industryKey?: string | null | undefined

  /** Khóa cứng (Hard-Locks) từ cấp Mother hoặc Chain */
  hardLocks?: HardLock<Partial<StorePoliciesConfig>>[] | undefined

  /** Dữ liệu từng tầng (đọc từ DB hoặc scoped JSON) */
  storePoliciesRaw?: Partial<StorePoliciesConfig> | null | undefined
  chainPoliciesRaw?: Partial<StorePoliciesConfig> | null | undefined

  /** Bộ lọc catalog công khai (nếu khách truy cập qua Brochure / Smart Greeting Card) */
  catalogFilters?: unknown
}

export interface CascadingPoliciesResolutionResult {
  effectivePolicies: StorePoliciesConfig
  publicAppliedPolicies: PublicAppliedPolicies
  decidedBy: {
    promotions: string
    commitments: string
    agreements: string
  }
  lockedItems: {
    promotions: boolean
    commitments: boolean
    agreements: boolean
  }
}

/**
 * Resolve chính sách cửa hàng theo cơ chế Cascading 4 Tầng:
 * Store (Delta) -> Chain -> Industry Profile -> Mother System Defaults
 */
export function resolveCascadingStorePolicies(
  input: ResolveCascadingStorePoliciesInput
): CascadingPoliciesResolutionResult {
  const {
    storeOrgId,
    chainOrgId,
    industryKey,
    hardLocks = [],
    storePoliciesRaw,
    chainPoliciesRaw,
    catalogFilters,
  } = input

  // 1. Resolve Promotions
  const promoFallback: { items: PromotionItem[] } = {
    items: getIndustryDefaultPromotions(industryKey),
  }

  const promoLock = hardLocks
    .filter((l) => l.key === "PROMOTIONS" || l.key === "STORE_POLICIES")
    .map((l) => ({
      key: "PROMOTIONS",
      tier: l.tier,
      scopeId: l.scopeId,
      locked: l.locked,
      reason: l.reason,
      enforcedConfig: l.enforcedConfig?.promotions ? { items: l.enforcedConfig.promotions } : undefined,
    }))

  const promoStoreEntry: TierConfigEntry<{ items: PromotionItem[] }> | null =
    storePoliciesRaw?.promotions && storePoliciesRaw.promotions.length > 0
      ? {
          key: "PROMOTIONS",
          tier: "STORE",
          scopeId: storeOrgId,
          enabled: true,
          config: { items: storePoliciesRaw.promotions },
        }
      : null

  const promoChainEntry: TierConfigEntry<{ items: PromotionItem[] }> | null =
    chainPoliciesRaw?.promotions && chainPoliciesRaw.promotions.length > 0
      ? {
          key: "PROMOTIONS",
          tier: "CHAIN",
          scopeId: chainOrgId ?? "CHAIN_UNKNOWN",
          enabled: true,
          config: { items: chainPoliciesRaw.promotions },
        }
      : null

  const resolvedPromos = resolveCascadingGovernance<{ items: PromotionItem[] }>({
    key: "PROMOTIONS",
    storeScopeId: storeOrgId,
    chainScopeId: chainOrgId,
    industryScopeId: industryKey,
    hardLocks: promoLock,
    storeOverride: promoStoreEntry,
    chainOverride: promoChainEntry,
    systemFallback: promoFallback,
  })

  // 2. Resolve Commitments
  const commitFallback: { items: CommitmentItem[] } = {
    items: getIndustryDefaultCommitments(industryKey),
  }

  const commitLock = hardLocks
    .filter((l) => l.key === "COMMITMENTS" || l.key === "STORE_POLICIES")
    .map((l) => ({
      key: "COMMITMENTS",
      tier: l.tier,
      scopeId: l.scopeId,
      locked: l.locked,
      reason: l.reason,
      enforcedConfig: l.enforcedConfig?.commitments ? { items: l.enforcedConfig.commitments } : undefined,
    }))

  const commitStoreEntry: TierConfigEntry<{ items: CommitmentItem[] }> | null =
    storePoliciesRaw?.commitments && storePoliciesRaw.commitments.length > 0
      ? {
          key: "COMMITMENTS",
          tier: "STORE",
          scopeId: storeOrgId,
          enabled: true,
          config: { items: storePoliciesRaw.commitments },
        }
      : null

  const commitChainEntry: TierConfigEntry<{ items: CommitmentItem[] }> | null =
    chainPoliciesRaw?.commitments && chainPoliciesRaw.commitments.length > 0
      ? {
          key: "COMMITMENTS",
          tier: "CHAIN",
          scopeId: chainOrgId ?? "CHAIN_UNKNOWN",
          enabled: true,
          config: { items: chainPoliciesRaw.commitments },
        }
      : null

  const resolvedCommits = resolveCascadingGovernance<{ items: CommitmentItem[] }>({
    key: "COMMITMENTS",
    storeScopeId: storeOrgId,
    chainScopeId: chainOrgId,
    industryScopeId: industryKey,
    hardLocks: commitLock,
    storeOverride: commitStoreEntry,
    chainOverride: commitChainEntry,
    systemFallback: commitFallback,
  })

  // 3. Resolve Agreements
  const agreeFallback: { items: AgreementItem[] } = {
    items: getIndustryDefaultAgreements(industryKey),
  }

  const agreeLock = hardLocks
    .filter((l) => l.key === "AGREEMENTS" || l.key === "STORE_POLICIES")
    .map((l) => ({
      key: "AGREEMENTS",
      tier: l.tier,
      scopeId: l.scopeId,
      locked: l.locked,
      reason: l.reason,
      enforcedConfig: l.enforcedConfig?.agreements ? { items: l.enforcedConfig.agreements } : undefined,
    }))

  const agreeStoreEntry: TierConfigEntry<{ items: AgreementItem[] }> | null =
    storePoliciesRaw?.agreements && storePoliciesRaw.agreements.length > 0
      ? {
          key: "AGREEMENTS",
          tier: "STORE",
          scopeId: storeOrgId,
          enabled: true,
          config: { items: storePoliciesRaw.agreements },
        }
      : null

  const agreeChainEntry: TierConfigEntry<{ items: AgreementItem[] }> | null =
    chainPoliciesRaw?.agreements && chainPoliciesRaw.agreements.length > 0
      ? {
          key: "AGREEMENTS",
          tier: "CHAIN",
          scopeId: chainOrgId ?? "CHAIN_UNKNOWN",
          enabled: true,
          config: { items: chainPoliciesRaw.agreements },
        }
      : null

  const resolvedAgrees = resolveCascadingGovernance<{ items: AgreementItem[] }>({
    key: "AGREEMENTS",
    storeScopeId: storeOrgId,
    chainScopeId: chainOrgId,
    industryScopeId: industryKey,
    hardLocks: agreeLock,
    storeOverride: agreeStoreEntry,
    chainOverride: agreeChainEntry,
    systemFallback: agreeFallback,
  })

  // 4. Tổng hợp Effective StorePoliciesConfig
  const effectivePolicies: StorePoliciesConfig = {
    promotions: resolvedPromos.config.items,
    commitments: resolvedCommits.config.items,
    agreements: resolvedAgrees.config.items,
    intakePromotionCta: {
      enabled: true,
      percent: 10,
    },
  }

  // 5. Tính toán Public Applied Policies (Áp dụng cho Khách duyệt Thẻ chào / Đặt Brochure)
  const filters =
    catalogFilters && typeof catalogFilters === "object"
      ? (catalogFilters as Record<string, unknown>)
      : {}
  const applied = filters.appliedPolicies as
    | {
        promotionIds?: string[]
        commitmentIds?: string[]
        agreementIds?: string[]
        allowCustomerPromotionChoice?: boolean
      }
    | undefined

  const promoFilter = applied?.promotionIds
  const commitFilter = applied?.commitmentIds
  const agreeFilter = applied?.agreementIds

  const activePromos = effectivePolicies.promotions.filter((p) => p.active !== false)
  const finalPromos = (
    promoFilter ? activePromos.filter((p) => promoFilter.includes(p.id)) : activePromos
  ).map((p) => ({
    id: p.id,
    title: p.title,
    customerText: p.description,
    ...promotionPricingOf(p),
  }))

  const finalCommits = (
    commitFilter
      ? effectivePolicies.commitments.filter((c) => commitFilter.includes(c.id))
      : effectivePolicies.commitments
  ).map(({ id, title, customerText }) => ({ id, title, customerText }))

  const finalAgrees = (
    agreeFilter
      ? effectivePolicies.agreements.filter((a) => agreeFilter.includes(a.id))
      : effectivePolicies.agreements
  ).map(({ id, title, customerText }) => ({ id, title, customerText }))

  const publicAppliedPolicies: PublicAppliedPolicies = {
    promotions: finalPromos,
    commitments: finalCommits,
    agreements: finalAgrees,
    allowCustomerPromotionChoice: applied?.allowCustomerPromotionChoice ?? true,
    intakePromotionCta: effectivePolicies.intakePromotionCta,
  }

  return {
    effectivePolicies,
    publicAppliedPolicies,
    decidedBy: {
      promotions: resolvedPromos.decidedBy,
      commitments: resolvedCommits.decidedBy,
      agreements: resolvedAgrees.decidedBy,
    },
    lockedItems: {
      promotions: resolvedPromos.isLocked,
      commitments: resolvedCommits.isLocked,
      agreements: resolvedAgrees.isLocked,
    },
  }
}
