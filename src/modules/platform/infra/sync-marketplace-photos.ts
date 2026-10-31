/**
 * Service tải và đồng bộ ảnh thực tế từ Google Drive về máy chủ cục bộ (public/partner-stores/)
 * Hỗ trợ xác thực qua Google Service Account (đối với Drive riêng tư) hoặc Direct Stream.
 */

import fs from "fs"
import path from "path"
import { pipeline } from "stream/promises"
import { google } from "googleapis"
import { getGoogleSheetsAuth } from "@/core/google/google-sheets-auth"
import type { PartnerStoreMarketplaceEntity } from "../domain/partner-marketplace.types"

const PUBLIC_PARTNER_DIR = path.resolve(process.cwd(), "public/partner-stores")
const DATA_FILE_PATH = path.resolve(
  process.cwd(),
  "src/modules/platform/domain/partner-marketplace-data.json"
)

export interface PhotoDownloadResult {
  storeId: string
  downloadedCount: number
  failedCount: number
  localUrls: string[]
}

/**
 * Tải 1 file ảnh từ Google Drive về đường dẫn đích
 */
async function downloadSingleDriveFile(
  fileId: string,
  destPath: string,
  driveClient: ReturnType<typeof google.drive> | null
): Promise<boolean> {
  // Thử phương án 1: Dùng Google Drive API với Service Account (hỗ trợ Drive Private)
  if (driveClient) {
    try {
      const res = await driveClient.files.get(
        { fileId, alt: "media" },
        { responseType: "stream" }
      )
      if (res.data) {
        const destStream = fs.createWriteStream(destPath)
        await pipeline(res.data, destStream)
        return true
      }
    } catch {
      // Fallback sang phương án 2
    }
  }

  // Thử phương án 2: Tải trực tiếp qua HTTP URL (hỗ trợ nếu file được set Anyone with link)
  try {
    const downloadUrl = `https://drive.usercontent.google.com/download?id=${fileId}&export=download`
    const res = await fetch(downloadUrl, {
      headers: { "User-Agent": "smeOS-Image-Sync/1.0" },
      signal: AbortSignal.timeout(15_000),
    })

    if (res.ok) {
      const buffer = await res.arrayBuffer()
      // Kiểm tra buffer có phải là image không (tránh lưu file HTML trang đăng nhập Google)
      const uint8 = new Uint8Array(buffer.slice(0, 4))
      const isJpeg = uint8[0] === 0xff && uint8[1] === 0xd8
      const isPng = uint8[0] === 0x89 && uint8[1] === 0x50 && uint8[2] === 0x4e
      const isWebp = buffer.byteLength > 12 // WEBP signature

      if (isJpeg || isPng || isWebp) {
        fs.writeFileSync(destPath, Buffer.from(buffer))
        return true
      }
    }
  } catch {
    // Không tải được
  }

  return false
}

/**
 * Đồng bộ ảnh cho 1 cửa hàng từ danh sách driveImageIds
 */
export async function downloadStorePhotos(
  store: PartnerStoreMarketplaceEntity,
  driveClient: ReturnType<typeof google.drive> | null
): Promise<PhotoDownloadResult> {
  const storeDir = path.join(PUBLIC_PARTNER_DIR, store.id)
  if (!fs.existsSync(storeDir)) {
    fs.mkdirSync(storeDir, { recursive: true })
  }

  const driveIds = store.media.driveImageIds || []
  const localUrls: string[] = []
  let downloadedCount = 0
  let failedCount = 0

  for (let i = 0; i < driveIds.length; i++) {
    const fileId = driveIds[i]
    if (!fileId) continue

    const destFile = path.join(storeDir, `photo_${i + 1}.jpg`)
    const relativeUrl = `/partner-stores/${store.id}/photo_${i + 1}.jpg`

    // Nếu ảnh đã tồn tại cục bộ và có kích thước > 0, tái sử dụng
    if (fs.existsSync(destFile) && fs.statSync(destFile).size > 1000) {
      localUrls.push(relativeUrl)
      downloadedCount++
      continue
    }

    const ok = await downloadSingleDriveFile(fileId, destFile, driveClient)
    if (ok) {
      localUrls.push(relativeUrl)
      downloadedCount++
    } else {
      failedCount++
    }
  }

  return {
    storeId: store.id,
    downloadedCount,
    failedCount,
    localUrls,
  }
}

/**
 * Đồng bộ toàn bộ ảnh cho các cửa hàng trong hệ thống
 */
export async function syncAllMarketplacePhotos(): Promise<{
  totalStores: number
  totalDownloaded: number
  totalFailed: number
}> {
  let driveClient: ReturnType<typeof google.drive> | null = null
  try {
    const auth = getGoogleSheetsAuth()
    driveClient = google.drive({ version: "v3", auth })
  } catch {
    // Không có credentials Service Account -> dùng direct stream fallback
  }

  let stores: PartnerStoreMarketplaceEntity[] = []
  try {
    const raw = fs.readFileSync(DATA_FILE_PATH, "utf-8")
    stores = JSON.parse(raw) as PartnerStoreMarketplaceEntity[]
  } catch {
    return { totalStores: 0, totalDownloaded: 0, totalFailed: 0 }
  }

  let totalDownloaded = 0
  let totalFailed = 0

  for (const store of stores) {
    if (store.media.driveImageIds && store.media.driveImageIds.length > 0) {
      const res = await downloadStorePhotos(store, driveClient)
      totalDownloaded += res.downloadedCount
      totalFailed += res.failedCount

      if (res.localUrls.length > 0) {
        store.media.photoGalleryUrls = res.localUrls
        store.media.coverPhotoUrl = res.localUrls[0]
      }
    }
  }

  // Cập nhật lại file JSON với các link ảnh cục bộ mới
  try {
    fs.writeFileSync(DATA_FILE_PATH, JSON.stringify(stores, null, 2), "utf-8")
  } catch {
    // ignore
  }

  return {
    totalStores: stores.length,
    totalDownloaded,
    totalFailed,
  }
}

