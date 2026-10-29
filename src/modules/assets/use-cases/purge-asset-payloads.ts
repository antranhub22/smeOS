import type { StorageProvider } from "@/core/ports"
import type { TenantContext } from "@/core/tenancy"
import { log } from "@/core/observability/log"
import { env } from "@/lib/env"
import { getStorageProvider } from "@/modules/assets/adapters/storage-provider-factory"
import { payloadKeysToPurge } from "@/modules/assets/domain/payload-deletion"
import { countPayloadReferences } from "@/modules/assets/infra/payload-references"

export type PurgeDeps = {
  storage: Pick<StorageProvider, "delete">
  countReferences: (ctx: TenantContext, key: string) => Promise<number>
}

/** Tắt mặc định cho tới khi kho R2 có bản sao (SDAGF D-06, roadmap P1-4):
 *  xoá nhầm payload khi chưa có backup là không khôi phục được. */
function defaultDeps(): PurgeDeps | null {
  if (env.STORAGE_DELETE_PAYLOADS !== "enabled") return null
  return {
    storage: getStorageProvider(),
    countReferences: countPayloadReferences,
  }
}

/**
 * Gọi SAU khi dòng `assets` đã xoá vĩnh viễn. Xoá payload (và thumbnail)
 * không còn bản ghi nào trỏ tới. Best-effort: lỗi kho chỉ ghi log, không làm
 * hỏng thao tác xoá của người dùng — tệp sót lại do job đối soát dọn (P2).
 */
export async function purgeAssetPayloads(
  ctx: TenantContext,
  asset: { id: string; storage_key: string; thumb_key: string | null },
  deps: PurgeDeps | null = defaultDeps()
): Promise<void> {
  if (!deps) return
  for (const key of payloadKeysToPurge(ctx.organizationId, asset)) {
    try {
      if ((await deps.countReferences(ctx, key)) > 0) continue
      await deps.storage.delete(key)
    } catch (err: unknown) {
      log.warn("storage.payload_purge_failed", {
        organizationId: ctx.organizationId,
        assetId: asset.id,
        error: err instanceof Error ? err.message : String(err),
      })
    }
  }
}
