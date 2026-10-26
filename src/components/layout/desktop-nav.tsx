"use client"

/**
 * DesktopNav — Sidebar điều hướng chính (Desktop)
 *
 * Chức năng enterprise:
 * - Thu gọn (icon-only, 56px) / Mở rộng (240px) — lưu localStorage
 * - Header phân biệt tầng kiến trúc (SaaS Mother / Ngành / ChainOS / StoreOS)
 * - Tìm kiếm nhanh với phím tắt `/`
 * - Nhóm mục có thể đóng/mở — lưu trạng thái theo org
 * - Nav items với tooltip khi thu gọn, active indicator
 */

import { useState, useRef, useEffect, useMemo, useCallback } from "react"
import { usePathname, useRouter } from "next/navigation"
import { Search, X, ChevronDown, BarChart3 } from "lucide-react"
import { useSession } from "@/lib/session"
import { isRouteLocked } from "@/lib/feature-lock"
import { cn, stripVietnamese } from "@/lib/utils"
import { buildNav, type NavEntry, type NavGroup } from "./nav-model"
import { DesktopNavHeader } from "./desktop-nav-header"
import { DesktopNavItem } from "./desktop-nav-item"
import { DesktopNavFooter } from "./desktop-nav-footer"
import {
  loadNavGroups,
  loadReportsOpen,
  loadNavCollapsed,
  navStorageKeys,
  persistNavGroups,
  persistNavCollapsed,
} from "./nav-storage"
import { NAV_ICONS as ICONS } from "./nav-icons"
import { SuperadminHomepageBadge } from "./superadmin-homepage-badge"

// ────────────────────────────────────────────────────────────────
// Types
// ────────────────────────────────────────────────────────────────
interface DesktopNavProps {
  /** Hiển thị trong ngăn kéo trên điện thoại */
  drawer?: boolean
  onNavigate?: () => void
  onClose?: () => void
  /** process.env.NODE_ENV !== "production" — truyền từ Server Component */
  isDev?: boolean
}

// ────────────────────────────────────────────────────────────────
// Component
// ────────────────────────────────────────────────────────────────
export function DesktopNav({
  drawer = false,
  onNavigate,
  onClose,
  isDev = false,
}: DesktopNavProps = {}) {
  const pathname = usePathname()
  const router = useRouter()
  const { can, roleUx, organization, organizationType } = useSession()
  const orgId = organization?.id
  const { groupsKey, reportsKey, collapseKey } = useMemo(() => navStorageKeys(orgId), [orgId])

  // ── State ──────────────────────────────────────────────────────
  const [collapsed, setCollapsed] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>({})
  const [reportsOpen, setReportsOpen] = useState(true)
  const searchInputRef = useRef<HTMLInputElement>(null)

  // ── Nav data ───────────────────────────────────────────────────
  const navView = useMemo(
    () => buildNav(can, roleUx, organization?.industry, organization?.navHiddenKeys, organizationType),
    [can, roleUx, organization?.industry, organization?.navHiddenKeys, organizationType]
  )

  // ── Hydrate from localStorage ──────────────────────────────────
  useEffect(() => {
    setOpenGroups(loadNavGroups(groupsKey))
    setReportsOpen(loadReportsOpen(reportsKey))
    if (!drawer) setCollapsed(loadNavCollapsed(collapseKey))
  }, [groupsKey, reportsKey, collapseKey, drawer])

  // ── Keyboard shortcut: `/` → focus search, Escape → blur ───────
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (
        e.key === "/" &&
        !["INPUT", "TEXTAREA", "SELECT"].includes((e.target as HTMLElement)?.tagName)
      ) {
        e.preventDefault()
        if (collapsed) setCollapsed(false)
        requestAnimationFrame(() => searchInputRef.current?.focus())
      }
      if (e.key === "Escape" && document.activeElement === searchInputRef.current) {
        setSearchQuery("")
        searchInputRef.current?.blur()
      }
    }
    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [collapsed])

  // ── Collapse toggle ─────────────────────────────────────────────
  const toggleCollapse = useCallback(() => {
    setCollapsed((prev) => {
      const next = !prev
      persistNavCollapsed(collapseKey, next)
      if (next) setSearchQuery("") // đóng search khi thu gọn
      return next
    })
  }, [collapseKey])

  // ── Groups ─────────────────────────────────────────────────────
  function isGroupExpanded(group: NavGroup): boolean {
    if (group.key === "viec-chinh") return true
    if (openGroups[group.key] !== undefined) return openGroups[group.key]!
    return group.entries.some(
      (e) => pathname === e.href || (e.href !== "/" && pathname.startsWith(`${e.href}/`))
    )
  }

  function toggleGroup(key: string, current: boolean) {
    const next = { ...openGroups, [key]: !current }
    setOpenGroups(next)
    persistNavGroups(groupsKey, next)
  }

  function toggleReports(next: boolean) {
    setReportsOpen(next)
    try { localStorage.setItem(reportsKey, String(next)) } catch { /* ignore */ }
  }

  // ── Search ─────────────────────────────────────────────────────
  const searchResults = useMemo(() => {
    const q = stripVietnamese(searchQuery.trim())
    if (!q) return []
    const all = navView.groups.flatMap((g) => g.entries)
    const seen = new Set<string>()
    return all.filter((e) => {
      if (seen.has(e.href)) return false
      seen.add(e.href)
      return stripVietnamese(e.label).includes(q)
    })
  }, [navView, searchQuery])

  function handleSearchKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter" && searchResults.length > 0) {
      const t = searchResults[0]!
      if (t.status !== "COMING_SOON" && !isRouteLocked(t.href)) {
        setSearchQuery("")
        router.push(t.href as never)
        onNavigate?.()
      }
    }
  }

  function navigateTo(href: string) {
    if (searchQuery) setSearchQuery("")
    router.push(href as never)
    onNavigate?.()
  }

  function isActive(entry: NavEntry): boolean {
    return pathname === entry.href || (entry.href !== "/" && pathname.startsWith(`${entry.href}/`))
  }

  // ── Sidebar width ──────────────────────────────────────────────
  const sidebarWidth = drawer
    ? "w-72 max-w-[85vw]"
    : collapsed
    ? "w-14"
    : "w-60"

  // ────────────────────────────────────────────────────────────────
  // Render
  // ────────────────────────────────────────────────────────────────
  return (
    <aside
      aria-label="Điều hướng chính"
      className={cn(
        "h-dvh flex-shrink-0 flex-col border-r border-border bg-surface",
        "transition-[width] duration-200 ease-in-out",
        drawer ? "flex" : "hidden md:flex",
        sidebarWidth
      )}
    >
      {/* ── Header ─────────────────────────────────────────────── */}
      <DesktopNavHeader
        collapsed={collapsed && !drawer}
        onToggleCollapse={toggleCollapse}
        drawer={drawer}
        onClose={onClose}
        isDev={isDev}
      />

      {/* ── Search — ẩn khi thu gọn ────────────────────────────── */}
      {!collapsed && (
        <div className="border-b border-border px-3 py-2">
          <div className="relative flex items-center">
            <Search size={14} className="absolute left-2.5 text-text-muted pointer-events-none" aria-hidden />
            <input
              ref={searchInputRef}
              type="search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={handleSearchKeyDown}
              placeholder="Tìm chức năng…"
              aria-label="Tìm kiếm chức năng"
              className={cn(
                "h-8 w-full rounded-lg border border-border bg-surface-alt",
                "pl-8 pr-16 text-meta text-text placeholder:text-text-muted",
                "focus:outline-none focus:ring-1 focus:ring-primary/50 focus:border-primary/40",
                "transition-[border-color,box-shadow] duration-150"
              )}
            />
            {searchQuery ? (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="absolute right-2 text-text-muted hover:text-text transition-colors"
                aria-label="Xóa tìm kiếm"
              >
                <X size={13} />
              </button>
            ) : (
              <kbd className="absolute right-2 rounded border border-border bg-surface px-1 py-0.5 text-caption font-mono text-text-muted leading-none pointer-events-none">
                /
              </kbd>
            )}
          </div>
        </div>
      )}

      {/* ── Navigation Scroll Area ───────────────────────────────── */}
      <nav
        className={cn(
          "flex flex-1 flex-col overflow-y-auto overflow-x-hidden",
          collapsed ? "gap-1 px-1.5 py-2" : "gap-3 px-3 py-3"
        )}
        aria-label="Menu điều hướng"
      >
        {/* Search results */}
        {searchQuery && !collapsed ? (
          <div className="space-y-1">
            <div className="px-2 pb-1 text-caption font-bold uppercase tracking-wider text-text-muted">
              Kết quả ({searchResults.length})
            </div>
            {searchResults.length === 0 ? (
              <p className="px-2.5 py-4 text-center text-meta text-text-muted">
                Không tìm thấy chức năng phù hợp
              </p>
            ) : (
              searchResults.map((entry) => (
                <DesktopNavItem
                  key={entry.href}
                  item={entry}
                  active={isActive(entry)}
                  iconComponent={ICONS[entry.iconKey]}
                  onClick={() => navigateTo(entry.href)}
                />
              ))
            )}
          </div>
        ) : (
          navView.groups.map((group) => (
            <NavGroup
              key={group.key}
              group={group}
              collapsed={collapsed && !drawer}
              expanded={isGroupExpanded(group)}
              pathname={pathname}
              reportsOpen={reportsOpen}
              onToggleGroup={(key, current) => toggleGroup(key, current)}
              onToggleReports={toggleReports}
              onNavigate={navigateTo}
            />
          ))
        )}
      </nav>

      {/* ── Footer ─────────────────────────────────────────────── */}
      <DesktopNavFooter collapsed={collapsed && !drawer} />
    </aside>
  )
}

// ────────────────────────────────────────────────────────────────
// NavGroup sub-component (SRP: xử lý render 1 nhóm)
// ────────────────────────────────────────────────────────────────
interface NavGroupProps {
  group: NavGroup
  collapsed: boolean
  expanded: boolean
  pathname: string
  reportsOpen: boolean
  onToggleGroup: (key: string, current: boolean) => void
  onToggleReports: (next: boolean) => void
  onNavigate: (href: string) => void
}

function NavGroup({
  group,
  collapsed,
  expanded,
  pathname,
  reportsOpen,
  onToggleGroup,
  onToggleReports,
  onNavigate,
}: NavGroupProps) {
  const isActive = (entry: NavEntry) =>
    pathname === entry.href || (entry.href !== "/" && pathname.startsWith(`${entry.href}/`))

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
                "group relative flex h-9 w-full items-center justify-between rounded-lg px-2.5 text-meta font-medium transition-all text-left",
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
                  size={16}
                  strokeWidth={isReportActive ? 2.4 : 1.9}
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
        className="group flex w-full items-center justify-between px-2 pb-1 text-caption font-bold uppercase tracking-wider text-text-muted hover:text-text transition-colors duration-150"
      >
        <span>{group.label}</span>
        <ChevronDown
          size={12}
          aria-hidden
          className={cn("transition-transform duration-200", expanded ? "rotate-0" : "-rotate-90")}
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

// ── Section label ─────────────────────────────────────────────
function SectionLabel({ label }: { label: string }) {
  return (
    <div className="px-2 pb-1 text-caption font-bold uppercase tracking-wider text-text-muted">
      {label}
    </div>
  )
}
