"use client"

import React from "react"
import Link from "next/navigation"
import { ArrowLeft, Folder, Sparkles, Wrench } from "@/components/ui/icons"
import { IconTile } from "@/components/ui/app-icon"
import { InfoTip } from "@/components/ui/info-tip"
import type { BusinessModule } from "@/modules/toolkit/domain/business-modules"
import { getAllTools, type ToolDefinition } from "@/modules/toolkit/domain/toolkit-catalog"
import { AssetTypeCard } from "./asset-type-card"
import { ToolCard } from "./toolkit-card"
import { MODULE_TONES } from "./toolkit-module-grid"

interface ModuleDetailProps {
  module: BusinessModule
  isDev: boolean
  onBack?: () => void
}

export function ModuleDetail({ module, isDev, onBack }: ModuleDetailProps) {
  const tone = MODULE_TONES[module.key] ?? "plum"
  const toolMap = new Map<number, ToolDefinition>(getAllTools().map((t) => [t.id, t]))

  return (
    <section className="space-y-8">
      <div className="flex items-center justify-between gap-4">
        {onBack ? (
          <button
            type="button"
            onClick={onBack}
            className="inline-flex items-center gap-1.5 min-h-8 px-2 -ml-2 rounded-lg text-body-sm font-medium text-text-muted hover:text-primary hover:bg-surface-alt transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" aria-hidden="true" />
            Tất cả các mục
          </button>
        ) : (
          <div />
        )}

        <a
          href="/kho-du-lieu"
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-body-sm font-medium text-text-muted hover:text-primary hover:bg-surface-alt border border-border/70 transition-colors"
        >
          <Folder className="w-4 h-4" aria-hidden="true" />
          <span>Asset đã tạo</span>
        </a>
      </div>

      <div className="flex items-center gap-4 p-5 sm:p-6 rounded-2xl bg-surface shadow-sm ring-1 ring-border/60">
        <IconTile name={module.icon} tone={tone} variant="solid" />
        <div className="min-w-0">
          <span className="text-caption font-semibold text-text-muted">Mục tiêu {module.order}</span>
          <div className="flex items-center gap-2">
            <h2 className="text-display font-extrabold text-text tracking-tight">{module.name}</h2>
            <InfoTip label={module.name} side="bottom">{module.purpose}</InfoTip>
          </div>
        </div>
      </div>

      {/* Khu L0: Bạn muốn tạo gì? (Asset Types) */}
      {module.assets.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-primary" aria-hidden="true" />
              <h3 className="text-title-sm font-bold text-text">
                Bạn muốn tạo gì?
                <span className="ml-2 text-caption font-medium text-text-muted">
                  {module.assets.length} loại ấn phẩm
                </span>
              </h3>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-5">
            {module.assets.map((asset) => (
              <AssetTypeCard
                key={asset.code}
                asset={asset}
                tool={asset.toolId ? toolMap.get(asset.toolId) : null}
                isDev={isDev}
              />
            ))}
          </div>
        </div>
      )}

      {/* Khu L1: Công cụ trực tiếp */}
      {module.tools.length > 0 && (
        <div className="space-y-4 pt-4 border-t border-border/60">
          <div className="flex items-center gap-2">
            <Wrench className="w-5 h-5 text-text-muted" aria-hidden="true" />
            <h3 className="text-title-sm font-bold text-text">
              Công cụ hỗ trợ
              <span className="ml-2 text-caption font-medium text-text-muted">
                {module.tools.length} công cụ
              </span>
            </h3>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-6">
            {module.tools.map((tool) => (
              <ToolCard key={tool.id} tool={tool} isDev={isDev} tone={tone} />
            ))}
          </div>
        </div>
      )}
    </section>
  )
}
