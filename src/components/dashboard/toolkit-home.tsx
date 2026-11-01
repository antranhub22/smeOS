"use client"

import React, { useState, useMemo } from "react"
import { Search, Sparkles } from "@/components/ui/icons"
import {
  countByStatus,
  STATUS_DISPLAY,
  type ToolStatus,
} from "@/modules/toolkit/domain/toolkit-catalog"
import {
  getVisibleBusinessModules,
  type BusinessModule,
  type ModuleTool,
} from "@/modules/toolkit/domain/business-modules"
import {
  getStoreOperationsSection,
  type StoreOperationsSection,
} from "@/modules/toolkit/domain/store-operations"
import { useSession } from "@/lib/session"
import { useI18n } from "@/lib/i18n"
import { InfoTip } from "@/components/ui/info-tip"
import { UserMenu } from "@/components/layout/user-menu"
import { ModuleGrid } from "./toolkit-module-grid"
import { ModuleDetail } from "./toolkit-module-detail"
import { StoreOperationsPanel } from "./store-operations-panel"

function useIsDev(): boolean {
  return process.env.NODE_ENV === "development" || process.env.NEXT_PUBLIC_VERCEL_ENV === "preview"
}

type StatusFilter = "ALL" | ToolStatus

const FILTER_OPTIONS: { id: StatusFilter; label: string }[] = [
  { id: "ALL", label: "Tất cả" },
  { id: "DONE", label: "✅ Hoàn thiện" },
  { id: "IN_PROGRESS", label: "🔨 Đang làm" },
  { id: "FOUNDATION", label: "🏗️ Nền tảng sẵn" },
  { id: "PLANNED", label: "📋 Sẽ làm" },
]

function ToolkitStats({ isDev }: { isDev: boolean }) {
  if (!isDev) return null
  const counts = countByStatus()

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
      {(Object.entries(counts) as [ToolStatus, number][]).map(([status, count]) => {
        const info = STATUS_DISPLAY[status]
        return (
          <div
            key={status}
            className="flex items-center gap-3 p-3 rounded-lg border border-border bg-surface"
          >
            <span className="text-display">{info.emoji}</span>
            <div>
              <div className="text-title font-extrabold text-text">{count}</div>
              <div className="text-caption text-text-muted">{info.label}</div>
            </div>
          </div>
        )
      })}
    </div>
  )
}

function filterModule(
  module: BusinessModule,
  query: string,
  status: StatusFilter,
): BusinessModule | null {
  const q = query.trim().toLowerCase()

  const matchTool = (t: ModuleTool) => {
    const matchStatus = status === "ALL" || t.status === status
    const matchQuery = !q || t.name.toLowerCase().includes(q) || t.description.toLowerCase().includes(q)
    return matchStatus && matchQuery
  }

  const matchAsset = (a: BusinessModule["assets"][number]) => {
    if (status !== "ALL" && status !== "DONE") return false
    return !q || a.name.toLowerCase().includes(q) || a.purpose.toLowerCase().includes(q)
  }

  const filteredTools = module.tools.filter(matchTool)
  const filteredAssets = module.assets.filter(matchAsset)

  if (filteredTools.length === 0 && filteredAssets.length === 0) return null

  return {
    ...module,
    tools: filteredTools,
    assets: filteredAssets,
  }
}

export function ToolkitHome() {
  const isDev = useIsDev()
  const { userInitials } = useSession()
  const { t } = useI18n()

  const [searchQuery, setSearchQuery] = useState("")
  const [selectedStatus, setSelectedStatus] = useState<StatusFilter>("ALL")
  const [selectedKey, setSelectedKey] = useState<string | null>(null)

  const modules = useMemo(() => getVisibleBusinessModules(isDev), [isDev])
  const storeOperations = useMemo(() => getStoreOperationsSection(isDev), [isDev])

  const filteredModules = useMemo(() => {
    if (!searchQuery && selectedStatus === "ALL") return modules
    return modules
      .map((m) => filterModule(m, searchQuery, selectedStatus))
      .filter((m): m is BusinessModule => m !== null)
  }, [modules, searchQuery, selectedStatus])

  const currentModule = useMemo(() => {
    if (!selectedKey || selectedKey === "store_operations") return null
    return modules.find((m) => m.key === selectedKey) ?? null
  }, [modules, selectedKey])

  const isFiltering = searchQuery.trim().length > 0 || selectedStatus !== "ALL"

  return (
    <div className="space-y-6 sm:space-y-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-border">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-display font-extrabold text-text tracking-tight">
              Trung tâm Tiếp thị & Bán hàng
            </h1>
            <InfoTip label="Trung tâm Tiếp thị & Bán hàng" side="bottom">
              Chuẩn bị các loại ấn phẩm, trang bán hàng và công cụ kinh doanh theo 6 mục tiêu phát triển.
            </InfoTip>
          </div>
          <p className="mt-1 text-body-sm text-text-muted">
            Chọn mục tiêu tăng trưởng để xem các ấn phẩm và công cụ chuyên trách
          </p>
        </div>

        <div className="flex items-center gap-3">
          <UserMenu initials={userInitials} />
        </div>
      </div>

      <ToolkitStats isDev={isDev} />

      {/* Tìm kiếm và bộ lọc */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Tìm kiếm ấn phẩm hoặc công cụ..."
            className="w-full pl-10 pr-4 py-2 rounded-xl border border-border bg-surface text-body-sm text-text placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
          />
        </div>

        {isDev && (
          <div className="flex items-center gap-1 overflow-x-auto pb-1 sm:pb-0">
            {FILTER_OPTIONS.map((opt) => (
              <button
                key={opt.id}
                type="button"
                onClick={() => setSelectedStatus(opt.id)}
                className={`px-3 py-1.5 rounded-lg text-caption font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                  selectedStatus === opt.id
                    ? "bg-primary text-primary-fg shadow-xs"
                    : "bg-surface-alt text-text-muted hover:text-text hover:bg-surface border border-border"
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Hiển thị chi tiết hoặc lưới */}
      {selectedKey === "store_operations" ? (
        <StoreOperationsPanel
          section={storeOperations}
          isDev={isDev}
          onBack={() => setSelectedKey(null)}
        />
      ) : currentModule ? (
        <ModuleDetail
          module={currentModule}
          isDev={isDev}
          onBack={() => setSelectedKey(null)}
        />
      ) : isFiltering ? (
        <div className="space-y-8">
          {filteredModules.length === 0 ? (
            <div className="text-center py-12 rounded-2xl bg-surface border border-dashed border-border">
              <p className="text-body text-text-muted">Không tìm thấy ấn phẩm hoặc công cụ phù hợp</p>
            </div>
          ) : (
            filteredModules.map((m) => (
              <ModuleDetail key={m.key} module={m} isDev={isDev} />
            ))
          )}
        </div>
      ) : (
        <ModuleGrid
          modules={modules}
          storeOperations={storeOperations}
          isDev={isDev}
          onOpen={(key) => setSelectedKey(key)}
        />
      )}
    </div>
  )
}
