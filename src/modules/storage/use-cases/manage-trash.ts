import { AppError, notFound } from "@/core/http/errors"
import type { TenantContext } from "@/core/tenancy"
import type { ITrashRepository } from "../domain/repositories/trash-repository.interface"
import { getTrashRepository } from "../infra/trash-repository"
import type { TrashItem, TrashItemType } from "../domain/trash-types"

export function requireExecutiveRole(ctx: TenantContext) {
  // G3 (asset.delete) và L4 (product.archive) đều có trần cứng bắt buộc duy nhất là dieu_hanh
  const isExecutive =
    ctx.capabilities.has("G3") ||
    ctx.capabilities.has("L4") ||
    ctx.capabilities.has("A3") ||
    ctx.capabilities.has("B6")

  if (!isExecutive) {
    throw new AppError("CAPABILITY_DENIED", "Chỉ tài khoản có vai trò Điều hành mới có quyền quản lý xóa/khôi phục thùng rác")
  }
}

export async function getTrashList(
  ctx: TenantContext,
  repo: ITrashRepository = getTrashRepository()
): Promise<TrashItem[]> {
  requireExecutiveRole(ctx)
  return repo.listTrash(ctx)
}

export async function moveToTrash(
  ctx: TenantContext,
  input: { id: string; type: TrashItemType },
  repo: ITrashRepository = getTrashRepository()
): Promise<void> {
  requireExecutiveRole(ctx)
  const ok = await repo.moveToTrash(ctx, { ...input, userId: ctx.userId })
  if (!ok) throw notFound()
}

export async function restoreFromTrash(
  ctx: TenantContext,
  input: { id: string; type: TrashItemType },
  repo: ITrashRepository = getTrashRepository()
): Promise<void> {
  requireExecutiveRole(ctx)
  const ok = await repo.restoreFromTrash(ctx, input)
  if (!ok) throw notFound()
}

export async function permanentDelete(
  ctx: TenantContext,
  input: { id: string; type: TrashItemType },
  repo: ITrashRepository = getTrashRepository()
): Promise<void> {
  requireExecutiveRole(ctx)
  const ok = await repo.permanentDelete(ctx, input)
  if (!ok) throw notFound()
}

