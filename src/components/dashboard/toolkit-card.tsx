"use client"

import React from "react"
import * as LucideIcons from "lucide-react"
import { useRouter } from "next/navigation"
import type { ToolDefinition, ToolStatus } from "@/modules/toolkit/domain/toolkit-catalog"
import { STATUS_DISPLAY, LABEL_DISPLAY } from "@/modules/toolkit/domain/toolkit-catalog"

// ── Status badge styling ───────────────────────────────────────────

const STATUS_STYLE: Record<ToolStatus, string> = {
  DONE: "bg-success-bg text-success border-success-border",
  IN_PROGRESS: "bg-warning-bg text-warning border-warning-border",
  FOUNDATION: "bg-info-bg text-info border-info-border",
  PLANNED: "bg-surface-alt text-text-muted border-border",
}

const PROGRESS_BAR_STYLE: Record<ToolStatus, string> = {
  DONE: "bg-success",
  IN_PROGRESS: "bg-warning",
  FOUNDATION: "bg-info",
  PLANNED: "bg-border",
}

// ── ToolCard ───────────────────────────────────────────────────────

interface ToolCardProps {
  tool: ToolDefinition
  isDev: boolean
}

export function ToolCard({ tool, isDev }: ToolCardProps) {
  const router = useRouter()
  const iconsMap = LucideIcons as unknown as Record<string, React.ElementType>
  const IconComponent = iconsMap[tool.icon] || LucideIcons.Sparkles

  const isClickable = tool.href !== null
  const statusInfo = STATUS_DISPLAY[tool.status]

  const handleClick = () => {
    if (isClickable && tool.href) {
      router.push(tool.href as never)
    }
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={!isClickable}
      aria-disabled={!isClickable || undefined}
      className={`group relative flex flex-col text-left p-4 rounded-xl border transition-all duration-200 ${
        isClickable
          ? "bg-surface border-border hover:border-primary/50 hover:shadow-md cursor-pointer"
          : "bg-surface border-border/60 opacity-75 cursor-not-allowed"
      }`}
    >
      {/* Top row: Icon + Số thứ tự + Status badge */}
      <div className="flex items-start justify-between w-full mb-2.5">
        <div className="flex items-center gap-2.5">
          <div
            className={`flex items-center justify-center w-10 h-10 rounded-lg transition-colors ${
              tool.status === "DONE"
                ? "bg-success-bg text-success group-hover:bg-success group-hover:text-surface"
                : tool.status === "IN_PROGRESS"
                ? "bg-warning-bg text-warning group-hover:bg-warning group-hover:text-surface"
                : "bg-surface-alt text-text-muted"
            }`}
          >
            <IconComponent className="w-5 h-5" aria-hidden="true" />
          </div>
          {tool.id >= 0 && (
            <span className="text-caption font-bold text-text-muted">
              #{String(tool.id).padStart(2, "0")}
            </span>
          )}
        </div>

        {isDev && (
          <span
            className={`inline-flex items-center px-2 py-0.5 rounded-full text-caption font-semibold border ${STATUS_STYLE[tool.status]}`}
          >
            {statusInfo.emoji} {statusInfo.label}
          </span>
        )}
      </div>

      {/* Title + Description */}
      <div className="flex flex-col flex-1">
        <h3
          className={`text-title-sm font-bold transition-colors ${
            isClickable
              ? "text-text group-hover:text-primary"
              : "text-text-muted"
          }`}
        >
          {tool.name}
        </h3>
        <p className="text-body-sm text-text-muted mt-1 leading-relaxed line-clamp-2">
          {tool.description}
        </p>
      </div>

      {/* Bottom: Progress bar (dev) or CTA */}
      <div className="mt-3 pt-2.5 border-t border-border">
        {isDev ? (
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-caption font-medium text-text-muted">
              <span className="inline-flex items-center gap-1">
                <span
                  className={`inline-block w-1.5 h-1.5 rounded-full ${PROGRESS_BAR_STYLE[tool.status]}`}
                />
                {LABEL_DISPLAY[tool.label]}
              </span>
              <span>{tool.progress}%</span>
            </div>
            <div className="w-full h-1.5 rounded-full bg-surface-alt overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-500 ${PROGRESS_BAR_STYLE[tool.status]}`}
                style={{ width: `${tool.progress}%` }}
              />
            </div>
            {tool.statusNote && (
              <p className="text-caption text-text-muted truncate" title={tool.statusNote}>
                {tool.statusNote}
              </p>
            )}
          </div>
        ) : (
          <div className="flex items-center justify-between text-caption font-medium text-text-muted group-hover:text-primary">
            <span>{LABEL_DISPLAY[tool.label]}</span>
            <div className="flex items-center gap-1">
              <span>Bắt đầu</span>
              <LucideIcons.ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
            </div>
          </div>
        )}
      </div>
    </button>
  )
}
