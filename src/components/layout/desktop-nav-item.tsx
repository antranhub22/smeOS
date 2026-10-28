"use client"

/**
 * DesktopNavItem — Mục điều hướng đơn trong Sidebar
 *
 * Hỗ trợ 2 chế độ:
 *  - Mở rộng (collapsed=false): icon + nhãn đầy đủ
 *  - Thu gọn (collapsed=true): icon duy nhất + tooltip khi hover
 *
 * Active state: dải chỉ báo bên trái + nền selected + màu primary.
 * Coming Soon: badge "Sắp ra mắt" + mờ + không click.
 */

import type { ComponentType } from "react"
import { Tag } from "lucide-react"
import { cn } from "@/lib/utils"
import { COMING_SOON_LABEL, isRouteLocked } from "@/lib/feature-lock"
import type { NavEntry } from "./nav-model"

interface DesktopNavItemProps {
  item: NavEntry
  active: boolean
  isSubItem?: boolean
  collapsed?: boolean
  iconComponent?: ComponentType<{ size?: number; className?: string; strokeWidth?: number }> | undefined
  onClick: () => void
}

// ────────────────────────────────────────────────────────────────
// Shared layout classes
// ────────────────────────────────────────────────────────────────
function itemBaseClass(isSubItem: boolean, collapsed: boolean) {
  return cn(
    "group relative flex w-full items-center font-medium transition-all duration-150 text-left",
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:ring-inset",
    collapsed
      ? "h-9 justify-center rounded-xl px-0"
      : isSubItem
      ? "h-8 rounded-lg px-2.5 text-body-sm"
      : "h-9 rounded-lg px-2.5 text-meta"
  )
}

// ────────────────────────────────────────────────────────────────
// Tooltip wrapper — chỉ hiện khi collapsed
// ────────────────────────────────────────────────────────────────
function NavTooltip({
  label,
  collapsed,
  children,
}: {
  label: string
  collapsed: boolean
  children: React.ReactNode
}) {
  if (!collapsed) return <>{children}</>

  return (
    <div className="group relative flex w-full justify-center">
      {children}
      {/* Tooltip */}
      <div
        role="tooltip"
        className={cn(
          "pointer-events-none absolute left-full ml-2 z-50",
          "flex items-center gap-1.5 whitespace-nowrap rounded-lg",
          "bg-[#2A1E22] px-2.5 py-1.5 text-body-sm font-medium text-white",
          "shadow-lg opacity-0 transition-opacity duration-150",
          "group-hover:opacity-100",
          "-translate-y-1/2 top-1/2"
        )}
      >
        <span>{label}</span>
        <span className="h-0 w-0 border-y-4 border-y-transparent border-r-4 border-r-text absolute -left-1" />
      </div>
    </div>
  )
}

// ────────────────────────────────────────────────────────────────
// Coming Soon (disabled)
// ────────────────────────────────────────────────────────────────
function NavItemDisabled({
  item,
  isSubItem,
  collapsed,
  Icon,
}: {
  item: NavEntry
  isSubItem: boolean
  collapsed: boolean
  Icon: ComponentType<{ size?: number; className?: string; strokeWidth?: number }>
}) {
  return (
    <NavTooltip label={item.label} collapsed={collapsed}>
      <div
        aria-disabled="true"
        title={!collapsed ? COMING_SOON_LABEL : item.label}
        className={cn(itemBaseClass(isSubItem, collapsed), "cursor-not-allowed opacity-50")}
      >
        <Icon
          size={collapsed ? 18 : isSubItem ? 15 : 16}
          strokeWidth={1.8}
          className="shrink-0 text-text-muted"
          aria-hidden
        />
        {!collapsed && (
          <>
            <span className="ml-2.5 flex-1 truncate text-text-muted">{item.label}</span>
            <span className="ml-1 shrink-0 rounded-full bg-surface-alt px-1.5 py-0.5 text-caption font-extrabold uppercase tracking-wide text-text-muted">
              {COMING_SOON_LABEL}
            </span>
          </>
        )}
      </div>
    </NavTooltip>
  )
}

// ────────────────────────────────────────────────────────────────
// Main export
// ────────────────────────────────────────────────────────────────
export function DesktopNavItem({
  item,
  active,
  isSubItem = false,
  collapsed = false,
  iconComponent,
  onClick,
}: DesktopNavItemProps) {
  const Icon = iconComponent || Tag

  if (item.status === "COMING_SOON" || isRouteLocked(item.href)) {
    return (
      <NavItemDisabled
        item={item}
        isSubItem={isSubItem}
        collapsed={collapsed}
        Icon={Icon}
      />
    )
  }

  return (
    <NavTooltip label={item.label} collapsed={collapsed}>
      <button
        type="button"
        onClick={onClick}
        aria-current={active ? "page" : undefined}
        className={cn(
          itemBaseClass(isSubItem, collapsed),
          active
            ? "bg-selected text-primary border border-primary/20 shadow-xs"
            : "text-text-muted border border-transparent hover:bg-surface-alt hover:text-text"
        )}
      >
        {/* Dải chỉ báo trái khi active */}
        {active && !collapsed && (
          <span
            className="absolute left-0 top-2 bottom-2 w-[3px] rounded-r-full bg-primary"
            aria-hidden="true"
          />
        )}

        {/* Icon */}
        <Icon
          size={collapsed ? 18 : isSubItem ? 15 : 16}
          strokeWidth={active ? 2.4 : 1.9}
          aria-hidden
          className={cn(
            "shrink-0 transition-colors duration-150",
            active ? "text-primary" : "text-text-muted group-hover:text-text"
          )}
        />

        {/* Label + glow dot khi active collapsed */}
        {collapsed ? (
          active && (
            <span
              className="absolute -top-0.5 -right-0.5 h-2 w-2 rounded-full bg-primary ring-2 ring-surface"
              aria-hidden
            />
          )
        ) : (
          <span className="ml-2.5 flex-1 truncate">{item.label}</span>
        )}
      </button>
    </NavTooltip>
  )
}
