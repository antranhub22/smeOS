import { handle, jsonResponse } from "@/core/http/response"
import { requireCapability } from "@/core/rbac/capabilities"
import { requireTenantContext } from "@/modules/organization/use-cases/resolve-session"
import { BranchPortalRepository } from "@/modules/greeting-card/infra/branch-portal-repository"
import { listBranchPortalOrders } from "@/modules/greeting-card/use-cases/branch-portal"

/**
 * GET /api/v1/branch-portal/orders
 * Trang cửa hàng nhận gia công: đơn đang mời chi nhánh của tài khoản và đơn chi nhánh đang làm.
 * Chi nhánh lấy từ `memberships.chain_branch_code` của phiên — không nhận tham số chi nhánh.
 */
export const GET = handle(async (request) => {
  const { ctx } = await requireTenantContext(request)
  requireCapability(ctx, "R14")

  // Link Thẻ Gia Công dựng từ URL công khai đã cấu hình (giống tin Telegram), không từ header
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || new URL(request.url).origin
  const data = await listBranchPortalOrders(ctx, new BranchPortalRepository(), baseUrl)
  return jsonResponse({ data })
})

export const dynamic = "force-dynamic"
