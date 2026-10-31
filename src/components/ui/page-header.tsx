import * as React from "react"
import { cn } from "@/lib/utils"
import { InfoTip } from "@/components/ui/info-tip"

export interface PageHeaderProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "title"> {
  title: React.ReactNode
  description?: React.ReactNode
  breadcrumbs?: React.ReactNode
  badge?: React.ReactNode
  actions?: React.ReactNode
  /** Giải thích chi tiết đặt trong dấu "?" cạnh tiêu đề (OPERATING_PRINCIPLES §6.1) */
  tip?: React.ReactNode
}

export const PageHeader = React.forwardRef<HTMLDivElement, PageHeaderProps>(
  function PageHeader({ className, title, description, breadcrumbs, badge, actions, tip, ...props }, ref) {
    return (
      <div
        ref={ref}
        className={cn(
          "flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between pb-1",
          className
        )}
        {...props}
      >
        <div className="min-w-0 flex-1 space-y-1">
          {breadcrumbs && <div className="text-caption text-text-muted mb-1">{breadcrumbs}</div>}
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-title sm:text-display font-bold text-text tracking-tight truncate">
              {title}
            </h1>
            {badge}
            {tip && <InfoTip label={typeof title === "string" ? title : "Giải thích"}>{tip}</InfoTip>}
          </div>
          {description && (
            <p className="text-body-sm text-text-muted max-w-3xl">
              {description}
            </p>
          )}
        </div>
        {actions && (
          <div className="flex flex-wrap items-center gap-2 pt-1 sm:pt-0 shrink-0">
            {actions}
          </div>
        )}
      </div>
    )
  }
)
PageHeader.displayName = "PageHeader"
