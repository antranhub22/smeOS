"use client"

import React from "react"
import { useOrderFocus, type OrderFocusBlock } from "./order-focus-context"

/** Lớp giao diện theo chuẩn Spotlight: khối đang chọn nổi bật, khối khác chìm xuống. */
export function spotlightClasses(active: boolean): { block: string; badge: string } {
  return active
    ? {
        block: "bg-surface border-primary/50 ring-2 ring-primary/20 shadow-sm opacity-100",
        badge: "bg-primary text-white",
      }
    : {
        block: "bg-surface/80 border-border opacity-60 hover:opacity-95",
        badge: "bg-surface-muted text-text-muted",
      }
}

export function SpotlightBlock({
  step,
  title,
  description,
  children,
}: {
  step: OrderFocusBlock
  title: string
  description?: string | undefined
  children: React.ReactNode
}) {
  const { activeBlock, setActiveBlock } = useOrderFocus()
  const active = activeBlock === step
  const cls = spotlightClasses(active)
  const headingId = `order-block-${step}-title`
  const activate = () => {
    if (!active) setActiveBlock(step)
  }

  return (
    <section
      aria-labelledby={headingId}
      data-active={active ? "true" : "false"}
      data-testid={`order-block-${step}`}
      onFocusCapture={activate}
      onPointerDownCapture={activate}
      className={`rounded-2xl border p-4 sm:p-5 transition-all duration-300 ${cls.block}`}
    >
      <header className="mb-4 flex items-start gap-3">
        <span
          aria-hidden="true"
          className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-caption font-extrabold transition-all duration-300 ${cls.badge}`}
        >
          {step}
        </span>
        <div className="min-w-0">
          <h3 id={headingId} className="text-body font-extrabold text-foreground leading-tight">
            {title}
          </h3>
          {description && <p className="mt-0.5 text-caption text-text-muted">{description}</p>}
        </div>
      </header>
      <div className="flex flex-col gap-4">{children}</div>
    </section>
  )
}
