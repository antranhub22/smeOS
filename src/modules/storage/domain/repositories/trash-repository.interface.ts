import type { TenantContext } from "@/core/tenancy"
import type { TrashItem, TrashItemType } from "../trash-types"

export interface ITrashRepository {
  listTrash(ctx: TenantContext): Promise<TrashItem[]>
  moveToTrash(
    ctx: TenantContext,
    input: { id: string; type: TrashItemType; userId?: string | null | undefined }
  ): Promise<boolean>
  restoreFromTrash(
    ctx: TenantContext,
    input: { id: string; type: TrashItemType }
  ): Promise<boolean>
  permanentDelete(
    ctx: TenantContext,
    input: { id: string; type: TrashItemType }
  ): Promise<boolean>
}
