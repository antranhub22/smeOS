"use client"

/**
 * desktop-nav-group.tsx — Render một nhóm điều hướng trong Sidebar (SRP)
 */

import { ChevronDown, BarChart3 } from "@/components/ui/icons"
import { cn } from "@/lib/utils"
import type { NavEntry, NavGroup as NavGroupType } from "./nav-model"
import { isToolkitGroupKey } from "./nav/nav-types"
import { DesktopNavItem } from "./desktop-nav-item"
import { NAV_ICONS as ICONS } from "./nav-icons"
import { ToolkitShortcutsGroup } from "./toolkit-shortcuts-group"
import { getAllToolkitNavEntries } from "./nav-toolkit-shortcuts"

export interface DesktopNavGroupProps {
  group: NavGroupType
  collapsed: boolean
  expanded: boolean
  pathname: string
  reportsOpen: boolean
  /** ID tổ chức hiện tại — dùng để lưu shortcuts per-org */
  orgId?: string | null | undefined
  /**
   * Toàn bộ NavEntry từ mọi nhóm (đã lọc qua capability) — dùng cho picker shortcuts.
   * Chỉ cần khi nhóm là ToolkitGroupKey.
   */
  allNavEntries?: NavEntry[]
  onToggleGroup: (key: string, current: boolean) => void
  onToggleReports: (next: boolean) => void
  onNavigate: (href: string) => void
}

export function DesktopNavGroup({
  group,
  collapsed,
  expanded,
  pathname,
  reportsOpen,
  orgId,
  allNavEntries,
  onToggleGroup,
  onToggleReports,
  onNavigate,
}: DesktopNavGroupProps) {
  const isActive = (entry: NavEntry) =>
    pathname === entry.href || (entry.href !== "/" && pathname.startsWith(`${entry.href}/`))

  // ── Nhóm Công cụ (StoreOS: "cong-cu", ChainOS: "cong-cu-chuoi", SaaS Ngành: "cong-cu-ban-hang") ───────
  if (isToolkitGroupKey(group.key)) {
    const libraryEntry =
      group.entries.find(
        (e) =>
          e.navKey === "toolkit" ||
          e.navKey === "chain-toolkit" ||
          e.navKey === "industry-toolkit" ||
          e.href === "/cong-cu"
      ) ?? group.entries[0]!

    const toolEntries = group.entries.filter(
      (e) => e.href !== libraryEntry.href && e.navKey !== libraryEntry.navKey
    )
    // Cung cấp toàn bộ danh mục công cụ (SSOT toolkit-catalog) cho picker và shortcut resolution
    const toolkitNavEntries = getAllToolkitNavEntries()
    return (
      <ToolkitShortcutsGroup
        groupKey={group.key}
        groupLabel={group.label}
        libraryEntry={libraryEntry}
        toolEntries={toolEntries}
        allNavEntries={toolkitNavEntries}
        collapsed={collapsed}
        expanded={expanded}
        pathname={pathname}
        orgId={orgId}
        onNavigate={onNavigate}
        onToggleGroup={onToggleGroup}
      />
    )
  }

  // ── Collapsed: chỉ hiện icon stack ──────────────────────────
  if (collapsed) {
    return (
      <div className="flex flex-col gap-1">
        {group.entries.map((entry) => (
          <DesktopNavItem
            key={entry.href}
            item={entry}
            active={isActive(entry)}
            collapsed
            iconComponent={ICONS[entry.iconKey]}
            onClick={() => onNavigate(entry.href)}
          />
        ))}
        {/* Divider sau mỗi nhóm */}
        <div className="my-1 h-px w-full rounded-full bg-border/60" aria-hidden />
      </div>
    )
  }

  // ── Nhóm "viec-chinh" — luôn mở, có sub-accordion Báo cáo ───
  if (group.key === "viec-chinh") {
    const homeEntry = group.entries.find((e) => e.href === "/")
    const reportEntries = group.entries.filter((e) => e.href !== "/")
    const isReportActive = reportEntries.some((e) => isActive(e)) || pathname === "/so-lieu"

    return (
      <div className="space-y-0.5">
        <SectionLabel label={group.label} />

        {homeEntry && (
          <DesktopNavItem
            item={homeEntry}
            active={pathname === "/"}
            iconComponent={ICONS[homeEntry.iconKey]}
            onClick={() => onNavigate("/")}
          />
        )}

        {reportEntries.length > 0 && (
          <div className="pt-0.5">
            {/* Báo cáo accordion */}
            <button
              type="button"
              onClick={() => onToggleReports(!reportsOpen)}
              aria-expanded={reportsOpen}
              className={cn(
                "group relative flex h-9 w-full items-center justify-between rounded-lg px-2.5 text-meta font-medium transition-all text-left cursor-pointer",
                isReportActive && !reportsOpen
                  ? "bg-selected border border-primary/20 shadow-xs text-primary"
                  : "border border-transparent text-text-muted hover:bg-surface-alt hover:text-text"
              )}
            >
              {isReportActive && !reportsOpen && (
                <span className="absolute left-0 top-2 bottom-2 w-[3px] rounded-r-full bg-primary" aria-hidden />
              )}
              <div className="flex items-center gap-2.5">
                <BarChart3
                  size={20}
                  weight={isReportActive ? "fill" : "regular"}
                  aria-hidden
                  className={isReportActive ? "text-primary" : "text-text-muted group-hover:text-text"}
                />
                <span>Báo cáo</span>
              </div>
              <ChevronDown
                size={13}
                aria-hidden
                className={cn(
                  "transition-transform duration-200 text-text-muted group-hover:text-text",
                  reportsOpen ? "rotate-0" : "-rotate-90"
                )}
              />
            </button>

            {reportsOpen && (
              <div className="ml-3.5 mt-0.5 space-y-0.5 border-l border-border pl-2">
                {reportEntries.map((item) => (
                  <DesktopNavItem
                    key={item.href}
                    item={item}
                    active={isActive(item)}
                    isSubItem
                    iconComponent={ICONS[item.iconKey]}
                    onClick={() => onNavigate(item.href)}
                  />
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    )
  }

  // ── Nhóm thông thường — collapsible ─────────────────────────
  return (
    <div className="space-y-0.5">
      <button
        type="button"
        aria-expanded={expanded}
        onClick={() => onToggleGroup(group.key, expanded)}
        className={cn(
          "group flex w-full items-center justify-between gap-1.5 rounded-lg px-2 py-1 text-left select-none cursor-pointer",
          "text-caption font-bold uppercase tracking-wider text-text-muted hover:text-text hover:bg-surface-alt/50 transition-colors duration-150",
          "focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary/40"
        )}
      >
        <span className="truncate text-left flex-1">{group.label}</span>
        <ChevronDown
          size={12}
          aria-hidden
          className={cn("shrink-0 transition-transform duration-200 text-text-muted group-hover:text-text", expanded ? "rotate-0" : "-rotate-90")}
        />
      </button>

      {expanded && (
        <div className="space-y-0.5">
          {group.entries.map((entry) => (
            <DesktopNavItem
              key={entry.href}
              item={entry}
              active={isActive(entry)}
              iconComponent={ICONS[entry.iconKey]}
              onClick={() => onNavigate(entry.href)}
            />
          ))}
        </div>
      )}
    </div>
  )
}

function SectionLabel({ label }: { label: string }) {
  return (
    <div className="px-2 pb-1 text-caption font-bold uppercase tracking-wider text-text-muted">
      {label}
    </div>
  )
}
