/**
 * Chợ đối tác (SaaS Mẹ): xem cần `N1`; đồng bộ Sheet / nhập Excel / tải ảnh cần
 * `N17` và luôn ghi nhật ký nền tảng. Ảnh chỉ phát qua URL ký có hạn.
 */
import { unprocessable } from "@/core/http/errors"
import { requirePlatformCapability } from "@/core/platform/platform-capabilities"
import type { PlatformContext } from "@/core/platform/platform-context"
import type { StorageProvider } from "@/core/ports/storage-provider"
import { getStorageProvider } from "@/modules/assets/adapters/storage-provider-factory"
import { recordPlatformAuditLog } from "../infra/platform-audit-repository"
import { getPartnerMarketplaceRepository } from "../infra/partner-marketplace-repository"
import { parseMarketplaceWorkbook } from "../infra/parse-marketplace-excel"
import { GoogleWorkspaceError, getGoogleWorkspaceClient, type GoogleWorkspaceClient } from "../adapters/google-workspace-client"
import { filterMarketplaceStores, type ListMarketplaceStoresFilter, type ListMarketplaceStoresResult } from "../domain/partner-marketplace-filter"
import { rowsToProfiles } from "../domain/partner-marketplace-row-mapper"
import type { IPartnerMarketplaceRepository, MarketplaceImportSource } from "../domain/repositories/partner-marketplace-repository.interface"
import { downloadStorePhotos } from "./partner-marketplace-photos"

export type MarketplaceDeps = {
  repo: IPartnerMarketplaceRepository
  storage: StorageProvider
  google: GoogleWorkspaceClient
  audit: typeof recordPlatformAuditLog
  env: Readonly<Record<string, string | undefined>>
}

function defaultDeps(): MarketplaceDeps {
  return {
    repo: getPartnerMarketplaceRepository(),
    storage: getStorageProvider(),
    google: getGoogleWorkspaceClient(),
    audit: recordPlatformAuditLog,
    env: process.env,
  }
}

/** Hạn URL ảnh trả cho trình duyệt. */
export const PHOTO_URL_TTL_SECONDS = 3600

export async function listMarketplaceStores(
  pctx: PlatformContext,
  filter: ListMarketplaceStoresFilter = {},
  deps: Pick<MarketplaceDeps, "repo" | "storage"> = defaultDeps()
): Promise<ListMarketplaceStoresResult> {
  requirePlatformCapability(pctx, "N1")
  const entries = await deps.repo.listAll()
  const keysById = new Map(entries.map((e) => [e.store.id, e.photoKeys]))
  const result = filterMarketplaceStores(entries, filter)
  const stores = await Promise.all(
    result.stores.map(async (store) => {
      const keys = keysById.get(store.id) ?? []
      const urls = await Promise.all(keys.map((k) => deps.storage.signedUrl(k, PHOTO_URL_TTL_SECONDS, "GET")))
      return { ...store, media: { ...store.media, photoGalleryUrls: urls, coverPhotoUrl: urls[0] } }
    })
  )
  return { ...result, stores }
}

export type ImportSummary = { added: number; updated: number; total: number; skipped: number }

async function importRows(
  pctx: PlatformContext,
  rows: string[][],
  source: MarketplaceImportSource,
  deps: Pick<MarketplaceDeps, "repo" | "audit">
): Promise<ImportSummary> {
  const { profiles, skipped } = rowsToProfiles(rows)
  if (profiles.length === 0) throw unprocessable("Không có dòng khảo sát nào có tên cửa hàng")
  const result = await deps.repo.upsertMany(profiles, source)
  await deps.audit(pctx, {
    action: source === "SHEET" ? "platform.marketplace.sync_sheet" : "platform.marketplace.import_excel",
    entityType: "partner_marketplace_stores",
    entityId: "*",
    after: { ...result, skipped },
  })
  return { ...result, skipped }
}

export async function syncMarketplaceFromSheet(pctx: PlatformContext, deps: MarketplaceDeps = defaultDeps()): Promise<ImportSummary> {
  requirePlatformCapability(pctx, "N17")
  const sheetId = deps.env.PARTNER_SURVEY_SHEET_ID
  if (!sheetId) throw unprocessable("Chưa cấu hình Google Sheet khảo sát đối tác")
  let rows: string[][]
  try {
    rows = await deps.google.readSheet(sheetId, deps.env.PARTNER_SURVEY_SHEET_GID || undefined)
  } catch (err) {
    if (err instanceof GoogleWorkspaceError) throw unprocessable(`Không đọc được Google Sheet: ${err.message}`)
    throw err
  }
  return importRows(pctx, rows, "SHEET", deps)
}

export const MAX_EXCEL_BYTES = 10 * 1024 * 1024

export async function importMarketplaceExcel(
  pctx: PlatformContext,
  file: { name: string; bytes: Uint8Array },
  deps: Pick<MarketplaceDeps, "repo" | "audit"> = defaultDeps()
): Promise<ImportSummary> {
  requirePlatformCapability(pctx, "N17")
  if (!/\.(xlsx|xls|csv)$/i.test(file.name)) throw unprocessable("Chỉ nhận tệp .xlsx, .xls hoặc .csv")
  if (file.bytes.length === 0 || file.bytes.length > MAX_EXCEL_BYTES) throw unprocessable("Tệp trống hoặc vượt quá 10 MB")
  const rows = parseMarketplaceWorkbook(file.bytes)
  if (!rows || rows.length < 2) throw unprocessable("Không đọc được tệp, hoặc tệp chỉ có dòng tiêu đề")
  return importRows(pctx, rows, "EXCEL", deps)
}

/** Số cửa hàng xử lý mỗi lần bấm — giữ request trong giới hạn thời gian. */
export const PHOTO_STORES_PER_RUN = 8

export async function syncMarketplacePhotos(
  pctx: PlatformContext,
  deps: MarketplaceDeps = defaultDeps()
): Promise<{ stores: number; downloaded: number; failed: number; remaining: number }> {
  requirePlatformCapability(pctx, "N17")
  const { items, remaining } = await deps.repo.listPhotoPending(PHOTO_STORES_PER_RUN)
  let downloaded = 0
  let failed = 0
  for (const store of items) {
    const res = await downloadStorePhotos(store, deps)
    downloaded += res.downloaded
    failed += res.failed
    // Đánh dấu đã xử lý cả khi có ảnh lỗi — tránh lặp mãi một cửa hàng; ảnh lỗi báo qua `failed`.
    await deps.repo.setPhotos(store.id, res.photoKeys, store.driveImageIds)
  }
  const summary = { stores: items.length, downloaded, failed, remaining }
  await deps.audit(pctx, {
    action: "platform.marketplace.sync_photos",
    entityType: "partner_marketplace_stores",
    entityId: "*",
    after: summary,
  })
  return summary
}
