import { validationFailed } from "@/core/http/errors"
import type { TenantContext } from "@/core/tenancy/tenant-context"
import {
  calculateQuotationTotals,
  type Quotation,
  validateQuotationItems,
} from "../domain/quotation"
import type { IQuotationRepository } from "../domain/repositories/quotation-repository.interface"
import { getQuotationRepository } from "../infra/quotation-repository"

export interface CreateQuotationItemInput {
  productId?: string | null | undefined
  name: string
  qty: number
  unitPrice: number
  note?: string | null | undefined
}

export interface CreateQuotationInput {
  leadId?: string | null | undefined
  customerId?: string | null | undefined
  assetUsageId?: string | null | undefined
  validUntil?: Date | string | null | undefined
  discountAmount?: number | undefined
  terms?: string | null | undefined
  notes?: string | null | undefined
  items: CreateQuotationItemInput[]
}

export async function createQuotationUseCase(
  ctx: TenantContext,
  input: CreateQuotationInput,
  repo: IQuotationRepository = getQuotationRepository(),
): Promise<Quotation> {
  const itemErr = validateQuotationItems(input.items)
  if (itemErr) {
    throw validationFailed({ items: itemErr })
  }

  const { subtotal, discountAmount, totalAmount } = calculateQuotationTotals(
    input.items,
    input.discountAmount ?? 0,
  )

  const code = await repo.generateNextCode(ctx)

  const items = input.items.map((it) => ({
    productId: it.productId ?? null,
    name: it.name.trim(),
    qty: Math.max(1, Math.floor(it.qty)),
    unitPrice: Math.max(0, Math.round(it.unitPrice)),
    totalPrice: Math.max(1, Math.floor(it.qty)) * Math.max(0, Math.round(it.unitPrice)),
    note: it.note?.trim() ?? null,
  }))

  const validUntilDate = input.validUntil ? new Date(input.validUntil) : null

  return repo.create(ctx, {
    code,
    leadId: input.leadId ?? null,
    customerId: input.customerId ?? null,
    assetUsageId: input.assetUsageId ?? null,
    status: "DRAFT",
    validUntil: validUntilDate,
    subtotal,
    discountAmount,
    totalAmount,
    terms: input.terms?.trim() ?? null,
    notes: input.notes?.trim() ?? null,
    createdBy: ctx.userId ?? "system",
    items,
  })
}

