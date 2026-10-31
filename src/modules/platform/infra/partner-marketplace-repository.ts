import type {
  IPartnerMarketplaceRepository,
  ListMarketplaceStoresFilter,
  ListMarketplaceStoresResult,
} from "../domain/repositories/partner-marketplace-repository.interface"
import type { PartnerStoreMarketplaceEntity } from "../domain/partner-marketplace.types"
import storesJson from "../domain/partner-marketplace-data.json"

function matchStoreField(store: PartnerStoreMarketplaceEntity, field: string | undefined, q: string): boolean {
  if (!field || field === "all") {
    // Deep search across all 75 fields
    const jsonStr = JSON.stringify(store).toLowerCase()
    return jsonStr.includes(q)
  }

  // Nested property lookup e.g. 'identity.shopName', 'production.productLines'
  const parts = field.split(".")
  let current: unknown = store
  for (const part of parts) {
    if (current && typeof current === "object" && part in (current as Record<string, unknown>)) {
      current = (current as Record<string, unknown>)[part]
    } else {
      return false
    }
  }

  if (Array.isArray(current)) {
    return current.some((item) => String(item).toLowerCase().includes(q))
  }
  return String(current ?? "").toLowerCase().includes(q)
}

export class PartnerMarketplaceRepository implements IPartnerMarketplaceRepository {
  private readonly stores: PartnerStoreMarketplaceEntity[] = storesJson as PartnerStoreMarketplaceEntity[]

  async listStores(filter?: ListMarketplaceStoresFilter): Promise<ListMarketplaceStoresResult> {
    const allStores = this.stores

    // Thống kê phân hạng
    const tierCounts: Record<string, number> = {
      all: allStores.length,
    }

    for (const s of allStores) {
      const tier = s.scoreAndTier.suggestedTier || "Hạng Tiêu Chuẩn"
      tierCounts[tier] = (tierCounts[tier] || 0) + 1
    }

    let filtered = allStores

    if (filter?.tier && filter.tier !== "ALL") {
      filtered = filtered.filter(
        (s) => (s.scoreAndTier.suggestedTier || "Hạng Tiêu Chuẩn") === filter.tier
      )
    }

    if (filter?.search && filter.search.trim()) {
      const q = filter.search.toLowerCase().trim()
      filtered = filtered.filter((s) => matchStoreField(s, filter.field, q))
    }

    if (filter?.district && filter.district.trim() && filter.district !== "ALL") {
      const d = filter.district.toLowerCase().trim()
      filtered = filtered.filter((s) => s.contact.address.toLowerCase().includes(d))
    }

    return {
      stores: filtered,
      total: filtered.length,
      tierCounts,
    }
  }

  async getStoreById(id: string): Promise<PartnerStoreMarketplaceEntity | null> {
    const store = this.stores.find((s) => s.id === id)
    return store || null
  }
}

// Singleton Factory (Quy chuẩn ADR-001/002)
let instance: IPartnerMarketplaceRepository | null = null

export function getPartnerMarketplaceRepository(): IPartnerMarketplaceRepository {
  if (!instance) {
    instance = new PartnerMarketplaceRepository()
  }
  return instance
}
