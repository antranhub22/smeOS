import { prisma } from "@/core/tenancy/infra/prisma"
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

    const orderMap = new Map<string, { code: string; customerName: string; customerPhone: string }>()
    if (orderIds.length > 0) {
      const orders = await this.db.orders.findMany({
        where: { organization_id: organizationId, id: { in: orderIds } },
        select: { id: true, code: true, customer: { select: { name: true, phone: true } } },
      })
      for (const o of orders) {
        orderMap.set(o.id, {
          code: o.code,
          customerName: o.customer?.name ?? "",
          customerPhone: o.customer?.phone ?? "",
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
        checkInDate: r.check_in_date,
        checkOutDate: r.check_out_date,
        note: r.note,
        status: r.status as "ACTIVE" | "CANCELLED",
        createdAt: r.created_at.toISOString(),
      }
    })
  }

  /** Thêm block thủ công hoặc từ đơn hàng */
  async createBooking(input: CreateBlockInput): Promise<string> {
    if (this.db.product_bookings) {
      const row = await this.db.product_bookings.create({
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
    }

    const id = crypto.randomUUID()
    await this.db.$executeRaw`
      INSERT INTO product_bookings (id, organization_id, product_id, order_id, check_in_date, check_out_date, note, status, created_at, updated_at)
      VALUES (${id}, ${input.organizationId}, ${input.productId}, ${input.orderId ?? null}, ${input.checkInDate}, ${input.checkOutDate}, ${input.note ?? null}, 'ACTIVE', NOW(), NOW())
    `
    return id
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
}
