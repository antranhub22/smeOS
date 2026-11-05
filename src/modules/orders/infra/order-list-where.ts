/** Điều kiện truy vấn danh sách đơn đa nguồn (`GET /orders`) — tách khỏi `order-repository.ts` (ngưỡng 350 dòng). */

import type { Prisma } from "@/generated/prisma/client"
import { multiSourceSaleWhere, orderListExtraWhere } from "../domain/order-list-filter"
import type { OrderFilter } from "../domain/order-types"

export function buildOrderListWhere(organizationId: string, filter: OrderFilter): Prisma.ordersWhereInput {
  const where: Prisma.ordersWhereInput = { organization_id: organizationId }
  if (filter.status) where.status = filter.status
  if (filter.productionStatus) where.production_status = filter.productionStatus
  if (filter.deliveryStatus) where.delivery_status = filter.deliveryStatus
  if (filter.branchId) where.branch_id = filter.branchId
  if (filter.customerId) where.customer_id = filter.customerId
  if (filter.search) {
    where.OR = [
      { code: { contains: filter.search, mode: "insensitive" } },
      { card_message: { contains: filter.search, mode: "insensitive" } },
    ]
  }
  if (filter.fromDate || filter.toDate) {
    where.created_at = { ...(filter.fromDate ? { gte: filter.fromDate } : {}), ...(filter.toDate ? { lte: filter.toDate } : {}) }
  }
  // Lọc nâng cao: ngày giao, nhân viên bán (checklist ALG 4.3)
  where.AND = orderListExtraWhere({ deliveryFrom: filter.deliveryFrom, deliveryTo: filter.deliveryTo, saleId: filter.saleId }, multiSourceSaleWhere)
    .AND as Prisma.ordersWhereInput[]
  return where
}
