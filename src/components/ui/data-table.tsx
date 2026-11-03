"use client"

import * as React from "react"
import { ChevronUp, ChevronDown, ChevronLeft, ChevronRight } from "@/components/ui/icons"
import { Checkbox } from "@/components/ui/checkbox"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export type SortDirection = "asc" | "desc" | null

export interface ColumnDef<T> {
  id: string
  header: React.ReactNode
  cell: (row: T, index: number) => React.ReactNode
  sortable?: boolean
  className?: string
  headerClassName?: string
  mobileCardTitle?: boolean
  mobileCardSubtitle?: boolean
  hideOnMobile?: boolean
}

export interface DataTableProps<T> {
  columns: ColumnDef<T>[]
  data: T[]
  getRowId?: (row: T, index: number) => string
  // Selection (UX-P10)
  selectable?: boolean
  selectedIds?: Set<string>
  onSelectionChange?: (selectedIds: Set<string>) => void
  // Sorting
  sortColumn?: string | null
  sortDirection?: SortDirection
  onSortChange?: (columnId: string, direction: SortDirection) => void
  // Loading & Empty
  loading?: boolean
  emptyMessage?: React.ReactNode
  className?: string
}

export function DataTable<T>({
  columns,
  data,
  getRowId = (_row, index) => String(index),
  selectable = false,
  selectedIds = new Set(),
  onSelectionChange,
  sortColumn,
  sortDirection,
  onSortChange,
  loading = false,
  emptyMessage = "Không có dữ liệu",
  className,
}: DataTableProps<T>) {
  const allIds = React.useMemo(
    () => data.map((row, index) => getRowId(row, index)),
    [data, getRowId]
  )

  const isAllSelected =
    data.length > 0 && allIds.every((id) => selectedIds.has(id))
  const isSomeSelected =
    data.length > 0 &&
    allIds.some((id) => selectedIds.has(id)) &&
    !isAllSelected

  function handleSelectAll() {
    if (!onSelectionChange) return
    if (isAllSelected) {
      onSelectionChange(new Set())
    } else {
      onSelectionChange(new Set(allIds))
    }
  }

  function handleToggleRow(id: string) {
    if (!onSelectionChange) return
    const next = new Set(selectedIds)
    if (next.has(id)) {
      next.delete(id)
    } else {
      next.add(id)
    }
    onSelectionChange(next)
  }

  function handleHeaderClick(col: ColumnDef<T>) {
    if (!col.sortable || !onSortChange) return
    if (sortColumn !== col.id) {
      onSortChange(col.id, "asc")
    } else if (sortDirection === "asc") {
      onSortChange(col.id, "desc")
    } else {
      onSortChange(col.id, null)
    }
  }

  return (
    <div className={cn("w-full space-y-3", className)}>
      {/* Desktop Table View */}
      <div className="hidden sm:block relative w-full overflow-x-auto rounded-xl border border-border bg-surface shadow-xs">
        <table className="w-full caption-bottom text-body-sm text-text border-collapse">
          <thead>
            <tr className="border-b border-border bg-surface-alt/70 font-semibold text-text">
              {selectable && (
                <th className="w-10 px-3 py-[var(--table-py,10px)] text-center align-middle">
                  <Checkbox
                    checked={isAllSelected || isSomeSelected}
                    onCheckedChange={handleSelectAll}
                    aria-label="Chọn tất cả các hàng"
                  />
                </th>
              )}
              {columns.map((col) => {
                const isSorted = sortColumn === col.id
                return (
                  <th
                    key={col.id}
                    onClick={() => handleHeaderClick(col)}
                    className={cn(
                      "px-[var(--table-px,14px)] py-[var(--table-py,10px)] text-left align-middle font-bold text-caption text-text-muted uppercase tracking-wider select-none",
                      col.sortable && "cursor-pointer hover:text-text",
                      col.headerClassName
                    )}
                  >
                    <div className="flex items-center gap-1.5">
                      <span>{col.header}</span>
                      {col.sortable && (
                        <span className="text-text-muted">
                          {isSorted && sortDirection === "asc" ? (
                            <ChevronUp className="h-3.5 w-3.5 text-primary" />
                          ) : isSorted && sortDirection === "desc" ? (
                            <ChevronDown className="h-3.5 w-3.5 text-primary" />
                          ) : (
                            <ChevronDown className="h-3.5 w-3.5 opacity-30" />
                          )}
                        </span>
                      )}
                    </div>
                  </th>
                )
              })}
            </tr>
          </thead>
          <tbody className="divide-y divide-border/60">
            {loading ? (
              <tr>
                <td
                  colSpan={columns.length + (selectable ? 1 : 0)}
                  className="p-8 text-center text-text-muted"
                >
                  Đang nạp dữ liệu…
                </td>
              </tr>
            ) : data.length === 0 ? (
              <tr>
                <td
                  colSpan={columns.length + (selectable ? 1 : 0)}
                  className="p-8 text-center text-text-muted"
                >
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              data.map((row, index) => {
                const rowId = getRowId(row, index)
                const isSelected = selectedIds.has(rowId)

                return (
                  <tr
                    key={rowId}
                    data-state={isSelected ? "selected" : undefined}
                    className={cn(
                      "transition-colors hover:bg-surface-alt/50",
                      isSelected && "bg-selected/50"
                    )}
                  >
                    {selectable && (
                      <td className="w-10 px-3 py-[var(--table-py,10px)] text-center align-middle">
                        <Checkbox
                          checked={isSelected}
                          onCheckedChange={() => handleToggleRow(rowId)}
                          aria-label={`Chọn hàng ${index + 1}`}
                        />
                      </td>
                    )}
                    {columns.map((col) => (
                      <td
                        key={col.id}
                        className={cn(
                          "px-[var(--table-px,14px)] py-[var(--table-py,10px)] align-middle text-body-sm text-text",
                          col.className
                        )}
                      >
                        {col.cell(row, index)}
                      </td>
                    ))}
                  </tr>
                )
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Mobile Card Stacking View (< sm) */}
      <div className="sm:hidden space-y-2.5">
        {loading ? (
          <div className="p-6 text-center text-text-muted rounded-xl border border-border bg-surface">
            Đang nạp dữ liệu…
          </div>
        ) : data.length === 0 ? (
          <div className="p-6 text-center text-text-muted rounded-xl border border-border bg-surface">
            {emptyMessage}
          </div>
        ) : (
          data.map((row, index) => {
            const rowId = getRowId(row, index)
            const isSelected = selectedIds.has(rowId)

            return (
              <div
                key={rowId}
                data-state={isSelected ? "selected" : undefined}
                className={cn(
                  "rounded-xl border border-border bg-surface p-4 shadow-xs transition-colors space-y-2",
                  isSelected && "border-primary/50 bg-selected/30"
                )}
              >
                {selectable && (
                  <div className="flex items-center justify-between border-b border-border/50 pb-2">
                    <span className="text-caption font-semibold text-text-muted">
                      Hàng #{index + 1}
                    </span>
                    <Checkbox
                      checked={isSelected}
                      onCheckedChange={() => handleToggleRow(rowId)}
                      aria-label={`Chọn thẻ ${index + 1}`}
                    />
                  </div>
                )}
                <div className="grid gap-2">
                  {columns
                    .filter((col) => !col.hideOnMobile)
                    .map((col) => (
                      <div key={col.id} className="flex items-center justify-between gap-2">
                        <span className="text-caption font-medium text-text-muted">
                          {col.header}
                        </span>
                        <div className="text-body-sm text-text font-medium text-right">
                          {col.cell(row, index)}
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}

export interface PaginationProps {
  currentPage: number
  totalPages: number
  onPageChange: (page: number) => void
  className?: string
}

export function Pagination({
  currentPage,
  totalPages,
  onPageChange,
  className,
}: PaginationProps) {
  if (totalPages <= 1) return null

  return (
    <nav
      aria-label="Phân trang dữ liệu"
      className={cn("flex items-center justify-between gap-2 px-1 py-2", className)}
    >
      <div className="text-caption text-text-muted">
        Trang <span className="font-semibold text-text">{currentPage}</span> / {totalPages}
      </div>
      <div className="flex items-center gap-1.5">
        <Button
          size="xs"
          variant="outline"
          disabled={currentPage <= 1}
          onClick={() => onPageChange(currentPage - 1)}
          aria-label="Trang trước"
        >
          <ChevronLeft className="h-3.5 w-3.5" />
          <span className="hidden sm:inline">Trước</span>
        </Button>
        <Button
          size="xs"
          variant="outline"
          disabled={currentPage >= totalPages}
          onClick={() => onPageChange(currentPage + 1)}
          aria-label="Trang sau"
        >
          <span className="hidden sm:inline">Sau</span>
          <ChevronRight className="h-3.5 w-3.5" />
        </Button>
      </div>
    </nav>
  )
}
