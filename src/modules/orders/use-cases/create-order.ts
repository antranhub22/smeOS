/**
 * Use-case: Create Order (Tạo đơn hàng mới — M10, R2).
 */

import { AppError } from "@/core/http/errors"
import type { TenantContext } from "@/core/tenancy/tenant-context"
import { calculateOrderTotal, generateOrderCode } from "../domain/order-rules"
import type { CreateOrderInput, OrderRecord } from "../domain/order-types"
import type { IOrderRepository } from "../domain/repositories/order-repository.interface"
import { getOrderRepository } from "../infra/order-repository"
import { notifyOrganization } from "@/modules/notification/use-cases/notify-organization"

export async function createOrder(
  ctx: TenantContext,
  input: CreateOrderInput,
  repo: IOrderRepository = getOrderRepository(),
  notify: typeof notifyOrganization = notifyOrganization
): Promise<OrderRecord> {
  if (!input.items || input.items.length === 0) {
    throw new AppError("VALIDATION_FAILED", "Đơn hàng phải có ít nhất một sản phẩm hoặc sản phẩm.")
  }

  const totalVnd = calculateOrderTotal(input.items)
  if (totalVnd < 0) {
    throw new AppError("VALIDATION_FAILED", "Tổng tiền đơn hàng không thể là số âm.")
  }

  const countToday = await repo.countTodayOrders(ctx.organizationId)
  const code = generateOrderCode(countToday + 1)

  const order = await repo.create(ctx.organizationId, code, input, totalVnd, ctx.userId)
  // Không chờ: thông báo chậm/lỗi không được làm chậm hay hỏng việc tạo đơn
  void notify({
    organizationId: ctx.organizationId,
    eventKey: "ORDER_RECEIVED",
    ownerUserId: ctx.userId,
    message: `Đơn ${order.code} vừa được tạo.`,
    deepLink: "/don-hang",
  })
  return order
}
