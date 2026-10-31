/**
 * Cổng nhận đơn và đồng bộ còn/hết hàng với kênh bán ngoài (Trung tâm Tích hợp GĐ4A, 31/10/2026).
 * Webhook của sàn chỉ là tín hiệu "có đơn mới" — chi tiết đơn (có địa chỉ, SĐT người nhận) luôn lấy lại
 * qua API bằng mã đơn, không lưu trong nhật ký sự kiện (nhật ký đã che dữ liệu cá nhân).
 */

export interface ChannelOrderItem {
  /** SKU người bán đặt trên sàn — khớp `products.code` để nối về sản phẩm nội bộ. */
  readonly sellerSku: string | null
  readonly title: string
  readonly quantity: number
  readonly unitPriceVnd: number
}

export interface ChannelOrder {
  readonly externalOrderId: string
  readonly createdAt: string
  readonly items: readonly ChannelOrderItem[]
  readonly buyerNote: string | null
  readonly recipient: { name: string; phone: string; address: string } | null
}

export interface ChannelAvailability {
  readonly externalId: string
  readonly sku: string
  readonly inStock: boolean
}

/** Giới hạn mỗi lần gọi — người gọi tự chia lô. */
export const MAX_AVAILABILITY_PER_PUSH = 100
export const MAX_ORDERS_PER_PULL = 50
