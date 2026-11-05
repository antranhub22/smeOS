import type { TenantContext } from "@/core/tenancy"
import { log } from "@/core/observability/log"
import type { AssetUsage } from "@/modules/assets/domain/asset-lifecycle"
import { findAssetUsages } from "@/modules/assets/infra/asset-usage-guard"
import { deleteAssetAndEnqueuePayloads } from "@/modules/assets/infra/payload-outbox"
import { processStorageOutbox, type OutboxSummary } from "@/modules/assets/use-cases/process-storage-outbox"
import { findExpiredTrashedAssets, type ExpiredTrashedAsset } from "../infra/expired-trash-query"

/** Số asset tối đa xoá một lượt cron (5 phút/lần) — vòng lặp luôn có giới hạn. */
const TRASH_BATCH_SIZE = 100

export type TrashSweepDeps = {
  findExpired: (now: Date, limit: number) => Promise<ExpiredTrashedAsset[]>
  remove: (ctx: TenantContext, asset: ExpiredTrashedAsset) => Promise<boolean>
  usages: (ctx: TenantContext, assetId: string) => Promise<AssetUsage[]>
}

const defaultTrashDeps: TrashSweepDeps = {
  findExpired: findExpiredTrashedAssets,
  remove: (ctx, asset) => deleteAssetAndEnqueuePayloads(ctx, asset, "trash.auto_purge"),
  usages: findAssetUsages,
}

function systemContext(organizationId: string): TenantContext {
  return { organizationId, workspaceId: organizationId, userId: "cron:trash-sweep", branchId: null, capabilities: new Set() }
}

/**
 * Xoá vĩnh viễn asset quá hạn thùng rác (30 ngày, SDAGF D-03), bỏ qua asset
 * đang legal hold (lọc ở truy vấn) và asset đang được dùng ở nơi khác. Thay
 * cơ chế dọn "lười" lúc mở danh sách.
 */
export async function sweepExpiredTrash(now: Date, deps: TrashSweepDeps = defaultTrashDeps): Promise<number> {
  let removed = 0
  for (const asset of await deps.findExpired(now, TRASH_BATCH_SIZE)) {
    const ctx = systemContext(asset.organization_id)
    // Ảnh đang được dùng (vd. chứng từ thanh toán) vẫn ở thùng rác, không xoá (SDAGF-012)
    const inUse = await deps.usages(ctx, asset.id)
    if (inUse.length > 0) {
      log.warn("storage.trash_sweep_skipped_in_use", { organizationId: asset.organization_id, assetId: asset.id, usages: inUse.join(",") })
      continue
    }
    if (await deps.remove(ctx, asset)) removed += 1
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
