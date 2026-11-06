/**
 * Địa chỉ phạm vi chuẩn dùng chung (ADR-012 D-T5): `platform · industry:<key> · org:<organization_id> · branch:<branch_id>`.
 *
 * T-6b: cột `scope_id` của `notification_hard_locks` và `integration_governance` lưu theo dạng này (migration
 * `*_scope_keys_d_t5`), để T-7 gộp các nơi lưu quyết định theo tầng vào một bảng. Domain và API hiện vẫn dùng dạng
 * cũ ("GLOBAL", id tổ chức thô, "industry:<key>"); repository đổi qua lại bằng hai hàm dưới đây. Đọc chấp nhận cả hai
 * dạng (dòng do bản cũ ghi trong lúc deploy).
 *
 * Luật thuần — không import Prisma.
 */
export const PLATFORM_SCOPE_KEY = "platform"
const LEGACY_PLATFORM = "GLOBAL"
const PREFIXES = ["industry:", "org:", "branch:"] as const

/** Dạng cũ (domain/API) → dạng lưu D-T5. */
export function toScopeKey(scopeId: string): string {
  if (scopeId === LEGACY_PLATFORM || scopeId === PLATFORM_SCOPE_KEY) return PLATFORM_SCOPE_KEY
  if (PREFIXES.some((p) => scopeId.startsWith(p))) return scopeId
  return `org:${scopeId}`
}

/** Dạng lưu D-T5 (hoặc dòng cũ chưa đổi) → dạng cũ domain/API đang dùng. */
export function fromScopeKey(stored: string): string {
  if (stored === PLATFORM_SCOPE_KEY || stored === LEGACY_PLATFORM) return LEGACY_PLATFORM
  if (stored.startsWith("org:")) return stored.slice("org:".length)
  return stored
}

/** Mọi giá trị `scope_id` có thể đang lưu cho một phạm vi (dạng mới trước) — dùng trong điều kiện đọc. */
export function storedScopeIds(scopeId: string): string[] {
  const key = toScopeKey(scopeId)
  const legacy = fromScopeKey(key)
  return key === legacy ? [key] : [key, legacy]
}
