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
    throw new Error("Không tìm thấy nhóm khách hàng")
  }

  // Lấy toàn bộ danh sách khách hàng của tenant để đánh giá (hoặc theo bộ lọc tìm kiếm)
  const allCustomersRes = await customerRepo.list(
    ctx,
    { search: params.search },
    { limit: 500, offset: 0 }
  )

  const matchedCustomers: CustomerMasterIndex[] = []

  for (const c of allCustomersRes.items) {
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

  const offset = params.offset ?? 0
  const limit = params.limit ?? 50
  const paginated = matchedCustomers.slice(offset, offset + limit)

  return {
    segmentName: segment.name,
    items: paginated,
    totalMatched: matchedCustomers.length,
  }
}

