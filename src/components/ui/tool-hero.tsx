import * as React from "react"
import { InfoTip } from "./info-tip"

interface ToolHeroProps {
  icon: React.ElementType
  /** Tên công cụ ngắn (≤ 5 từ) */
  title: string
  /** Giải thích chi tiết — nằm trong "?" */
  detail: string
}

/** Đầu trang công cụ: icon lớn, tên ngắn, giải thích trong "?" (thử phong cách thoáng trên /cong-cu). */
export function ToolHero({ icon: Icon, title, detail }: ToolHeroProps) {
  return (
    <header className="flex items-center gap-4 p-5 sm:p-6 rounded-2xl bg-surface shadow-sm ring-1 ring-border/60">
      <div className="flex items-center justify-center w-16 h-16 shrink-0 rounded-2xl bg-primary text-primary-foreground">
        <Icon className="w-8 h-8" aria-hidden="true" />
      </div>
      <div className="flex items-center gap-2 min-w-0">
        <h1 className="text-display font-extrabold text-text tracking-tight">{title}</h1>
        <InfoTip label={title} side="bottom">{detail}</InfoTip>
      </div>
    </header>
  )
}
