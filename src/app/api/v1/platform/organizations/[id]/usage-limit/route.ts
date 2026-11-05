/** PUT /api/v1/platform/organizations/:id/usage-limit (`N3`) — `{ monthlyLimit: number | null }`, checklist ALG 10.3. */
import { z } from "zod"
import { validationFailed } from "@/core/http/errors"
import { handle, jsonResponse } from "@/core/http/response"
import { requirePlatformContext } from "@/modules/platform/use-cases/resolve-platform-session"
import { setOrganizationMonthlyLimit } from "@/modules/platform/use-cases/manage-credits"

const bodySchema = z.object({ monthlyLimit: z.number().int().nullable() })

export const PUT = handle(async (request, context: { params: Promise<{ id: string }> }) => {
  const pctx = await requirePlatformContext(request)
  const { id } = await context.params
  const parsed = bodySchema.safeParse(await request.json().catch(() => null))
  if (!parsed.success) throw validationFailed({ issues: parsed.error.issues })
  return jsonResponse({ data: await setOrganizationMonthlyLimit(pctx, id, parsed.data.monthlyLimit) })
})

export const dynamic = "force-dynamic" as const
export const revalidate = 0 as const
