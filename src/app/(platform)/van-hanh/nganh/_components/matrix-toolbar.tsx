"use client"

import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import type { MatrixGroup } from "../_lib/types"

interface MatrixToolbarProps {
  searchQuery: string
  onSearchChange: (q: string) => void
  selectedGroup: string
  onGroupChange: (g: string) => void
  groups: MatrixGroup[]
  hasChanges: boolean
  changeCount: number
  isSaving: boolean
  onSaveClick: () => void
  onResetClick: () => void
}

export function MatrixToolbar({
  searchQuery,
  onSearchChange,
  selectedGroup,
  onGroupChange,
  groups,
  hasChanges,
  changeCount,
  isSaving,
  onSaveClick,
  onResetClick,
}: MatrixToolbarProps) {
  return (
    <div className="flex flex-col gap-3 rounded-xl border border-border bg-surface p-4 shadow-sm md:flex-row md:items-center md:justify-between">
      <div className="flex flex-1 flex-wrap items-center gap-2">
        <div className="w-full sm:w-64">
          <Input
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Tìm theo tên chức năng, đường dẫn..."
            className="w-full"
          />
        </div>

        <div className="flex flex-wrap gap-1">
          <button
            type="button"
            onClick={() => onGroupChange("ALL")}
            className={`rounded-lg px-3 py-1.5 text-body-sm font-medium transition-colors ${
              selectedGroup === "ALL"
                ? "bg-primary text-primary-foreground"
                : "bg-surface-alt text-text hover:bg-surface-alt/80"
            }`}
          >
            Tất cả nhóm
          </button>
          {groups.map((group) => (
            <button
              key={group.key}
              type="button"
              onClick={() => onGroupChange(group.key)}
              className={`rounded-lg px-3 py-1.5 text-body-sm font-medium transition-colors ${
                selectedGroup === group.key
                  ? "bg-primary text-primary-foreground"
                  : "bg-surface-alt text-text hover:bg-surface-alt/80"
              }`}
            >
              {group.label}
            </button>
          ))}
        </div>
      </div>

      <div className="flex items-center gap-2 border-t border-border pt-3 md:border-t-0 md:pt-0">
        {hasChanges && (
          <Badge tone="warning" className="px-2.5 py-1">
            {changeCount} thay đổi chưa lưu
          </Badge>
        )}
        <Button
          variant="outline"
          onClick={onResetClick}
          disabled={!hasChanges || isSaving}
        >
          Đặt lại
        </Button>
        <Button
          variant="primary"
          onClick={onSaveClick}
          disabled={!hasChanges || isSaving}
        >
          {isSaving ? "Đang lưu..." : `Lưu ma trận${hasChanges ? ` (${changeCount})` : ""}`}
        </Button>
      </div>
    </div>
  )
}
