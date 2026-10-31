/**
 * Hạ tầng cho đặt hàng công khai từ catalog/landing (P3 — §3.2). Không có phiên: tổ chức luôn do use-case suy
 * từ catalog, mọi truy vấn ở đây lọc theo `organizationId` đó.
 */

import { prisma } from "@/core/tenancy/infra/prisma"

export class PublicOrderRepository {
  async orgSettings(organizationId: string): Promise<unknown> {
    return (await prisma.organizations.findUnique({ where: { id: organizationId }, select: { settings: true } }))?.settings ?? null
  }

  /** Đơn công khai (catalog/landing) của cùng SĐT trong khoảng gần đây — chặn gửi dồn. */
  async countRecentByPhone(organizationId: string, phone: string, since: Date): Promise<number> {
    return prisma.orders.count({
      where: { organization_id: organizationId, source: { in: ["CATALOG", "LANDING"] }, created_at: { gte: since }, customer: { phone } },
    })
  }

  /** Lead đang mở của cùng SĐT — đơn gắn vào lead đó (§3.1: "khách bấm Đặt hàng → gắn vào lead đang mở"). */
  async openLeadId(organizationId: string, phone: string): Promise<string | null> {
    const lead = await prisma.leads.findFirst({
      where: { organization_id: organizationId, phone, status: { in: ["NEW", "IN_PROGRESS"] }, converted_order_id: null },
      orderBy: { created_at: "desc" },
      select: { id: true },
    })
    return lead?.id ?? null
  }
}
