/**
 * Use-case: Get Order Printout (Chuẩn bị phiếu in đơn & sản xuất — M10, R7).
 */

import { AppError } from "@/core/http/errors"
import type { TenantContext } from "@/core/tenancy/tenant-context"
import type { IOrderRepository } from "../domain/repositories/order-repository.interface"
import { getOrderRepository } from "../infra/order-repository"
import { formatDate } from "@/lib/i18n/formatters"

export interface OrderPrintData {
  orderCode: string
  createdDate: string
  deliveryWindow: string
  recipientInfo: {
    name: string
    phone: string
    address: string
  }
  cardMessage: string
  items: Array<{
    name: string
    quantity: number
    price: number
    subtotal: number
  }>
  totalVnd: number
  floristNote: string
}

export async function getOrderPrintout(
  ctx: TenantContext,
  orderId: string,
  repo: IOrderRepository = getOrderRepository()
): Promise<OrderPrintData> {
  const order = await repo.findById(ctx.organizationId, orderId)
  if (!order) {
    throw new AppError("NOT_FOUND", `Không tìm thấy đơn hàng với mã ID: ${orderId}`)
  }

  const recipient = order.deliveryAddress
  const fullAddress = [
    recipient?.street,
    recipient?.ward,
    recipient?.district,
    recipient?.province,
  ]
    .filter(Boolean)
    .join(", ")

  return {
    orderCode: order.code,
    createdDate: formatDate(order.createdAt),
    deliveryWindow: order.deliveryWindow
      ? `${order.deliveryWindow.timeSlot ? order.deliveryWindow.timeSlot + " " : ""}${order.deliveryWindow.date}`
      : "Giao tiêu chuẩn",
    recipientInfo: {
      name: recipient?.recipientName ?? "Khách lẻ",
      phone: recipient?.phone ?? "Chưa có",
      address: fullAddress || "Nhận tại cửa hàng",
    },
    cardMessage: order.cardMessage || "Không có lời nhắn thiệp",
    items: (order.items ?? []).map((it) => ({
      name: it.description ?? "Sản phẩm tươi",
      quantity: it.quantity,
      price: it.unitPriceVnd,
      subtotal: it.quantity * it.unitPriceVnd,
    })),
    totalVnd: order.totalVnd,
    floristNote: order.internalNote ?? "",
  }
}
