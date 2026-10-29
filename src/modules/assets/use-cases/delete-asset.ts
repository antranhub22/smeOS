import { conflict, notFound } from "@/core/http/errors"
import type { TenantContext } from "@/core/tenancy"
import { isUnderLegalHold } from "../domain/asset-lifecycle"
import type { IAssetRepository } from "../domain/repositories/asset-repository.interface"
import { getAssetRepository } from "../infra/asset-repository"
import { organizationLegalHoldUntil } from "../infra/legal-hold"
import { deleteAssetAndEnqueuePayloads } from "../infra/payload-outbox"

export const LEGAL_HOLD_MESSAGE = "Ảnh đang được giữ lại theo yêu cầu pháp lý nên chưa xoá được"

export type DeleteAssetDeps = {
  remove: typeof deleteAssetAndEnqueuePayloads
  organizationHoldUntil: (organizationId: string) => Promise<Date | null>
  now: Date
}

/**
 * `DELETE /assets/:id` (`G3`, trần cứng Điều hành). Xoá dòng và ghi hàng đợi
 * xoá payload trong một transaction; cron xoá tệp sau (SDAGF P1). Legal hold
 * của asset hoặc của cả tổ chức chặn xoá (D-04).
 */
export async function deleteAsset(
  ctx: TenantContext,
  id: string,
  repo: IAssetRepository = getAssetRepository(),
  deps: Partial<DeleteAssetDeps> = {}
): Promise<void> {
  const { remove = deleteAssetAndEnqueuePayloads, organizationHoldUntil = organizationLegalHoldUntil, now = new Date() } = deps
  const asset = await repo.findById(ctx, id)
  if (!asset) throw notFound()
  const orgHold = await organizationHoldUntil(ctx.organizationId)
  if (isUnderLegalHold(asset, now) || isUnderLegalHold({ legal_hold_until: orgHold }, now)) {
    throw conflict(LEGAL_HOLD_MESSAGE)
  }
  if (!(await remove(ctx, asset, "asset.delete"))) throw notFound()
}
