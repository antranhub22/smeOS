/**
 * GET /api/v1/platform/jobs/failed — hàng đợi lỗi xuyên tổ chức (`N5`, ROADMAP E5.2).
 * Không trả payload/output của job.
 */
import { handle, jsonResponse } from "@/core/http/response"
import { listFailedJobsForOps } from "@/modules/platform/use-cases/manage-failed-jobs"
import { requirePlatformContext } from "@/modules/platform/use-cases/resolve-platform-session"

export const GET = handle(async (request) => {
  const pctx = await requirePlatformContext(request)
  return jsonResponse({ data: await listFailedJobsForOps(pctx) })
})

export const dynamic = "force-dynamic" as const
export const revalidate = 0 as const
