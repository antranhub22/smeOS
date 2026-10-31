/** Phụ thuộc của use-case kênh bán hàng (GĐ4A) — tiêm được để test không cần DB. */

import { createOrder } from "@/modules/orders/use-cases/create-order"
import { getProductRepository } from "@/modules/products/infra/product-repository"
import { getSalesChannelRepository, type SalesChannelRepository } from "../infra/sales-channel-repository"
import { defaultHubDeps, type HubDeps } from "./hub-deps"

export interface SalesDeps extends HubDeps {
  sales: Pick<SalesChannelRepository, keyof SalesChannelRepository>
  listProducts: ReturnType<typeof getProductRepository>["listWithPreview"]
  createOrder: typeof createOrder
}

export function defaultSalesDeps(): SalesDeps {
  const products = getProductRepository()
  return {
    ...defaultHubDeps(),
    sales: getSalesChannelRepository(),
    listProducts: (ctx, filters, page) => products.listWithPreview(ctx, filters, page),
    createOrder,
  }
}
