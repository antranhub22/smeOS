import type {
  ChannelListing,
  ListingSyncResult,
  SalesChannelCatalogProvider,
  SalesChannelId,
} from "@/core/ports/sales-channel-catalog-provider"

/**
 * Adapter mặc định khi kênh chưa được nối (chưa có hợp đồng/API key — PO 30/10/2026: tạo đầu nối
 * trước, bổ sung dịch vụ sau). Không gọi mạng; mọi tin trả `NOT_CONFIGURED` để giao diện báo rõ.
 */
export class NotConfiguredChannelAdapter implements SalesChannelCatalogProvider {
  constructor(readonly channel: SalesChannelId) {}

  async upsertListings(_organizationId: string, listings: readonly ChannelListing[]): Promise<ListingSyncResult[]> {
    return listings.map((l) => ({ productId: l.productId, status: "NOT_CONFIGURED", reason: "Kênh bán chưa được kết nối" }))
  }

  async removeListings(_organizationId: string, productIds: readonly string[]): Promise<ListingSyncResult[]> {
    return productIds.map((productId) => ({ productId, status: "NOT_CONFIGURED", reason: "Kênh bán chưa được kết nối" }))
  }
}

/** Điểm duy nhất chọn adapter theo kênh — thêm adapter thật ở đây khi PO duyệt nhà cung cấp. */
export function getSalesChannelCatalogProvider(channel: SalesChannelId): SalesChannelCatalogProvider {
  return new NotConfiguredChannelAdapter(channel)
}
