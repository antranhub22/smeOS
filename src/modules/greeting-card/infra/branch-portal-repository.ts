import { prisma } from "@/core/tenancy/infra/prisma"
import { scopedWhere, type TenantContext } from "@/core/tenancy"
import { ACTIVE_DISPATCH_STATUSES } from "./chain-dispatch-sweep-query"

/** Trần số đơn trả về cho trang cửa hàng — danh sách luôn có giới hạn */
export const PORTAL_MAX_ORDERS = 100

/**
 * Dữ liệu trang cửa hàng nhận gia công. Mọi truy vấn đi qua tổ chức của `ctx`; chi nhánh của tài khoản
 * đọc từ `memberships.chain_branch_code` (máy chủ), không bao giờ từ yêu cầu.
 */
export class BranchPortalRepository {
  constructor(private readonly db = prisma) {}

  /** Chi nhánh chuỗi gắn với tài khoản đang đăng nhập (null = chưa gắn) */
  async memberChainBranch(ctx: TenantContext): Promise<{ code: string; name: string } | null> {
    const membership = await this.db.memberships.findFirst({
      where: scopedWhere(ctx, { user_id: ctx.userId, status: "ACTIVE" as const }),
      select: { chain_branch_code: true },
    })
    const code = membership?.chain_branch_code
    if (!code) return null
    const branch = await this.db.chain_branches.findUnique({
      where: { organization_id_branch_code: { organization_id: ctx.organizationId, branch_code: code } },
      select: { branch_code: true, name: true, is_active: true },
    })
    return branch?.is_active ? { code: branch.branch_code, name: branch.name } : null
  }

  async listChainBranches(ctx: TenantContext): Promise<Array<{ code: string; name: string }>> {
    const rows = await this.db.chain_branches.findMany({
      where: scopedWhere(ctx, {}),
      select: { branch_code: true, name: true },
      orderBy: { name: "asc" },
    })
    return rows.map((r) => ({ code: r.branch_code, name: r.name }))
  }

  /** Gắn / gỡ chi nhánh cho một thành viên. Trả false nếu thành viên hoặc chi nhánh không thuộc tổ chức. */
  async setMemberChainBranch(ctx: TenantContext, membershipId: string, code: string | null): Promise<boolean> {
    if (code) {
      const exists = await this.db.chain_branches.count({ where: scopedWhere(ctx, { branch_code: code }) })
      if (exists === 0) return false
    }
    const updated = await this.db.memberships.updateMany({
      where: scopedWhere(ctx, { id: membershipId }),
      data: { chain_branch_code: code },
    })
    return updated.count > 0
  }

  /**
   * Phiên điều phối đang hoạt động mà chi nhánh được mời ở vòng hiện tại hoặc đang giữ đơn.
   * Lọc trong DB theo JSON (`invitedBranchIds` chứa mã / `claimedBranchId` = mã), mới cập nhật trước.
   */
  async listBranchDispatches(ctx: TenantContext, branchCode: string) {
    return this.db.order_coordinations.findMany({
      where: {
        organization_id: ctx.organizationId,
        AND: [
          {
            OR: ACTIVE_DISPATCH_STATUSES.map((status) => ({
              metadata: { path: ["subcontract_dispatch", "dispatchStatus"], equals: status },
            })),
          },
          {
            OR: [
              { metadata: { path: ["subcontract_dispatch", "invitedBranchIds"], array_contains: [branchCode] } },
              { metadata: { path: ["subcontract_dispatch", "claimedBranchId"], equals: branchCode } },
            ],
          },
        ],
        order: { status: { notIn: ["CANCELLED", "COMPLETED"] }, NOT: { delivery_status: "DELIVERED" } },
      },
      select: {
        metadata: true,
        updated_at: true,
        order: { select: { id: true, code: true, delivery_address: true, delivery_window: true, production_status: true } },
      },
      orderBy: { updated_at: "desc" },
      take: PORTAL_MAX_ORDERS,
    })
  }
}
