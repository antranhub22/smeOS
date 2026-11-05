/**
 * GET/PUT /api/v1/usage/limits — hạn mức credit tháng của cửa hàng (checklist ALG 10.3, 9.7).
 * GET (`G8`): kỳ hiện tại, credit đã dùng/hạn mức, phần AI. PUT (`U2`): `{ aiMonthlyLimit: number | null }`.
 */
import { z } from "zod"
import { validationFailed } from "@/core/http/errors"
import { handle, jsonResponse } from "@/core/http/response"
import { requireTenantContext } from "@/modules/organization/use-cases/resolve-session"
import { getMonthlyLimits, setAiMonthlyLimit } from "@/modules/usage/use-cases/monthly-limits"

export const GET = handle(async (request) => {
  const { ctx } = await requireTenantContext(request)
  return jsonResponse({ data: await getMonthlyLimits(ctx) })
})

const bodySchema = z.object({ aiMonthlyLimit: z.number().int().nullable() })

export const PUT = handle(async (request) => {
  const { ctx } = await requireTenantContext(request)
  const parsed = bodySchema.safeParse(await request.json().catch(() => null))
  if (!parsed.success) throw validationFailed({ issues: parsed.error.issues })
  return jsonResponse({ data: await setAiMonthlyLimit(ctx, parsed.data.aiMonthlyLimit) })
})

export const dynamic = "force-dynamic" as const
export const revalidate = 0 as const
