import { prisma } from "@/core/tenancy/infra/prisma"

type Db = typeof prisma

/**
 * Truy vấn XUYÊN tổ chức cho cron `POST /internal/chain-dispatch-sweep` (gác bằng CRON_SECRET,
 * không có phiên tenant). Chỉ đọc; mọi lần ghi sau đó đi qua repository có phạm vi tenant.
 */
export class ChainDispatchSweepQuery {
  constructor(private readonly db: Db = prisma) {}

  /** Phiên điều phối có metadata (lọc trạng thái gia công ở tầng gọi). */
  async listCoordinationsWithMetadata(limit: number) {
    return this.db.order_coordinations.findMany({
      where: { metadata: { not: {} } },
      select: { id: true, organization_id: true, order_id: true, metadata: true },
      take: limit,
    })
  }

  async listOrganizationSettings(organizationIds: string[]) {
    return this.db.organizations.findMany({
      where: { id: { in: organizationIds } },
      select: { id: true, settings: true },
    })
  }

  async listOrdersForReminders(orderIds: string[]) {
    return this.db.orders.findMany({
      where: { id: { in: orderIds } },
      select: {
        id: true,
        code: true,
        delivery_address: true,
        delivery_window: true,
        delivery_status: true,
        production_status: true,
        items: { select: { description: true, metadata: true } },
      },
    })
  }
}
