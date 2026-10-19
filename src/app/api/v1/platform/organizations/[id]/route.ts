import { z } from "zod"
import { validationFailed } from "@/core/http/errors"
import { handle, jsonResponse } from "@/core/http/response"
import { requirePlatformContext } from "@/modules/platform/use-cases/resolve-platform-session"
import { getOrganization } from "@/modules/platform/use-cases/get-organization"
import { approveOrganizationModelChange } from "@/modules/platform/use-cases/approve-organization-model-change"

export const GET = handle(async (request, context: { params: Promise<{ id: string }> }) => {
  const pctx = await requirePlatformContext(request)
  const { id } = await context.params
  return jsonResponse({ data: await getOrganization(pctx, id) })
})

const patchSchema = z.object({
  target_type: z.enum(["SINGLE", "STORE", "CHAIN", "FLOWER_NETWORK"]),
  note: z.string().trim().max(500).nullish(),
})

export const PATCH = handle(async (request, context: { params: Promise<{ id: string }> }) => {
  const pctx = await requirePlatformContext(request)
  const { id } = await context.params

  const parsed = patchSchema.safeParse(await request.json().catch(() => null))
  if (!parsed.success) throw validationFailed({ issues: parsed.error.issues })

  const result = await approveOrganizationModelChange(pctx, {
    organizationId: id,
    targetType: parsed.data.target_type,
    note: parsed.data.note ?? null,
  })

  return jsonResponse({ data: result })
})

export const dynamic = "force-dynamic" as const
export const revalidate = 0 as const

