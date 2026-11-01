import { handle, jsonResponse } from "@/core/http/response"
import { requireCapability } from "@/core/rbac/capabilities"
import { requireTenantContext } from "@/modules/organization/use-cases/resolve-session"
import { convertQuotationToOrderUseCase } from "@/modules/sales/use-cases/convert-quotation-to-order.use-case"

export const POST = handle(async (request, context) => {
  const { ctx } = await requireTenantContext(request)
  requireCapability(ctx, "R15")

  const { id } = (await (context as { params: Promise<{ id: string }> }).params)
  const result = await convertQuotationToOrderUseCase(ctx, id)

  return jsonResponse({ data: result })
})

