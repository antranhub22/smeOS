/**
 * Use-case: Create Order (Tạo đơn hàng mới — M10, R2).
 */

import { AppError } from "@/core/http/errors"
import { branchScopeOf } from "@/core/tenancy"
import type { TenantContext } from "@/core/tenancy/tenant-context"
import { calculateOrderTotal, generateOrderCode } from "../domain/order-rules"
import type { CreateOrderInput, OrderRecord } from "../domain/order-types"
import type { IOrderRepository } from "../domain/repositories/order-repository.interface"
import { getOrderRepository } from "../infra/order-repository"
import { findForeignOrderReferences } from "../infra/order-reference-guard"
import { notifyOrganization } from "@/modules/notification/use-cases/notify-organization"

export async function createOrder(
  ctx: TenantContext,
  input: CreateOrderInput,
  repo: IOrderRepository = getOrderRepository(),
  notify: typeof notifyOrganization = notifyOrganization,
  findForeign: typeof findForeignOrderReferences = findForeignOrderReferences
): Promise<OrderRecord> {
  if (!input.items || input.items.length === 0) {
    throw new AppError("VALIDATION_FAILED", "Đơn hàng phải có ít nhất một sản phẩm hoặc sản phẩm.")
  }

  const totalVnd = calculateOrderTotal(input.items)
  if (totalVnd < 0) {
    throw new AppError("VALIDATION_FAILED", "Tổng tiền đơn hàng không thể là số âm.")
  }

  // Nhân viên chi nhánh tạo đơn → đơn thuộc chi nhánh đó, không chọn chi nhánh khác (checklist ALG 9.13)
  const scope = branchScopeOf(ctx)
  const scopedInput = scope ? { ...input, branchId: scope } : input
  // Khách / chi nhánh / sản phẩm của tổ chức khác → như không tồn tại (404, không 403)
  const foreign = await findForeign(ctx, {
    customerId: scopedInput.customerId,
    // Chi nhánh lấy từ phiên (nhân viên chi nhánh) là tin được; chỉ kiểm chi nhánh client gửi lên
    branchId: scope ? undefined : input.branchId,
    productIds: scopedInput.items.map((it) => it.productId),
    variantIds: scopedInput.items.map((it) => it.variantId),
  })
  if (foreign.length > 0) throw new AppError("NOT_FOUND", "Không tìm thấy khách hàng, chi nhánh hoặc sản phẩm đã chọn.")
  const countToday = await repo.countTodayOrders(ctx.organizationId)
  const order = await createWithFreshCode(ctx, repo, countToday, scopedInput, totalVnd)
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

/** Số lần thử sinh mã khi trùng — vòng lặp có giới hạn. */
export const ORDER_CODE_ATTEMPTS = 3

/**
 * Hai đơn tạo cùng lúc đọc cùng `countToday` → cùng mã → trùng khoá `(organization_id, code)`. Trước đây trả 500;
 * nay thử số kế tiếp, tối đa `ORDER_CODE_ATTEMPTS` lần (audit BL-10, cùng cách với tạo đơn Điều phối).
 */
async function createWithFreshCode(
  ctx: TenantContext,
  repo: IOrderRepository,
  countToday: number,
  input: CreateOrderInput,
  totalVnd: number
): Promise<OrderRecord> {
  for (let attempt = 0; ; attempt += 1) {
    try {
      return await repo.create(ctx.organizationId, generateOrderCode(countToday + 1 + attempt), input, totalVnd, ctx.userId)
    } catch (error: unknown) {
      if (!isUniqueViolation(error) || attempt + 1 >= ORDER_CODE_ATTEMPTS) {
        if (isUniqueViolation(error)) throw new AppError("CONFLICT", "Đang có nhiều đơn tạo cùng lúc — vui lòng thử lại.")
        throw error
      }
    }
  }
}

function isUniqueViolation(error: unknown): boolean {
  return typeof error === "object" && error !== null && (error as { code?: unknown }).code === "P2002"
}
