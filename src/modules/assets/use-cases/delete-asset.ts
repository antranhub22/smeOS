import { notFound } from "@/core/http/errors"
import type { TenantContext } from "@/core/tenancy"
import type { IAssetRepository } from "../domain/repositories/asset-repository.interface"
import { getAssetRepository } from "../infra/asset-repository"

/** `DELETE /assets/:id` (`G3`, trần cứng Điều hành). */
export async function deleteAsset(
  ctx: TenantContext,
  id: string,
  repo: IAssetRepository = getAssetRepository()
): Promise<void> {
  const deleted = await repo.delete(ctx, id)
  if (!deleted) throw notFound()
}
