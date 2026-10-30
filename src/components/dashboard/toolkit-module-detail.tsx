"use client"

import React from "react"
import * as LucideIcons from "lucide-react"
import { ArrowLeft } from "lucide-react"
import type { GrowthModule } from "@/modules/toolkit/domain/growth-modules"
import { ToolCard } from "./toolkit-card"

interface ModuleDetailProps {
  module: GrowthModule
  isDev: boolean
  /** Ẩn nút quay lại khi đang hiển thị kết quả tìm kiếm */
  onBack?: () => void
}

/** Công cụ của một module, chia theo giai đoạn phát triển. */
export function ModuleDetail({ module, isDev, onBack }: ModuleDetailProps) {
  const iconsMap = LucideIcons as unknown as Record<string, React.ElementType>
  const Icon = iconsMap[module.icon] || LucideIcons.Folder
  const showPhaseNames = module.order !== null

  return (
    <section className="space-y-5">
      {onBack && (
        <button
          type="button"
          onClick={onBack}
          className="inline-flex items-center gap-1.5 min-h-8 px-2 -ml-2 rounded-lg text-body-sm font-medium text-text-muted hover:text-primary hover:bg-surface-alt transition-colors"
        >
          <ArrowLeft className="w-4 h-4" aria-hidden="true" />
          Tất cả các bước
        </button>
      )}

      <div className="flex items-center gap-3 pb-2 border-b border-border">
        <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-primary-muted text-primary">
          <Icon className="w-5 h-5" aria-hidden="true" />
        </div>
        <div>
          <h2 className="text-title font-bold text-text">
            {module.order !== null ? `Bước ${module.order} — ${module.name}` : module.name}
          </h2>
          <p className="text-body-sm text-text-muted">{module.purpose}</p>
        </div>
      </div>

      {module.phases.map((phase) => (
        <div key={phase.phase} className="space-y-3">
          {showPhaseNames && (
            <h3 className="text-body font-semibold text-text">
              {phase.name}
              <span className="ml-2 text-caption font-medium text-text-muted">
                {phase.tools.length} công cụ
              </span>
            </h3>
          )}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {phase.tools.map((tool) => (
              <ToolCard key={tool.id} tool={tool} isDev={isDev} />
            ))}
          </div>
        </div>
      ))}
    </section>
  )
}
