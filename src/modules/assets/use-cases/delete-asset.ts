import { notFound } from "@/core/http/errors"
import type { TenantContext } from "@/core/tenancy"
import type { IAssetRepository } from "../domain/repositories/asset-repository.interface"
import { getAssetRepository } from "../infra/asset-repository"
import { purgeAssetPayloads } from "./purge-asset-payloads"

/** `DELETE /assets/:id` (`G3`, trần cứng Điều hành). Xoá dòng rồi dọn payload không còn ai trỏ tới. */
export async function deleteAsset(
  ctx: TenantContext,
  id: string,
  repo: IAssetRepository = getAssetRepository(),
  purge: typeof purgeAssetPayloads = purgeAssetPayloads
): Promise<void> {
  const asset = await repo.findById(ctx, id)
  if (!asset) throw notFound()
  const deleted = await repo.delete(ctx, id)
  if (!deleted) throw notFound()
  await purge(ctx, asset)
}
