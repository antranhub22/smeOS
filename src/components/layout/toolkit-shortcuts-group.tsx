"use client"

/**
 * toolkit-shortcuts-group.tsx — Nhóm "01 · CÔNG CỤ" trong Sidebar (StoreOS)
 *
 * Thiết kế 3 lớp:
 *  1. Mục cố định "Thư viện 51 công cụ" → /cong-cu
 *  2. Danh sách Shortcuts (tối đa 5, user tự pin, lưu localStorage per org)
 *  3. Nút "+ Thêm" mở mini-picker chọn công cụ muốn pin
 *
 * SRP: File này chỉ phụ trách render nhóm Công cụ. Storage ở nav-toolkit-shortcuts.ts.
 */

import { useState, useEffect, useCallback, useRef } from "react"
import { LayoutGrid, Plus, X, Pin, PinOff, RotateCcw, ChevronDown } from "lucide-react"
import { cn } from "@/lib/utils"
import { NAV_ICONS as ICONS } from "./nav-icons"
import { DesktopNavItem } from "./desktop-nav-item"
import type { NavEntry } from "./nav-model"
import {
  getEffectiveShortcutKeys,
  pinShortcut,
  unpinShortcut,
  resetShortcuts,
  hasCustomShortcuts,
  MAX_SHORTCUTS,
  DEFAULT_SHORTCUT_KEYS,
} from "./nav-toolkit-shortcuts"

// ────────────────────────────────────────────────────────────────
// Types
// ────────────────────────────────────────────────────────────────

export interface ToolkitShortcutsGroupProps {
  /** Toàn bộ NavEntry thuộc nhóm cong-cu (không gồm mục Thư viện) */
  toolEntries: NavEntry[]
  /** Mục "Thư viện 51 công cụ" cố định */
  libraryEntry: NavEntry
  collapsed: boolean
  expanded: boolean
  pathname: string
  orgId?: string | null | undefined
  onNavigate: (href: string) => void
  onToggleGroup: (key: string, current: boolean) => void
}

// ────────────────────────────────────────────────────────────────
// Component
// ────────────────────────────────────────────────────────────────

export function ToolkitShortcutsGroup({
  toolEntries,
  libraryEntry,
  collapsed,
  expanded,
  pathname,
  orgId,
  onNavigate,
  onToggleGroup,
}: ToolkitShortcutsGroupProps) {
  const [shortcutKeys, setShortcutKeys] = useState<string[]>(() =>
    getEffectiveShortcutKeys(orgId)
  )
  const [pickerOpen, setPickerOpen] = useState(false)
  const pickerRef = useRef<HTMLDivElement>(null)

  // Đồng bộ lại khi orgId thay đổi (switch tổ chức)
  useEffect(() => {
    setShortcutKeys(getEffectiveShortcutKeys(orgId))
  }, [orgId])

  // Đóng picker khi click ngoài
  useEffect(() => {
    if (!pickerOpen) return
    function handleClickOutside(e: MouseEvent) {
      if (pickerRef.current && !pickerRef.current.contains(e.target as Node)) {
        setPickerOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [pickerOpen])

  const handlePin = useCallback(
    (navKey: string) => {
      const next = pinShortcut(orgId, navKey)
      setShortcutKeys([...next])
    },
    [orgId]
  )

  const handleUnpin = useCallback(
    (navKey: string) => {
      const next = unpinShortcut(orgId, navKey)
      setShortcutKeys([...next])
    },
    [orgId]
  )

  const handleReset = useCallback(() => {
    resetShortcuts(orgId)
    setShortcutKeys([...DEFAULT_SHORTCUT_KEYS])
    setPickerOpen(false)
  }, [orgId])

  // Shortcut entries hiển thị theo thứ tự đã pin
  const shortcutEntries: NavEntry[] = shortcutKeys
    .map((key) => toolEntries.find((e) => e.navKey === key))
    .filter((e): e is NavEntry => e !== undefined)

  // Entries chưa pin (để hiện trong picker)
  const unpinnedEntries = toolEntries.filter((e) => !shortcutKeys.includes(e.navKey))

  const isActive = (entry: NavEntry) =>
    pathname === entry.href || (entry.href !== "/" && pathname.startsWith(`${entry.href}/`))

  // ── Collapsed mode: chỉ icon ─────────────────────────────────
  if (collapsed) {
    return (
      <div className="flex flex-col gap-1">
        {/* Thư viện */}
        <DesktopNavItem
          item={libraryEntry}
          active={isActive(libraryEntry)}
          collapsed
          iconComponent={ICONS[libraryEntry.iconKey]}
          onClick={() => onNavigate(libraryEntry.href)}
        />
        {/* Shortcuts */}
        {shortcutEntries.map((entry) => (
          <DesktopNavItem
            key={entry.href}
            item={entry}
            active={isActive(entry)}
            collapsed
            iconComponent={ICONS[entry.iconKey]}
            onClick={() => onNavigate(entry.href)}
          />
        ))}
        <div className="my-1 h-px w-full rounded-full bg-border/60" aria-hidden />
      </div>
    )
  }

  // ── Expanded mode ─────────────────────────────────────────────
  return (
    <div className="space-y-0.5">
      {/* Header nhóm — collapsible */}
      <button
        type="button"
        aria-expanded={expanded}
        onClick={() => onToggleGroup("cong-cu", expanded)}
        className={cn(
          "group flex w-full items-center justify-between gap-1.5 rounded-lg px-2 py-1 text-left select-none cursor-pointer",
          "text-caption font-bold uppercase tracking-wider text-text-muted hover:text-text hover:bg-surface-alt/50 transition-colors duration-150",
          "focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary/40"
        )}
      >
        <span className="truncate text-left flex-1">01 · CÔNG CỤ</span>
        <ChevronDown
          size={12}
          aria-hidden
          className={cn(
            "shrink-0 transition-transform duration-200 text-text-muted group-hover:text-text",
            expanded ? "rotate-0" : "-rotate-90"
          )}
        />
      </button>

      {expanded && (
        <div className="space-y-0.5">
          {/* 1. Thư viện cố định */}
          <DesktopNavItem
            item={libraryEntry}
            active={isActive(libraryEntry)}
            iconComponent={ICONS[libraryEntry.iconKey]}
            onClick={() => onNavigate(libraryEntry.href)}
          />

          {/* 2. Divider */}
          {shortcutEntries.length > 0 && (
            <div className="flex items-center gap-2 px-2.5 pt-1 pb-0.5">
              <div className="flex-1 h-px bg-border/50" />
              <span className="text-[10px] font-semibold uppercase tracking-widest text-text-muted/70 flex items-center gap-1">
                <Pin size={8} aria-hidden />
                Lối tắt
              </span>
              <div className="flex-1 h-px bg-border/50" />
            </div>
          )}

          {/* 3. Shortcut entries */}
          {shortcutEntries.map((entry) => (
            <div key={entry.href} className="group/shortcut relative flex items-center">
              <DesktopNavItem
                item={entry}
                active={isActive(entry)}
                iconComponent={ICONS[entry.iconKey]}
                onClick={() => onNavigate(entry.href)}
              />
              {/* Nút bỏ pin — hiện khi hover */}
              <button
                type="button"
                aria-label={`Bỏ pin "${entry.label}"`}
                onClick={(e) => { e.stopPropagation(); handleUnpin(entry.navKey) }}
                className={cn(
                  "absolute right-1.5 z-10 flex h-5 w-5 items-center justify-center rounded-md",
                  "text-text-muted hover:text-destructive hover:bg-destructive/10 transition-all duration-150",
                  "opacity-0 group-hover/shortcut:opacity-100"
                )}
              >
                <X size={11} />
              </button>
            </div>
          ))}

          {/* 4. Nút thêm shortcut */}
          {shortcutKeys.length < MAX_SHORTCUTS && (
            <div className="relative" ref={pickerRef}>
              <button
                type="button"
                id="btn-add-toolkit-shortcut"
                aria-label="Thêm lối tắt công cụ"
                aria-expanded={pickerOpen}
                onClick={() => setPickerOpen((v) => !v)}
                className={cn(
                  "flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 text-meta text-left",
                  "border border-dashed border-border/60 hover:border-primary/40",
                  "text-text-muted hover:text-primary hover:bg-primary/5 transition-all duration-150",
                  pickerOpen && "border-primary/40 text-primary bg-primary/5"
                )}
              >
                <Plus size={13} strokeWidth={2.5} aria-hidden />
                <span>Thêm lối tắt</span>
                <span className="ml-auto text-caption text-text-muted/60">
                  {shortcutKeys.length}/{MAX_SHORTCUTS}
                </span>
              </button>

              {/* Picker dropdown */}
              {pickerOpen && (
                <ToolkitPicker
                  entries={unpinnedEntries}
                  pinnedKeys={shortcutKeys}
                  isCustomized={hasCustomShortcuts(orgId)}
                  onPin={handlePin}
                  onReset={handleReset}
                  onClose={() => setPickerOpen(false)}
                />
              )}
            </div>
          )}

          {/* Khi đã đủ MAX: chỉ hiện nút reset nếu đã tùy chỉnh */}
          {shortcutKeys.length >= MAX_SHORTCUTS && hasCustomShortcuts(orgId) && (
            <button
              type="button"
              onClick={handleReset}
              className="flex w-full items-center gap-2 rounded-lg px-2.5 py-1 text-caption text-text-muted hover:text-text hover:bg-surface-alt/50 transition-colors"
            >
              <RotateCcw size={11} aria-hidden />
              <span>Đặt lại mặc định</span>
            </button>
          )}
        </div>
      )}
    </div>
  )
}

// ────────────────────────────────────────────────────────────────
// ToolkitPicker — Mini dropdown chọn công cụ để pin
// ────────────────────────────────────────────────────────────────

interface ToolkitPickerProps {
  entries: NavEntry[]
  pinnedKeys: string[]
  isCustomized: boolean
  onPin: (navKey: string) => void
  onReset: () => void
  onClose: () => void
}

function ToolkitPicker({
  entries,
  isCustomized,
  onPin,
  onReset,
  onClose,
}: ToolkitPickerProps) {
  return (
    <div
      className={cn(
        "absolute left-0 right-0 top-full z-50 mt-1 rounded-xl border border-border",
        "bg-surface shadow-lg shadow-black/10 backdrop-blur-sm",
        "animate-in fade-in slide-in-from-top-2 duration-150"
      )}
      role="dialog"
      aria-label="Chọn công cụ để ghim"
    >
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border px-3 py-2">
        <span className="text-meta font-semibold text-text">Chọn lối tắt</span>
        <div className="flex items-center gap-1">
          {isCustomized && (
            <button
              type="button"
              onClick={onReset}
              className="flex items-center gap-1 rounded-md px-2 py-0.5 text-caption text-text-muted hover:text-text hover:bg-surface-alt transition-colors"
            >
              <RotateCcw size={10} />
              Mặc định
            </button>
          )}
          <button
            type="button"
            aria-label="Đóng"
            onClick={onClose}
            className="rounded-md p-0.5 text-text-muted hover:text-text hover:bg-surface-alt transition-colors"
          >
            <X size={13} />
          </button>
        </div>
      </div>

      {/* Danh sách công cụ chưa pin */}
      <div className="max-h-56 overflow-y-auto py-1">
        {entries.length === 0 ? (
          <p className="px-3 py-4 text-center text-meta text-text-muted">
            Đã ghim tất cả công cụ khả dụng
          </p>
        ) : (
          entries.map((entry) => {
            const Icon = ICONS[entry.iconKey]
            return (
              <button
                key={entry.navKey}
                type="button"
                onClick={() => { onPin(entry.navKey); onClose() }}
                className={cn(
                  "flex w-full items-center gap-2.5 px-3 py-2 text-meta text-left",
                  "hover:bg-surface-alt transition-colors duration-100"
                )}
              >
                {Icon && (
                  <Icon size={14} className="shrink-0 text-text-muted" aria-hidden />
                )}
                <span className="flex-1 truncate text-text">{entry.label}</span>
                <PinOff size={11} className="shrink-0 text-text-muted/60" aria-hidden />
              </button>
            )
          })
        )}
      </div>
    </div>
  )
}
