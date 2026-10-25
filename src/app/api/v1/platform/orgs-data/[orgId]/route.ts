/**
 * GET /api/v1/platform/orgs-data/[orgId]
 *
 * Platform Admin: Lấy toàn bộ dữ liệu theo mô hình Folder-in-Folder
 * của một tổ chức cụ thể. Yêu cầu PlatformContext N1.
 */

import { handle, jsonResponse } from "@/core/http/response"
import { requirePlatformContext } from "@/modules/platform/use-cases/resolve-platform-session"
import { getPlatformOrgFolderData } from "@/modules/platform/use-cases/get-platform-org-folder-data"
import { notFound } from "@/core/http/errors"

export const GET = handle(async (request, { params }) => {
  const pctx = await requirePlatformContext(request)
  const { orgId } = await params
  const result = await getPlatformOrgFolderData(pctx, orgId as string)
  if (!result) throw notFound()
  return jsonResponse({ data: result })
})

export const dynamic = "force-dynamic" as const
export const revalidate = 0 as const
