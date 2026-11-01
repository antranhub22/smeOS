import { notFound } from "@/core/http/errors"
import { handle, jsonResponse } from "@/core/http/response"
import { isQuotationExpired } from "@/modules/sales/domain/quotation"
import { getQuotationRepository } from "@/modules/sales/infra/quotation-repository"

export const GET = handle(async (_request, context) => {
  const { code } = (await (context as { params: Promise<{ code: string }> }).params)
  if (!code || typeof code !== "string") {
    throw notFound()
  }

  const repo = getQuotationRepository()
  const quotation = await repo.findByPublicCode(code)
  if (!quotation) {
    throw notFound()
  }

  const isExpired = isQuotationExpired(quotation)

  return jsonResponse({
    data: {
      code: quotation.code,
      status: isExpired && quotation.status !== "CONVERTED" ? "EXPIRED" : quotation.status,
      validUntil: quotation.validUntil,
      subtotal: quotation.subtotal,
      discountAmount: quotation.discountAmount,
      totalAmount: quotation.totalAmount,
      terms: quotation.terms,
      items: quotation.items.map((it) => ({
        id: it.id,
        name: it.name,
        qty: it.qty,
        unitPrice: it.unitPrice,
        totalPrice: it.totalPrice,
        note: it.note,
      })),
      createdAt: quotation.createdAt,
    },
  })
})

