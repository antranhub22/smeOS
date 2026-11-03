import { notFound } from "@/core/http/errors"
import { handle, jsonResponse } from "@/core/http/response"
import { hasCapability, requireCapability } from "@/core/rbac/capabilities"
import { requireTenantContext } from "@/modules/organization/use-cases/resolve-session"
import { getPrintRenditionUseCase } from "@/modules/print/use-cases/get-print-rendition.use-case"

export const GET = handle(async (request, context) => {
  const { ctx } = await requireTenantContext(request)
  if (!hasCapability(ctx, "M5") && !hasCapability(ctx, "Q1")) {
    requireCapability(ctx, "M5")
  }

  const { id } = await (context as { params: Promise<{ id: string }> }).params
  const rendition = await getPrintRenditionUseCase(ctx, id)
  if (!rendition) {
    throw notFound()
  }

  return jsonResponse({ data: rendition })
})
