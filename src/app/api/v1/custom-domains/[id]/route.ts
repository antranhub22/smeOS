/**
 * DELETE /api/v1/custom-domains/:id (`D19`) — gỡ tên miền riêng (checklist ALG 10.8). Tên miền của tổ chức
 * khác → 404; tên miền đang bị nền tảng khoá → 409.
 */
import { handle, jsonResponse } from "@/core/http/response"
import { requireTenantContext } from "@/modules/organization/use-cases/resolve-session"
import { removeCustomDomain } from "@/modules/custom-domain/use-cases/manage-custom-domains"

type Ctx = { params: Promise<{ id: string }> }

export const DELETE = handle(async (request, context: Ctx) => {
  const { ctx } = await requireTenantContext(request)
  const { id } = await context.params
  await removeCustomDomain(ctx, id)
  return jsonResponse({ data: { removed: true } })
})

export const dynamic = "force-dynamic" as const
export const revalidate = 0 as const
