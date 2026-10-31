"use client"

import React, { useCallback, useEffect, useMemo, useState } from "react"
import {
  Store,
  Search,
  Award,
  MapPin,
} from "@/components/ui/icons"
import { PageHeader } from "@/components/ui/page-header"
import { PageContainer } from "@/components/ui/page-container"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import type { PartnerStoreMarketplaceEntity } from "@/modules/platform/domain/partner-marketplace.types"
import { filterMarketplaceStores } from "@/modules/platform/domain/partner-marketplace-filter"
import { searchTextOf } from "@/modules/platform/domain/partner-marketplace-row-mapper"
import { InlineError } from "@/components/ui/inline-error"
import { MarketplaceStoreCard } from "./marketplace-store-card"
import { MarketplaceProfileModal } from "./marketplace-profile-modal"
import { MarketplaceSyncActions } from "./marketplace-sync-actions"

const SEARCHABLE_FIELDS: { value: string; label: string }[] = [
  { value: "all", label: "Mọi thông tin" },
  { value: "identity.shopName", label: "Tên cửa hàng" },
  { value: "identity.ownerName", label: "Chủ cửa hàng / người đại diện" },
  { value: "contact.phone", label: "Số điện thoại" },
  { value: "contact.address", label: "Địa chỉ / khu vực" },
  { value: "production.mainProductLine", label: "Dòng sản phẩm chủ lực" },
  { value: "production.productLines", label: "Danh mục sản phẩm" },
  { value: "production.floristCount", label: "Số thợ cắm hoa" },
  { value: "production.flowerSupply", label: "Nguồn cung hoa" },
  { value: "business.monthlyRevenue", label: "Doanh thu trung bình tháng" },
  { value: "business.targetCustomers", label: "Khách hàng mục tiêu" },
  { value: "business.paymentMethods", label: "Phương thức thanh toán" },
  { value: "business.challenges", label: "Khó khăn hiện tại" },
  { value: "business.goals12m", label: "Mục tiêu 12 tháng" },
  { value: "facilityAndDelivery.coolers", label: "Tủ mát bảo quản" },
  { value: "facilityAndDelivery.coldStorage", label: "Kho lạnh" },
  { value: "facilityAndDelivery.deliveryVehicles", label: "Phương tiện giao hàng" },
  { value: "facilityAndDelivery.deliveryRadius", label: "Bán kính giao hàng" },
  { value: "identity.legalCompliance", label: "Giấy tờ pháp lý" },
  { value: "audit.specialist", label: "Chuyên viên khảo sát" },
]

const DISTRICTS: [string, string[]][] = [
  ["Ba Đình", ["ba đình"]], ["Cầu Giấy", ["cầu giấy"]], ["Đống Đa", ["đống đa"]], ["Hà Đông", ["hà đông"]],
  ["Hai Bà Trưng", ["hai bà trưng"]], ["Hoàn Kiếm", ["hoàn kiếm"]], ["Hoàng Mai", ["hoàng mai"]],
  ["Tây Hồ", ["tây hồ"]], ["Thanh Xuân", ["thanh xuân"]], ["Từ Liêm", ["nam từ liêm", "bắc từ liêm"]],
]

export default function PlatformMarketplacePage() {
  const [stores, setStores] = useState<PartnerStoreMarketplaceEntity[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [searchField, setSearchField] = useState("all")
  const [selectedTier, setSelectedTier] = useState<string>("ALL")
  const [selectedDistrict, setSelectedDistrict] = useState<string>("ALL")
  const [loadError, setLoadError] = useState<string | null>(null)
  const [selectedStore, setSelectedStore] = useState<PartnerStoreMarketplaceEntity | null>(null)

  // Tải toàn bộ một lần; lọc tại chỗ bằng cùng bộ lọc domain với API.
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

  const entries = useMemo(() => stores.map((store) => ({ store, searchText: searchTextOf(store) })), [stores])

  const districts = useMemo(
    () => DISTRICTS.filter(([, keys]) => stores.some((s) => keys.some((k) => s.contact.address.toLowerCase().includes(k)))),
    [stores]
  )

  const { stores: filteredStores, tierCounts } = useMemo(() => {
    const keys = DISTRICTS.find(([name]) => name === selectedDistrict)?.[1]
    const byDistrict = keys ? entries.filter((e) => keys.some((k) => e.store.contact.address.toLowerCase().includes(k))) : entries
    return filterMarketplaceStores(byDistrict, { search, field: searchField, tier: selectedTier })
  }, [entries, search, searchField, selectedTier, selectedDistrict])

  const currentFieldLabel =
    SEARCHABLE_FIELDS.find((f) => f.value === searchField)?.label ?? "Từ khoá"

  return (
    <PageContainer className="space-y-6">
      {/* Top Header */}
      <PageHeader
        title="Chợ cửa hàng & đối tác"
        description={`${stores.length} cửa hàng đã khảo sát — năng lực, cơ sở vật chất và phân hạng đối tác.`}
        actions={<MarketplaceSyncActions loading={loading} onRefresh={fetchStores} />}
      />

      {/* Filter and Multi-field Search Bar */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        {/* Search Field Selector + Search Input */}
        <div className="flex flex-1 items-center gap-2 max-w-2xl">
          {/* Field Dropdown */}
          <div className="relative shrink-0">
            <select
              value={searchField}
              onChange={(e) => setSearchField(e.target.value)}
              className="rounded-xl border border-border bg-surface px-3 py-2 text-xs font-semibold text-text focus:border-primary focus:outline-none shadow-2xs"
              title="Chọn trường dữ liệu muốn lọc hoặc tìm kiếm"
            >
              {SEARCHABLE_FIELDS.map((f) => (
                <option key={f.value} value={f.value}>
                  {f.label}
                </option>
              ))}
            </select>
          </div>

          {/* Search Text Input */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
            <Input
              type="text"
              placeholder={`Tìm theo ${currentFieldLabel.toLowerCase()}...`}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 text-xs"
              inputSize="sm"
            />
            {search.trim() && (
              <button
                type="button"
                onClick={() => setSearch("")}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-caption font-bold text-text-muted hover:text-text px-1.5 py-0.5 rounded bg-surface-alt"
              >
                Xóa
              </button>
            )}
          </div>
        </div>

        {/* District Filter */}
        <div className="flex items-center gap-2">
          <MapPin className="h-4 w-4 text-text-muted" />
          <select
            value={selectedDistrict}
            onChange={(e) => setSelectedDistrict(e.target.value)}
            className="rounded-xl border border-border bg-surface px-3 py-2 text-xs font-medium text-text focus:border-primary focus:outline-none shadow-2xs"
          >
            <option value="ALL">Tất cả quận/huyện ({stores.length})</option>
            {districts.map(([d]) => (
              <option key={d} value={d}>
                {d}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Tier Filter Tabs */}
      <div className="flex flex-wrap items-center gap-2 border-b border-border/80 pb-3">
        <button
          type="button"
          onClick={() => setSelectedTier("ALL")}
          className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${
            selectedTier === "ALL"
              ? "bg-primary text-primary-foreground shadow-sm font-bold"
              : "bg-surface border border-border text-text-muted hover:text-text hover:bg-surface-alt"
          }`}
        >
          Tất cả đối tác ({stores.length})
        </button>

        {Object.entries(tierCounts)
          .filter(([k]) => k !== "all")
          .map(([tier, count]) => (
            <button
              key={tier}
              type="button"
              onClick={() => setSelectedTier(tier)}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all flex items-center gap-1.5 ${
                selectedTier === tier
                  ? "bg-primary text-primary-foreground shadow-sm font-bold"
                  : "bg-surface border border-border text-text-muted hover:text-text hover:bg-surface-alt"
              }`}
            >
              <Award className="h-3.5 w-3.5" />
              {tier} ({count})
            </button>
          ))}
      </div>

      {/* Counter */}
      <div className="flex items-center justify-between text-xs text-text-muted">
        <div>
          Hiển thị: <strong className="text-text">{filteredStores.length}</strong> / {stores.length} cửa hàng đối tác
          {search.trim() && (
            <span className="ml-2 text-primary font-medium">
              (tìm “{search}” trong {currentFieldLabel.toLowerCase()})
            </span>
          )}
        </div>
        {selectedTier !== "ALL" && (
          <span className="text-primary font-medium">Đang lọc theo: {selectedTier}</span>
        )}
      </div>

      {loadError && <InlineError message={loadError} />}

      {/* Stores Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 py-8">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Card key={i} className="h-64 animate-pulse bg-surface-alt/40 border border-border" />
          ))}
        </div>
      ) : filteredStores.length === 0 ? (
        <Card className="text-center py-16 p-8 space-y-3">
          <Store className="w-12 h-12 text-text-muted/40 mx-auto" />
          <h3 className="text-sm font-semibold text-text">Không tìm thấy cửa hàng nào phù hợp</h3>
          <p className="text-meta text-text-muted max-w-sm mx-auto">
            Thử đổi từ khoá, hoặc chọn “Mọi thông tin” để tìm trên toàn bộ hồ sơ.
          </p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredStores.map((store) => (
            <MarketplaceStoreCard
              key={store.id}
              store={store}
              onQuickView={(s) => setSelectedStore(s)}
            />
          ))}
        </div>
      )}

      {/* Quick View Profile Modal */}
      <MarketplaceProfileModal
        key={selectedStore?.id ?? "none"}
        store={selectedStore}
        onClose={() => setSelectedStore(null)}
      />
    </PageContainer>
  )
}
