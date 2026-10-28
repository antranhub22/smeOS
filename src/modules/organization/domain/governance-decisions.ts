/**
 * Quyết định của MỘT tầng trên ma trận quản trị (ưu đãi, cam kết, chính sách, thanh toán, phí gia công…).
 *
 * - `overrides[key]`: tầng này bật/tắt mục cho chính mình (ghi đè mặc định kế thừa).
 * - `locks[key]`: tầng này khoá cứng mục ở trạng thái `enabled` cho mọi tầng dưới.
 *
 * Thứ tự áp: Mẹ → Chuỗi → tầng đang xem. Khoá của tầng trên thắng mọi ghi đè/khoá của tầng dưới.
 * Pure — không phụ thuộc Prisma.
 */

export const GOVERNANCE_SYSTEMS = ["PROMOTIONS", "COMMITMENTS", "POLICIES", "PAYMENTS", "CRAFT_FEES", "TEMPLATES"] as const
export type GovernanceSystem = (typeof GOVERNANCE_SYSTEMS)[number]
export type GovernanceLayerTier = "MOTHER" | "INDUSTRY" | "CHAIN" | "STORE"

export type GovernanceLock = { enabled: boolean }
export type GovernanceDecisions = {
  overrides: Record<string, boolean>
  locks: Record<string, GovernanceLock>
}

export const MAX_GOVERNANCE_KEYS = 500
const KEY_RE = /^[A-Za-z0-9_.:-]{1,96}$/

export function isGovernanceSystem(v: unknown): v is GovernanceSystem {
  return typeof v === "string" && (GOVERNANCE_SYSTEMS as readonly string[]).includes(v)
}

export function emptyDecisions(): GovernanceDecisions {
  return { overrides: {}, locks: {} }
}

/** Đọc quyết định đã lưu (JSON tuỳ ý) thành dạng sạch; bỏ khoá sai định dạng. */
export function parseDecisions(raw: unknown): GovernanceDecisions {
  const out = emptyDecisions()
  if (!raw || typeof raw !== "object") return out
  const { overrides, locks } = raw as { overrides?: unknown; locks?: unknown }
  if (overrides && typeof overrides === "object") {
    for (const [k, v] of Object.entries(overrides)) if (KEY_RE.test(k) && typeof v === "boolean") out.overrides[k] = v
  }
  if (locks && typeof locks === "object") {
    for (const [k, v] of Object.entries(locks)) {
      const enabled = (v as { enabled?: unknown } | null)?.enabled
      if (KEY_RE.test(k) && typeof enabled === "boolean") out.locks[k] = { enabled }
    }
  }
  return out
}

/** Quyết định của tầng `system` trong `organizations.settings.governance_matrix`. */
export function decisionsFromSettings(settings: unknown, system: GovernanceSystem): GovernanceDecisions {
  const matrix = settings && typeof settings === "object" ? (settings as { governance_matrix?: unknown }).governance_matrix : null
  return parseDecisions(matrix && typeof matrix === "object" ? (matrix as Record<string, unknown>)[system] : null)
}

export type UpperLayer = { tier: GovernanceLayerTier; decisions: GovernanceDecisions }

/** Khoá đang áp xuống từ tầng trên gần nhất có khoá (tầng trên cùng thắng). */
export function upperLockFor(key: string, upper: readonly UpperLayer[]): { tier: GovernanceLayerTier; lock: GovernanceLock } | null {
  for (const layer of upper) {
    const lock = layer.decisions.locks[key]
    if (lock) return { tier: layer.tier, lock }
  }
  return null
}

export type DecisionViolation = { key: string; reason: "LOCKED_BY_UPPER" | "STORE_CANNOT_LOCK" | "BAD_KEY" | "TOO_MANY" }

/**
 * Kiểm quyết định mới của tầng đang xem trước khi lưu: không ghi đè/khoá mục tầng trên đã khoá,
 * cửa hàng không đặt khoá (không có tầng dưới), khoá đúng định dạng và có trần số lượng.
 */
export function validateDecisions(
  next: GovernanceDecisions,
  ownTier: GovernanceLayerTier,
  upper: readonly UpperLayer[]
): DecisionViolation[] {
  const violations: DecisionViolation[] = []
  const keys = [...Object.keys(next.overrides), ...Object.keys(next.locks)]
  if (keys.length > MAX_GOVERNANCE_KEYS) return [{ key: "*", reason: "TOO_MANY" }]
  for (const key of keys) {
    if (!KEY_RE.test(key)) violations.push({ key, reason: "BAD_KEY" })
    else if (upperLockFor(key, upper)) violations.push({ key, reason: "LOCKED_BY_UPPER" })
  }
  if (ownTier === "STORE") for (const key of Object.keys(next.locks)) violations.push({ key, reason: "STORE_CANNOT_LOCK" })
  return violations
}

export type EffectiveDecision = {
  enabled: boolean
  source: "UPPER_LOCK" | "OWN_LOCK" | "OWN_OVERRIDE" | "DEFAULT"
  lockedBy: GovernanceLayerTier | null
}

/** Trạng thái hiệu lực của một mục cho tầng đang xem. */
export function effectiveDecision(
  key: string,
  defaultEnabled: boolean,
  own: GovernanceDecisions,
  ownTier: GovernanceLayerTier,
  upper: readonly UpperLayer[]
): EffectiveDecision {
  const up = upperLockFor(key, upper)
  if (up) return { enabled: up.lock.enabled, source: "UPPER_LOCK", lockedBy: up.tier }
  const ownLock = own.locks[key]
  if (ownLock) return { enabled: ownLock.enabled, source: "OWN_LOCK", lockedBy: ownTier }
  if (key in own.overrides) return { enabled: own.overrides[key]!, source: "OWN_OVERRIDE", lockedBy: null }
  return { enabled: defaultEnabled, source: "DEFAULT", lockedBy: null }
}
