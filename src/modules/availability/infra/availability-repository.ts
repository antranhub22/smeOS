import { prisma } from "@/core/tenancy/infra/prisma"
import type { Prisma } from "@/generated/prisma/client"
import type { ProductBookingRecord } from "../domain/availability-mode"

type Db = typeof prisma

export interface CreateBlockInput {
  organizationId: string
  productId: string
  orderId?: string | null | undefined
  checkInDate: string
  checkOutDate: string
  note?: string | null | undefined
}

export class AvailabilityRepository {
  constructor(private readonly db: Db = prisma) {}

  /** Lấy danh sách booking trong khoảng ngày của một hoặc tất cả sản phẩm */
  async listBookings(
    organizationId: string,
    fromDate: string,
    toDate: string,
    productId?: string | undefined,
  ): Promise<ProductBookingRecord[]> {
    let rows: Array<{
      id: string
      product_id: string
      order_id: string | null
      check_in_date: string
      check_out_date: string
      note: string | null
      status: string
      created_at: Date
      product: { name: string }
    }> = []

    if (this.db.product_bookings) {
      rows = await this.db.product_bookings.findMany({
        where: {
          organization_id: organizationId,
          status: "ACTIVE",
          ...(productId ? { product_id: productId } : {}),
          check_in_date: { lt: toDate },
          check_out_date: { gt: fromDate },
        },
        include: {
          product: { select: { name: true } },
        },
        orderBy: { check_in_date: "asc" },
      })
    } else {
      const raw = await this.db.$queryRaw<Array<{
        id: string
        product_id: string
        order_id: string | null
        check_in_date: string
        check_out_date: string
        note: string | null
        status: string
        created_at: Date
        product_name: string
      }>>`
        SELECT pb.id, pb.product_id, pb.order_id, pb.check_in_date, pb.check_out_date,
               pb.note, pb.status, pb.created_at, p.name as product_name
        FROM product_bookings pb
        JOIN products p ON p.id = pb.product_id
        WHERE pb.organization_id = ${organizationId}
          AND pb.status = 'ACTIVE'
          AND pb.check_in_date < ${toDate}
          AND pb.check_out_date > ${fromDate}
        ORDER BY pb.check_in_date ASC
      `
      rows = raw.map((r) => ({
        ...r,
        product: { name: r.product_name },
      }))
    }

    // Lấy thông tin đơn hàng nếu có order_id
    const orderIds = rows
      .map((r) => r.order_id)
      .filter((id): id is string => Boolean(id))

    const orderMap = new Map<
      string,
      {
        code: string
        customerName: string
        customerPhone: string
        orderStatus: string
        totalVnd: number
        paidVnd: number
        checkInTimeSlot: string | null
      }
    >()
    if (orderIds.length > 0) {
      const orders = await this.db.orders.findMany({
        where: { organization_id: organizationId, id: { in: orderIds } },
        select: {
          id: true,
          code: true,
          status: true,
          total_vnd: true,
          paid_vnd: true,
          delivery_window: true,
          customer: { select: { name: true, phone: true } },
        },
      })
      for (const o of orders) {
        const win = (o.delivery_window as Record<string, string> | null) || {}
        orderMap.set(o.id, {
          code: o.code,
          customerName: o.customer?.name ?? "",
          customerPhone: o.customer?.phone ?? "",
          orderStatus: o.status,
          totalVnd: Number(o.total_vnd),
          paidVnd: Number(o.paid_vnd),
          checkInTimeSlot: win.timeSlot || null,
        })
      }
    }

    return rows.map((r) => {
      const ord = r.order_id ? orderMap.get(r.order_id) : undefined
      return {
        id: r.id,
        productId: r.product_id,
        productName: r.product.name,
        orderId: r.order_id,
        orderCode: ord?.code ?? null,
        customerName: ord?.customerName ?? null,
        customerPhone: ord?.customerPhone ?? null,
        orderStatus: ord?.orderStatus ?? null,
        totalVnd: ord?.totalVnd ?? null,
        paidVnd: ord?.paidVnd ?? null,
        checkInTimeSlot: ord?.checkInTimeSlot ?? null,
        checkInDate: r.check_in_date,
        checkOutDate: r.check_out_date,
        note: r.note,
        status: r.status as "ACTIVE" | "CANCELLED",
        createdAt: r.created_at.toISOString(),
      }
    })
  }

  /**
   * Thêm block thủ công hoặc từ đơn hàng — `null` nếu khoảng ngày chồng lên một đặt chỗ ACTIVE
   * khác của cùng sản phẩm. Khoá tư vấn theo sản phẩm (pg_advisory_xact_lock) tuần tự hoá mọi lần
   * ghi của một phòng giữa các instance, nên hai khách thanh toán cùng lúc không cùng giữ được
   * một phòng (rà soát 21/10/2026, H8). Chưa đặt ràng buộc EXCLUDE ở CSDL: Prisma không khai được
   * nên ràng buộc chỉ sống trong SQL migration viết tay và dễ trôi giữa các môi trường.
   */
  async createBooking(input: CreateBlockInput): Promise<string | null> {
    return this.db.$transaction(async (tx) => {
      await tx.$executeRaw`SELECT pg_advisory_xact_lock(hashtextextended(${input.productId}::text, 0))`
      const clash = await tx.product_bookings.findFirst({
        where: {
          organization_id: input.organizationId,
          product_id: input.productId,
          status: "ACTIVE",
          check_in_date: { lt: input.checkOutDate },
          check_out_date: { gt: input.checkInDate },
        },
        select: { id: true },
      })
      if (clash) return null
      const row = await tx.product_bookings.create({
        data: {
          organization_id: input.organizationId,
          product_id: input.productId,
          order_id: input.orderId ?? null,
          check_in_date: input.checkInDate,
          check_out_date: input.checkOutDate,
          note: input.note ?? null,
          status: "ACTIVE",
        },
        select: { id: true },
      })
      return row.id
    })
  }

  /** Khoảng ngày có chồng lên đặt chỗ ACTIVE nào của sản phẩm không (kiểm trước khi tạo đơn). */
  async hasActiveOverlap(organizationId: string, productId: string, checkInDate: string, checkOutDate: string): Promise<boolean> {
    const clash = await this.db.product_bookings.findFirst({
      where: {
        organization_id: organizationId,
        product_id: productId,
        status: "ACTIVE",
        check_in_date: { lt: checkOutDate },
        check_out_date: { gt: checkInDate },
      },
      select: { id: true },
    })
    return clash !== null
  }

  /** Sản phẩm có thuộc tổ chức không — `productId` đến từ body, không được tin. */
  async productBelongsToOrganization(organizationId: string, productId: string): Promise<boolean> {
    const row = await this.db.products.findFirst({
      where: { id: productId, organization_id: organizationId },
      select: { id: true },
    })
    return row !== null
  }

  /** Xóa manual block của admin (chỉ block có order_id = null) */
  async deleteManualBlock(organizationId: string, blockId: string): Promise<boolean> {
    if (this.db.product_bookings) {
      const res = await this.db.product_bookings.updateMany({
        where: {
          organization_id: organizationId,
          id: blockId,
          order_id: null,
        },
        data: { status: "CANCELLED" },
      })
      return res.count > 0
    }

    const count = await this.db.$executeRaw`
      UPDATE product_bookings
      SET status = 'CANCELLED', updated_at = NOW()
      WHERE organization_id = ${organizationId} AND id = ${blockId} AND order_id IS NULL
    `
    return count > 0
  }

  /** Tìm booking theo orderId */
  async findBookingByOrderId(organizationId: string, orderId: string): Promise<{ id: string; status: string } | null> {
    if (this.db.product_bookings) {
      const row = await this.db.product_bookings.findFirst({
        where: { organization_id: organizationId, order_id: orderId },
        select: { id: true, status: true },
      })
      return row ?? null
    }

    const rows = await this.db.$queryRaw<Array<{ id: string; status: string }>>`
      SELECT id, status FROM product_bookings
      WHERE organization_id = ${organizationId} AND order_id = ${orderId}
      LIMIT 1
    `
    return rows[0] ?? null
  }

  /** Hủy booking tự động khi đơn hàng bị hủy */
  async cancelByOrderId(organizationId: string, orderId: string): Promise<void> {
    if (this.db.product_bookings) {
      await this.db.product_bookings.updateMany({
        where: { organization_id: organizationId, order_id: orderId },
        data: { status: "CANCELLED" },
      })
      return
    }

    await this.db.$executeRaw`
      UPDATE product_bookings
      SET status = 'CANCELLED', updated_at = NOW()
      WHERE organization_id = ${organizationId} AND order_id = ${orderId}
    `
  }

  /** Lấy danh sách sản phẩm cùng cấu hình khả dụng của tổ chức */
  async listProductsWithAvailability(organizationId: string): Promise<Array<{
    id: string
    code: string
    name: string
    category: string | null
    status: string
    availabilityConfig: unknown
    inventoryStatus?: string | undefined
    quantityAvailable?: number | null | undefined
  }>> {
    try {
      const products = await this.db.products.findMany({
        where: { organization_id: organizationId, status: { not: "ARCHIVED" } },
        select: {
          id: true,
          code: true,
          name: true,
          category: true,
          status: true,
          availability_config: true,
          inventory: { select: { status: true, quantity_available: true }, take: 1 },
        },
        orderBy: { name: "asc" },
      })

      return products.map((p) => ({
        id: p.id,
        code: p.code,
        name: p.name,
        category: p.category,
        status: p.status,
        availabilityConfig: (p as { availability_config?: unknown }).availability_config,
        inventoryStatus: p.inventory[0]?.status,
        quantityAvailable: p.inventory[0]?.quantity_available,
      }))
    } catch {
      // Fallback khi Next.js Turbopack dev server chưa restart để nhận availability_config
      const rawProducts = await this.db.$queryRaw<Array<{
        id: string
        code: string
        name: string
        category: string | null
        status: string
        availability_config: unknown
        inventory_status: string | null
        quantity_available: number | null
      }>>`
        SELECT p.id, p.code, p.name, p.category, p.status, p.availability_config,
               inv.status as inventory_status, inv.quantity_available
        FROM products p
        LEFT JOIN LATERAL (
          SELECT status, quantity_available FROM product_inventory
          WHERE product_id = p.id AND organization_id = ${organizationId}
          LIMIT 1
        ) inv ON true
        WHERE p.organization_id = ${organizationId} AND p.status != 'ARCHIVED'
        ORDER BY p.name ASC
      `

      return rawProducts.map((p) => ({
        id: p.id,
        code: p.code,
        name: p.name,
        category: p.category,
        status: p.status,
        availabilityConfig: p.availability_config,
        inventoryStatus: p.inventory_status ?? undefined,
        quantityAvailable: p.quantity_available,
      }))
    }
  }

  /** Cập nhật delivery_window của đơn hàng (dùng khi tự phục hồi checkOutDate cho đơn Homestay) */
  async updateOrderDeliveryWindow(
    organizationId: string,
    orderId: string,
    deliveryWindow: Record<string, unknown>,
  ): Promise<void> {
    await this.db.orders.updateMany({
      where: { organization_id: organizationId, id: orderId },
      data: { delivery_window: deliveryWindow as Prisma.InputJsonValue },
    })
  }
}

