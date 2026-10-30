import { requireCapability } from "@/core/rbac/capabilities"
import { handle, jsonResponse } from "@/core/http/response"
import { requireTenantContext } from "@/modules/organization/use-cases/resolve-session"
import { listChainBrandLibrary } from "@/modules/profiles/use-cases/brand-library"

/** Cửa hàng thành viên: tài nguyên chuỗi đã chia sẻ (chỉ đọc). `data: null` khi không thuộc chuỗi. */
export const GET = handle(async (request) => {
  const { ctx } = await requireTenantContext(request)
  requireCapability(ctx, "F1")
  return jsonResponse({ data: await listChainBrandLibrary(ctx) })
})
