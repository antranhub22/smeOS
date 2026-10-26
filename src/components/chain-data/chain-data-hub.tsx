"use client"

import React, { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { SkeletonBlock } from "@/components/ui/skeleton"
import {
  Database,
  Store,
  Folder,
  ChevronRight,
  Search,
  RefreshCw,
  Home,
  FileSpreadsheet,
  Layers,
  ArrowLeft,
} from "lucide-react"
import type { ChainStoreSummary } from "@/modules/field-platform/use-cases/get-chain-stores-data"
import type { StoreFolderDataResult, StoreDomainFolder } from "@/modules/field-platform/use-cases/get-store-folder-data"
import { StoreCard } from "./store-card"
import { DomainFolderCard } from "./domain-folder-card"
import { FieldDataTable } from "./field-data-table"
import { AddBranchModal } from "./add-branch-modal"
import { AddPartnerStoreModal } from "./add-partner-store-modal"
import { Plus, Handshake, Building2 } from "lucide-react"

export function ChainDataHub() {
  const [stores, setStores] = useState<readonly ChainStoreSummary[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [filterType, setFilterType] = useState<"ALL" | "DIRECT" | "PARTNER">("ALL")
  const [isAddBranchOpen, setIsAddBranchOpen] = useState(false)
  const [isAddPartnerOpen, setIsAddPartnerOpen] = useState(false)

  // Navigation state (Folder in Folder)
  const [selectedStore, setSelectedStore] = useState<ChainStoreSummary | null>(null)
  const [storeDetail, setStoreDetail] = useState<StoreFolderDataResult | null>(null)
  const [loadingStore, setLoadingStore] = useState(false)
  const [selectedFolder, setSelectedFolder] = useState<StoreDomainFolder | null>(null)

  const loadStores = async () => {
    setLoading(true)
    try {
      const res = await fetch("/api/v1/chain/stores-data")
      if (res.ok) {
        const json = await res.json()
        const data = json.data as { stores: ChainStoreSummary[] }
        setStores(data.stores)
      }
    } catch {
      // Silently handle error
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void loadStores()
  }, [])

  const handleOpenStore = async (store: ChainStoreSummary) => {
    setSelectedStore(store)
    setSelectedFolder(null)
    setLoadingStore(true)
    try {
      const res = await fetch(`/api/v1/chain/stores-data/${store.id}`)
      if (res.ok) {
        const json = await res.json()
        setStoreDetail(json.data as StoreFolderDataResult)
      }
    } catch {
      // Silently handle error
    } finally {
      setLoadingStore(false)
    }
  }

  const handleBackToStores = () => {
    setSelectedStore(null)
    setStoreDetail(null)
    setSelectedFolder(null)
  }

  const handleBackToStoreFolders = () => {
    setSelectedFolder(null)
  }

  const directCount = stores.filter((s) => !s.isPartner).length
  const partnerCount = stores.filter((s) => s.isPartner).length

  // Filtered stores
  const filteredStores = stores.filter((s) => {
    const matchesSearch =
      s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (s.address && s.address.toLowerCase().includes(searchQuery.toLowerCase()))

    if (!matchesSearch) return false
    if (filterType === "DIRECT") return !s.isPartner
    if (filterType === "PARTNER") return s.isPartner
    return true
  })

  return (
    <div className="flex flex-1 flex-col overflow-y-auto p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full space-y-6">
      {/* Top Banner & Breadcrumbs Header */}
      <div className="border-b border-border/80 pb-5 space-y-3">
        {/* Breadcrumb Navigation */}
        <nav className="flex items-center gap-2 text-caption font-bold text-text-muted flex-wrap">
          <button
            type="button"
            onClick={handleBackToStores}
            className="flex items-center gap-1.5 hover:text-primary transition-colors text-text font-bold"
          >
            <Database size={15} className="text-primary" />
            <span>Trung Tâm Dữ Liệu Chuỗi</span>
          </button>

          {selectedStore && (
            <>
              <ChevronRight size={13} className="text-text-muted/60" />
              <button
                type="button"
                onClick={handleBackToStoreFolders}
                className={`flex items-center gap-1.5 transition-colors ${
                  selectedFolder ? "hover:text-primary text-text-muted" : "text-primary font-extrabold"
                }`}
              >
                <Store size={14} />
                <span>{selectedStore.name}</span>
              </button>
            </>
          )}

          {selectedFolder && (
            <>
              <ChevronRight size={13} className="text-text-muted/60" />
              <span className="flex items-center gap-1.5 text-primary font-extrabold">
                <Folder size={14} className="fill-current text-amber-500" />
                <span>{selectedFolder.domainNameVi}</span>
              </span>
            </>
          )}
        </nav>

        {/* Title & Actions */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-black text-text tracking-tight flex items-center gap-2.5">
              {selectedFolder ? (
                <>
                  <Folder className="text-amber-500 fill-current" size={26} />
                  <span>{selectedFolder.domainNameVi}</span>
                </>
              ) : selectedStore ? (
                <>
                  <Store className="text-primary" size={26} />
                  <span>Cửa hàng: {selectedStore.name}</span>
                </>
              ) : (
                <>
                  <Database className="text-primary" size={26} />
                  <span>Trung Tâm Dữ Liệu Chuỗi (Consolidated Data Hub)</span>
                </>
              )}
            </h1>
            <p className="text-caption text-text-muted mt-1">
              {selectedFolder
                ? `Chi tiết tất cả trường dữ liệu thu thập thuộc nhóm ${selectedFolder.domainNameVi} của ${selectedStore?.name}.`
                : selectedStore
                ? `Thư mục dữ liệu hợp nhất thu thập từ ${selectedStore.name} theo Chain Collection Profile.`
                : "Quản lý và hiển thị toàn bộ dữ liệu thu thập được từ các cửa hàng thành viên (mô hình Folder-in-Folder)."}
            </p>
          </div>

          <div className="flex items-center gap-2.5 shrink-0 self-end sm:self-auto">
            {selectedStore && (
              <Button
                variant="outline"
                size="sm"
                onClick={selectedFolder ? handleBackToStoreFolders : handleBackToStores}
                className="gap-1.5 font-bold"
              >
                <ArrowLeft size={14} />
                <span>{selectedFolder ? "Quay lại thư mục cửa hàng" : "Quay lại danh sách cửa hàng"}</span>
              </Button>
            )}

            {!selectedStore && (
              <div className="flex items-center gap-2 flex-wrap">
                <div className="relative w-48 sm:w-56">
                  <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
                  <input
                    type="text"
                    placeholder="Tìm kiếm cửa hàng…"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full text-caption h-9 pl-9 pr-3 rounded-xl border border-border bg-surface focus:outline-primary"
                  />
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsAddBranchOpen(true)}
                  className="gap-1.5 font-bold h-9 text-xs"
                >
                  <Building2 size={14} className="text-primary" />
                  <span>+ Thêm Chi Nhánh</span>
                </Button>

                <Button
                  size="sm"
                  onClick={() => setIsAddPartnerOpen(true)}
                  className="gap-1.5 font-bold h-9 text-xs bg-amber-600 hover:bg-amber-700 text-white"
                >
                  <Handshake size={14} />
                  <span>+ Kết Nối Đối Tác (DSA)</span>
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Content Area based on level */}
      {loading ? (
        <SkeletonBlock lines={6} />
      ) : selectedFolder ? (
        /* LEVEL 2: Data Field Table inside Domain Folder */
        <div className="space-y-4">
          <div className="flex items-center justify-between text-body-sm">
            <span className="font-bold text-text-muted uppercase text-caption tracking-wider">
              Danh sách {selectedFolder.fieldCount} trường dữ liệu thực tế
            </span>
            <span className="text-caption text-text-muted">
              Định dạng theo Profile: <strong className="text-primary font-bold">Hoạt động</strong>
            </span>
          </div>

          <FieldDataTable fields={selectedFolder.fields} />
        </div>
      ) : selectedStore ? (
        /* LEVEL 1: Domain Folders inside Store ("Folder trong Folder") */
        loadingStore ? (
          <SkeletonBlock lines={5} />
        ) : storeDetail && storeDetail.folders.length > 0 ? (
          <div className="space-y-4">
            <div className="flex items-center justify-between text-caption font-bold text-text-muted">
              <span>CÁC THƯ MỤC DỮ LIỆU CỦA CỬA HÀNG ({storeDetail.folders.length} THƯ MỤC)</span>
              <span>Tổng: {storeDetail.totalFieldCount} trường đã thu thập</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {storeDetail.folders.map((folder) => (
                <DomainFolderCard
                  key={folder.domainKey}
                  folder={folder}
                  onOpenFolder={setSelectedFolder}
                />
              ))}
            </div>
          </div>
        ) : (
          <Card className="p-8 text-center border-dashed border-border">
            <p className="text-body-sm font-semibold text-text">Cửa hàng này chưa có dữ liệu thu thập.</p>
          </Card>
        )
      ) : (
        /* LEVEL 0: Grid of Store Tiles ("Các ô cửa hàng") */
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border/60 pb-3">
            <div className="flex items-center gap-2 flex-wrap">
              <button
                type="button"
                onClick={() => setFilterType("ALL")}
                className={`px-3 py-1 rounded-lg text-caption font-bold transition-colors ${
                  filterType === "ALL"
                    ? "bg-primary text-white"
                    : "bg-surface border border-border text-text-muted hover:text-text"
                }`}
              >
                Tất cả ({stores.length})
              </button>
              <button
                type="button"
                onClick={() => setFilterType("DIRECT")}
                className={`px-3 py-1 rounded-lg text-caption font-bold transition-colors ${
                  filterType === "DIRECT"
                    ? "bg-primary text-white"
                    : "bg-surface border border-border text-text-muted hover:text-text"
                }`}
              >
                Trực thuộc ({directCount})
              </button>
              <button
                type="button"
                onClick={() => setFilterType("PARTNER")}
                className={`px-3 py-1 rounded-lg text-caption font-bold transition-colors ${
                  filterType === "PARTNER"
                    ? "bg-amber-600 text-white"
                    : "bg-surface border border-border text-text-muted hover:text-text"
                }`}
              >
                Đối tác nhượng quyền ({partnerCount})
              </button>
            </div>

            <span className="text-caption text-text-muted font-medium">
              Bấm vào từng ô để mở thư mục dữ liệu
            </span>
          </div>

          {filteredStores.length === 0 ? (
            <Card className="p-8 text-center border-dashed border-border bg-surface">
              <Store size={28} className="mx-auto text-text-muted mb-2" />
              <p className="text-body-sm font-bold text-text">Không tìm thấy cửa hàng phù hợp</p>
              <p className="text-caption text-text-muted mt-1">
                Hãy thử tìm kiếm với từ khóa khác hoặc thêm cửa hàng mới trong phần Cài đặt.
              </p>
            </Card>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {filteredStores.map((store) => (
                <StoreCard
                  key={store.id}
                  store={store}
                  onOpenStore={handleOpenStore}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
