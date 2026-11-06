import { AppError } from "@/core/http/errors"
import { checkSubscription } from "./subscription-guard"

/** Câu khách thấy — không nhắc tới thuê bao hay hoá đơn của cửa hàng. */
export const PUBLIC_ORDERS_PAUSED_MESSAGE = "Cửa hàng đang tạm ngưng nhận đơn trực tuyến. Vui lòng liên hệ trực tiếp cửa hàng để đặt hàng."

/**
 * Đơn đặt qua link công khai (Thẻ Chào, catalog, landing) khi gói dịch vụ của cửa hàng quá hạn thanh toán
 * → không tạo đơn (PO 05/11/2026). Cùng quy tắc chỉ xem của phiên nhân viên (`checkSubscription`).
 */
export async function assertAcceptingPublicOrders(
  organizationId: string,
  check: typeof checkSubscription = checkSubscription,
): Promise<void> {
  const { readOnly } = await check(organizationId)
  if (readOnly) throw new AppError("SUBSCRIPTION_OVERDUE", PUBLIC_ORDERS_PAUSED_MESSAGE)
}
