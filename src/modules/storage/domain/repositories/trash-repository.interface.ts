import type { TenantContext } from "@/core/tenancy"
import type { TrashItem, TrashItemType } from "../trash-types"

/** `legal_hold`: asset đang được giữ theo yêu cầu pháp lý (SDAGF D-04). */
export type TrashDeleteResult = "deleted" | "not_found" | "legal_hold"

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
  ): Promise<TrashDeleteResult>
}
