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

export class SubcontractOrderRepository implements ISubcontractStateStore {
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
          ...(state.claimedBranchId ? { partner_id: state.claimedBranchId } : {}),
        },
      })
    } else {
      await this.db.order_coordinations.create({
        data: {
          id: `coord_${state.orderId}`,
          organization_id: ctx.organizationId,
          order_id: state.orderId,
          metadata: newMeta as unknown as Prisma.InputJsonValue,
          partner_id: state.claimedBranchId ?? null,
        },
      })
    }

    // Nếu đơn có branch nhận và chuyển CLAIMED_GRACE hoặc COMMITTED, cập nhật orders.branch_id
    if (state.claimedBranchId && (state.dispatchStatus === "CLAIMED_GRACE" || state.dispatchStatus === "COMMITTED")) {
      await this.db.orders.updateMany({
        where: scopedWhere(ctx, { id: state.orderId }),
        data: { branch_id: state.claimedBranchId },
      })
    } else if (state.dispatchStatus === "OPEN") {
      // Khi chi nhánh hủy trong Grace Period, đơn quay lại OPEN -> xóa branch_id
      await this.db.orders.updateMany({
        where: scopedWhere(ctx, { id: state.orderId }),
        data: { branch_id: null },
      })
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
      },
    })
  }

  /**
   * Tra cứu chi nhánh trong phạm vi tổ chức cho màn hình Thẻ Gia Công công khai.
   */
  async findBranchInOrganization(branchId: string, orgId: string) {
    return this.db.branches.findFirst({
      where: { id: branchId, organization_id: orgId },
      select: { id: true, name: true, is_active: true },
    })
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
}
