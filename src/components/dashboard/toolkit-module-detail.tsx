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

      {/* Quy trình bán hàng chuẩn cho module sales (PO 01/11/2026, PR-4) */}
      {module.key === "sales" && (
        <div className="p-4 rounded-xl border border-border bg-surface-alt/70 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-caption font-bold text-primary uppercase tracking-wide">
              Quy trình bán hàng & chốt đơn chuẩn
            </span>
            <span className="text-caption text-text-muted">5 bước khép kín</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-5 gap-2">
            {[
              { step: 1, label: "Chọn khách", desc: "CRM & Khách tiềm năng", href: "/khach-hang" },
              { step: 2, label: "Tư vấn mẫu", desc: "Thẻ chào & Bộ sưu tập", href: "/the-chao" },
              { step: 3, label: "Lập báo giá", desc: "Bảng tính chi phí có số", href: "/bao-gia" },
              { step: 4, label: "Chốt duyệt", desc: "Gửi link báo giá khách", href: "/bao-gia" },
              { step: 5, label: "Đơn hàng", desc: "Tự động chuyển thành đơn", href: "/don-hang" },
            ].map((s) => (
              <a
                key={s.step}
                href={s.href}
                className="p-3 rounded-lg bg-surface border border-border hover:border-primary transition-all group flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center gap-1.5 text-caption font-bold text-text group-hover:text-primary">
                    <span className="w-5 h-5 rounded-full bg-selected text-primary flex items-center justify-center text-caption font-extrabold">
                      {s.step}
                    </span>
                    <span>{s.label}</span>
                  </div>
                  <div className="text-caption text-text-muted mt-1 leading-snug">
                    {s.desc}
                  </div>
                </div>
              </a>
            ))}
          </div>
        </div>
      )}

      {/* Quy trình chăm sóc khách hàng chuẩn cho module care (PO 01/11/2026, PR-5) */}
      {module.key === "care" && (
        <div className="p-4 rounded-xl border border-border bg-surface-alt/70 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-caption font-bold text-primary uppercase tracking-wide">
              Quy trình chăm sóc & giữ chân khách hàng
            </span>
            <span className="text-caption text-text-muted">4 bước chu đáo</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-2">
            {[
              { step: 1, label: "Phân nhóm khách", desc: "Theo RFM, dịp & sự đồng ý", href: "/cham-soc" },
              { step: 2, label: "Chọn mục tiêu", desc: "Sau mua, sinh nhật, quay lại", href: "/cham-soc" },
              { step: 3, label: "Soạn thiệp chăm sóc", desc: "Mẫu thiệp #48–#52, #55 trang trọng", href: "/cham-soc" },
              { step: 4, label: "Gửi & Ghi nhận", desc: "Mở Zalo, gọi & lưu nhật ký", href: "/cham-soc" },
            ].map((s) => (
              <a
                key={s.step}
                href={s.href}
                className="p-3 rounded-lg bg-surface border border-border hover:border-primary transition-all group flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center gap-1.5 text-caption font-bold text-text group-hover:text-primary">
                    <span className="w-5 h-5 rounded-full bg-selected text-primary flex items-center justify-center text-caption font-extrabold">
                      {s.step}
                    </span>
                    <span>{s.label}</span>
                  </div>
                  <div className="text-caption text-text-muted mt-1 leading-snug">
                    {s.desc}
                  </div>
                </div>
              </a>
            ))}
          </div>
        </div>
      )}

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
