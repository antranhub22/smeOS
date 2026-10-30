/**
 * CASCADING POLICY — Luật resolve Bottom-up Override + Hard Lock đa tầng
 *
 * Đây là trái tim của hệ thống notification. Khi cần quyết định
 * "có gửi notification hay không", module này resolve theo thứ tự:
 *
 *   GATE 1: Channel được Mother kích hoạt chưa?
 *   GATE 2: Hard Lock (Mother → Industry → Chain → Store)?
 *   BOTTOM-UP: User > Store > Org/Chain > Mother Default
 *
 * Pure TypeScript — không import Prisma, không import module khác.
 */
import type { NotifyChannel, NotifyPriority, NotificationTier } from "./events/_contract"

// ── Domain Types ────────────────────────────────────────────────────────────

export interface ChannelActivationMap {
  [channel: string]: boolean
}

export interface HardLockEntry {
  eventKey: string
  channel: NotifyChannel
  tier: NotificationTier
  /** "GLOBAL" nếu tier = MOTHER, organization_id nếu tier khác */
  scopeId: string
  enabled: boolean
  reason?: string | undefined
}

export interface NotificationSetting {
  enabled: boolean
  priority?: NotifyPriority | undefined
}

export interface PreferenceRecord {
  eventKey: string
  channel: NotifyChannel
  enabled: boolean
  priority?: NotifyPriority | undefined
}

export interface ResolveCascadeInput {
  eventKey: string
  channel: NotifyChannel
  userId: string
  roleKey: string
  storeOrgId: string
  parentOrgId?: string | undefined // Chain hoặc Industry org id (nếu có)
  /** Kết quả từ DB — truyền vào để tách biệt I/O khỏi domain logic */
  channelActivations: ChannelActivationMap
  hardLocks: HardLockEntry[]
  userPreference?: PreferenceRecord | null | undefined
  storeDefault?: PreferenceRecord | null | undefined
  orgPolicy?: PreferenceRecord | null | undefined
  motherDefault?: PreferenceRecord | null | undefined
}

export interface ResolveResult {
  enabled: boolean
  priority: NotifyPriority
  /** Tầng nào quyết định kết quả cuối */
  decidedBy: "CHANNEL_NOT_ACTIVATED" | "HARD_LOCK_MOTHER" | "HARD_LOCK_INDUSTRY" | "HARD_LOCK_CHAIN" | "HARD_LOCK_STORE" | "USER" | "STORE" | "ORG" | "MOTHER_DEFAULT" | "SYSTEM_DEFAULT"
  hardLockReason?: string | undefined
}

// ── Hằng số ─────────────────────────────────────────────────────────────────

const ALWAYS_ACTIVATED_CHANNELS: NotifyChannel[] = ["APP_INBOX"]
const DEFAULT_PRIORITY: NotifyPriority = "NORMAL"

/** Tổ chức nhận thông báo + tổ chức cấp trên (Chuỗi/Ngành) nếu có. */
export interface LockScope {
  storeOrgId: string
  parentOrgId?: string | undefined
}

/**
 * Khoá cứng chỉ áp cho đúng phạm vi đã đặt (AUD-014): MOTHER áp toàn sàn ("GLOBAL"),
 * INDUSTRY/CHAIN áp cho tổ chức đặt khoá và các cửa hàng trực thuộc, STORE chỉ cho chính cửa hàng.
 * Trước đây khoá của MỘT tổ chức áp cho MỌI tenant.
 */
export function isLockInScope(lock: HardLockEntry, scope: LockScope): boolean {
  if (lock.tier === "MOTHER") return lock.scopeId === "GLOBAL"
  if (lock.tier === "STORE") return lock.scopeId === scope.storeOrgId
  return lock.scopeId === scope.storeOrgId || (scope.parentOrgId !== undefined && lock.scopeId === scope.parentOrgId)
}

// ── Core resolve function ────────────────────────────────────────────────────

/**
 * Resolve effective notification preference theo luật Bottom-up Override + Hard Lock.
 *
 * Hàm này là pure function — không có side effects, không gọi DB.
 * Caller chịu trách nhiệm load dữ liệu từ DB và truyền vào.
 */
export function resolveCascadingPreference(input: ResolveCascadeInput): ResolveResult {
  const {
    eventKey,
    channel,
    channelActivations,
    hardLocks,
    userPreference,
    storeDefault,
    orgPolicy,
    motherDefault,
  } = input

  // ── GATE 1: Channel có được Mother kích hoạt chưa? ─────────────────────
  const isAlwaysActivated = ALWAYS_ACTIVATED_CHANNELS.includes(channel)
  const isActivated = isAlwaysActivated || channelActivations[channel] === true

  if (!isActivated) {
    return {
      enabled: false,
      priority: DEFAULT_PRIORITY,
      decidedBy: "CHANNEL_NOT_ACTIVATED",
    }
  }

  // ── GATE 2: Hard Lock — kiểm tra từ cao xuống thấp ─────────────────────
  const tiers: NotificationTier[] = ["MOTHER", "INDUSTRY", "CHAIN", "STORE"]

  const scope = { storeOrgId: input.storeOrgId, parentOrgId: input.parentOrgId }
  for (const tier of tiers) {
    const lock = hardLocks.find(
      (l) => l.tier === tier && l.eventKey === eventKey && l.channel === channel && isLockInScope(l, scope)
    )
    if (lock) {
      return {
        enabled: lock.enabled,
        priority: DEFAULT_PRIORITY,
        decidedBy: `HARD_LOCK_${tier}` as ResolveResult["decidedBy"],
        hardLockReason: lock.reason,
      }
    }
  }

  // ── BOTTOM-UP RESOLUTION: Most specific setting wins ────────────────────
  if (userPreference != null) {
    return {
      enabled: userPreference.enabled,
      priority: userPreference.priority ?? DEFAULT_PRIORITY,
      decidedBy: "USER",
    }
  }

  if (storeDefault != null) {
    return {
      enabled: storeDefault.enabled,
      priority: storeDefault.priority ?? DEFAULT_PRIORITY,
      decidedBy: "STORE",
    }
  }

  if (orgPolicy != null) {
    return {
      enabled: orgPolicy.enabled,
      priority: orgPolicy.priority ?? DEFAULT_PRIORITY,
      decidedBy: "ORG",
    }
  }

  if (motherDefault != null) {
    return {
      enabled: motherDefault.enabled,
      priority: motherDefault.priority ?? DEFAULT_PRIORITY,
      decidedBy: "MOTHER_DEFAULT",
    }
  }

  // Không có setting nào → tắt theo mặc định an toàn
  return {
    enabled: false,
    priority: DEFAULT_PRIORITY,
    decidedBy: "SYSTEM_DEFAULT",
  }
}

/**
 * Kiểm tra Hard Lock có áp dụng không — dùng cho UI
 * để quyết định hiện toggle hay badge "🔒 Bị khóa".
 */
export function getAppliedHardLock(
  hardLocks: HardLockEntry[],
  eventKey: string,
  channel: NotifyChannel,
  viewerTier: NotificationTier,
  scope: LockScope
): HardLockEntry | null {
  // Tier thứ tự từ cao xuống thấp
  const tierOrder: NotificationTier[] = ["MOTHER", "INDUSTRY", "CHAIN", "STORE"]

  // Chỉ xét Hard Lock của tầng trên so với viewerTier
  const viewerIndex = tierOrder.indexOf(viewerTier)

  for (let i = 0; i < viewerIndex; i++) {
    const tier = tierOrder[i]
    const lock = hardLocks.find(
      (l) => l.tier === tier && l.eventKey === eventKey && l.channel === channel && isLockInScope(l, scope)
    )
    if (lock) return lock
  }

  return null
}

/**
 * Kiểm tra một tầng có quyền đặt Hard Lock cho event/channel không.
 * Tầng X chỉ có thể hard lock nếu event đó thuộc scope hiển thị của tầng X.
 */
export function canTierSetHardLock(
  viewerTier: NotificationTier,
  _eventKey: string
): boolean {
  // Mọi tầng đều có thể hard lock events trong phạm vi của mình
  // Validation chi tiết hơn (event có visible với tier không) nằm ở use-case layer
  return viewerTier !== undefined
}
