import { handle, jsonResponse } from "@/core/http/response"
import { validationFailed } from "@/core/http/errors"
import { requirePlatformContext } from "@/modules/platform/use-cases/resolve-platform-session"
import { requirePlatformCapability } from "@/core/platform/platform-capabilities"
import { recordPlatformAuditLog } from "@/modules/platform/infra/platform-audit-repository"
import { isGovernanceSystem, parseDecisions, validateDecisions } from "@/modules/organization/domain/governance-decisions"
import { getMotherGovernance, saveMotherGovernance } from "@/modules/organization/infra/governance-decisions-repository"

function systemFrom(request: Request) {
  const system = new URL(request.url).searchParams.get("system")
  if (!isGovernanceSystem(system)) throw validationFailed({ reason: "Thiếu hoặc sai loại ma trận" })
  return system
}

export const GET = handle(async (request) => {
  await requirePlatformContext(request)
  const system = systemFrom(request)
  return jsonResponse({ data: { system, tier: "MOTHER", own: await getMotherGovernance(system), upper: [] } })
})

/** Quyết định của tầng Mẹ áp xuống MỌI tổ chức — cần mã quản trị cấu hình N12. */
export const PUT = handle(async (request) => {
  const pctx = await requirePlatformContext(request)
  requirePlatformCapability(pctx, "N12")
  const system = systemFrom(request)
  const body = (await request.json().catch(() => null)) as { decisions?: unknown } | null
  const next = parseDecisions(body?.decisions)
  const violations = validateDecisions(next, "MOTHER", [])
  if (violations.length > 0) throw validationFailed({ violations })
  const before = await getMotherGovernance(system)
  await saveMotherGovernance(system, next, pctx.userId)
  try {
    await recordPlatformAuditLog(pctx, {
      action: "platform.governance_matrix.update",
      entityType: "GOVERNANCE_MATRIX",
      entityId: system,
      before,
      after: next,
    })
  } catch {
    // Không làm gián đoạn việc lưu nếu audit log ghi lỗi
  }
  return jsonResponse({ data: { system, tier: "MOTHER", own: next, upper: [] } })
})

export const dynamic = "force-dynamic" as const
