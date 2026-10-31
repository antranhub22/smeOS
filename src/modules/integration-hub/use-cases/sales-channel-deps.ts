/** Phụ thuộc của use-case kênh bán hàng (GĐ4A) — tiêm được để test không cần DB. */

import { ingestOrder } from "@/modules/orders/use-cases/ingest-order"
import { getProductRepository } from "@/modules/products/infra/product-repository"
import { getSalesChannelRepository, type SalesChannelRepository } from "../infra/sales-channel-repository"
import { defaultHubDeps, type HubDeps } from "./hub-deps"

export interface SalesDeps extends HubDeps {
  sales: Pick<SalesChannelRepository, keyof SalesChannelRepository>
  listProducts: ReturnType<typeof getProductRepository>["listWithPreview"]
  /** Cổng nhận đơn chung (`ingestOrder`, nguồn `CHANNEL`). */
  createOrder: typeof ingestOrder
}

export function defaultSalesDeps(): SalesDeps {
  const products = getProductRepository()
  return {
    ...defaultHubDeps(),
    sales: getSalesChannelRepository(),
    listProducts: (ctx, filters, page) => products.listWithPreview(ctx, filters, page),
    createOrder: ingestOrder,
  }
}
