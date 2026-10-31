/**
 * Đơn ngoài Thẻ chào đang trong Điều phối (P4 — tab Điều phối của mục Đơn hàng). Chỉ đọc, lọc theo tổ chức.
 * Đơn Thẻ chào có bảng Điều phối riêng được nhúng nguyên vẹn — không lặp lại ở đây.
 */

import { prisma } from "@/core/tenancy/infra/prisma"
import { scopedWhere, type TenantContext } from "@/core/tenancy/tenant-context"

export const COORDINATION_QUEUE_MAX = 100

export class CoordinationQueueRepository {
  async list(ctx: TenantContext) {
    return prisma.order_coordinations.findMany({
      where: scopedWhere(ctx, {
        stage: { notIn: ["COMPLETED" as const, "CANCELLED" as const] },
        order: { NOT: { source: "BROCHURE" } },
      }),
      orderBy: [{ next_action_due: "asc" }, { created_at: "asc" }],
      take: COORDINATION_QUEUE_MAX,
      select: {
        stage: true, risk_level: true, next_action: true, next_action_due: true,
        order: { select: { id: true, code: true, source: true, balance_vnd: true, delivery_window: true, delivery_address: true } },
      },
    })
  }
}
