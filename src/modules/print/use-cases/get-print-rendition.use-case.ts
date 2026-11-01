import type { TenantContext } from "@/core/tenancy/tenant-context"
import type { PrintRendition } from "../domain/print-rendition"
import type { IPrintRenditionRepository } from "../domain/repositories/print-rendition-repository.interface"
import { getPrintRenditionRepository } from "../infra/print-rendition-repository"

export async function getPrintRenditionUseCase(
  ctx: TenantContext,
  id: string,
  repo: IPrintRenditionRepository = getPrintRenditionRepository()
): Promise<PrintRendition | null> {
  return repo.findById(ctx, id)
}

