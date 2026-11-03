"use client"

/**
 * desktop-nav-group.tsx — Render một nhóm điều hướng trong Sidebar (SRP)
 */

import { ChevronDown, BarChart3 } from "@/components/ui/icons"
import { cn } from "@/lib/utils"
import type { NavEntry, NavGroup as NavGroupType } from "./nav-model"
import { isToolkitGroupKey } from "./nav/nav-types"
import { DesktopNavItem } from "./desktop-nav-item"
import { NavSectionHeader } from "./nav-section-header"
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
      <div className="flex flex-col gap-0.5">
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
        <div className="mx-auto my-1.5 h-px w-6 bg-border" aria-hidden />
      </div>
    )
  }

  // ── Nhóm "viec-chinh" — luôn mở, có mục con Báo cáo ─────────
  if (group.key === "viec-chinh") {
    const homeEntry = group.entries.find((e) => e.href === "/")
    const reportEntries = group.entries.filter((e) => e.href !== "/")
    const isReportActive = reportEntries.some((e) => isActive(e)) || pathname === "/so-lieu"
    const highlightReports = isReportActive && !reportsOpen

    return (
      <div className="flex flex-col gap-px">
        <NavSectionHeader label={group.label} expanded />

        {homeEntry && (
          <DesktopNavItem
            item={homeEntry}
            active={pathname === "/"}
            iconComponent={ICONS[homeEntry.iconKey]}
            onClick={() => onNavigate("/")}
          />
        )}

        {reportEntries.length > 0 && (
          <>
            <button
              type="button"
              onClick={() => onToggleReports(!reportsOpen)}
              aria-expanded={reportsOpen}
              className={cn(
                "group relative flex h-9 w-full items-center gap-2.5 rounded-lg px-2.5 text-left text-body-sm font-medium",
                "transition-colors duration-150 pointer-coarse:h-11",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:ring-inset",
                highlightReports
                  ? "bg-primary-muted font-semibold text-primary"
                  : "text-text-muted hover:bg-surface-alt hover:text-text"
              )}
            >
              <BarChart3
                size={18}
                weight={isReportActive ? "fill" : "regular"}
                aria-hidden
                className={cn("shrink-0", isReportActive ? "text-primary" : "text-text-muted group-hover:text-text")}
              />
              <span className="min-w-0 flex-1 truncate">Báo cáo</span>
              <ChevronDown
                size={14}
                aria-hidden
                className={cn(
                  "shrink-0 text-text-muted transition-transform duration-150 group-hover:text-text",
                  !reportsOpen && "-rotate-90"
                )}
              />
            </button>

            {reportsOpen && (
              <div className="ml-5 flex flex-col gap-px border-l border-border pl-2">
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
          </>
        )}
      </div>
    )
  }

  // ── Nhóm thông thường — đóng/mở được ────────────────────────
  return (
    <div className="flex flex-col gap-px">
      <NavSectionHeader
        label={group.label}
        expanded={expanded}
        count={group.entries.length}
        onToggle={() => onToggleGroup(group.key, expanded)}
      />

      {expanded &&
        group.entries.map((entry) => (
          <DesktopNavItem
            key={entry.href}
            item={entry}
            active={isActive(entry)}
            iconComponent={ICONS[entry.iconKey]}
            onClick={() => onNavigate(entry.href)}
          />
        ))}
    </div>
  )
}
