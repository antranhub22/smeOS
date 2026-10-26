/**
<<<<<<< HEAD
 * GET /api/v1/platform/registrations — danh sách đơn đăng ký (N1).
 * Query param: ?status=PENDING|APPROVED|REJECTED|all (default: all)
 */
import { z } from "zod"
import { handle, jsonResponse } from "@/core/http/response"
import { requirePlatformContext } from "@/modules/platform/use-cases/resolve-platform-session"
import { getRegistrationRequestRepository, type RegistrationStatus } from "@/modules/organization/infra/registration-request-repository"

const querySchema = z.object({
  status: z.enum(["PENDING", "APPROVED", "REJECTED", "all"]).default("all"),
})

export const GET = handle(async (request) => {
  await requirePlatformContext(request)

  const { searchParams } = new URL(request.url)
  const { status } = querySchema.parse({ status: searchParams.get("status") ?? "all" })

  const repo = getRegistrationRequestRepository()
  const rows =
    status === "all"
      ? await repo.listAll()
      : await repo.listByStatus(status as RegistrationStatus)

  return jsonResponse({ data: rows })
=======
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
>>>>>>> origin/main
})

export const dynamic = "force-dynamic" as const
export const revalidate = 0 as const
