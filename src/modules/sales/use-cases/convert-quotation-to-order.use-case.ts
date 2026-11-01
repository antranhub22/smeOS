import { notFound, validationFailed } from "@/core/http/errors"
import type { TenantContext } from "@/core/tenancy/tenant-context"
import type { IngestOrderInput, OrderItemInput, OrderRecord } from "@/modules/orders/domain/order-types"
import { ingestOrder } from "@/modules/orders/use-cases/ingest-order"
import {
  canTransitionQuotationStatus,
  type Quotation,
} from "../domain/quotation"
import type { IQuotationRepository } from "../domain/repositories/quotation-repository.interface"
import { getQuotationRepository } from "../infra/quotation-repository"

export interface ConvertQuotationDeps {
  repo?: IQuotationRepository
  ingestOrderFn?: (ctx: TenantContext, input: IngestOrderInput) => Promise<OrderRecord>
}

export interface ConvertQuotationResult {
  quotation: Quotation
  order: OrderRecord
}

export async function convertQuotationToOrderUseCase(
  ctx: TenantContext,
  id: string,
  deps: ConvertQuotationDeps = {},
): Promise<ConvertQuotationResult> {
  const repo = deps.repo ?? getQuotationRepository()
  const quotation = await repo.findById(ctx, id)
  if (!quotation) {
    throw notFound()
  }

  if (quotation.status === "CONVERTED") {
    throw validationFailed({
      status: `Báo giá ${quotation.code} đã được chuyển đổi thành đơn hàng trước đó.`,
    })
  }

  if (!canTransitionQuotationStatus(quotation.status, "CONVERTED")) {
    throw validationFailed({
      status: `Không thể chuyển đổi báo giá ở trạng thái "${quotation.status}" thành đơn hàng.`,
    })
  }

  const orderItems: OrderItemInput[] = quotation.items.map((it) => ({
    productId: it.productId ?? undefined,
    description: it.name,
    quantity: it.qty,
    unitPriceVnd: it.unitPrice,
    metadata: it.note ? { note: it.note } : null,
  }))

  const ingestFn = deps.ingestOrderFn ?? ingestOrder
  const order = await ingestFn(ctx, {
    source: "QUOTATION",
    customerId: quotation.customerId ?? undefined,
    leadId: quotation.leadId ?? undefined,
    items: orderItems,
    internalNote: `Tạo từ báo giá ${quotation.code}`,
  })

  const updatedQuotation = await repo.update(ctx, id, {
    status: "CONVERTED",
    convertedOrderId: order.id,
  })

  return {
    quotation: updatedQuotation,
    order,
  }
}

