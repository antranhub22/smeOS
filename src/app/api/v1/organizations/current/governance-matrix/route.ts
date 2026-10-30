import { handle, jsonResponse } from "@/core/http/response"
import { validationFailed } from "@/core/http/errors"
import { requireCapability } from "@/core/rbac/capabilities"
import { requireTenantContext } from "@/modules/organization/use-cases/resolve-session"
import { isGovernanceSystem } from "@/modules/organization/domain/governance-decisions"
import { getGovernanceMatrix, saveGovernanceMatrix } from "@/modules/organization/use-cases/governance-matrix"

function systemFrom(request: Request) {
  const system = new URL(request.url).searchParams.get("system")
  if (!isGovernanceSystem(system)) throw validationFailed({ reason: "Thiếu hoặc sai loại ma trận" })
  return system
}

export const GET = handle(async (request) => {
  const { ctx } = await requireTenantContext(request)
  requireCapability(ctx, "F1")
  return jsonResponse({ data: await getGovernanceMatrix(ctx, systemFrom(request)) })
})

export const PUT = handle(async (request) => {
  const { ctx } = await requireTenantContext(request)
  requireCapability(ctx, "F2")
  const system = systemFrom(request)
  const body = (await request.json().catch(() => null)) as { decisions?: unknown } | null
  return jsonResponse({ data: await saveGovernanceMatrix(ctx, system, body?.decisions) })
})

export const dynamic = "force-dynamic" as const
