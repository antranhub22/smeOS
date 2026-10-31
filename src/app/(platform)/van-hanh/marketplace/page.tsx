"use client"

import React, { useState, useEffect, useMemo } from "react"
import {
  Store,
  Search,
  Sparkles,
  Award,
  MapPin,
  Filter,
} from "@/components/ui/icons"
import { PageHeader } from "@/components/ui/page-header"
import { PageContainer } from "@/components/ui/page-container"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import type { PartnerStoreMarketplaceEntity } from "@/modules/platform/domain/partner-marketplace.types"
import { MarketplaceStoreCard } from "./marketplace-store-card"
import { MarketplaceProfileModal } from "./marketplace-profile-modal"
import { MarketplaceSyncActions } from "./marketplace-sync-actions"

export const SEARCHABLE_FIELDS = [
  { value: "all", label: "🔍 Tất cả các trường dữ liệu" },
  { value: "identity.shopName", label: "🏷️ Tên cửa hàng" },
  { value: "identity.ownerName", label: "👤 Chủ shop / Người đại diện" },
  { value: "contact.phone", label: "📞 Số điện thoại / Hotline" },
  { value: "contact.address", label: "📍 Địa chỉ / Khu vực" },
  { value: "production.mainProductLine", label: "✨ Dòng sản phẩm chủ lực" },
  { value: "production.productLines", label: "📦 Danh mục sản phẩm hiện có" },
  { value: "production.floristCount", label: "✂️ Số lượng nhân sự thợ" },
  { value: "production.flowerSupply", label: "🌸 Nguồn cung ứng hoa" },
  { value: "business.monthlyRevenue", label: "💰 Mức doanh thu TB/tháng" },
  { value: "business.targetCustomers", label: "🎯 Khách hàng mục tiêu" },
  { value: "business.paymentMethods", label: "💳 Phương thức thanh toán" },
  { value: "business.challenges", label: "⚠️ Khó khăn & Thách thức" },
  { value: "business.goals12m", label: "🎯 Mục tiêu phát triển 12m" },
  { value: "facilityAndDelivery.coolers", label: "❄️ Tủ mát bảo quản hoa" },
  { value: "facilityAndDelivery.coldStorage", label: "🧊 Kho lạnh riêng" },
  { value: "facilityAndDelivery.deliveryVehicles", label: "🚚 Phương tiện giao hàng" },
  { value: "facilityAndDelivery.deliveryRadius", label: "🗺️ Bán kính giao hàng" },
  { value: "identity.legalCompliance", label: "📜 Tuân thủ pháp lý & GPKD" },
  { value: "audit.specialist", label: "📋 Chuyên viên khảo sát" },
]

function matchStoreValue(store: PartnerStoreMarketplaceEntity, field: string, q: string): boolean {
  if (field === "all" || !field) {
    return JSON.stringify(store).toLowerCase().includes(q)
  }

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

export default function PlatformMarketplacePage() {
  const [stores, setStores] = useState<PartnerStoreMarketplaceEntity[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [searchField, setSearchField] = useState("all")
  const [selectedTier, setSelectedTier] = useState<string>("ALL")
  const [selectedDistrict, setSelectedDistrict] = useState<string>("ALL")
  const [tierCounts, setTierCounts] = useState<Record<string, number>>({})
  const [selectedStore, setSelectedStore] = useState<PartnerStoreMarketplaceEntity | null>(null)

  // Fetch stores
  const fetchStores = async () => {
    setLoading(true)
    try {
      const res = await fetch("/api/v1/platform/marketplace/stores")
      if (res.ok) {
        const json = await res.json()
        setStores(json.data.stores || [])
        setTierCounts(json.data.tierCounts || {})
      }
    } catch {
      // ignore
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void fetchStores()
  }, [])

  // Filter list locally for instant performance
  const filteredStores = useMemo(() => {
    return stores.filter((s) => {
      // Tier filter
      if (selectedTier !== "ALL") {
        const storeTier = s.scoreAndTier.suggestedTier || "Hạng Tiêu Chuẩn"
        if (storeTier !== selectedTier) return false
      }

      // District filter
      if (selectedDistrict !== "ALL") {
        if (!s.contact.address.toLowerCase().includes(selectedDistrict.toLowerCase())) {
          return false
        }
      }

      // Dynamic Field Search
      if (search.trim()) {
        const q = search.toLowerCase().trim()
        const match = matchStoreValue(s, searchField, q)
        if (!match) return false
      }

      return true
    })
  }, [stores, selectedTier, selectedDistrict, search, searchField])

  // Extract unique districts
  const districts = useMemo(() => {
    const dMap = new Set<string>()
    stores.forEach((s) => {
      const addr = s.contact.address.toLowerCase()
      if (addr.includes("cầu giấy")) dMap.add("Cầu Giấy")
      else if (addr.includes("đống đa")) dMap.add("Đống Đa")
      else if (addr.includes("ba đình")) dMap.add("Ba Đình")
      else if (addr.includes("hà đông") || addr.includes("hđ")) dMap.add("Hà Đông")
      else if (addr.includes("thanh xuân")) dMap.add("Thanh Xuân")
      else if (addr.includes("hoàn kiếm")) dMap.add("Hoàn Kiếm")
      else if (addr.includes("hai bà trưng") || addr.includes("hbt")) dMap.add("Hai Bà Trưng")
      else if (addr.includes("hoàng mai")) dMap.add("Hoàng Mai")
      else if (addr.includes("tây hồ")) dMap.add("Tây Hồ")
      else if (addr.includes("nam từ liêm") || addr.includes("bắc từ liêm")) dMap.add("Từ Liêm")
    })
    return Array.from(dMap).sort()
  }, [stores])

  const currentFieldLabel =
    SEARCHABLE_FIELDS.find((f) => f.value === searchField)?.label ?? "Từ khóa"

  return (
    <PageContainer className="space-y-6">
      {/* Top Header */}
      <PageHeader
        title="Chợ Cửa hàng & Mạng lưới Đối tác"
        description="Marketplace hiển thị toàn bộ 98 đối tác cửa hàng đã khảo sát trên toàn hệ thống với 100% dữ liệu năng lực thực tế."
        badge={
          <span className="text-caption bg-primary-subtle text-primary font-semibold px-2.5 py-0.5 rounded-full border border-primary/20 flex items-center gap-1">
            <Sparkles className="h-3.5 w-3.5" /> SaaS Mother Marketplace
          </span>
        }
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
              placeholder={`Nhập nội dung lọc theo [${currentFieldLabel}]...`}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 text-xs"
              inputSize="sm"
            />
            {search.trim() && (
              <button
                type="button"
                onClick={() => setSearch("")}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[11px] font-bold text-text-muted hover:text-text px-1.5 py-0.5 rounded bg-surface-alt"
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
            {districts.map((d) => (
              <option key={d} value={d}>
                Quận {d}
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
              ? "bg-primary text-white shadow-sm font-bold"
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
                  ? "bg-primary text-white shadow-sm font-bold"
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
              (Lọc theo: &quot;{search}&quot; trong {currentFieldLabel})
            </span>
          )}
        </div>
        {selectedTier !== "ALL" && (
          <span className="text-primary font-medium">Đang lọc theo: {selectedTier}</span>
        )}
      </div>

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
            Thử thay đổi từ khóa tìm kiếm hoặc chọn trường lọc khác như [🔍 Tất cả các trường dữ liệu].
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
        store={selectedStore}
        onClose={() => setSelectedStore(null)}
      />
    </PageContainer>
  )
}
