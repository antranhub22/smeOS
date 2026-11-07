/**
 * GET/POST /api/v1/platform/organizations/:id/credits — sổ cái credit của một tổ chức (checklist ALG 10.6).
 * GET (`N1`): số dư và các dòng gần nhất. POST (`N3`): `{ kind: TOPUP|GIFT|REFUND, amount, reason }`.
 */
import { z } from "zod"
import { validationFailed } from "@/core/http/errors"
import { handle, jsonResponse } from "@/core/http/response"
import { requirePlatformContext } from "@/modules/platform/use-cases/resolve-platform-session"
import { recordPlatformAccess } from "@/modules/audit/use-cases/record-platform-access"
import { adjustOrganizationCredits, listOrganizationCredits } from "@/modules/platform/use-cases/manage-credits"

type Ctx = { params: Promise<{ id: string }> }

export const GET = handle(async (request, context: Ctx) => {
  const pctx = await requirePlatformContext(request)
  await recordPlatformAccess(request, pctx) // D-60: ghi trước khi đọc/ghi dữ liệu tổ chức
  const { id } = await context.params
  return jsonResponse({ data: await listOrganizationCredits(pctx, id) })
})

const bodySchema = z.object({
  kind: z.enum(["TOPUP", "GIFT", "REFUND"]),
  amount: z.number().int(),
  reason: z.string().trim().min(1).max(300),
})

export const POST = handle(async (request, context: Ctx) => {
  const pctx = await requirePlatformContext(request)
  await recordPlatformAccess(request, pctx) // D-60: ghi trước khi đọc/ghi dữ liệu tổ chức
  const { id } = await context.params
  const parsed = bodySchema.safeParse(await request.json().catch(() => null))
  if (!parsed.success) throw validationFailed({ issues: parsed.error.issues })
  return jsonResponse({ data: await adjustOrganizationCredits(pctx, { organizationId: id, ...parsed.data }) })
})

export const dynamic = "force-dynamic" as const
export const revalidate = 0 as const
