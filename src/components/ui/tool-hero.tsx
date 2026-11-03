import * as React from "react"
import { InfoTip } from "./info-tip"
import { IconTile, type IconTone } from "./app-icon"

interface ToolHeroProps {
  /** Tên icon trong bộ chuẩn (`app-icon.tsx`) */
  icon: string
  tone?: IconTone
  /** Tên công cụ ngắn (≤ 5 từ) */
  title: string
  /** Giải thích chi tiết — nằm trong "?" */
  detail: string
}

/** Đầu trang công cụ: icon lớn, tên ngắn, giải thích trong "?" (thử phong cách thoáng trên /cong-cu). */
export function ToolHero({ icon, tone = "plum", title, detail }: ToolHeroProps) {
  return (
    <header className="flex items-center gap-4 p-5 sm:p-6 rounded-2xl bg-surface shadow-sm ring-1 ring-border/60">
      <IconTile name={icon} tone={tone} variant="solid" />
      <div className="flex items-center gap-2 min-w-0">
        <h1 className="text-display font-extrabold text-text tracking-tight">{title}</h1>
        <InfoTip label={title} side="bottom">{detail}</InfoTip>
      </div>
    </header>
  )
}
