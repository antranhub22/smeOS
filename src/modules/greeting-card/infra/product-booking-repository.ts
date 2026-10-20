import { prisma } from "@/core/tenancy/infra/prisma"
import type { BookingSpan } from "../domain/product-availability-config"

type Db = typeof prisma

export class ProductBookingRepository {
  constructor(private readonly db: Db = prisma) {}

  /** Lấy toàn bộ booking ACTIVE của sản phẩm trong khoảng ngày tìm kiếm (±90 ngày). */
  async getActiveBookings(
    organizationId: string,
    productId: string,
    fromDate: string,
    toDate: string,
  ): Promise<BookingSpan[]> {
    const rows = await this.db.product_bookings.findMany({
      where: {
        organization_id: organizationId,
        product_id: productId,
        status: "ACTIVE",
        // Chồng lịch: check_in_date < toDate AND check_out_date > fromDate
        check_in_date:  { lt: toDate },
        check_out_date: { gt: fromDate },
      },
      select: { check_in_date: true, check_out_date: true },
      orderBy: { check_in_date: "asc" },
    })
    return rows.map((r: { check_in_date: string; check_out_date: string }) => ({
      checkInDate: r.check_in_date,
      checkOutDate: r.check_out_date,
    }))
  }

  /** Tạo booking mới (từ đơn khách hoặc admin block). */
  async create(data: {
    organizationId: string
    productId: string
    orderId?: string | null
    checkInDate: string
    checkOutDate: string
    note?: string | null
  }): Promise<string> {
    const row = await this.db.product_bookings.create({
      data: {
        organization_id: data.organizationId,
        product_id: data.productId,
        order_id: data.orderId ?? null,
        check_in_date: data.checkInDate,
        check_out_date: data.checkOutDate,
        note: data.note ?? null,
        status: "ACTIVE",
      },
      select: { id: true },
    })
    return row.id
  }

  /** Huỷ booking khi đơn bị cancel. */
  async cancelByOrderId(organizationId: string, orderId: string): Promise<void> {
    await this.db.product_bookings.updateMany({
      where: { organization_id: organizationId, order_id: orderId },
      data: { status: "CANCELLED" },
    })
  }

  /** Lấy danh sách admin blocks (không phải từ đơn) để hiện trong admin UI. */
  async getManualBlocks(organizationId: string, productId: string): Promise<Array<{
    id: string; checkInDate: string; checkOutDate: string; note: string | null
  }>> {
    const rows = await this.db.product_bookings.findMany({
      where: { organization_id: organizationId, product_id: productId, order_id: null, status: "ACTIVE" },
      select: { id: true, check_in_date: true, check_out_date: true, note: true },
      orderBy: { check_in_date: "asc" },
    })
    return rows.map((r: { id: string; check_in_date: string; check_out_date: string; note: string | null }) => ({
      id: r.id,
      checkInDate: r.check_in_date,
      checkOutDate: r.check_out_date,
      note: r.note,
    }))
  }

  /** Xoá admin block. */
  async deleteBlock(organizationId: string, blockId: string): Promise<void> {
    await this.db.product_bookings.updateMany({
      where: { organization_id: organizationId, id: blockId, order_id: null },
      data: { status: "CANCELLED" },
    })
  }
}
