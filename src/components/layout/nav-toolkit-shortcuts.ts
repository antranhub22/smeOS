/**
 * nav-toolkit-shortcuts.ts — Lưu trữ shortcuts Công cụ user tự pin (localStorage)
 *
 * Thiết kế:
 * - Tối đa MAX_SHORTCUTS công cụ pinned per organization.
 * - Lưu dưới dạng mảng navKey (string[]), gắn organization_id.
 * - Nếu user chưa pin gì → dùng DEFAULT_SHORTCUT_KEYS (5 công cụ hay dùng nhất).
 * - Tất cả operations đều safe với SSR (typeof window guard).
 */

export const MAX_SHORTCUTS = 5

/** Mặc định hiển thị nếu user chưa tự chọn (StoreOS) */
export const DEFAULT_SHORTCUT_KEYS: readonly string[] = [
  "creative-studio",   // Chế tác tự động A-Z
  "catalog",           // Tạo Catalog & Link bán hàng
  "content",           // Viết nội dung marketing
  "templates",         // Kho mẫu & Ấn phẩm
  "scan-photo",        // Phân tích ảnh bằng AI
]

function storageKey(orgId?: string | null): string {
  const suffix = orgId ? `__${orgId}` : ""
  return `smeos_toolkit_shortcuts_v1${suffix}`
}

/**
 * Tải danh sách navKey đã pin. Trả null nếu user chưa lần nào lưu
 * (dùng null để phân biệt "chưa pin" với "đã pin rỗng").
 */
export function loadShortcutKeys(orgId?: string | null): string[] | null {
  if (typeof window === "undefined") return null
  try {
    const raw = localStorage.getItem(storageKey(orgId))
    if (!raw) return null
    const parsed = JSON.parse(raw) as unknown
    if (Array.isArray(parsed)) return parsed as string[]
    return null
  } catch {
    return null
  }
}

/** Trả danh sách hiển thị (defaults nếu chưa pin) */
export function getEffectiveShortcutKeys(orgId?: string | null, availableDefaultKeys?: string[]): string[] {
  const loaded = loadShortcutKeys(orgId)
  if (loaded !== null) return loaded
  if (availableDefaultKeys && availableDefaultKeys.length > 0) {
    return availableDefaultKeys.slice(0, MAX_SHORTCUTS)
  }
  return [...DEFAULT_SHORTCUT_KEYS]
}

/** Kiểm tra user đã tự chỉnh shortcuts chưa */
export function hasCustomShortcuts(orgId?: string | null): boolean {
  return loadShortcutKeys(orgId) !== null
}

/** Lưu danh sách shortcuts mới (tối đa MAX_SHORTCUTS) */
export function saveShortcutKeys(orgId: string | null | undefined, keys: string[]): void {
  try {
    const limited = keys.slice(0, MAX_SHORTCUTS)
    localStorage.setItem(storageKey(orgId), JSON.stringify(limited))
  } catch {
    // localStorage bị khoá — bỏ qua
  }
}

/** Thêm một công cụ vào shortcuts (bỏ nếu đã có, không vượt MAX) */
export function pinShortcut(orgId: string | null | undefined, navKey: string): string[] {
  const current = getEffectiveShortcutKeys(orgId)
  if (current.includes(navKey)) return current
  const next = [...current, navKey].slice(0, MAX_SHORTCUTS)
  saveShortcutKeys(orgId, next)
  return next
}

/** Bỏ pin một công cụ khỏi shortcuts */
export function unpinShortcut(orgId: string | null | undefined, navKey: string): string[] {
  const current = getEffectiveShortcutKeys(orgId)
  const next = current.filter((k) => k !== navKey)
  saveShortcutKeys(orgId, next)
  return next
}

/** Đặt lại về defaults (xóa key trong localStorage) */
export function resetShortcuts(orgId?: string | null): void {
  try {
    localStorage.removeItem(storageKey(orgId))
  } catch {
    // bỏ qua
  }
}
