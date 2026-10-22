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
   * Tìm đơn hàng gia công theo orderCode công khai cho màn hình Thẻ Gia Công. Mã đơn chỉ duy
   * nhất trong một tổ chức — tổ chức lấy từ token link đã xác minh, không bao giờ từ client.
   */
  async findSubcontractByCode(orderCode: string, organizationId: string) {
    return this.db.orders.findFirst({
      where: { organization_id: organizationId, code: orderCode },
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
   * Tìm trong bảng `branches` trước, rồi đến `chain_branches` (chi nhánh chuỗi nhập qua Excel).
   */
  async findBranchInOrganization(branchId: string, orgId: string) {
    const dbBranch = await this.db.branches.findFirst({
      where: { id: branchId, organization_id: orgId },
      select: { id: true, name: true, is_active: true },
    })
    if (dbBranch) return dbBranch

    // Không có trong bảng branches → chi nhánh điều phối chuỗi (bảng chain_branches, nhập Excel)
    const chainBranch = await this.db.chain_branches.findUnique({
      where: { organization_id_branch_code: { organization_id: orgId, branch_code: branchId } },
      select: { branch_code: true, name: true, is_active: true },
    })
    if (chainBranch) return { id: chainBranch.branch_code, name: chainBranch.name, is_active: chainBranch.is_active }

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

  /** Đơn kèm dữ liệu cần để sàng lọc và phát lệnh điều phối chuỗi (route chain-dispatch). */
  async findOrderForChainDispatch(organizationId: string, orderId: string) {
    return this.db.orders.findFirst({
      where: { id: orderId, organization_id: organizationId },
      select: {
        id: true,
        organization_id: true,
        code: true,
        delivery_address: true,
        delivery_window: true,
        total_vnd: true,
        pricing_rule_ref: true,
        items: { select: { product_id: true, description: true, metadata: true } },
        greeting_sessions: { select: { product_snapshot: true }, take: 1 },
      },
    })
  }

  /** Ghi đè `orders.pricing_rule_ref` (người gọi tự trộn với bản cũ). */
  async updatePricingRef(organizationId: string, orderId: string, pricingRef: Record<string, unknown>): Promise<void> {
    await this.db.orders.updateMany({
      where: { id: orderId, organization_id: organizationId },
      data: { pricing_rule_ref: pricingRef as Prisma.InputJsonValue },
    })
  }
}
