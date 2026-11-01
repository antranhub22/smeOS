import * as React from "react"
import { cn } from "@/lib/utils"
import { InfoTip } from "@/components/ui/info-tip"

export interface StatTileProps {
  label: string
  value: React.ReactNode
  /** Giải thích cách tính — nằm trong "?" (OPERATING_PRINCIPLES §6.6) */
  tip?: React.ReactNode
  /** Biểu tượng nhỏ đặt cạnh nhãn, tuỳ chọn */
  icon?: React.ReactNode
  className?: string
}

/**
 * @deprecated Vui lòng chuyển sang sử dụng `KpiTile` từ `@/components/ui/kpi-tile` (theo ADR-011 / D-UI-12).
 * `StatTile` sẽ bị loại bỏ hoàn toàn trong phiên bản Major tiếp theo của Design System.
 */
export function StatTile({ label, value, tip, icon, className }: StatTileProps) {
  return (
    <div className={cn("flex flex-col gap-2 rounded-2xl bg-surface p-5 shadow-sm ring-1 ring-border/60", className)}>
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 text-body-sm font-medium text-text-muted">
          {icon}
          <span>{label}</span>
        </div>
        {tip && <InfoTip label={label}>{tip}</InfoTip>}
      </div>
      <div className="text-display font-extrabold tracking-tight text-text tabular-nums">{value}</div>
    </div>
  )
}
