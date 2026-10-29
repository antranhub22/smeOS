import { requireCapability } from "@/core/rbac/capabilities"
import { handle, jsonResponse } from "@/core/http/response"
import { requireTenantContext } from "@/modules/organization/use-cases/resolve-session"
import { loadCostingProfile } from "@/modules/costing/use-cases/costing-service"

/** `GET /costing/profile` (`L1`) — hồ sơ tính giá theo ngành của cửa hàng; `supported: false` khi ngành chưa hỗ trợ. */
export const GET = handle(async (request) => {
  const { ctx } = await requireTenantContext(request)
  requireCapability(ctx, "L1")
  const p = await loadCostingProfile(ctx)
  return jsonResponse({ data: { supported: p.spec !== null, industryKey: p.industryKey, spec: p.spec, config: p.config } })
})
