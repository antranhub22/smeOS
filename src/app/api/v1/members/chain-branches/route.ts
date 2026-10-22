import { handle, jsonResponse } from "@/core/http/response"
import { requireCapability } from "@/core/rbac/capabilities"
import { requireTenantContext } from "@/modules/organization/use-cases/resolve-session"
import { BranchPortalRepository } from "@/modules/greeting-card/infra/branch-portal-repository"

/** GET /api/v1/members/chain-branches — chi nhánh chuỗi của tổ chức, để chọn khi gắn tài khoản cửa hàng. */
export const GET = handle(async (request) => {
  const { ctx } = await requireTenantContext(request)
  requireCapability(ctx, "F5")
  return jsonResponse({ data: await new BranchPortalRepository().listChainBranches(ctx) })
})
