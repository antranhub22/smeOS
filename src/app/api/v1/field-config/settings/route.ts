/**
 * GET /api/v1/field-config/settings?entity=… (`D18`) — danh sách trường cho màn Cài đặt → Trường dữ liệu:
 * trường nền tảng kèm mức sàn và trường riêng của cửa hàng (gồm cả trường đang ẩn). Checklist ALG 1.9.
 */
import { handle, jsonResponse } from "@/core/http/response"
import { requireTenantContext } from "@/modules/organization/use-cases/resolve-session"
import { listShopFieldSettings } from "@/modules/field-platform/use-cases/manage-shop-fields"
import type { FieldEntity } from "@/modules/field-platform/domain/core-field-registry"

export const GET = handle(async (request) => {
  const { ctx } = await requireTenantContext(request)
  const raw = new URL(request.url).searchParams.get("entity")
  const entity: FieldEntity | undefined = raw === "ORDER" || raw === "PARTNER" ? raw : undefined
  return jsonResponse({ data: await listShopFieldSettings(ctx, entity) })
})

export const dynamic = "force-dynamic" as const
export const revalidate = 0 as const
