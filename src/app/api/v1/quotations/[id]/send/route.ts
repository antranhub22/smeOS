import { handle, jsonResponse } from "@/core/http/response"
import { requireCapability } from "@/core/rbac/capabilities"
import { requireTenantContext } from "@/modules/organization/use-cases/resolve-session"
import { sendQuotationUseCase } from "@/modules/sales/use-cases/send-quotation.use-case"

export const POST = handle(async (request, context) => {
  const { ctx } = await requireTenantContext(request)
  requireCapability(ctx, "R15")

  const { id } = (await (context as { params: Promise<{ id: string }> }).params)
  const quotation = await sendQuotationUseCase(ctx, id)

  return jsonResponse({ data: quotation })
})

