import type { TenantContext } from "./tenant-context"

/**
 * Cách ly dữ liệu theo chi nhánh (checklist ALG 9.13): nhân viên được giao một chi nhánh
 * (`memberships.branch_id`, có trong `TenantContext.branchId`) chỉ thấy đơn hàng, doanh số, tồn kho
 * của chi nhánh đó; trưởng chi nhánh chỉ quản lý cơ sở của mình. Người có quyền quản lý mọi chi nhánh
 * (`F7` — trần cứng Điều hành) không bị giới hạn.
 */
export const ORG_WIDE_BRANCH_CAPABILITY = "F7"

/** Chi nhánh người thao tác bị giới hạn vào; `null` = thấy toàn tổ chức. */
export function branchScopeOf(ctx: Pick<TenantContext, "branchId" | "capabilities">): string | null {
  if (!ctx.branchId) return null
  return ctx.capabilities.has(ORG_WIDE_BRANCH_CAPABILITY) ? null : ctx.branchId
}

/** Điều kiện `branch_id` cho truy vấn bảng có cột chi nhánh (đơn hàng…); `{}` khi không giới hạn. */
export function branchScopedWhere(ctx: Pick<TenantContext, "branchId" | "capabilities">): { branch_id?: string } {
  const scope = branchScopeOf(ctx)
  return scope ? { branch_id: scope } : {}
}

/** Bản ghi có nằm trong phạm vi chi nhánh của người thao tác không (ngoài phạm vi → trả 404 như khác tổ chức). */
export function inBranchScope(ctx: Pick<TenantContext, "branchId" | "capabilities">, branchId: string | null | undefined): boolean {
  const scope = branchScopeOf(ctx)
  return scope === null || branchId === scope
}

/**
 * Lọc sản phẩm/tồn kho theo chi nhánh (checklist ALG 9.13): người bị giới hạn chỉ thấy sản phẩm dùng
 * chung (`branch_id` rỗng) và sản phẩm của chi nhánh mình. `requested` là bộ lọc chi nhánh người gọi
 * tự chọn — chọn chi nhánh khác thì không ra dòng nào.
 */
export function branchScopedProductWhere(
  ctx: Pick<TenantContext, "branchId" | "capabilities">,
  requested: string | null | undefined
): { branch_id?: string | null; OR?: Array<{ branch_id: string | null }> } {
  const base = requested !== undefined ? { branch_id: requested } : {}
  const scope = branchScopeOf(ctx)
  return scope ? { ...base, OR: [{ branch_id: null }, { branch_id: scope }] } : base
}
