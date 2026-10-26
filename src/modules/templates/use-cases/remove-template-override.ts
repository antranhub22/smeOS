import { notFound } from "@/core/http/errors"
import type { TenantContext } from "@/core/tenancy"
import type { ITemplateOverrideRepository } from "../domain/repositories/template-override-repository.interface"
import { getTemplateOverrideRepository } from "../infra/template-override-repository"

/** `DELETE /template-overrides/:templateKey/:fieldKey` (nợ #99 — trở về mặc định hệ thống). */
export async function removeTemplateOverride(
  ctx: TenantContext,
  templateKey: string,
  fieldKey: string,
  repo: ITemplateOverrideRepository = getTemplateOverrideRepository()
) {
  const removed = await repo.remove(ctx, templateKey, fieldKey)
  if (!removed) throw notFound()
}

