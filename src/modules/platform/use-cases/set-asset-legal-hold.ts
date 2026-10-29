import { notFound, validationFailed } from "@/core/http/errors"
import { requirePlatformCapability } from "@/core/platform/platform-capabilities"
import type { PlatformContext } from "@/core/platform/platform-context"
import { setLegalHoldUntil } from "@/modules/assets/infra/legal-hold"
import { recordPlatformAuditLog } from "@/modules/platform/infra/platform-audit-repository"

export type SetLegalHoldDeps = {
  setHold: typeof setLegalHoldUntil
  audit: typeof recordPlatformAuditLog
}

const defaultDeps: SetLegalHoldDeps = { setHold: setLegalHoldUntil, audit: recordPlatformAuditLog }

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
  if (input.until && input.until.getTime() <= now.getTime()) {
    throw validationFailed({ until: "Hạn giữ phải ở tương lai" })
  }
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
