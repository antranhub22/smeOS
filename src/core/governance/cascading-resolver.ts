/**
 * 4-TIER CASCADING GOVERNANCE RESOLVER (Zero-ORM Domain Engine)
 *
 * Tiêu chuẩn kiến trúc bất biến (PO 27/10/2026, AGENTS.md §4-Tier Cascading Governance SSOT)
 * Giải quyết bài toán phân cấp 4 tầng cho: Ưu đãi, Cam kết, Chính sách, Kế hoạch thanh toán,
 * Phí gia công và Mẫu ấn phẩm.
 *
 * Thứ tự Resolve:
 *   1. GATE 1: Feature / Channel Activation (nếu có)
 *   2. GATE 2: Hard-Locks theo thứ tự từ trên xuống (MOTHER -> INDUSTRY -> CHAIN -> STORE)
 *   3. BOTTOM-UP RESOLUTION: STORE -> CHAIN -> INDUSTRY -> MOTHER_DEFAULT -> SYSTEM_FALLBACK
 */

export type GovernanceTier = "MOTHER" | "INDUSTRY" | "CHAIN" | "STORE"

export interface HardLock<TConfig = Record<string, unknown>> {
  key: string
  tier: GovernanceTier
  scopeId: string // "GLOBAL" cho MOTHER, hoặc industryKey, chainOrgId, storeOrgId
  locked: boolean
  enforcedConfig?: TConfig | undefined
  reason?: string | undefined
}

export interface TierConfigEntry<TConfig> {
  key: string
  tier: GovernanceTier
  scopeId: string
  enabled: boolean
  config?: TConfig | undefined
}

export interface ResolveCascadingInput<TConfig> {
  key: string
  storeScopeId: string
  chainScopeId?: string | null | undefined
  industryScopeId?: string | null | undefined
  
  /** Cờ kích hoạt cấp cao (nếu module bị tắt toàn sàn thì dừng ngay) */
  isGloballyActivated?: boolean | undefined

  /** Danh sách các khóa cứng (Hard-Locks) */
  hardLocks?: HardLock<TConfig>[] | undefined

  /** Dữ liệu cấu hình từng tầng (chỉ nạp phần override nếu có) */
  storeOverride?: TierConfigEntry<TConfig> | null | undefined
  chainOverride?: TierConfigEntry<TConfig> | null | undefined
  industryDefault?: TierConfigEntry<TConfig> | null | undefined
  motherDefault?: TierConfigEntry<TConfig> | null | undefined
  systemFallback: TConfig
}

export interface ResolveCascadingOutput<TConfig> {
  key: string
  enabled: boolean
  config: TConfig
  isLocked: boolean
  lockedBy?: GovernanceTier | undefined
  lockReason?: string | undefined
  decidedBy:
    | "GLOBALLY_DEACTIVATED"
    | "HARD_LOCK_MOTHER"
    | "HARD_LOCK_INDUSTRY"
    | "HARD_LOCK_CHAIN"
    | "HARD_LOCK_STORE"
    | "STORE"
    | "CHAIN"
    | "INDUSTRY"
    | "MOTHER_DEFAULT"
    | "SYSTEM_FALLBACK"
}

/**
 * Pure Domain Resolver Function - Zero Prisma, Zero Side Effects.
 */
export function resolveCascadingGovernance<TConfig>(
  input: ResolveCascadingInput<TConfig>
): ResolveCascadingOutput<TConfig> {
  const {
    key,
    storeScopeId,
    chainScopeId,
    industryScopeId,
    isGloballyActivated = true,
    hardLocks = [],
    storeOverride,
    chainOverride,
    industryDefault,
    motherDefault,
    systemFallback,
  } = input

  // GATE 1: Tắt toàn sàn
  if (!isGloballyActivated) {
    return {
      key,
      enabled: false,
      config: systemFallback,
      isLocked: true,
      lockedBy: "MOTHER",
      lockReason: "Chức năng tạm ngưng trên toàn hệ thống",
      decidedBy: "GLOBALLY_DEACTIVATED",
    }
  }

  // GATE 2: Hard Locks - Kiểm tra từ trên xuống (MOTHER -> INDUSTRY -> CHAIN -> STORE)
  const tierHierarchy: GovernanceTier[] = ["MOTHER", "INDUSTRY", "CHAIN", "STORE"]

  for (const tier of tierHierarchy) {
    const lock = hardLocks.find((l) => {
      if (l.key !== key || l.tier !== tier || !l.locked) return false
      if (tier === "MOTHER") return true
      if (tier === "INDUSTRY" && industryScopeId && l.scopeId === industryScopeId) return true
      if (tier === "CHAIN" && chainScopeId && l.scopeId === chainScopeId) return true
      if (tier === "STORE" && storeScopeId && l.scopeId === storeScopeId) return true
      return false
    })

    if (lock) {
      return {
        key,
        enabled: true,
        config: lock.enforcedConfig ?? systemFallback,
        isLocked: true,
        lockedBy: tier,
        lockReason: lock.reason ?? `Đã khóa bất biến bởi cấp ${tier}`,
        decidedBy: `HARD_LOCK_${tier}` as ResolveCascadingOutput<TConfig>["decidedBy"],
      }
    }
  }

  // GATE 3: Bottom-up Fallback (Most Specific Wins)
  if (storeOverride != null) {
    return {
      key,
      enabled: storeOverride.enabled,
      config: storeOverride.config ?? systemFallback,
      isLocked: false,
      decidedBy: "STORE",
    }
  }

  if (chainOverride != null) {
    return {
      key,
      enabled: chainOverride.enabled,
      config: chainOverride.config ?? systemFallback,
      isLocked: false,
      decidedBy: "CHAIN",
    }
  }

  if (industryDefault != null) {
    return {
      key,
      enabled: industryDefault.enabled,
      config: industryDefault.config ?? systemFallback,
      isLocked: false,
      decidedBy: "INDUSTRY",
    }
  }

  if (motherDefault != null) {
    return {
      key,
      enabled: motherDefault.enabled,
      config: motherDefault.config ?? systemFallback,
      isLocked: false,
      decidedBy: "MOTHER_DEFAULT",
    }
  }

  return {
    key,
    enabled: true,
    config: systemFallback,
    isLocked: false,
    decidedBy: "SYSTEM_FALLBACK",
  }
}
