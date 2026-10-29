import * as React from "react"
import { cn } from "@/lib/utils"

export type ResultStage = "draft" | "saved" | "published"

const STAGE_LABEL: Record<ResultStage, string> = {
  draft: "Bản nháp",
  saved: "Đã lưu",
  published: "Đã đăng",
}

const STAGE_TONE: Record<ResultStage, string> = {
  draft: "bg-warning-bg text-warning-text border-warning-border",
  saved: "bg-info-bg text-info-text border-info-border",
  published: "bg-success-bg text-success-text border-success-border",
}

export interface ResultPanelProps {
  title: string
  stage?: ResultStage
  /** Kết quả hoặc bản xem trước — là trọng tâm của panel. */
  children: React.ReactNode
  /** Đúng một hành động chính (03a UX-010). */
  primaryAction?: React.ReactNode
  /** Hành động phụ: tải xuống, tạo lại, chỉnh sửa… */
  secondaryActions?: React.ReactNode
  /** Phần còn thiếu nếu kết quả chưa hoàn chỉnh. */
  missing?: string[]
  className?: string
}

/** Kết quả + hành động tiếp theo (UX-P05). */
export function ResultPanel({
  title,
  stage,
  children,
  primaryAction,
  secondaryActions,
  missing,
  className,
}: ResultPanelProps) {
  return (
    <section aria-label={title} className={cn("flex flex-col gap-3 rounded-2xl border border-border bg-surface p-4", className)}>
      <header className="flex items-center justify-between gap-2">
        <h3 className="text-title-sm font-bold text-text">{title}</h3>
        {stage && (
          <span className={cn("rounded-full border px-2 py-0.5 text-caption font-semibold", STAGE_TONE[stage])}>
            {STAGE_LABEL[stage]}
          </span>
        )}
      </header>
      <div>{children}</div>
      {missing && missing.length > 0 && (
        <div className="rounded-xl border border-warning-border bg-warning-bg px-3 py-2 text-body-sm text-warning-text">
          <p className="font-semibold">Còn thiếu</p>
          <ul className="mt-1 list-disc pl-5">
            {missing.map((m) => (
              <li key={m}>{m}</li>
            ))}
          </ul>
        </div>
      )}
      {(primaryAction || secondaryActions) && (
        <footer className="flex flex-col-reverse gap-2 sm:flex-row sm:items-center sm:justify-end">
          {secondaryActions && <div className="flex flex-wrap gap-2">{secondaryActions}</div>}
          {primaryAction}
        </footer>
      )}
    </section>
  )
}
