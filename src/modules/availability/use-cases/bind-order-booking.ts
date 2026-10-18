import { AvailabilityRepository } from "../infra/availability-repository"

export interface BindOrderBookingInput {
  organizationId: string
  productId: string
  orderId: string
  checkInDate: string
  checkOutDate: string
  note?: string | null | undefined
}

/** Tự động tạo booking khóa ngày khi khách đặt phòng trên Thẻ chào (Greeting Card). */
export async function bindOrderBooking(
  input: BindOrderBookingInput,
  repo = new AvailabilityRepository(),
): Promise<string | null> {
  if (!input.checkInDate || !input.checkOutDate) return null
  if (input.checkInDate >= input.checkOutDate) return null

  return repo.createBooking({
    organizationId: input.organizationId,
    productId: input.productId,
    orderId: input.orderId,
    checkInDate: input.checkInDate,
    checkOutDate: input.checkOutDate,
    note: input.note ?? null,
  })
}

/** Tự động giải phóng ngày/khung giờ khi đơn hàng bị hủy */
export async function releaseOrderBooking(
  organizationId: string,
  orderId: string,
  repo = new AvailabilityRepository(),
): Promise<void> {
  await repo.cancelByOrderId(organizationId, orderId)
}
