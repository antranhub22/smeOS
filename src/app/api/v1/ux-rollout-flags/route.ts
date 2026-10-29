import { handle, jsonResponse } from "@/core/http/response"
import { enabledUxRolloutFlagsFor } from "@/modules/platform/domain/ux-rollout-flags"
import { getUxRolloutFlags } from "@/modules/platform/infra/ux-rollout-flag-store"
import { requireTenantContext } from "@/modules/organization/use-cases/resolve-session"

/** Cờ rollout UX đang bật cho tổ chức của phiên — không trả danh sách tổ chức khác (03c E9). */
export const GET = handle(async (request) => {
  const { ctx } = await requireTenantContext(request)
  const flags = await getUxRolloutFlags()
  return jsonResponse({ data: { enabled: enabledUxRolloutFlagsFor(flags, ctx.organizationId) } })
})

export const dynamic = "force-dynamic" as const
export const revalidate = 0 as const
