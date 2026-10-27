/**
 * 4-TIER CASCADING BROCHURE PAYMENT & DEPOSIT POLICY RESOLVER
 *
 * Chuẩn hóa chính sách Đặt cọc & Thanh toán theo 4 tầng phân cấp:
 * Mother (Sàn quy định danh mục kênh/sàn cọc)
 * -> Industry Profile (Thói quen ngành: Homestay 50-100%, May đo 70%, v.v.)
 * -> Chain (Chuỗi áp đặt chính sách cọc & QC thành phẩm)
 * -> Store (Tiệm tùy biến trong phạm vi cho phép)
 */

import {
  resolveCascadingGovernance,
  type HardLock,
  type TierConfigEntry,
} from "@/core/governance/cascading-resolver"
import {
  type BrochurePaymentPolicy,
  DEFAULT_PAYMENT_POLICY,
} from "./brochure-payment-policy"

export interface ResolveCascadingPaymentPolicyInput {
  storeOrgId: string
  chainOrgId?: string | null | undefined
  industryKey?: string | null | undefined

  /** Khóa cứng từ Mother hoặc Chuỗi (ví dụ: Chuỗi bắt buộc cọc tối thiểu 50% hoặc bắt buộc QC ảnh) */
  hardLocks?: HardLock<Partial<BrochurePaymentPolicy>>[] | undefined

  /** Dữ liệu cấu hình từng tầng */
  storePolicyRaw?: Partial<BrochurePaymentPolicy> | null | undefined
  chainPolicyRaw?: Partial<BrochurePaymentPolicy> | null | undefined
}

export interface CascadingPaymentPolicyResult {
  effectivePolicy: BrochurePaymentPolicy
  decidedBy: string
  isLocked: boolean
  lockReason?: string | undefined
}

export function getIndustryDefaultPaymentPolicy(industryKey?: string | null): BrochurePaymentPolicy {
  switch (industryKey) {
    case "HOMESTAY":
      return {
        ...DEFAULT_PAYMENT_POLICY,
        depositPercent: 50,
        requirePaidBeforeProduction: true,
        requireFullBeforeDispatch: true,
        requirePaymentProof: true,
      }
    case "FASHION":
    case "CRAFT_GIFT":
      return {
        ...DEFAULT_PAYMENT_POLICY,
        depositPercent: 50,
        requirePaidBeforeProduction: true,
        requireFullBeforeDispatch: false,
        requireProductPhotoQC: true,
      }
    case "FNB":
      return {
        ...DEFAULT_PAYMENT_POLICY,
        depositPercent: 0,
        requirePaidBeforeProduction: true,
        requireFullBeforeDispatch: true,
      }
    case "FLOWER":
    default:
      return {
        ...DEFAULT_PAYMENT_POLICY,
        depositPercent: 0,
        requirePaidBeforeProduction: false,
        requireFullBeforeDispatch: true,
        requireProductPhotoQC: true,
        requirePaymentProof: true,
      }
  }
}

export function resolveCascadingPaymentPolicy(
  input: ResolveCascadingPaymentPolicyInput
): CascadingPaymentPolicyResult {
  const {
    storeOrgId,
    chainOrgId,
    industryKey,
    hardLocks = [],
    storePolicyRaw,
    chainPolicyRaw,
  } = input

  const industryFallback = getIndustryDefaultPaymentPolicy(industryKey)

  const paymentHardLocks = hardLocks
    .filter((l) => l.key === "PAYMENT_POLICY" || l.key === "BROCHURE_PAYMENT")
    .map((l) => ({
      key: "PAYMENT_POLICY",
      tier: l.tier,
      scopeId: l.scopeId,
      locked: l.locked,
      reason: l.reason,
      enforcedConfig: l.enforcedConfig
        ? ({ ...industryFallback, ...l.enforcedConfig } as Record<string, unknown>)
        : undefined,
    }))

  const storeEntry: TierConfigEntry<Record<string, unknown>> | null =
    storePolicyRaw && Object.keys(storePolicyRaw).length > 0
      ? {
          key: "PAYMENT_POLICY",
          tier: "STORE",
          scopeId: storeOrgId,
          enabled: true,
          config: { ...industryFallback, ...storePolicyRaw } as Record<string, unknown>,
        }
      : null

  const chainEntry: TierConfigEntry<Record<string, unknown>> | null =
    chainPolicyRaw && Object.keys(chainPolicyRaw).length > 0
      ? {
          key: "PAYMENT_POLICY",
          tier: "CHAIN",
          scopeId: chainOrgId ?? "CHAIN_UNKNOWN",
          enabled: true,
          config: { ...industryFallback, ...chainPolicyRaw } as Record<string, unknown>,
        }
      : null

  const res = resolveCascadingGovernance<Record<string, unknown>>({
    key: "PAYMENT_POLICY",
    storeScopeId: storeOrgId,
    chainScopeId: chainOrgId,
    industryScopeId: industryKey,
    hardLocks: paymentHardLocks,
    storeOverride: storeEntry,
    chainOverride: chainEntry,
    systemFallback: industryFallback as unknown as Record<string, unknown>,
  })

  return {
    effectivePolicy: res.config as unknown as BrochurePaymentPolicy,
    decidedBy: res.decidedBy,
    isLocked: res.isLocked,
    lockReason: res.lockReason,
  }
}
