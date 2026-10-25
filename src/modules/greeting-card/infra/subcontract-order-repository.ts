/**
 * subcontract-order-repository.ts
 *
 * Repository lưu trữ và đồng bộ trạng thái Thẻ Gia Công (Subcontract Order).
 * Triển khai ISubcontractStateStore theo chuẩn Clean Architecture & Tenant Isolation.
 */

import { prisma } from "@/core/tenancy/infra/prisma"
import { scopedWhere, type TenantContext } from "@/core/tenancy"
import type { Prisma } from "@/generated/prisma/client"
import type { SubcontractOrderState } from "../domain/subcontract-order"
import type { ISubcontractStateStore } from "../use-cases/dispatch-subcontract-order"
import type { ISubcontractOrderRepository } from "../domain/repositories/subcontract-order-repository.interface"

export class SubcontractOrderRepository implements ISubcontractStateStore, ISubcontractOrderRepository {
  constructor(private readonly db = prisma) {}

  async loadSubcontractState(ctx: TenantContext, orderId: string): Promise<SubcontractOrderState | null> {
    const coordination = await this.db.order_coordinations.findFirst({
      where: scopedWhere(ctx, { order_id: orderId }),
      select: { metadata: true },
    })

    if (!coordination?.metadata || typeof coordination.metadata !== "object") return null
    const meta = coordination.metadata as Record<string, unknown>
    const sub = meta.subcontract_dispatch
    if (!sub || typeof sub !== "object") return null
    return sub as SubcontractOrderState
  }

  async saveSubcontractState(ctx: TenantContext, state: SubcontractOrderState): Promise<void> {
    const coordination = await this.db.order_coordinations.findFirst({
      where: scopedWhere(ctx, { order_id: state.orderId }),
    })

    const existingMeta = (coordination?.metadata as Record<string, unknown> | null) ?? {}
    const newMeta = {
      ...existingMeta,
      subcontract_dispatch: state,
    }

    if (coordination) {
      await this.db.order_coordinations.update({
        where: { id: coordination.id },
        data: {
          metadata: newMeta as unknown as Prisma.InputJsonValue,
        },
      })
    } else {
      await this.db.order_coordinations.create({
        data: {
          id: `coord_${state.orderId}`,
          organization_id: ctx.organizationId,
          order_id: state.orderId,
          metadata: newMeta as unknown as Prisma.InputJsonValue,
        },
      })
    }

    // Nếu chi nhánh là branch thật trong CSDL bảng branches, cập nhật orders.branch_id
    const isRealDbBranch = state.claimedBranchId
      ? await this.db.branches.findFirst({
          where: { id: state.claimedBranchId, organization_id: ctx.organizationId },
          select: { id: true },
        })
      : null

    if (isRealDbBranch && (state.dispatchStatus === "CLAIMED_GRACE" || state.dispatchStatus === "COMMITTED")) {
      await this.db.orders.updateMany({
        where: scopedWhere(ctx, { id: state.orderId }),
        data: { branch_id: isRealDbBranch.id },
      })
    } else if (state.dispatchStatus === "OPEN") {
      await this.db.orders.updateMany({
        where: scopedWhere(ctx, { id: state.orderId }),
        data: { branch_id: null },
      })
    }

    // Cơ chế Tự Động Xác Nhận Đơn (Gate 2 Auto-Confirm):
    // Khi chi nhánh đã nhận & chốt làm (COMMITTED), nếu cấu hình autoConfirmOnBranchCommit = true (mặc định)
    // -> Tự động chuyển đơn sang CONFIRMED & ASSIGNED, Điều phối không cần bấm nút duyệt thủ công.
    if (state.dispatchStatus === "COMMITTED") {
      const org = await this.db.organizations.findUnique({
        where: { id: ctx.organizationId },
        select: { settings: true },
      })
      const settings = (org?.settings as Record<string, unknown> | null) ?? {}
      const rawPolicy = settings["chain_dispatch_policy"] as Record<string, unknown> | undefined
      const autoConfirm = rawPolicy?.auto_confirm_on_branch_commit !== false && rawPolicy?.autoConfirmOnBranchCommit !== false

      if (autoConfirm) {
        await this.db.orders.updateMany({
          where: scopedWhere(ctx, {
            id: state.orderId,
            NOT: { status: "CANCELLED" as const },
            production_status: "WAITING" as const,
          }),
          data: {
            status: "CONFIRMED" as const,
            production_status: "ASSIGNED" as const,
          },
        })
      }
    }
  }

  /**
   * Tìm đơn hàng gia công theo orderCode công khai cho màn hình Thẻ Gia Công.
   */
  async findSubcontractByCode(orderCode: string) {
    return this.db.orders.findFirst({
      where: { code: orderCode },
      include: {
        coordination: true,
        items: true,
        greeting_sessions: true,
        customer: true,
      },
    })
  }

  /**
   * Tìm đơn hàng gia công theo ID (dùng cho Coordinator-Stream APIs nội bộ, có scope tenant).
   */
  async findSubcontractById(orderId: string, organizationId: string) {
    return this.db.orders.findFirst({
      where: { id: orderId, organization_id: organizationId },
      include: {
        coordination: true,
        items: true,
        greeting_sessions: true,
        customer: true,
      },
    })
  }

  /**
   * Tra cứu chi nhánh trong phạm vi tổ chức cho màn hình Thẻ Gia Công công khai.
   * Hỗ trợ tìm trong cả bảng branches lẫn danh sách chain_branches được import qua Excel vào settings.
   */
  async findBranchInOrganization(branchId: string, orgId: string) {
    const dbBranch = await this.db.branches.findFirst({
      where: { id: branchId, organization_id: orgId },
      select: { id: true, name: true, is_active: true },
    })
    if (dbBranch) return dbBranch

    // Nếu không có trong bảng branches, tra cứu trong settings.chain_branches
    const org = await this.db.organizations.findUnique({
      where: { id: orgId },
      select: { settings: true },
    })
    const settings = (org?.settings as Record<string, unknown> | null) ?? {}
    const chainBranches = (settings.chain_branches as Array<{ branchId: string; branchName: string; isActive?: boolean }>) || []
    const match = chainBranches.find((b) => b.branchId === branchId)
    if (match) {
      return {
        id: match.branchId,
        name: match.branchName,
        is_active: match.isActive ?? true,
      }
    }

    return null
  }

  /**
   * Tra cứu settings tổ chức cho màn hình Thẻ Gia Công công khai.
   */
  async findOrganizationSettings(orgId: string) {
    return this.db.organizations.findUnique({
      where: { id: orgId },
      select: { id: true, settings: true },
    })
  }

  /**
   * Ghi nhận sự kiện chi nhánh HỦY nhận đơn và trừ điểm chất lượng KPI (Quality Score Penalty).
   * Mỗi lần hủy trong Grace Period trừ 2 điểm KPI và tăng biến đếm số lần hủy để thuật toán Matching Engine giảm ưu tiên đơn sau.
   */
  async recordBranchCancellationPenalty(
    orgId: string,
    branchId: string,
    reason: string = "Hủy nhận đơn trong thời hạn Grace Period (Kho thiếu hoa/nguyên liệu)"
  ): Promise<{ newQualityScore: number; cancellationCount: number }> {
    const org = await this.db.organizations.findUnique({
      where: { id: orgId },
      select: { settings: true },
    })
    const settings = (org?.settings as Record<string, unknown> | null) ?? {}
    const rawBranches = settings.chain_branches
    const chainBranches = Array.isArray(rawBranches) ? [...(rawBranches as Array<Record<string, unknown>>)] : []

    let newQualityScore = 90
    let cancellationCount = 1

    const updatedBranches = chainBranches.map((b) => {
      if (b.branchId === branchId) {
        const currentScore = typeof b.qualityScore === "number" ? b.qualityScore : 90
        const currentCancels = typeof b.cancellationCount === "number" ? b.cancellationCount : 0
        // Trừ 2 điểm chất lượng, tối thiểu 10 điểm
        newQualityScore = Math.max(10, currentScore - 2)
        cancellationCount = currentCancels + 1

        const history = Array.isArray(b.cancellationHistory) ? [...b.cancellationHistory] : []
        history.unshift({
          timestamp: new Date().toISOString(),
          reason,
          penalty: -2,
        })

        return {
          ...b,
          qualityScore: newQualityScore,
          cancellationCount,
          cancellationHistory: history.slice(0, 50), // Giữ tối đa 50 lần gần nhất
        }
      }
      return b
    })

    await this.db.organizations.update({
      where: { id: orgId },
      data: {
        settings: {
          ...settings,
          chain_branches: updatedBranches,
        } as unknown as Prisma.InputJsonValue,
      },
    })

    return { newQualityScore, cancellationCount }
  }

  /**
   * Trừ 2 điểm chất lượng KPI của chi nhánh khi xin bỏ qua bằng chứng (QC, Shipper, POD).
   * Điểm này trực tiếp làm giảm tỷ lệ trúng đơn gia công ở các vòng phân bổ sau.
   */
  async recordBranchBypassPenalty(
    orgId: string,
    branchId: string,
    reason: string
  ): Promise<{ newQualityScore: number; bypassCount: number }> {
    const org = await this.db.organizations.findUnique({
      where: { id: orgId },
      select: { settings: true },
    })
    const settings = (org?.settings as Record<string, unknown> | null) ?? {}
    const rawBranches = settings.chain_branches
    const chainBranches = Array.isArray(rawBranches) ? [...(rawBranches as Array<Record<string, unknown>>)] : []

    let newQualityScore = 90
    let bypassCount = 1

    const updatedBranches = chainBranches.map((b) => {
      if (b.branchId === branchId) {
        const currentScore = typeof b.qualityScore === "number" ? b.qualityScore : 90
        const currentBypasses = typeof b.bypassCount === "number" ? b.bypassCount : 0
        newQualityScore = Math.max(10, currentScore - 2)
        bypassCount = currentBypasses + 1

        const history = Array.isArray(b.bypassHistory) ? [...b.bypassHistory] : []
        history.unshift({
          timestamp: new Date().toISOString(),
          reason,
          penalty: -2,
        })

        return {
          ...b,
          qualityScore: newQualityScore,
          bypassCount,
          bypassHistory: history.slice(0, 50),
        }
      }
      return b
    })

    await this.db.organizations.update({
      where: { id: orgId },
      data: {
        settings: {
          ...settings,
          chain_branches: updatedBranches,
        } as unknown as Prisma.InputJsonValue,
      },
    })

    return { newQualityScore, bypassCount }
  }
}

let defaultSubcontractOrderRepository: ISubcontractOrderRepository | null = null

export function getSubcontractOrderRepository(): ISubcontractOrderRepository {
  if (!defaultSubcontractOrderRepository) {
    defaultSubcontractOrderRepository = new SubcontractOrderRepository()
  }
  return defaultSubcontractOrderRepository!
}
