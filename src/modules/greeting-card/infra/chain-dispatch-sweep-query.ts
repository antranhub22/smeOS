import { prisma } from "@/core/tenancy/infra/prisma"

type Db = typeof prisma

export const ACTIVE_DISPATCH_STATUSES = ["OPEN", "CLAIMED_GRACE", "COMMITTED"] as const

/**
 * Truy vấn XUYÊN tổ chức cho cron `POST /internal/chain-dispatch-sweep` (gác bằng CRON_SECRET,
 * không có phiên tenant). Chỉ đọc; mọi lần ghi sau đó đi qua repository có phạm vi tenant.
 */
export class ChainDispatchSweepQuery {
  constructor(private readonly db: Db = prisma) {}

  /**
   * Một trang phiên điều phối gia công CẦN xử lý, lọc ngay trong DB (không quét toàn bảng ở tầng ứng dụng):
   * trạng thái điều phối OPEN / CLAIMED_GRACE / COMMITTED, đơn chưa huỷ, chưa hoàn tất, chưa giao xong.
   * Phân trang keyset theo `id` — mỗi lượt quét đi qua hết tập cần xử lý, không bỏ sót đơn nằm sau trang đầu.
   */
  async listActiveDispatchPage(limit: number, afterId: string | null) {
    return this.db.order_coordinations.findMany({
      where: {
        ...(afterId ? { id: { gt: afterId } } : {}),
        OR: ACTIVE_DISPATCH_STATUSES.map((status) => ({
          metadata: { path: ["subcontract_dispatch", "dispatchStatus"], equals: status },
        })),
        order: {
          status: { notIn: ["CANCELLED", "COMPLETED"] },
          NOT: { delivery_status: "DELIVERED" },
        },
      },
      select: { id: true, organization_id: true, order_id: true, metadata: true },
      orderBy: { id: "asc" },
      take: limit,
    })
  }

  /**
   * Chạy `fn` khi giữ được khoá tư vấn Postgres của bộ quét; lượt cron chồng lên lượt đang chạy → trả null
   * ngay (không gửi trùng tin nhắc). Khoá gắn với giao dịch nên tự nhả khi xong hoặc khi tiến trình chết.
   */
  async withSweepLock<T>(timeoutMs: number, fn: () => Promise<T>): Promise<T | null> {
    return this.db.$transaction(
      async (tx) => {
        const rows = await tx.$queryRaw<Array<{ locked: boolean }>>`
          SELECT pg_try_advisory_xact_lock(hashtext('chain_dispatch_sweep')) AS locked`
        if (!rows[0]?.locked) return null
        return fn()
      },
      { maxWait: 5_000, timeout: timeoutMs }
    )
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
