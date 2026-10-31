/**
 * Tải ảnh khảo sát của một cửa hàng từ Drive vào kho, khoá
 * `platform/partner-stores/<storeId>/<driveId>.<ext>`. Kiểm nội dung trước khi ghi;
 * ảnh đã có trong kho (cùng Drive id) không tải lại.
 */
import type { StorageProvider } from "@/core/ports/storage-provider"
import { checkUploadContent } from "@/modules/assets/domain/upload-content-rules"
import type { GoogleWorkspaceClient } from "../adapters/google-workspace-client"
import type { MarketplacePhotoState } from "../domain/repositories/partner-marketplace-repository.interface"

export const MAX_PHOTOS_PER_STORE = 12
export const MAX_PHOTO_BYTES = 15 * 1024 * 1024
const EXTENSIONS = ["jpg", "png", "webp"] as const

export function partnerPhotoKeyPrefix(storeId: string): string {
  return `platform/partner-stores/${storeId}/`
}

export async function downloadStorePhotos(
  store: MarketplacePhotoState,
  deps: { storage: StorageProvider; google: GoogleWorkspaceClient }
): Promise<{ photoKeys: string[]; downloaded: number; failed: number }> {
  const prefix = partnerPhotoKeyPrefix(store.id)
  const photoKeys: string[] = []
  let downloaded = 0
  let failed = 0
  for (const driveId of store.driveImageIds.slice(0, MAX_PHOTOS_PER_STORE)) {
    const reused = store.photoKeys.find((k) => k.startsWith(`${prefix}${driveId}.`))
    if (reused) {
      photoKeys.push(reused)
      continue
    }
    try {
      const bytes = await deps.google.downloadDriveFile(driveId, MAX_PHOTO_BYTES)
      const key = bytes && EXTENSIONS.map((ext) => `${prefix}${driveId}.${ext}`).find((k) => checkUploadContent(k, bytes).ok)
      if (!bytes || !key) {
        failed++
        continue
      }
      const check = checkUploadContent(key, bytes)
      await deps.storage.put(key, bytes, check.ok ? check.contentType : "application/octet-stream")
      photoKeys.push(key)
      downloaded++
    } catch {
      failed++
    }
  }
  return { photoKeys, downloaded, failed }
}
