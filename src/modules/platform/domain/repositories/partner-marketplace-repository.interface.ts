import type { PartnerStoreProfile } from "../partner-marketplace-row-mapper"
import type { SearchableEntry } from "../partner-marketplace-filter"

export type { ListMarketplaceStoresFilter, ListMarketplaceStoresResult } from "../partner-marketplace-filter"

export type MarketplaceImportSource = "SHEET" | "EXCEL" | "SEED"

export interface MarketplacePhotoState {
  id: string
  driveImageIds: string[]
  photoKeys: string[]
  photoSourceIds: string[]
}

/** Port lưu hồ sơ chợ đối tác (bảng cấp nền tảng `partner_marketplace_stores`). */
export interface IPartnerMarketplaceRepository {
  /** Mọi hồ sơ kèm chuỗi tìm kiếm; `photoKeys` là khoá kho (chưa ký). */
  listAll(): Promise<(SearchableEntry & { photoKeys: string[] })[]>
  /** Upsert theo khoá khớp tên; giữ id và ảnh đã tải. */
  upsertMany(profiles: PartnerStoreProfile[], source: MarketplaceImportSource): Promise<{ added: number; updated: number; total: number }>
  /** Hồ sơ có ảnh Drive chưa tải (hoặc danh sách Drive đã đổi), tối đa `limit`. */
  listPhotoPending(limit: number): Promise<{ items: MarketplacePhotoState[]; remaining: number }>
  setPhotos(id: string, photoKeys: string[], photoSourceIds: string[]): Promise<void>
}
