import { notFound } from "@/core/http/errors"
import type { TenantContext } from "@/core/tenancy/tenant-context"
import { isQuotationExpired, type Quotation } from "../domain/quotation"
import type { IQuotationRepository } from "../domain/repositories/quotation-repository.interface"
import { getQuotationRepository } from "../infra/quotation-repository"

export async function getQuotationUseCase(
  ctx: TenantContext,
  id: string,
  repo: IQuotationRepository = getQuotationRepository(),
): Promise<Quotation> {
  const quotation = await repo.findById(ctx, id)
  if (!quotation) {
    throw notFound()
  }

  // Tự động đánh dấu hết hạn nếu đã qua ngày hiệu lực
  if (isQuotationExpired(quotation) && quotation.status !== "EXPIRED") {
    return repo.update(ctx, quotation.id, { status: "EXPIRED" })
  }

  return quotation
}

