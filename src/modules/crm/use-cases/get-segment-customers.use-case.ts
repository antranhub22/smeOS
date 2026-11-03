import { notFound } from "@/core/http/errors"
import type { TenantContext } from "@/core/tenancy/tenant-context"
import type { CustomerMasterIndex } from "../domain/customer-master-index"
import {
  evaluateCustomerForSegment,
  type CustomerEvaluationInput,
} from "../domain/customer-segment"
import type { ICustomerSegmentRepository } from "../domain/repositories/customer-segment-repository.interface"
import type { ICustomerRepository } from "../domain/repositories/customer-repository.interface"
import { getCustomerSegmentRepository } from "../infra/customer-segment-repository"
import { getCustomerRepository } from "../infra/customer-repository"

/** Mỗi lượt đọc 500 khách; tối đa 200 lượt (100.000 khách) để vòng lặp luôn dừng. */
const SCAN_PAGE_SIZE = 500
const MAX_SCAN_PAGES = 200

export interface GetSegmentCustomersParams {
  segmentId: string
  limit?: number | undefined
  offset?: number | undefined
  search?: string | undefined
}

export interface SegmentCustomerResult {
  customer: CustomerMasterIndex
  matchingReason: string
}

export async function getSegmentCustomersUseCase(
  ctx: TenantContext,
  params: GetSegmentCustomersParams,
  segmentRepo: ICustomerSegmentRepository = getCustomerSegmentRepository(),
  customerRepo: ICustomerRepository = getCustomerRepository()
): Promise<{
  segmentName: string
  items: CustomerMasterIndex[]
  totalMatched: number
}> {
  const segment = await segmentRepo.findById(ctx, params.segmentId)
  if (!segment) {
    throw notFound()
  }

  // Duyệt toàn bộ khách của tổ chức theo trang — điều kiện nhóm đánh giá trên chỉ số
  // đã tính sẵn của từng khách nên chưa đẩy xuống truy vấn được.
  const matchedCustomers: CustomerMasterIndex[] = []
  for (let page = 0; page < MAX_SCAN_PAGES; page++) {
    const batch = await customerRepo.list(
      ctx,
      { search: params.search },
      { limit: SCAN_PAGE_SIZE, offset: page * SCAN_PAGE_SIZE }
    )
    for (const c of batch.items) {
      const evalInput: CustomerEvaluationInput = {
        id: c.id,
        tier: c.metrics.tier,
        totalSpentVnd: c.metrics.totalSpentVnd,
        orderCount: c.metrics.orderCount,
        lastOrderAt: c.metrics.lastOrderAt,
        tags: c.tags,
        occasions: c.occasions.map((o) => ({ name: o.name, date: o.date })),
        consents: c.consents.map((cs) => ({
          channel: cs.channel,
          granted: cs.granted,
          revokedAt: cs.revokedAt ?? undefined,
        })),
      }

      if (evaluateCustomerForSegment(evalInput, segment.rules)) {
        matchedCustomers.push(c)
      }
    }
    if (batch.items.length < SCAN_PAGE_SIZE || (page + 1) * SCAN_PAGE_SIZE >= batch.total) break
  }

  const offset = params.offset ?? 0
  const limit = params.limit ?? 50
  const paginated = matchedCustomers.slice(offset, offset + limit)

  return {
    segmentName: segment.name,
    items: paginated,
    totalMatched: matchedCustomers.length,
  }
}

