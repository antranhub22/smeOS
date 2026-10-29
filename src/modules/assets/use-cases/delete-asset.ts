import { conflict, notFound } from "@/core/http/errors"
import type { TenantContext } from "@/core/tenancy"
import { isUnderLegalHold } from "../domain/asset-lifecycle"
import type { IAssetRepository } from "../domain/repositories/asset-repository.interface"
import { getAssetRepository } from "../infra/asset-repository"
import { deleteAssetAndEnqueuePayloads } from "../infra/payload-outbox"

export const LEGAL_HOLD_MESSAGE = "Ảnh đang được giữ lại theo yêu cầu pháp lý nên chưa xoá được"

/**
 * `DELETE /assets/:id` (`G3`, trần cứng Điều hành). Xoá dòng và ghi hàng đợi
 * xoá payload trong một transaction; cron xoá tệp sau (SDAGF P1).
 */
export async function deleteAsset(
  ctx: TenantContext,
  id: string,
  repo: IAssetRepository = getAssetRepository(),
  remove: typeof deleteAssetAndEnqueuePayloads = deleteAssetAndEnqueuePayloads,
  now: Date = new Date()
): Promise<void> {
  const asset = await repo.findById(ctx, id)
  if (!asset) throw notFound()
  if (isUnderLegalHold(asset, now)) throw conflict(LEGAL_HOLD_MESSAGE)
  if (!(await remove(ctx, asset, "asset.delete"))) throw notFound()
}
