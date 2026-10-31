/**
 * Yêu cầu duyệt theo đơn (`order_approval_requests`) + chuyển đơn sang Điều phối — Đơn hàng đa nguồn P3.
 * Mọi truy vấn lọc theo tổ chức của `ctx`; đơn Thẻ chào (`BROCHURE`) không bao giờ được đọc ở đây (B1).
 */

import { prisma } from "@/core/tenancy/infra/prisma"
import { scopedWhere, type TenantContext } from "@/core/tenancy/tenant-context"
import type { Prisma } from "@/generated/prisma/client"
import { formatCurrency } from "@/lib/i18n/formatters"

const ORDER_SELECT = {
  id: true, code: true, source: true, status: true, total_vnd: true, paid_vnd: true,
  customer_id: true, delivery_window: true, owner_sale_id: true,
} as const

export type ApprovalOrderRow = Prisma.ordersGetPayload<{ select: typeof ORDER_SELECT }>

const OPEN_STATUSES = ["PENDING", "APPROVED", "AUTO_APPROVED"]
const APPROVED_STATUSES = ["APPROVED", "AUTO_APPROVED"]

export interface NewApprovalRequest {
  orderId: string
  kind: string
  status: "PENDING" | "AUTO_APPROVED"
  basis: string | null
  reason: string
  collectDueAt: Date | null
}

/** Đưa đơn vào Điều phối (bước tiếp nhận) trong cùng giao dịch, ghi sự kiện. Gọi lặp an toàn. */
async function sendToCoordination(tx: Prisma.TransactionClient, ctx: TenantContext, order: { id: string; source: string | null; status: string }, reason: string) {
  await tx.order_coordinations.upsert({
    where: { order_id: order.id },
    create: { organization_id: ctx.organizationId, order_id: order.id, stage: "INTAKE", source: order.source },
    update: {},
  })
  await tx.orders.update({ where: { id: order.id }, data: { workflow: "STANDARD" } })
  await tx.order_events.create({
    data: { organization_id: ctx.organizationId, order_id: order.id, axis: "order", from_value: order.status, to_value: order.status, actor_id: ctx.userId, reason },
  })
}

export class ApprovalRequestRepository {
  async findOrder(ctx: TenantContext, orderId: string): Promise<ApprovalOrderRow | null> {
    return prisma.orders.findFirst({ where: scopedWhere(ctx, { id: orderId, NOT: { source: "BROCHURE" } }), select: ORDER_SELECT })
  }

  async orgSettings(ctx: TenantContext): Promise<unknown> {
    return (await prisma.organizations.findUnique({ where: { id: ctx.organizationId }, select: { settings: true } }))?.settings ?? null
  }

  async customerStats(ctx: TenantContext, customerId: string | null, now: Date) {
    if (!customerId) return { completedOrders: 0, hasOverdueDebt: false }
    const [completedOrders, overdue] = await Promise.all([
      prisma.orders.count({ where: scopedWhere(ctx, { customer_id: customerId, status: "COMPLETED" as const }) }),
      prisma.order_approval_requests.count({
        where: scopedWhere(ctx, {
          status: { in: APPROVED_STATUSES },
          collect_due_at: { lt: now },
          order: { customer_id: customerId, balance_vnd: { gt: 0 }, status: { not: "CANCELLED" as const } },
        }),
      }),
    ])
    return { completedOrders, hasOverdueDebt: overdue > 0 }
  }

  async hasOpenRequest(ctx: TenantContext, orderId: string, kind: string): Promise<boolean> {
    return (await prisma.order_approval_requests.count({ where: scopedWhere(ctx, { order_id: orderId, kind, status: { in: OPEN_STATUSES } }) })) > 0
  }

  /** Tạo yêu cầu; tự duyệt thì đưa đơn sang Điều phối cùng giao dịch. */
  async create(ctx: TenantContext, order: ApprovalOrderRow, req: NewApprovalRequest, coordinationReason: string) {
    return prisma.$transaction(async (tx) => {
      const row = await tx.order_approval_requests.create({
        data: {
          organization_id: ctx.organizationId, order_id: req.orderId, kind: req.kind, status: req.status, basis: req.basis,
          reason: req.reason, requested_by: ctx.userId, collect_due_at: req.collectDueAt,
          ...(req.status === "AUTO_APPROVED" ? { decided_by: ctx.userId, decided_at: new Date() } : {}),
        },
      })
      if (req.status === "AUTO_APPROVED") await sendToCoordination(tx, ctx, order, coordinationReason)
      return row
    })
  }

  async findRequest(ctx: TenantContext, id: string) {
    return prisma.order_approval_requests.findFirst({
      where: scopedWhere(ctx, { id }),
      include: { order: { select: { id: true, source: true, status: true } } },
    })
  }

  /** Quyết định một yêu cầu đang chờ. Trả `false` nếu yêu cầu không còn ở trạng thái chờ (đã có người quyết). */
  async decide(
    ctx: TenantContext,
    id: string,
    order: { id: string; source: string | null; status: string },
    decision: { approve: boolean; note: string | null; collectDueAt: Date | null },
    coordinationReason: string,
  ): Promise<boolean> {
    return prisma.$transaction(async (tx) => {
      const updated = await tx.order_approval_requests.updateMany({
        where: scopedWhere(ctx, { id, status: "PENDING" }),
        data: {
          status: decision.approve ? "APPROVED" : "REJECTED",
          basis: decision.approve ? "ADMIN" : null,
          decided_by: ctx.userId,
          decided_at: new Date(),
          decision_note: decision.note,
          ...(decision.approve && decision.collectDueAt ? { collect_due_at: decision.collectDueAt } : {}),
        },
      })
      if (updated.count === 0) return false
      if (decision.approve) await sendToCoordination(tx, ctx, order, coordinationReason)
      return true
    })
  }

  async list(ctx: TenantContext, opts: { status?: string | undefined; limit: number }) {
    return prisma.order_approval_requests.findMany({
      where: scopedWhere(ctx, opts.status ? { status: opts.status } : {}),
      orderBy: { created_at: "desc" },
      take: opts.limit,
      include: { order: { select: { id: true, code: true, source: true, total_vnd: true, paid_vnd: true, balance_vnd: true } } },
    })
  }

  /** Báo giá: chỉ đơn ngoài Thẻ chào, đang nháp, chưa thu đồng nào. Trả `false` nếu đơn không còn thoả. */
  async quote(ctx: TenantContext, orderId: string, totalVnd: number, note: string | null): Promise<boolean> {
    return prisma.$transaction(async (tx) => {
      const updated = await tx.orders.updateMany({
        where: scopedWhere(ctx, { id: orderId, status: "DRAFT" as const, paid_vnd: 0, NOT: { source: "BROCHURE" } }),
        data: { total_vnd: totalVnd, balance_vnd: totalVnd },
      })
      if (updated.count === 0) return false
      await tx.order_events.create({
        data: {
          organization_id: ctx.organizationId, order_id: orderId, axis: "order", from_value: "DRAFT", to_value: "DRAFT", actor_id: ctx.userId,
          reason: `Báo giá ${formatCurrency(totalVnd)}${note ? ` — ${note}` : ""}`,
        },
      })
      return true
    })
  }
}
