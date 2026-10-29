import type { TenantContext } from "@/core/tenancy"
import { log } from "@/core/observability/log"
import { deleteAssetAndEnqueuePayloads } from "@/modules/assets/infra/payload-outbox"
import { processStorageOutbox, type OutboxSummary } from "@/modules/assets/use-cases/process-storage-outbox"
import { findExpiredTrashedAssets, type ExpiredTrashedAsset } from "../infra/expired-trash-query"

/** Số asset tối đa xoá một lượt cron (5 phút/lần) — vòng lặp luôn có giới hạn. */
const TRASH_BATCH_SIZE = 100

export type TrashSweepDeps = {
  findExpired: (now: Date, limit: number) => Promise<ExpiredTrashedAsset[]>
  remove: (ctx: TenantContext, asset: ExpiredTrashedAsset) => Promise<boolean>
}

const defaultTrashDeps: TrashSweepDeps = {
  findExpired: findExpiredTrashedAssets,
  remove: (ctx, asset) => deleteAssetAndEnqueuePayloads(ctx, asset, "trash.auto_purge"),
}

function systemContext(organizationId: string): TenantContext {
  return { organizationId, workspaceId: organizationId, userId: "cron:trash-sweep", branchId: null, capabilities: new Set() }
}

/**
 * Xoá vĩnh viễn asset quá hạn thùng rác (30 ngày, SDAGF D-03), bỏ qua asset
 * đang legal hold (lọc ở truy vấn). Thay cơ chế dọn "lười" lúc mở danh sách.
 */
export async function sweepExpiredTrash(now: Date, deps: TrashSweepDeps = defaultTrashDeps): Promise<number> {
  let removed = 0
  for (const asset of await deps.findExpired(now, TRASH_BATCH_SIZE)) {
    if (await deps.remove(systemContext(asset.organization_id), asset)) removed += 1
  }
  return removed
}

export type StorageLifecycleSummary = { trashPurged: number | null; outbox: OutboxSummary | null }

/** Một lượt vòng đời kho cho cron `/internal/chain-dispatch-sweep`. Lỗi chỉ ghi log. */
export async function sweepStorageLifecycle(now: Date = new Date()): Promise<StorageLifecycleSummary> {
  const trashPurged = await sweepExpiredTrash(now).catch((error: unknown) => {
    log.error("storage.trash_sweep_failed", { error: error instanceof Error ? error.message : String(error) })
    return null
  })
  const outbox = await processStorageOutbox(now).catch((error: unknown) => {
    log.error("storage.outbox_failed", { error: error instanceof Error ? error.message : String(error) })
    return null
  })
  return { trashPurged, outbox }
}
