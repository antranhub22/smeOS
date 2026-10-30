/**
 * PATCH /api/v1/short-links/[id] — đổi đích, tên, vị trí đặt, hạn, bật/tắt. Mã đã in giữ nguyên.
 * J1: Tạo catalog.
 */

import { validationFailed } from "@/core/http/errors"
import { handle, jsonResponse } from "@/core/http/response"
import { requireCapability } from "@/core/rbac/capabilities"
import { requireTenantContext } from "@/modules/organization/use-cases/resolve-session"
import { updateShortLink } from "@/modules/acquisition/use-cases/manage-short-links"
import { shortLinkBodySchema } from "../schema"

export const PATCH = handle<[{ params: Promise<{ id: string }> }]>(async (request, context) => {
  const { ctx } = await requireTenantContext(request)
  requireCapability(ctx, "J1")
  const { id } = await context.params
  const parsed = shortLinkBodySchema.safeParse(await request.json().catch(() => null))
  if (!parsed.success) throw validationFailed({ body: "Dữ liệu không hợp lệ" })
  return jsonResponse(await updateShortLink(ctx, id, parsed.data))
})
