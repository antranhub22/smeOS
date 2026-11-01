import { requireCapability } from "@/core/rbac/capabilities"
import { handle, jsonResponse } from "@/core/http/response"
import { requireTenantContext } from "@/modules/organization/use-cases/resolve-session"
import { getOrganizationBrand } from "@/modules/organization/use-cases/get-organization-brand"
import { updateOrganizationBrand } from "@/modules/organization/use-cases/update-organization-brand"

/**
 * GET /api/v1/organization/brand — Xem cấu hình thương hiệu tổ chức (`F1`).
 */
export const GET = handle(async (request) => {
  const { ctx } = await requireTenantContext(request)
  requireCapability(ctx, "F1")
  return jsonResponse(await getOrganizationBrand(ctx))
})

/**
 * PUT /api/v1/organization/brand — Cập nhật cấu hình thương hiệu (`F2`).
 * Kiểm tra tương phản WCAG 2.2 AA (>= 4.5:1), trả 422 nếu không đạt.
 */
export const PUT = handle(async (request) => {
  const { ctx } = await requireTenantContext(request)
  requireCapability(ctx, "F2")
  const body = await request.json().catch(() => ({}))
  return jsonResponse(await updateOrganizationBrand(ctx, body))
})

/**
 * PATCH /api/v1/organization/brand — Cập nhật cấu hình thương hiệu (`F2`).
 */
export const PATCH = handle(async (request) => {
  const { ctx } = await requireTenantContext(request)
  requireCapability(ctx, "F2")
  const body = await request.json().catch(() => ({}))
  return jsonResponse(await updateOrganizationBrand(ctx, body))
})

