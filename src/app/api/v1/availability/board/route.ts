import { handle, jsonResponse } from "@/core/http/response"
import { requireTenantContext } from "@/modules/organization/use-cases/resolve-session"
import { requireCapability } from "@/core/rbac/capabilities"
import { getAvailabilityBoard } from "@/modules/availability/use-cases/get-availability-board"

import { prisma } from "@/core/tenancy/infra/prisma"

/**
 * GET /api/v1/availability/board?month=2026-10
 * Trả về toàn bộ dữ liệu bảng điều khiển khả dụng theo tháng và theo ngành của tổ chức.
 */
export const GET = handle(async (request) => {
  const { ctx } = await requireTenantContext(request)
  requireCapability(ctx, "L1")

  const { searchParams } = new URL(request.url)
  const month = searchParams.get("month") ?? undefined

  const org = await prisma.organizations.findUnique({
    where: { id: ctx.organizationId },
    select: { settings: true },
  })
  const settings = org?.settings as Record<string, unknown> | null
  const industryKey = typeof settings?.industry === "string" ? settings.industry : "FLORAL"

  const board = await getAvailabilityBoard(
    ctx.organizationId,
    month,
    industryKey,
  )

  return jsonResponse(board)
})

export const dynamic = "force-dynamic"
