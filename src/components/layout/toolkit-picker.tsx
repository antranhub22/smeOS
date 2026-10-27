"use client"

/**
 * toolkit-picker.tsx — Dropdown chọn công cụ để pin vào shortcuts (SRP)
 */

import { RotateCcw, X, PinOff } from "lucide-react"
import { cn } from "@/lib/utils"
import { NAV_ICONS as ICONS } from "./nav-icons"
import type { NavEntry } from "./nav-model"

export interface ToolkitPickerProps {
  entries: NavEntry[]
  pinnedKeys: string[]
  isCustomized: boolean
  onPin: (navKey: string) => void
  onReset: () => void
  onClose: () => void
}

export function ToolkitPicker({
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
                onClick={() => {
                  onPin(entry.navKey)
                  onClose()
                }}
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
