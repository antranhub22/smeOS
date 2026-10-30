"use client"

import React from "react"
import * as LucideIcons from "lucide-react"
import { ArrowRight } from "lucide-react"
import {
  countModuleTools,
  type GrowthModule,
} from "@/modules/toolkit/domain/growth-modules"

// ── Thẻ module ─────────────────────────────────────────────────────

interface ModuleCardProps {
  module: GrowthModule
  isDev: boolean
  onOpen: (key: string) => void
}

function countReady(module: GrowthModule): number {
  return module.phases.reduce(
    (sum, p) => sum + p.tools.filter((t) => t.status === "DONE").length,
    0,
  )
}

function ModuleCard({ module, isDev, onOpen }: ModuleCardProps) {
  const iconsMap = LucideIcons as unknown as Record<string, React.ElementType>
  const Icon = iconsMap[module.icon] || LucideIcons.Folder
  const total = countModuleTools(module)
  const ready = countReady(module)

  return (
    <button
      type="button"
      onClick={() => onOpen(module.key)}
      className="group flex flex-col text-left p-4 rounded-xl border border-border bg-surface hover:border-primary hover:shadow-md transition-all cursor-pointer"
    >
      <div className="flex items-center justify-between w-full mb-3">
        <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-primary-muted text-primary">
          <Icon className="w-5 h-5" aria-hidden="true" />
        </div>
        {module.order !== null && (
          <span className="text-caption font-semibold text-text-muted">Bước {module.order}</span>
        )}
      </div>
      <h3 className="text-title-sm font-bold text-text group-hover:text-primary transition-colors">
        {module.name}
      </h3>
      <p className="text-body-sm text-text-muted mt-1 leading-relaxed line-clamp-2 flex-1">
        {module.purpose}
      </p>
      <div className="mt-3 pt-2.5 border-t border-border flex items-center justify-between text-caption font-medium text-text-muted">
        <span>
          {isDev ? `${ready}/${total} công cụ sẵn dùng` : `${total} công cụ`}
        </span>
        <span className="inline-flex items-center gap-1 group-hover:text-primary">
          Xem
          <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
        </span>
      </div>
    </button>
  )
}

// ── Lưới module ────────────────────────────────────────────────────

interface ModuleGridProps {
  modules: readonly GrowthModule[]
  isDev: boolean
  onOpen: (key: string) => void
}

/** Màn đầu: 10 bước theo vòng phát triển cửa hàng, khu riêng tách bên dưới. */
export function ModuleGrid({ modules, isDev, onOpen }: ModuleGridProps) {
  const steps = modules.filter((m) => m.order !== null)
  const extras = modules.filter((m) => m.order === null)

  return (
    <div className="space-y-8">
      <section aria-label="Các bước phát triển cửa hàng">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
          {steps.map((m) => (
            <ModuleCard key={m.key} module={m} isDev={isDev} onOpen={onOpen} />
          ))}
        </div>
      </section>

      {extras.length > 0 && (
        <section className="space-y-3">
          <h2 className="text-title-sm font-bold text-text pb-2 border-b border-border">
            Công cụ khác
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
            {extras.map((m) => (
              <ModuleCard key={m.key} module={m} isDev={isDev} onOpen={onOpen} />
            ))}
          </div>
        </section>
      )}
    </div>
  )
}
