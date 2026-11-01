import { notFound, validationFailed } from "@/core/http/errors"
import type { TenantContext } from "@/core/tenancy/tenant-context"
import {
  calculateQuotationTotals,
  type Quotation,
  type QuotationStatus,
  validateQuotationItems,
} from "../domain/quotation"
import type {
  IQuotationRepository,
  UpdateQuotationDTO,
} from "../domain/repositories/quotation-repository.interface"
import { getQuotationRepository } from "../infra/quotation-repository"
import type { CreateQuotationItemInput } from "./create-quotation.use-case"

export interface UpdateQuotationInput {
  status?: QuotationStatus | undefined
  validUntil?: Date | string | null | undefined
  discountAmount?: number | undefined
  terms?: string | null | undefined
  notes?: string | null | undefined
  items?: CreateQuotationItemInput[] | undefined
}

export async function updateQuotationUseCase(
  ctx: TenantContext,
  id: string,
  input: UpdateQuotationInput,
  repo: IQuotationRepository = getQuotationRepository(),
): Promise<Quotation> {
  const existing = await repo.findById(ctx, id)
  if (!existing) {
    throw notFound()
  }

  if (existing.status === "CONVERTED") {
    throw validationFailed({
      status: "Không thể chỉnh sửa báo giá đã chuyển đổi thành đơn hàng.",
    })
  }

  const dto: UpdateQuotationDTO = {}

  if (input.status !== undefined) {
    dto.status = input.status
  }
  if (input.validUntil !== undefined) {
    dto.validUntil = input.validUntil ? new Date(input.validUntil) : null
  }
  if (input.terms !== undefined) {
    dto.terms = input.terms?.trim() ?? null
  }
  if (input.notes !== undefined) {
    dto.notes = input.notes?.trim() ?? null
  }

  if (input.items !== undefined || input.discountAmount !== undefined) {
    const rawItems = input.items ?? existing.items
    const itemErr = validateQuotationItems(rawItems)
    if (itemErr) {
      throw validationFailed({ items: itemErr })
    }

    const effectiveDiscount = input.discountAmount ?? existing.discountAmount
    const { subtotal, discountAmount, totalAmount } = calculateQuotationTotals(
      rawItems,
      effectiveDiscount,
    )

    dto.subtotal = subtotal
    dto.discountAmount = discountAmount
    dto.totalAmount = totalAmount

    if (input.items !== undefined) {
      dto.items = input.items.map((it) => ({
        productId: it.productId ?? null,
        name: it.name.trim(),
        qty: Math.max(1, Math.floor(it.qty)),
        unitPrice: Math.max(0, Math.round(it.unitPrice)),
        totalPrice: Math.max(1, Math.floor(it.qty)) * Math.max(0, Math.round(it.unitPrice)),
        note: it.note?.trim() ?? null,
      }))
    }
  }

  return repo.update(ctx, id, dto)
}

