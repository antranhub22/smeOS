"use client"

import React from "react"
import { ArrowLeft } from "lucide-react"
import type { GrowthModule } from "@/modules/toolkit/domain/growth-modules"
import { InfoTip } from "@/components/ui/info-tip"
import { IconTile } from "@/components/ui/app-icon"
import { MODULE_TONES } from "./toolkit-module-grid"
import { ToolCard } from "./toolkit-card"

interface ModuleDetailProps {
  module: GrowthModule
  isDev: boolean
  /** Ẩn nút quay lại khi đang hiển thị kết quả tìm kiếm */
  onBack?: () => void
}

/** Công cụ của một module, chia theo giai đoạn phát triển. */
export function ModuleDetail({ module, isDev, onBack }: ModuleDetailProps) {
  const tone = MODULE_TONES[module.key] ?? "plum"
  const showPhaseNames = module.order !== null

  return (
    <section className="space-y-8">
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

      <div className="flex items-center gap-4 p-5 sm:p-6 rounded-2xl bg-surface shadow-sm ring-1 ring-border/60">
        <IconTile name={module.icon} tone={tone} variant="solid" />
        <div className="min-w-0">
          {module.order !== null && (
            <span className="text-caption font-semibold text-text-muted">Bước {module.order}</span>
          )}
          <div className="flex items-center gap-2">
            <h2 className="text-display font-extrabold text-text tracking-tight">{module.name}</h2>
            <InfoTip label={module.name} side="bottom">{module.purpose}</InfoTip>
          </div>
        </div>
      </div>

      {module.phases.map((phase) => (
        <div key={phase.phase} className="space-y-4">
          {showPhaseNames && (
            <h3 className="text-title-sm font-bold text-text">
              {phase.name}
              <span className="ml-2 text-caption font-medium text-text-muted">
                {phase.tools.length}
              </span>
            </h3>
          )}
          <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-6">
            {phase.tools.map((tool) => (
              <ToolCard key={tool.id} tool={tool} isDev={isDev} tone={tone} />
            ))}
          </div>
        </div>
      ))}
    </section>
  )
}
