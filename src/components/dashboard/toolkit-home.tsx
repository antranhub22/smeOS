"use client"

import React, { useState, useMemo } from "react"
import * as LucideIcons from "lucide-react"
import { Search, SlidersHorizontal, Sparkles } from "lucide-react"
import {
  getVisibleGroups,
  countByStatus,
  STATUS_DISPLAY,
  type ToolStatus,
  type ToolGroup,
} from "@/modules/toolkit/domain/toolkit-catalog"
import { useSession } from "@/lib/session"
import { UserMenu } from "@/components/layout/user-menu"
import { ToolCard } from "./toolkit-card"

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

// ── Group section ──────────────────────────────────────────────────

function ToolGroupSection({ group, isDev }: { group: ToolGroup; isDev: boolean }) {
  const iconsMap = LucideIcons as unknown as Record<string, React.ElementType>
  const GroupIcon = iconsMap[group.icon] || LucideIcons.Folder

  return (
    <section className="space-y-4">
      {/* Group header */}
      <div className="flex items-center gap-3 pb-2 border-b border-border">
        <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary-muted text-primary">
          <GroupIcon className="w-4.5 h-4.5" aria-hidden="true" />
        </div>
        <div>
          <h2 className="text-title-sm font-bold text-text">
            Nhóm {group.groupNumber} — {group.name}
          </h2>
          <p className="text-caption text-text-muted">{group.objective}</p>
        </div>
        <span className="ml-auto inline-flex items-center px-2 py-0.5 rounded-full bg-surface-alt text-caption font-semibold text-text-muted border border-border">
          {group.tools.length} công cụ
        </span>
      </div>

      {/* Tools grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {group.tools.map((tool) => (
          <ToolCard key={tool.id} tool={tool} isDev={isDev} />
        ))}
      </div>
    </section>
  )
}

// ── Main component ─────────────────────────────────────────────────

export function ToolkitHome() {
  const isDev = useIsDev()
  const { userInitials } = useSession()
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("ALL")

  const allGroups = useMemo(() => getVisibleGroups(isDev), [isDev])

  // Apply search + status filter
  const filteredGroups = useMemo(() => {
    const query = searchQuery.trim().toLowerCase()

    return allGroups
      .map((group) => ({
        ...group,
        tools: group.tools.filter((tool) => {
          const matchesSearch =
            query === "" ||
            tool.name.toLowerCase().includes(query) ||
            tool.description.toLowerCase().includes(query) ||
            String(tool.id).includes(query)

          const matchesStatus =
            statusFilter === "ALL" || tool.status === statusFilter

          return matchesSearch && matchesStatus
        }),
      }))
      .filter((group) => group.tools.length > 0)
  }, [allGroups, searchQuery, statusFilter])

  const totalVisible = filteredGroups.reduce((sum, g) => sum + g.tools.length, 0)

  return (
    <div className="w-full max-w-7xl mx-auto px-4 py-6 md:py-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-border">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-selected text-primary text-caption font-semibold mb-2">
            <Sparkles className="w-3.5 h-3.5" aria-hidden="true" />
            <span>Toàn bộ 51 công cụ kinh doanh (9 nhóm)</span>
          </div>
          <h1 className="text-display font-extrabold text-text tracking-tight">
            {isDev
              ? "Hệ thống công cụ kinh doanh smeOS"
              : "Hôm nay bạn muốn làm gì?"}
          </h1>
          <p className="text-body text-text-muted mt-1">
            {isDev
              ? "Toàn bộ 51 công cụ phân theo 9 nhóm tác nghiệp chuẩn hóa đa tầng"
              : "Chọn công cụ bên dưới để bắt đầu."}
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
        {/* Status filter tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          {(isDev ? FILTER_OPTIONS : FILTER_OPTIONS.slice(0, 1)).map((opt) => (
            <button
              key={opt.id}
              type="button"
              onClick={() => setStatusFilter(opt.id)}
              className={`px-3 py-1.5 rounded-lg text-body-sm font-medium transition-colors cursor-pointer whitespace-nowrap ${
                statusFilter === opt.id
                  ? "bg-primary text-surface font-semibold"
                  : "bg-surface border border-border text-text hover:bg-surface-alt"
              }`}
            >
              {opt.id === "ALL"
                ? `Tất cả (${totalVisible})`
                : opt.label}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-64">
          <Search
            className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-text-muted"
            aria-hidden="true"
          />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Tìm kiếm chức năng..."
            className="w-full pl-9 pr-3 py-1.5 rounded-lg border border-border bg-surface text-body-sm text-text placeholder:text-text-muted focus:outline-none focus:border-primary transition-colors"
          />
        </div>
      </div>

      {/* Groups */}
      {filteredGroups.length > 0 ? (
        <div className="space-y-8">
          {filteredGroups.map((group) => (
            <ToolGroupSection
              key={group.groupNumber}
              group={group}
              isDev={isDev}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-12 border border-dashed border-border rounded-xl bg-surface">
          <p className="text-body text-text-muted">
            Không tìm thấy chức năng nào khớp với &quot;{searchQuery}&quot;
          </p>
        </div>
      )}

      {/* Dev footer */}
      {isDev && (
        <div className="mt-8 pt-4 border-t border-border text-center">
          <p className="text-caption text-text-muted">
            🔧 Đang chạy môi trường phát triển — Hiển thị toàn bộ 51 công cụ phân 9 nhóm kèm trạng thái.
            Trên production chỉ hiển thị các công cụ đã hoàn thiện.
          </p>
        </div>
      )}
    </div>
  )
}
