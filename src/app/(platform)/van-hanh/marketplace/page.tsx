"use client"

// Chợ cửa hàng & đối tác (xem N1). Lọc: ô tìm nhanh + dropdown nhiều tiêu chí (HOẶC trong nhóm, VÀ giữa nhóm).
import React, { useCallback, useEffect, useMemo, useState } from "react"
import { Search, Store } from "@/components/ui/icons"
import { PageHeader } from "@/components/ui/page-header"
import { PageContainer } from "@/components/ui/page-container"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import { InlineError } from "@/components/ui/inline-error"
import type { PartnerStoreMarketplaceEntity } from "@/modules/platform/domain/partner-marketplace.types"
import { buildFacetGroups, matchesFacets, type FacetSelection } from "@/modules/platform/domain/partner-marketplace-facets"
import { searchTextOf } from "@/modules/platform/domain/partner-marketplace-row-mapper"
import { MarketplaceStoreCard } from "./marketplace-store-card"
import { MarketplaceProfileModal } from "./marketplace-profile-modal"
import { MarketplaceSyncActions } from "./marketplace-sync-actions"
import { MarketplaceFacetFilter } from "./marketplace-facet-filter"

export default function PlatformMarketplacePage() {
  const [stores, setStores] = useState<PartnerStoreMarketplaceEntity[]>([])
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [search, setSearch] = useState("")
  const [selection, setSelection] = useState<FacetSelection>({})
  const [selectedStore, setSelectedStore] = useState<PartnerStoreMarketplaceEntity | null>(null)

  // Tải toàn bộ một lần; lọc tại chỗ bằng các hàm domain thuần.
  const fetchStores = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch("/api/v1/platform/marketplace/stores", { cache: "no-store" })
      if (!res.ok) {
        setLoadError(res.status === 403 ? "Tài khoản chưa có quyền xem chợ đối tác." : "Không tải được danh sách cửa hàng.")
        return
      }
      const json = (await res.json()) as { data: { stores: PartnerStoreMarketplaceEntity[] } }
      setStores(json.data.stores)
      setLoadError(null)
    } catch {
      setLoadError("Không kết nối được máy chủ.")
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void (async () => {
      await fetchStores()
    })()
  }, [fetchStores])

  const searchTexts = useMemo(() => new Map(stores.map((s) => [s.id, searchTextOf(s)])), [stores])

  // Ô tìm nhanh áp trước; số đếm trong dropdown phản ánh đúng kết quả đang xem.
  const searched = useMemo(() => {
    const q = search.trim().toLowerCase()
    return q ? stores.filter((s) => (searchTexts.get(s.id) ?? "").includes(q)) : stores
  }, [stores, searchTexts, search])

  const groups = useMemo(() => buildFacetGroups(searched, selection), [searched, selection])
  const filteredStores = useMemo(() => searched.filter((s) => matchesFacets(s, selection)), [searched, selection])
  const hasFilter = search.trim().length > 0 || Object.keys(selection).length > 0

  return (
    <PageContainer className="space-y-6">
      <PageHeader
        title="Chợ cửa hàng & đối tác"
        description={`${stores.length} cửa hàng đã khảo sát — năng lực, cơ sở vật chất và phân hạng đối tác.`}
        actions={<MarketplaceSyncActions loading={loading} onRefresh={fetchStores} />}
      />

      <div className="space-y-3">
        <div className="flex flex-col gap-2 md:flex-row md:items-start">
          <div className="relative flex-1 md:max-w-xl">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted" />
            <Input
              type="text"
              placeholder="Tìm nhanh: tên cửa hàng, số điện thoại, địa chỉ, ghi chú…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 text-xs"
              inputSize="sm"
            />
          </div>
          <MarketplaceFacetFilter groups={groups} selection={selection} onChange={setSelection} />
        </div>
        <p className="text-xs text-text-muted">
          Hiển thị: <strong className="text-text">{filteredStores.length}</strong> / {stores.length} cửa hàng đối tác
          {Object.keys(selection).length > 1 && " · cửa hàng thoả MỌI nhóm tiêu chí đã chọn"}
        </p>
      </div>

      {loadError && <InlineError message={loadError} />}

      {loading ? (
        <div className="grid grid-cols-1 gap-5 py-8 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Card key={i} className="h-64 animate-pulse border border-border bg-surface-alt/40" />
          ))}
        </div>
      ) : filteredStores.length === 0 ? (
        <Card className="space-y-3 p-8 py-16 text-center">
          <Store className="mx-auto h-12 w-12 text-text-muted/40" />
          <h3 className="text-sm font-semibold text-text">Không tìm thấy cửa hàng nào phù hợp</h3>
          <p className="mx-auto max-w-sm text-meta text-text-muted">
            {hasFilter ? "Thử bỏ bớt tiêu chí hoặc đổi từ khoá tìm nhanh." : "Chưa có hồ sơ khảo sát. Nhập tệp Excel hoặc đồng bộ từ Sheet."}
          </p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
          {filteredStores.map((store) => (
            <MarketplaceStoreCard key={store.id} store={store} onQuickView={(s) => setSelectedStore(s)} />
          ))}
        </div>
      )}

      <MarketplaceProfileModal key={selectedStore?.id ?? "none"} store={selectedStore} onClose={() => setSelectedStore(null)} />
    </PageContainer>
  )
}
