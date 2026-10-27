/**
 * tool-entitlement.ts — Hợp đồng & Luật Quản trị Phân quyền Công cụ Đa tầng (SSOT)
 *
 * Kiến trúc Phân tầng (Cascading Entitlement):
 * - Tầng 1 (SaaS Mother): Quản lý danh mục mở khóa toàn hệ thống / gói cước.
 * - Tầng 2 (SaaS Ngành): Bật/tắt công cụ cho các cửa hàng thuộc mạng lưới ngành.
 * - Tầng 3 (ChainOS): Quản lý & phê duyệt danh mục công cụ cho các chi nhánh cơ sở.
 * - Tầng 4 (StoreOS): Chỉ được sử dụng các công cụ khi có sự phê duyệt từ cấp quản lý.
 *
 * Pure TypeScript (Domain Layer) — Không phụ thuộc Prisma/Database driver.
 */

export type ToolStatus = "ENABLED" | "DISABLED" | "LOCKED"

export interface ToolGrant {
  toolKey: string
  status: ToolStatus
  grantedByOrgId?: string | null
  updatedAt?: string
}

export interface CascadingEntitlementPolicy {
  /**
   * Tính toán danh sách công cụ được phép hiển thị & sử dụng cho một tổ chức
   * dựa trên danh mục gốc và các lớp phê duyệt từ cấp trên.
   */
  isToolGranted(
    toolKey: string,
    options: {
      isSuperAdmin?: boolean
      unlockedToolKeys?: readonly string[] | null
      hiddenToolKeys?: readonly string[] | null
    }
  ): boolean
}

/**
 * Kiểm tra xem một công cụ có được mở khóa và cho phép sử dụng hay không.
 *
 * Quy tắc:
 * 1. Super Admin / Platform Admin luôn có quyền truy cập toàn bộ công cụ.
 * 2. Nếu nằm trong danh sách `hiddenToolKeys` (bị cấp trên khóa hoặc ẩn) -> Bị chặn (false).
 * 3. Nếu cấp trên chỉ định danh sách `unlockedToolKeys` (Whitelisting):
 *    Chỉ những công cụ nằm trong danh sách này mới được phép hoạt động.
 * 4. Mặc định (khi chưa cấu hình Whitelist cụ thể): Công cụ được mở nếu không bị ẩn.
 */
export function isToolUnlocked(
  toolKey: string,
  options: {
    isSuperAdmin?: boolean
    unlockedToolKeys?: readonly string[] | null
    hiddenToolKeys?: readonly string[] | null
  } = {}
): boolean {
  if (options.isSuperAdmin) return true

  // 1. Kiểm tra danh sách bị khóa/ẩn từ cấp trên
  if (options.hiddenToolKeys && options.hiddenToolKeys.includes(toolKey)) {
    return false
  }

  // 2. Kiểm tra danh sách được duyệt cụ thể (nếu có Whitelist cấp quyền)
  if (options.unlockedToolKeys && options.unlockedToolKeys.length > 0) {
    return options.unlockedToolKeys.includes(toolKey)
  }

  return true
}

/**
 * Lọc danh sách NavEntry theo quyền mở khóa công cụ của tổ chức
 */
export function filterAccessibleEntries<T extends { navKey: string }>(
  entries: readonly T[],
  options: {
    isSuperAdmin?: boolean
    unlockedToolKeys?: readonly string[] | null
    hiddenToolKeys?: readonly string[] | null
  }
): T[] {
  return entries.filter((entry) => isToolUnlocked(entry.navKey, options))
}
