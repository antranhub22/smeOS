import type { TenantContext } from "@/core/tenancy/tenant-context"
import type { Quotation, QuotationItem, QuotationStatus } from "../quotation"

export interface CreateQuotationDTO {
  code: string
  leadId?: string | null | undefined
  customerId?: string | null | undefined
  assetUsageId?: string | null | undefined
  status?: QuotationStatus | undefined
  validUntil?: Date | null | undefined
  subtotal: number
  discountAmount: number
  totalAmount: number
  terms?: string | null | undefined
  notes?: string | null | undefined
  createdBy: string
  items: Array<{
    productId?: string | null | undefined
    name: string
    qty: number
    unitPrice: number
    totalPrice: number
    note?: string | null | undefined
  }>
}

export interface UpdateQuotationDTO {
  status?: QuotationStatus | undefined
  validUntil?: Date | null | undefined
  subtotal?: number | undefined
  discountAmount?: number | undefined
  totalAmount?: number | undefined
  terms?: string | null | undefined
  notes?: string | null | undefined
  convertedOrderId?: string | null | undefined
  items?: Array<{
    productId?: string | null | undefined
    name: string
    qty: number
    unitPrice: number
    totalPrice: number
    note?: string | null | undefined
  }> | undefined
}

export interface QuotationFilter {
  status?: QuotationStatus | QuotationStatus[] | undefined
  leadId?: string | undefined
  customerId?: string | undefined
  search?: string | undefined
  limit?: number | undefined
  cursor?: string | undefined
}

export interface IQuotationRepository {
  create(ctx: TenantContext, dto: CreateQuotationDTO): Promise<Quotation>
  findById(ctx: TenantContext, id: string): Promise<Quotation | null>
  findByCode(ctx: TenantContext, code: string): Promise<Quotation | null>
  findByPublicCode(code: string): Promise<Quotation | null>
  list(
    ctx: TenantContext,
    filter?: QuotationFilter,
  ): Promise<{ items: Quotation[]; total: number; nextCursor?: string | undefined }>
  update(ctx: TenantContext, id: string, dto: UpdateQuotationDTO): Promise<Quotation>
  countByStatus(ctx: TenantContext): Promise<Record<QuotationStatus, number>>
  generateNextCode(ctx: TenantContext): Promise<string>
}
