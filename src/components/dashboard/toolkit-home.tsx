"use client"

import React, { useState, useMemo } from "react"
import { Search, SlidersHorizontal, Sparkles } from "lucide-react"
import {
  countByStatus,
  STATUS_DISPLAY,
  type ToolStatus,
} from "@/modules/toolkit/domain/toolkit-catalog"
import {
  getVisibleGrowthModules,
  type GrowthModule,
  type ModuleTool,
} from "@/modules/toolkit/domain/growth-modules"
import { useSession } from "@/lib/session"
import { useI18n } from "@/lib/i18n"
import { UserMenu } from "@/components/layout/user-menu"
import { ModuleGrid } from "./toolkit-module-grid"
import { ModuleDetail } from "./toolkit-module-detail"

// ── Environment check ──────────────────────────────────────────────

function useIsDev(): boolean {
  return process.env.NODE_ENV === "development" || process.env.NEXT_PUBLIC_VERCEL_ENV === "preview"
}

// ── Status filter tabs ─────────────────────────────────────────────

type StatusFilter = "ALL" | ToolStatus

const FILTER_OPTIONS: { id: StatusFilter; label: string }[] = [
  { id: "ALL", label: "Tất cả" },
  { id: "DONE", label: "✅ Hoàn thiện" },
  { id: "IN_PROGRESS", label: "🔨 Đang làm" },
  { id: "FOUNDATION", label: "🏗️ Nền tảng sẵn" },
  { id: "PLANNED", label: "📋 Sẽ làm" },
]

// ── Stats summary ──────────────────────────────────────────────────

function ToolkitStats({ isDev }: { isDev: boolean }) {
  if (!isDev) return null
  const counts = countByStatus()
  const total = counts.DONE + counts.IN_PROGRESS + counts.FOUNDATION + counts.PLANNED

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

// ── Lọc công cụ trong module ───────────────────────────────────────

function filterModule(
  module: GrowthModule,
  keep: (tool: ModuleTool) => boolean,
): GrowthModule {
  return {
    ...module,
    phases: module.phases
      .map((p) => ({ ...p, tools: p.tools.filter(keep) }))
      .filter((p) => p.tools.length > 0),
  }
}

// ── Main component ─────────────────────────────────────────────────

export function ToolkitHome() {
  const isDev = useIsDev()
  const { userInitials } = useSession()
  const { dict } = useI18n()
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("ALL")
  const [openKey, setOpenKey] = useState<string | null>(null)

  const modules = useMemo(() => getVisibleGrowthModules(isDev), [isDev])
  const query = searchQuery.trim().toLowerCase()
  const isFiltering = query !== "" || statusFilter !== "ALL"

  // Tìm kiếm hoặc lọc trạng thái → hiện thẳng công cụ khớp, nhóm theo module
  const filteredModules = useMemo(() => {
    const keep = (tool: ModuleTool) => {
      const matchesSearch =
        query === "" ||
        tool.name.toLowerCase().includes(query) ||
        tool.description.toLowerCase().includes(query)
      const matchesStatus = statusFilter === "ALL" || tool.status === statusFilter
      return matchesSearch && matchesStatus
    }
    return modules.map((m) => filterModule(m, keep)).filter((m) => m.phases.length > 0)
  }, [modules, query, statusFilter])

  const openModule = modules.find((m) => m.key === openKey) ?? null
  const totalTools = modules.reduce(
    (sum, m) => sum + m.phases.reduce((s, p) => s + p.tools.length, 0),
    0,
  )

  return (
    <div className="w-full max-w-7xl mx-auto px-4 py-6 md:py-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-border">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-selected text-primary text-caption font-semibold mb-2">
            <Sparkles className="w-3.5 h-3.5" aria-hidden="true" />
            <span>{dict.toolkit.header.badge}</span>
          </div>
          <h1 className="text-display font-extrabold text-text tracking-tight">
            {isDev
              ? dict.toolkit.header.titleDev
              : dict.toolkit.header.titleProd}
          </h1>
          <p className="text-body text-text-muted mt-1">
            {isDev
              ? dict.toolkit.header.descDev
              : dict.toolkit.header.descProd}
          </p>
        </div>

        <div className="flex items-center gap-3 self-start md:self-auto">
          <UserMenu initials={userInitials || "U"} direction="down" />
        </div>
      </div>

      {/* Stats (dev only) */}
      <ToolkitStats isDev={isDev} />

      {/* Filter + Search */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        {isDev ? (
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none [scrollbar-width:none]">
            {FILTER_OPTIONS.map((opt) => (
              <button
                key={opt.id}
                type="button"
                aria-pressed={statusFilter === opt.id}
                onClick={() => setStatusFilter(opt.id)}
                className={`shrink-0 px-3 py-1.5 rounded-lg text-body-sm font-medium transition-colors cursor-pointer whitespace-nowrap ${
                  statusFilter === opt.id
                    ? "bg-primary text-surface font-semibold"
                    : "bg-surface border border-border text-text hover:bg-surface-alt"
                }`}
              >
                {opt.id === "ALL" ? `Tất cả (${totalTools})` : opt.label}
              </button>
            ))}
          </div>
        ) : (
          <span />
        )}

        <div className="relative w-full sm:w-64">
          <Search
            className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-text-muted"
            aria-hidden="true"
          />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={dict.toolkit.filters.searchPlaceholder}
            aria-label={dict.toolkit.filters.searchPlaceholder}
            className="w-full pl-9 pr-3 py-1.5 rounded-lg border border-border bg-surface text-body-sm text-text placeholder:text-text-muted focus:outline-none focus:border-primary transition-colors"
          />
        </div>
      </div>

      {isFiltering ? (
        filteredModules.length > 0 ? (
          <div className="space-y-10">
            {filteredModules.map((m) => (
              <ModuleDetail key={m.key} module={m} isDev={isDev} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12 border border-dashed border-border rounded-xl bg-surface">
            <p className="text-body text-text-muted">
              Không tìm thấy công cụ nào khớp với &quot;{searchQuery}&quot;
            </p>
          </div>
        )
      ) : openModule ? (
        <ModuleDetail module={openModule} isDev={isDev} onBack={() => setOpenKey(null)} />
      ) : (
        <ModuleGrid modules={modules} isDev={isDev} onOpen={setOpenKey} />
      )}

      {/* Dev footer */}
      {isDev && (
        <div className="mt-8 pt-4 border-t border-border text-center">
          <p className="text-caption text-text-muted">
            🔧 Môi trường phát triển — hiện toàn bộ công cụ hiện có cùng các công cụ trong lộ trình, xếp theo 10 bước.
            Trên production chỉ hiện công cụ đã hoàn thiện; bước chưa có công cụ nào sẽ ẩn.
          </p>
        </div>
      )}
    </div>
  )
}
