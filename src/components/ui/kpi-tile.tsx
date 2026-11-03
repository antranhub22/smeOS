"use client"

import * as React from "react"
import { Eye, EyeOff, ArrowUpRight, ArrowDownRight } from "@/components/ui/icons"
import { InfoTip } from "@/components/ui/info-tip"
import { cn } from "@/lib/utils"

export interface KpiTileProps {
  label: string
  value: React.ReactNode
  /** Cho phép ẩn con số nhạy cảm (doanh thu, lợi nhuận) */
  sensitive?: boolean
  /** Giải thích cách tính nằm trong "?" (OPERATING_PRINCIPLES §6.6) */
  tip?: React.ReactNode
  /** Biểu tượng minh hoạ */
  icon?: React.ReactNode
  /** Tăng/giảm so với kỳ trước (vd: "+15.2%") */
  trend?: {
    value: string
    direction: "up" | "down" | "neutral"
    label?: string
  }
  /** Chú thích bổ trợ phía dưới */
  description?: React.ReactNode
  className?: string
}

export function KpiTile({
  label,
  value,
  sensitive = false,
  tip,
  icon,
  trend,
  description,
  className,
}: KpiTileProps) {
  const [isMasked, setIsMasked] = React.useState(sensitive)

  return (
    <div
      className={cn(
        "flex flex-col justify-between gap-3 rounded-2xl border border-border bg-surface p-5 shadow-xs transition-shadow hover:shadow-sm",
        className
      )}
    >
      {/* Header: Label + Icon + Tip + Mask Toggle */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 text-body-sm font-semibold text-text-muted min-w-0">
          {icon && <span className="text-text-muted shrink-0">{icon}</span>}
          <span className="truncate">{label}</span>
        </div>
        <div className="flex items-center gap-1.5 shrink-0">
          {sensitive && (
            <button
              type="button"
              onClick={() => setIsMasked(!isMasked)}
              aria-label={isMasked ? "Hiện số liệu" : "Ẩn số liệu"}
              className="text-text-muted hover:text-text p-1 rounded-md transition-colors focus-visible:outline-2 focus-visible:outline-primary"
            >
              {isMasked ? <EyeOff size={14} /> : <Eye size={14} />}
            </button>
          )}
          {tip && <InfoTip label={label}>{tip}</InfoTip>}
        </div>
      </div>

      {/* KPI Value */}
      <div className="flex items-baseline justify-between gap-2">
        <div className="text-display font-extrabold tracking-tight text-text tabular-nums select-all">
          {sensitive && isMasked ? "••••••••" : value}
        </div>
        {trend && (
          <div
            className={cn(
              "flex items-center gap-0.5 text-caption font-bold px-1.5 py-0.5 rounded-md shrink-0",
              trend.direction === "up" && "bg-success-bg text-success-text",
              trend.direction === "down" && "bg-danger-bg text-danger-text",
              trend.direction === "neutral" && "bg-surface-alt text-text-muted"
            )}
          >
            {trend.direction === "up" && <ArrowUpRight size={12} />}
            {trend.direction === "down" && <ArrowDownRight size={12} />}
            <span>{trend.value}</span>
          </div>
        )}
      </div>

      {/* Description / Subtext */}
      {description && (
        <div className="text-caption text-text-muted leading-tight">
          {description}
        </div>
      )}
    </div>
  )
}
