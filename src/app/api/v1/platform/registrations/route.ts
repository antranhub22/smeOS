/**
 * GET /api/v1/platform/registrations — tài khoản tự đăng ký đang chờ duyệt (`N13`, PO 22/10/2026).
 * Xem đặc tả 06 mục 21.
 */
import { handle, jsonResponse } from "@/core/http/response"
import { requirePlatformCapability } from "@/core/platform/platform-capabilities"
import { AccountApprovalRepository } from "@/modules/platform/infra/account-approval-repository"
import { requirePlatformContext } from "@/modules/platform/use-cases/resolve-platform-session"

export const GET = handle(async (request) => {
  const pctx = await requirePlatformContext(request)
  requirePlatformCapability(pctx, "N13")
  return jsonResponse({ data: await new AccountApprovalRepository().listPending() })
})

export const dynamic = "force-dynamic" as const
export const revalidate = 0 as const
