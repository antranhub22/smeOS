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

  // Chống tạo trùng booking cho cùng một orderId
  const existing = await repo.findBookingByOrderId(input.organizationId, input.orderId)
  if (existing && existing.status === "ACTIVE") {
    return existing.id
  }

  return repo.createBooking({
    organizationId: input.organizationId,
    productId: input.productId,
    orderId: input.orderId,
    checkInDate: input.checkInDate,
    checkOutDate: input.checkOutDate,
    note: input.note ?? null,
  })
}

export interface EnsureHomestayBookingOrder {
  id: string
  code: string
  organization_id: string
  delivery_window?: unknown
  internal_note?: string | null | undefined
  items?: Array<{ product_id: string | null; quantity?: number | undefined }>
}

/** Trích xuất hoặc khôi phục ngày trả phòng (checkOutDate) */
function resolveHomestayCheckOut(
  checkInDate: string,
  explicitCheckOut?: string | null | undefined,
  internalNote?: string | null | undefined,
  quantity?: number | undefined,
): string | null {
  if (explicitCheckOut && explicitCheckOut > checkInDate) {
    return explicitCheckOut
  }
  if (internalNote) {
    const match = internalNote.match(/➔\s*(\d{4}-\d{2}-\d{2})/)
    if (match?.[1] && match[1] > checkInDate) {
      return match[1]
    }
  }
  if (typeof quantity === "number" && quantity >= 1) {
    const inMs = Date.parse(`${checkInDate}T00:00:00Z`)
    if (!Number.isNaN(inMs)) {
      const out = new Date(inMs + quantity * 86_400_000).toISOString().slice(0, 10)
      if (out > checkInDate) return out
    }
  }
  return null
}

/** Đảm bảo đơn Homestay luôn được khóa phòng trên Calendar khi có thông báo chuyển khoản hoặc thanh toán */
export async function ensureHomestayOrderBooking(
  order: EnsureHomestayBookingOrder,
  repo = new AvailabilityRepository(),
): Promise<string | null> {
  const window = (order.delivery_window as Record<string, string> | null) || {}
  const checkInDate = window.date
  const productId = order.items?.[0]?.product_id
  const quantity = order.items?.[0]?.quantity

  if (!checkInDate || !productId) {
    return null
  }

  const checkOutDate = resolveHomestayCheckOut(checkInDate, window.checkOutDate, order.internal_note, quantity)
  if (!checkOutDate || checkInDate >= checkOutDate) {
    return null
  }

  // Nếu trong delivery_window chưa lưu checkOutDate, tự động cập nhật lại DB để đồng bộ vĩnh viễn
  if (!window.checkOutDate) {
    await repo.updateOrderDeliveryWindow(order.organization_id, order.id, {
      ...window,
      checkOutDate,
    }).catch(() => null)
  }

  return bindOrderBooking(
    {
      organizationId: order.organization_id,
      productId,
      orderId: order.id,
      checkInDate,
      checkOutDate,
      note: `Khóa phòng theo đơn Homestay #${order.code}`,
    },
    repo,
  )
}

/** Tự động giải phóng ngày/khung giờ khi đơn hàng bị hủy */
export async function releaseOrderBooking(
  organizationId: string,
  orderId: string,
  repo = new AvailabilityRepository(),
): Promise<void> {
  await repo.cancelByOrderId(organizationId, orderId)
}
