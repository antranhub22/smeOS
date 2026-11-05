/**
 * GET /api/v1/platform/organizations (`N1`, P25a). POST (`N7`, gán gói cần `N19`): tạo tổ chức mới với tài
 * khoản chủ tiệm mật khẩu tạm và gói thuê bao — checklist ALG 9.10.
 * Xem đặc tả 06 mục 21 — ngoại lệ có chủ đích với Luật 2.
 */
import { handle, jsonResponse } from "@/core/http/response"
import { requirePlatformContext } from "@/modules/platform/use-cases/resolve-platform-session"
import { listOrganizations } from "@/modules/platform/use-cases/list-organizations"
import { createOrganizationFromConsole } from "@/modules/platform/use-cases/create-organization"
import { z } from "zod"
import { validationFailed } from "@/core/http/errors"

export const GET = handle(async (request) => {
  const pctx = await requirePlatformContext(request)
  return jsonResponse({ data: await listOrganizations(pctx) })
})

const bodySchema = z.object({
  organizationName: z.string().trim().min(1).max(120),
  ownerEmail: z.string().trim().min(3).max(200),
  ownerName: z.string().trim().max(120).optional(),
  industry: z.string().trim().max(40).optional(),
  subscription: z.object({
    plan: z.string().trim().min(1).max(40),
    cycle: z.enum(["MONTHLY", "YEARLY"]),
    priceVnd: z.number().int().min(0).max(1_000_000_000),
    includedCreditsMonthly: z.number().int().min(0).max(10_000_000),
    firstPeriodPaid: z.boolean().optional(),
  }).optional(),
})

export const POST = handle(async (request) => {
  const pctx = await requirePlatformContext(request)
  const parsed = bodySchema.safeParse(await request.json().catch(() => null))
  if (!parsed.success) throw validationFailed({ issues: parsed.error.issues })
  return jsonResponse({ data: await createOrganizationFromConsole(pctx, parsed.data) }, { status: 201 })
})

export const dynamic = "force-dynamic" as const
export const revalidate = 0 as const
