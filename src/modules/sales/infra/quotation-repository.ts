import { scopedWhere, type TenantContext } from "@/core/tenancy"
import { prisma } from "@/core/tenancy/infra/prisma"
import type { Prisma, quotation_status } from "@/generated/prisma/client"
import type {
  Quotation,
  QuotationItem,
  QuotationStatus,
} from "../domain/quotation"
import type {
  CreateQuotationDTO,
  IQuotationRepository,
  QuotationFilter,
  UpdateQuotationDTO,
} from "../domain/repositories/quotation-repository.interface"

type QuotationRowWithRelations = Prisma.quotationsGetPayload<{
  include: {
    items: true
    lead: { select: { id: true, name: true, phone: true } }
    customer: { select: { id: true, name: true, phone: true } }
  }
}>

function toDomain(row: QuotationRowWithRelations): Quotation {
  return {
    id: row.id,
    organizationId: row.organization_id,
    code: row.code,
    leadId: row.lead_id,
    customerId: row.customer_id,
    assetUsageId: row.asset_usage_id,
    status: row.status as QuotationStatus,
    validUntil: row.valid_until,
    subtotal: Number(row.subtotal),
    discountAmount: Number(row.discount_amount),
    totalAmount: Number(row.total_amount),
    terms: row.terms,
    notes: row.notes,
    convertedOrderId: row.converted_order_id,
    createdBy: row.created_by,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    items: (row.items || []).map((it) => ({
      id: it.id,
      productId: it.product_id,
      name: it.name,
      qty: it.qty,
      unitPrice: Number(it.unit_price),
      totalPrice: Number(it.total_price),
      note: it.note,
    })),
    lead: row.lead ? { id: row.lead.id, name: row.lead.name, phone: row.lead.phone } : null,
    customer: row.customer
      ? { id: row.customer.id, name: row.customer.name, phone: row.customer.phone }
      : null,
  }
}

export class QuotationRepository implements IQuotationRepository {
  async generateNextCode(ctx: TenantContext): Promise<string> {
    const count = await prisma.quotations.count({
      where: scopedWhere(ctx),
    })
    const num = (count + 1).toString().padStart(4, "0")
    return `BG-${num}`
  }

  async create(ctx: TenantContext, dto: CreateQuotationDTO): Promise<Quotation> {
    const created = await prisma.quotations.create({
      data: {
        organization_id: ctx.organizationId,
        code: dto.code,
        lead_id: dto.leadId ?? null,
        customer_id: dto.customerId ?? null,
        asset_usage_id: dto.assetUsageId ?? null,
        status: (dto.status ?? "DRAFT") as quotation_status,
        valid_until: dto.validUntil ?? null,
        subtotal: dto.subtotal,
        discount_amount: dto.discountAmount,
        total_amount: dto.totalAmount,
        terms: dto.terms ?? null,
        notes: dto.notes ?? null,
        created_by: dto.createdBy,
        items: {
          create: dto.items.map((it) => ({
            product_id: it.productId ?? null,
            name: it.name,
            qty: it.qty,
            unit_price: it.unitPrice,
            total_price: it.totalPrice,
            note: it.note ?? null,
          })),
        },
      },
      include: {
        items: true,
        lead: { select: { id: true, name: true, phone: true } },
        customer: { select: { id: true, name: true, phone: true } },
      },
    })
    return toDomain(created)
  }

  async findById(ctx: TenantContext, id: string): Promise<Quotation | null> {
    const row = await prisma.quotations.findFirst({
      where: {
        ...scopedWhere(ctx),
        id,
      },
      include: {
        items: true,
        lead: { select: { id: true, name: true, phone: true } },
        customer: { select: { id: true, name: true, phone: true } },
      },
    })
    return row ? toDomain(row) : null
  }

  async findByCode(ctx: TenantContext, code: string): Promise<Quotation | null> {
    const row = await prisma.quotations.findFirst({
      where: {
        ...scopedWhere(ctx),
        code,
      },
      include: {
        items: true,
        lead: { select: { id: true, name: true, phone: true } },
        customer: { select: { id: true, name: true, phone: true } },
      },
    })
    return row ? toDomain(row) : null
  }

  async findByPublicCode(code: string): Promise<Quotation | null> {
    const row = await prisma.quotations.findFirst({
      where: { code },
      include: {
        items: true,
        lead: { select: { id: true, name: true, phone: true } },
        customer: { select: { id: true, name: true, phone: true } },
      },
    })
    return row ? toDomain(row) : null
  }

  async list(
    ctx: TenantContext,
    filter?: QuotationFilter,
  ): Promise<{ items: Quotation[]; total: number; nextCursor?: string | undefined }> {
    const where: Prisma.quotationsWhereInput = {
      ...scopedWhere(ctx),
    }

    if (filter?.status) {
      if (Array.isArray(filter.status)) {
        where.status = { in: filter.status as quotation_status[] }
      } else {
        where.status = filter.status as quotation_status
      }
    }
    if (filter?.leadId) {
      where.lead_id = filter.leadId
    }
    if (filter?.customerId) {
      where.customer_id = filter.customerId
    }
    if (filter?.search) {
      where.OR = [
        { code: { contains: filter.search, mode: "insensitive" } },
        { terms: { contains: filter.search, mode: "insensitive" } },
        { notes: { contains: filter.search, mode: "insensitive" } },
      ]
    }

    const limit = Math.min(Math.max(filter?.limit ?? 20, 1), 100)

    const findArgs: Prisma.quotationsFindManyArgs = {
      where,
      take: limit + 1,
      orderBy: { created_at: "desc" },
      include: {
        items: true,
        lead: { select: { id: true, name: true, phone: true } },
        customer: { select: { id: true, name: true, phone: true } },
      },
      ...(filter?.cursor ? { cursor: { id: filter.cursor }, skip: 1 } : {}),
    }

    const [rows, total] = await Promise.all([
      prisma.quotations.findMany(findArgs) as Promise<QuotationRowWithRelations[]>,
      prisma.quotations.count({ where }),
    ])

    let nextCursor: string | undefined
    let items = rows
    if (rows.length > limit) {
      const nextRow = rows[limit]
      if (nextRow) {
        nextCursor = nextRow.id
      }
      items = rows.slice(0, limit)
    }

    return {
      items: items.map(toDomain),
      total,
      nextCursor,
    }
  }

  async update(ctx: TenantContext, id: string, dto: UpdateQuotationDTO): Promise<Quotation> {
    const updateData: Prisma.quotationsUpdateInput = {}

    if (dto.status !== undefined) updateData.status = dto.status as quotation_status
    if (dto.validUntil !== undefined) updateData.valid_until = dto.validUntil
    if (dto.subtotal !== undefined) updateData.subtotal = dto.subtotal
    if (dto.discountAmount !== undefined) updateData.discount_amount = dto.discountAmount
    if (dto.totalAmount !== undefined) updateData.total_amount = dto.totalAmount
    if (dto.terms !== undefined) updateData.terms = dto.terms
    if (dto.notes !== undefined) updateData.notes = dto.notes
    if (dto.convertedOrderId !== undefined) {
      updateData.converted_order = dto.convertedOrderId
        ? { connect: { id: dto.convertedOrderId } }
        : { disconnect: true }
    }

    if (dto.items) {
      updateData.items = {
        deleteMany: {},
        create: dto.items.map((it) => ({
          product_id: it.productId ?? null,
          name: it.name,
          qty: it.qty,
          unit_price: it.unitPrice,
          total_price: it.totalPrice,
          note: it.note ?? null,
        })),
      }
    }

    const updated = await prisma.quotations.update({
      where: {
        id,
      },
      data: updateData,
      include: {
        items: true,
        lead: { select: { id: true, name: true, phone: true } },
        customer: { select: { id: true, name: true, phone: true } },
      },
    })
    return toDomain(updated)
  }

  async countByStatus(ctx: TenantContext): Promise<Record<QuotationStatus, number>> {
    const counts: Record<QuotationStatus, number> = {
      DRAFT: 0,
      SENT: 0,
      ACCEPTED: 0,
      REJECTED: 0,
      EXPIRED: 0,
      CONVERTED: 0,
    }

    const grouped = await prisma.quotations.groupBy({
      by: ["status"],
      where: scopedWhere(ctx),
      _count: { status: true },
    })

    for (const row of grouped) {
      if (row.status in counts) {
        counts[row.status as QuotationStatus] = row._count.status
      }
    }

    return counts
  }
}

let repositoryInstance: IQuotationRepository | null = null

export function getQuotationRepository(): IQuotationRepository {
  if (!repositoryInstance) {
    repositoryInstance = new QuotationRepository()
  }
  return repositoryInstance
}
