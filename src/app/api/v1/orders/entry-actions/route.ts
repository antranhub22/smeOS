/**
 * Nút "Đặt hàng" / "Liên hệ" trên trang khách, bật tắt theo toàn bộ hoặc từng nguồn
 * (`docs/kien-truc/KIEN_TRUC_SSOT_DON_HANG_DA_NGUON.md` §3.2).
 * GET — R1 (xem đơn) · PUT — F2 (sửa cài đặt tổ chức, trần cứng Điều hành).
 */

import { handle, jsonResponse } from "@/core/http/response"
import { requireCapability } from "@/core/rbac/capabilities"
import { requireTenantContext } from "@/modules/organization/use-cases/resolve-session"
import { getEntryActions, updateEntryActions } from "@/modules/orders/use-cases/entry-actions-settings"

export const GET = handle(async (request) => {
  const { ctx } = await requireTenantContext(request)
  requireCapability(ctx, "R1")
  return jsonResponse(await getEntryActions(ctx))
})

export const PUT = handle(async (request) => {
  const { ctx } = await requireTenantContext(request)
  requireCapability(ctx, "F2")
  const body: unknown = await request.json().catch(() => null)
  return jsonResponse(await updateEntryActions(ctx, body))
})

export const dynamic = "force-dynamic"
