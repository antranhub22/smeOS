import { notFound, validationFailed } from "@/core/http/errors"
import { requirePlatformCapability } from "@/core/platform/platform-capabilities"
import type { PlatformContext } from "@/core/platform/platform-context"
import { setLegalHoldUntil, setOrganizationLegalHoldUntil } from "@/modules/assets/infra/legal-hold"
import { recordPlatformAuditLog } from "@/modules/platform/infra/platform-audit-repository"

export type SetLegalHoldDeps = {
  setHold: typeof setLegalHoldUntil
  audit: typeof recordPlatformAuditLog
}

const defaultDeps: SetLegalHoldDeps = { setHold: setLegalHoldUntil, audit: recordPlatformAuditLog }

function requireFutureOrNull(until: Date | null, now: Date): void {
  if (until && until.getTime() <= now.getTime()) {
    throw validationFailed({ until: "Hạn giữ phải ở tương lai" })
  }
}

/**
 * SDAGF D-04: chỉ Platform Ops có `N14` được đặt/gỡ legal hold; luôn kèm lý
 * do và ghi nhật ký nền tảng. `until = null` là gỡ giữ.
 */
export async function setAssetLegalHold(
  pctx: PlatformContext,
  input: { organizationId: string; assetId: string; until: Date | null; reason: string },
  deps: SetLegalHoldDeps = defaultDeps,
  now: Date = new Date()
): Promise<{ legal_hold_until: string | null }> {
  requirePlatformCapability(pctx, "N14")
  requireFutureOrNull(input.until, now)
  const result = await deps.setHold(input.organizationId, input.assetId, input.until)
  if (!result) throw notFound()
  await deps.audit(pctx, {
    action: input.until ? "asset.legal_hold.set" : "asset.legal_hold.release",
    entityType: "asset",
    entityId: input.assetId,
    before: { legal_hold_until: result.before?.toISOString() ?? null },
    after: {
      organization_id: input.organizationId,
      legal_hold_until: input.until?.toISOString() ?? null,
      reason: input.reason,
    },
  })
  return { legal_hold_until: input.until?.toISOString() ?? null }
}

export type SetOrganizationLegalHoldDeps = {
  setHold: typeof setOrganizationLegalHoldUntil
  audit: typeof recordPlatformAuditLog
}

/** Legal hold cấp tổ chức — chặn mọi xoá vĩnh viễn của tổ chức (D-04). */
export async function setOrganizationLegalHold(
  pctx: PlatformContext,
  input: { organizationId: string; until: Date | null; reason: string },
  deps: SetOrganizationLegalHoldDeps = { setHold: setOrganizationLegalHoldUntil, audit: recordPlatformAuditLog },
  now: Date = new Date()
): Promise<{ legal_hold_until: string | null }> {
  requirePlatformCapability(pctx, "N14")
  requireFutureOrNull(input.until, now)
  const result = await deps.setHold(input.organizationId, input.until)
  if (!result) throw notFound()
  await deps.audit(pctx, {
    action: input.until ? "organization.legal_hold.set" : "organization.legal_hold.release",
    entityType: "organization",
    entityId: input.organizationId,
    before: { legal_hold_until: result.before?.toISOString() ?? null },
    after: { legal_hold_until: input.until?.toISOString() ?? null, reason: input.reason },
  })
  return { legal_hold_until: input.until?.toISOString() ?? null }
}
