import { z } from "zod"
import { validationFailed } from "@/core/http/errors"
import { handle, jsonResponse } from "@/core/http/response"
import { requirePlatformContext } from "@/modules/platform/use-cases/resolve-platform-session"
import { getOrganization } from "@/modules/platform/use-cases/get-organization"
import { approveOrganizationModelChange } from "@/modules/platform/use-cases/approve-organization-model-change"
import type { Prisma } from "@/generated/prisma/client"

export const GET = handle(async (request, context: { params: Promise<{ id: string }> }) => {
  const pctx = await requirePlatformContext(request)
  const { id } = await context.params
  return jsonResponse({ data: await getOrganization(pctx, id) })
})

const patchSchema = z.object({
  target_type: z.enum(["SINGLE", "STORE", "CHAIN", "FLOWER_NETWORK"]).optional(),
  note: z.string().trim().max(500).nullish(),
  unlocked_locales: z.array(z.string().trim()).optional(),
  /** Từ chối yêu cầu mở khóa ngôn ngữ — xóa pending field khỏi settings */
  clear_pending_language_unlock: z.boolean().optional(),
  /** Từ chối yêu cầu chuyển đổi mô hình — xóa pending field khỏi settings */
  clear_pending_model_change: z.boolean().optional(),
})

export const PATCH = handle(async (request, context: { params: Promise<{ id: string }> }) => {
  const pctx = await requirePlatformContext(request)
  const { id } = await context.params

  const parsed = patchSchema.safeParse(await request.json().catch(() => null))
  if (!parsed.success) throw validationFailed({ issues: parsed.error.issues })

  let result: unknown = { success: true }

  if (parsed.data.target_type) {
    result = await approveOrganizationModelChange(pctx, {
      organizationId: id,
      targetType: parsed.data.target_type,
      note: parsed.data.note ?? null,
    })
  }

  if (parsed.data.unlocked_locales) {
    const { updateOrganizationUnlockedLocales } = await import(
      "@/modules/platform/use-cases/update-organization-unlocked-locales"
    )
    result = await updateOrganizationUnlockedLocales(pctx, {
      organizationId: id,
      unlockedLocales: parsed.data.unlocked_locales,
    })
  }

  if (parsed.data.clear_pending_language_unlock) {
    const { prisma } = await import("@/core/tenancy/infra/prisma")
    const org = await prisma.organizations.findUnique({ where: { id }, select: { settings: true } })
    if (org) {
      const settings = (org.settings as Record<string, unknown> | null) ?? {}
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { pending_language_unlock: _, ...rest } = settings
      await prisma.organizations.update({
        where: { id },
        data: { settings: rest as unknown as Prisma.InputJsonValue },
      })
    }
    result = { success: true, action: "clear_pending_language_unlock" }
  }

  if (parsed.data.clear_pending_model_change) {
    const { prisma } = await import("@/core/tenancy/infra/prisma")
    const org = await prisma.organizations.findUnique({ where: { id }, select: { settings: true } })
    if (org) {
      const settings = (org.settings as Record<string, unknown> | null) ?? {}
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { pending_model_change: _, ...rest } = settings
      await prisma.organizations.update({
        where: { id },
        data: { settings: rest as unknown as Prisma.InputJsonValue },
      })
    }
    result = { success: true, action: "clear_pending_model_change" }
  }

  return jsonResponse({ data: result })
})


export const dynamic = "force-dynamic" as const
export const revalidate = 0 as const

