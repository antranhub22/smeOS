/**
 * GET /api/v1/field-config?entity=… (`R1`, tenant — cấu hình trường hiệu lực, ĐP-3 3.14).
 * POST (`D18`): cửa hàng tạo trường riêng. PUT (`D18`): ẩn/hiện, đổi nhãn, nâng mức một trường trong
 * phạm vi sàn nền tảng (checklist ALG 1.9). Tổ chức lấy từ phiên; trường riêng của tổ chức khác → 404.
 */
import { handle, jsonResponse } from "@/core/http/response"
import { requireTenantContext } from "@/modules/organization/use-cases/resolve-session"
import { getEffectiveFieldConfig } from "@/modules/field-platform/use-cases/get-effective-field-config"
import { createShopField, updateShopField } from "@/modules/field-platform/use-cases/manage-shop-fields"
import { createShopFieldSchema, parseBody, updateShopFieldSchema } from "@/modules/field-platform/adapters/http-schemas"
import type { FieldEntity } from "@/modules/field-platform/domain/core-field-registry"

export const GET = handle(async (request) => {
  const { ctx } = await requireTenantContext(request)
  const url = new URL(request.url)
  const entity = (url.searchParams.get("entity") ?? undefined) as FieldEntity | undefined
  return jsonResponse({ data: await getEffectiveFieldConfig(ctx, entity) })
})

export const POST = handle(async (request) => {
  const { ctx } = await requireTenantContext(request)
  const body = await parseBody(request, createShopFieldSchema)
  return jsonResponse({ data: await createShopField(ctx, body) }, { status: 201 })
})

export const PUT = handle(async (request) => {
  const { ctx } = await requireTenantContext(request)
  const body = await parseBody(request, updateShopFieldSchema)
  return jsonResponse({ data: await updateShopField(ctx, body) })
})

export const dynamic = "force-dynamic" as const
export const revalidate = 0 as const
