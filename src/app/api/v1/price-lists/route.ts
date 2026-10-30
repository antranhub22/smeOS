import { validationFailed } from "@/core/http/errors"
import { handle, jsonResponse } from "@/core/http/response"
import { requireCapability } from "@/core/rbac/capabilities"
import { requireTenantContext } from "@/modules/organization/use-cases/resolve-session"
import { listPriceLists, savePriceList } from "@/modules/products/use-cases/price-lists"

import { priceListBodySchema, toPriceListInput } from "./schema"

/** `GET /price-lists` (`L1`) — bảng giá sản phẩm của cửa hàng. */
export const GET = handle(async (request) => {
  const { ctx } = await requireTenantContext(request)
  requireCapability(ctx, "L1")
  return jsonResponse(await listPriceLists(ctx))
})

/** `POST /price-lists` (`L3`) — tạo bảng giá mới. */
export const POST = handle(async (request) => {
  const { ctx } = await requireTenantContext(request)
  requireCapability(ctx, "L3")
  const parsed = priceListBodySchema.safeParse(await request.json().catch(() => null))
  if (!parsed.success) throw validationFailed({ issues: parsed.error.issues })
  return jsonResponse(await savePriceList(ctx, null, toPriceListInput(parsed.data)), { status: 201 })
})
