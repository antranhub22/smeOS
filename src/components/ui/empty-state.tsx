import type { LucideIcon } from "@/components/ui/icons"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { IconTile } from "@/components/ui/app-icon"
import { cn } from "@/lib/utils"

export interface EmptyStateProps {
  title: string
  reason?: string | undefined
  action?: {
    label: string
    onClick?: () => void
    href?: string
  } | undefined
  icon?: LucideIcon | undefined
  className?: string | undefined
}

export function EmptyState({ title, reason, action, icon: Icon, className }: EmptyStateProps) {
  return (
    <div className={cn("flex flex-col items-center justify-center gap-2 p-6 text-center", className)}>
      {Icon && (
        // Icon lớn làm điểm nhìn (OPERATING_PRINCIPLES §6.2): ô nhạt 48px, icon 24px.
        <div className="mb-1 flex h-12 w-12 items-center justify-center rounded-2xl bg-primary-muted text-primary ring-1 ring-inset ring-primary/15">
          <Icon size={24} weight="duotone" aria-hidden="true" />
        </div>
      )}
      <div className="text-title-sm font-bold text-text">{title}</div>
      {reason && <p className="text-body-sm text-text-muted max-w-sm">{reason}</p>}
      {action && (
        <div className="mt-1">
          {action.href ? (
            <Link
              href={action.href as never}
              className="inline-flex items-center justify-center h-11 px-4 text-sm font-semibold rounded-xl border border-border bg-transparent text-text hover:bg-surface-alt transition-colors"
            >
              {action.label}
            </Link>
          ) : (
            <Button size="sm" variant="outline" onClick={action.onClick}>
              {action.label}
            </Button>
          )}
        </div>
      )}
    </div>
  )
}
