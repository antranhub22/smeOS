"use client"

import * as React from "react"
import { Search, X } from "@/components/ui/icons"
import { Button } from "@/components/ui/button"
import { Disclosure } from "@/components/ui/disclosure"
import { cn } from "@/lib/utils"

export interface SearchFilterBarProps {
  searchValue?: string
  onSearchChange?: (value: string) => void
  searchPlaceholder?: string
  /** 2–3 bộ lọc chính xuất hiện ở thanh công cụ */
  quickFilters?: React.ReactNode
  /** Các bộ lọc phụ được thu gọn vào Disclosure */
  advancedFilters?: React.ReactNode
  advancedFiltersLabel?: string
  activeFilterCount?: number
  onResetFilters?: () => void
  resetLabel?: string
  className?: string
}

export function SearchFilterBar({
  searchValue = "",
  onSearchChange,
  searchPlaceholder = "Tìm kiếm…",
  quickFilters,
  advancedFilters,
  advancedFiltersLabel = "Bộ lọc nâng cao",
  activeFilterCount = 0,
  onResetFilters,
  resetLabel = "Xoá bộ lọc",
  className,
}: SearchFilterBarProps) {
  const hasActiveFilters = activeFilterCount > 0 || Boolean(searchValue)

  return (
    <div className={cn("space-y-2.5", className)}>
      <div className="flex flex-wrap sm:flex-nowrap items-center gap-2.5">
        {/* Search Input */}
        {onSearchChange && (
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-text-muted pointer-events-none" />
            <input
              type="text"
              value={searchValue}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder={searchPlaceholder}
              className={cn(
                "h-10 w-full rounded-xl border border-border bg-surface pl-9.5 pr-8 text-body-sm text-text",
                "placeholder:text-text-muted hover:border-primary/40",
                "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
              )}
            />
            {searchValue && (
              <button
                type="button"
                onClick={() => onSearchChange("")}
                aria-label="Xoá tìm kiếm"
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-text-muted hover:text-text p-1 rounded-md"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
        )}

        {/* 2-3 Quick Filters */}
        {quickFilters && (
          <div className="flex flex-wrap items-center gap-2">
            {quickFilters}
          </div>
        )}

        {/* Reset Filters Button */}
        {hasActiveFilters && onResetFilters && (
          <Button
            size="xs"
            variant="ghost"
            onClick={onResetFilters}
            className="text-text-muted hover:text-danger flex-shrink-0"
          >
            {resetLabel}
            {activeFilterCount > 0 && (
              <span className="ml-1 rounded-full bg-surface-alt px-1.5 py-0.5 text-caption font-bold text-text">
                {activeFilterCount}
              </span>
            )}
          </Button>
        )}
      </div>

      {/* Advanced Filters in Disclosure */}
      {advancedFilters && (
        <Disclosure
          label={advancedFiltersLabel}
          appliedSummary={activeFilterCount > 0 ? `Đang lọc ${activeFilterCount} điều kiện` : undefined}
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 p-3">
            {advancedFilters}
          </div>
        </Disclosure>
      )}
    </div>
  )
}
