"use client"

import React from "react"
import { InfoTip } from "@/components/ui/info-tip"
import { IconTile, type IconTone } from "@/components/ui/app-icon"
import {
  countModuleTools,
  type GrowthModule,
} from "@/modules/toolkit/domain/growth-modules"

/** Màu nhóm cho ô icon của từng bước (dùng cả ở trang chi tiết bước). */
export const MODULE_TONES: Readonly<Record<string, IconTone>> = {
  brand: "plum", content: "rose", promotion: "orange", acquisition: "amber", consultation: "teal",
  quotation: "blue", order: "indigo", payment: "green", care: "pink", growth: "emerald", extra: "plum",
}

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
  const total = countModuleTools(module)
  const ready = countReady(module)

  // Nhãn ngắn + icon lớn; mục đích dài nằm trong "?" (OPERATING_PRINCIPLES §6).
  // Nút chính phủ cả thẻ bằng ::after để InfoTip không bị lồng nút trong nút.
  return (
    <div className="group relative flex flex-col items-center text-center p-4 pt-6 sm:p-6 rounded-2xl bg-surface shadow-sm hover:shadow-md ring-1 ring-border/60 hover:ring-primary transition-all">
      <InfoTip label={module.name} className="absolute top-1 right-1 sm:top-3 sm:right-3 m-0">
        {module.purpose}
      </InfoTip>
      <IconTile name={module.icon} tone={MODULE_TONES[module.key] ?? "plum"} variant="solid" className="mb-3 sm:mb-4 transition-transform group-hover:scale-105" />
      {module.order !== null && (
        <span className="text-caption font-semibold text-text-muted">Bước {module.order}</span>
      )}
      <h3 className="text-body-sm sm:text-title-sm font-bold leading-snug text-text mt-0.5">
        <button
          type="button"
          onClick={() => onOpen(module.key)}
          className="after:absolute after:inset-0 after:rounded-2xl after:content-[''] focus-visible:outline-none focus-visible:after:ring-2 focus-visible:after:ring-ring group-hover:text-primary transition-colors cursor-pointer"
        >
          {module.name}
        </button>
      </h3>
      <span className="mt-1 sm:mt-2 text-caption text-text-muted">
        {isDev ? `${ready}/${total} sẵn dùng` : `${total} công cụ`}
      </span>
    </div>
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
    <div className="space-y-10">
      <section aria-label="Các bước phát triển cửa hàng">
        <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3 sm:gap-6">
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
          <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3 sm:gap-6">
            {extras.map((m) => (
              <ModuleCard key={m.key} module={m} isDev={isDev} onOpen={onOpen} />
            ))}
          </div>
        </section>
      )}
    </div>
  )
}
