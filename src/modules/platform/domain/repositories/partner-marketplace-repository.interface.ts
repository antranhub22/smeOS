import type { PartnerStoreMarketplaceEntity } from "../partner-marketplace.types"

export interface ListMarketplaceStoresFilter {
  search?: string | undefined
  field?: string | undefined
  tier?: string | undefined
  district?: string | undefined
}

export interface ListMarketplaceStoresResult {
  stores: PartnerStoreMarketplaceEntity[]
  total: number
  tierCounts: Record<string, number>
}

/**
 * Port Interface for Partner Marketplace Repository
 * Tuân thủ Clean Architecture Standard (ADR-001/002/006, REQ-ARCH-006).
 */
export interface IPartnerMarketplaceRepository {
  listStores(filter?: ListMarketplaceStoresFilter): Promise<ListMarketplaceStoresResult>
  getStoreById(id: string): Promise<PartnerStoreMarketplaceEntity | null>
}

