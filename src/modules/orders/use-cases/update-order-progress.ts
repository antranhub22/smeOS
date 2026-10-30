/**
 * Use-case: Update Order Progress (Cập nhật tiến độ sản xuất & đơn hàng — M10, R3).
 */

import { AppError } from "@/core/http/errors"
import type { TenantContext } from "@/core/tenancy/tenant-context"
import {
  validateOrderStatusTransition,
  validateProductionStatusTransition,
  validateDeliveryStatusTransition,
  brochureLockReason,
} from "../domain/order-rules"
import type { OrderRecord, UpdateOrderInput } from "../domain/order-types"
import type { IOrderRepository } from "../domain/repositories/order-repository.interface"
import { getOrderRepository } from "../infra/order-repository"
import { notifyOrganization } from "@/modules/notification/use-cases/notify-organization"

export async function updateOrderProgress(
  ctx: TenantContext,
  orderId: string,
  input: UpdateOrderInput,
  repo: IOrderRepository = getOrderRepository(),
  notify: typeof notifyOrganization = notifyOrganization
): Promise<OrderRecord> {
  const existing = await repo.findById(ctx.organizationId, orderId)
  if (!existing) {
    throw new AppError("NOT_FOUND", `Không tìm thấy đơn hàng với mã ID: ${orderId}`)
  }

  const brochureLock = brochureLockReason(existing)
  if (brochureLock) throw new AppError("CONFLICT", brochureLock)

  // Kiểm tra chuyển trạng thái order
  if (input.status && input.status !== existing.status) {
    const check = validateOrderStatusTransition(existing.status, input.status)
    if (!check.valid) {
      throw new AppError("UNPROCESSABLE_ENTITY", check.reason ?? "Chuyển trạng thái đơn không hợp lệ.")
    }
  }

  // Kiểm tra chuyển trạng thái production
  if (input.productionStatus && input.productionStatus !== existing.productionStatus) {
    const check = validateProductionStatusTransition(existing.productionStatus, input.productionStatus)
    if (!check.valid) {
      throw new AppError("UNPROCESSABLE_ENTITY", check.reason ?? "Chuyển trạng thái chế tác không hợp lệ.")
    }
  }

  // Kiểm tra chuyển trạng thái delivery
  if (input.deliveryStatus && input.deliveryStatus !== existing.deliveryStatus) {
    const check = validateDeliveryStatusTransition(existing.deliveryStatus, input.deliveryStatus)
    if (!check.valid) {
      throw new AppError("UNPROCESSABLE_ENTITY", check.reason ?? "Chuyển trạng thái giao hàng không hợp lệ.")
    }
  }

  // Ghi nhận sự kiện thay đổi
  if (input.status && input.status !== existing.status) {
    await repo.recordEvent(
      ctx.organizationId,
      orderId,
      "order",
      input.status,
      ctx.userId,
      existing.status,
      "Cập nhật trạng thái đơn hàng"
    )
  }

  if (input.productionStatus && input.productionStatus !== existing.productionStatus) {
    await repo.recordEvent(
      ctx.organizationId,
      orderId,
      "production",
      input.productionStatus,
      ctx.userId,
      existing.productionStatus,
      "Cập nhật tiến độ chế tác"
    )
  }

  if (input.deliveryStatus && input.deliveryStatus !== existing.deliveryStatus) {
    await repo.recordEvent(
      ctx.organizationId,
      orderId,
      "delivery",
      input.deliveryStatus,
      ctx.userId,
      existing.deliveryStatus,
      "Cập nhật tiến độ giao hàng"
    )
  }

  const updated = await repo.update(ctx.organizationId, orderId, input)
  for (const eventKey of progressEvents(existing, input)) {
    // Không chờ: thông báo lỗi không làm hỏng việc cập nhật đơn
    void notify({
      organizationId: ctx.organizationId,
      eventKey,
      ownerUserId: existing.createdBy ?? null,
      message: `Đơn ${existing.code}: ${PROGRESS_TEXT[eventKey]}.`,
    })
  }
  return updated
}

const PROGRESS_TEXT: Record<string, string> = {
  ORDER_ACCEPTED: "đã xác nhận",
  PRODUCT_READY_FOR_DELIVERY: "đã chế tác xong, sẵn sàng giao",
  ORDER_DELIVERED: "đã giao thành công",
}

/** Sự kiện thông báo sinh ra khi tiến độ đơn đổi sang một mốc đáng báo. */
export function progressEvents(existing: OrderRecord, input: UpdateOrderInput): string[] {
  const events: string[] = []
  if (input.status === "CONFIRMED" && existing.status !== "CONFIRMED") events.push("ORDER_ACCEPTED")
  if (input.productionStatus === "READY" && existing.productionStatus !== "READY") events.push("PRODUCT_READY_FOR_DELIVERY")
  const delivered =
    (input.status === "DELIVERED" && existing.status !== "DELIVERED") ||
    (input.deliveryStatus === "DELIVERED" && existing.deliveryStatus !== "DELIVERED")
  if (delivered) events.push("ORDER_DELIVERED")
  return events
}
