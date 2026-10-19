"use client"

import { Check, X, RotateCcw, CheckSquare, Square } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import type { MatrixIndustry, MatrixNavItem, MatrixGroup } from "../_lib/types"

interface MatrixGridProps {
  industries: MatrixIndustry[]
  navItems: MatrixNavItem[]
  groups: MatrixGroup[]
  currentOverrides: Record<string, string[]>
  defaultMatrix: Record<string, string[]>
  onToggleCell: (industryKey: string, navKey: string) => void
  onSetColumnAll: (industryKey: string, visible: boolean) => void
  onResetColumnToDefault: (industryKey: string) => void
  onSetRowAll: (navKey: string, visible: boolean) => void
}

export function MatrixGrid({
  industries,
  navItems,
  groups,
  currentOverrides,
  defaultMatrix,
  onToggleCell,
  onSetColumnAll,
  onResetColumnToDefault,
  onSetRowAll,
}: MatrixGridProps) {
  const getGroupLabel = (groupKey: string) => {
    return groups.find((g) => g.key === groupKey)?.label ?? groupKey
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-border bg-surface shadow-sm">
      <table className="w-full border-collapse text-left text-body-sm">
        <thead>
          <tr className="border-b border-border bg-surface-alt">
            <th className="sticky left-0 z-20 min-w-[240px] bg-surface-alt p-3 font-semibold text-text">
              Chức năng ({navItems.length})
            </th>
            {industries.map((industry) => {
              const hiddenList = currentOverrides[industry.key] ?? defaultMatrix[industry.key] ?? []
              const hiddenCount = hiddenList.length
              const visibleCount = navItems.length - hiddenCount

              return (
                <th
                  key={industry.key}
                  className="min-w-[140px] border-l border-border p-3 text-center font-semibold text-text"
                >
                  <div className="space-y-1">
                    <p className="font-bold text-text truncate">{industry.name}</p>
                    <div className="flex items-center justify-center gap-1">
                      <Badge tone={hiddenCount === 0 ? "success" : "neutral"} className="text-caption">
                        {hiddenCount === 0 ? "Hiện 100%" : `Ẩn ${hiddenCount}`}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-center gap-1 pt-1 text-caption text-text-muted">
                      <button
                        type="button"
                        onClick={() => onSetColumnAll(industry.key, true)}
                        className="rounded px-1.5 py-0.5 hover:bg-surface hover:text-text"
                        title="Hiện tất cả cho ngành này"
                      >
                        Bật hết
                      </button>
                      <span>·</span>
                      <button
                        type="button"
                        onClick={() => onSetColumnAll(industry.key, false)}
                        className="rounded px-1.5 py-0.5 hover:bg-surface hover:text-text"
                        title="Ẩn tất cả cho ngành này"
                      >
                        Tắt hết
                      </button>
                      <span>·</span>
                      <button
                        type="button"
                        onClick={() => onResetColumnToDefault(industry.key)}
                        className="rounded p-0.5 hover:bg-surface hover:text-text"
                        title="Khôi phục mặc định ngành"
                      >
                        <RotateCcw className="h-3 w-3" />
                      </button>
                    </div>
                  </div>
                </th>
              )
            })}
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {navItems.map((item, index) => {
            const isFirstOfGroup =
              index === 0 || navItems[index - 1]?.group !== item.group

            return (
              <tr
                key={item.navKey}
                className="hover:bg-surface-alt/50 transition-colors"
              >
                <td className="sticky left-0 z-10 bg-surface p-3 shadow-[1px_0_0_0] shadow-border">
                  <div className="flex items-center justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-text">{item.label}</span>
                        <span className="text-caption text-text-muted font-mono bg-surface-alt px-1.5 py-0.5 rounded">
                          {item.navKey}
                        </span>
                      </div>
                      <p className="text-caption text-text-muted font-mono">{item.href}</p>
                    </div>
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 sm:opacity-70">
                      <button
                        type="button"
                        onClick={() => onSetRowAll(item.navKey, true)}
                        className="p-1 text-text-muted hover:text-primary rounded hover:bg-surface-alt"
                        title="Hiện cho tất cả ngành"
                      >
                        <CheckSquare className="h-3.5 w-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => onSetRowAll(item.navKey, false)}
                        className="p-1 text-text-muted hover:text-danger rounded hover:bg-surface-alt"
                        title="Ẩn cho tất cả ngành"
                      >
                        <Square className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                </td>

                {industries.map((industry) => {
                  const hiddenList = currentOverrides[industry.key] ?? defaultMatrix[industry.key] ?? []
                  const isHidden = hiddenList.includes(item.navKey)
                  const isVisible = !isHidden

                  return (
                    <td
                      key={industry.key}
                      className="border-l border-border p-2 text-center"
                    >
                      <button
                        type="button"
                        onClick={() => onToggleCell(industry.key, item.navKey)}
                        className={`inline-flex h-8 w-16 items-center justify-center rounded-lg border text-xs font-semibold transition-all ${
                          isVisible
                            ? "border-primary/30 bg-primary/10 text-primary hover:bg-primary/20"
                            : "border-border bg-surface-alt text-text-muted hover:bg-surface-alt/80 line-through opacity-60"
                        }`}
                        title={`${industry.name} — ${item.label}: ${isVisible ? "Đang hiện" : "Đang ẩn"}`}
                      >
                        {isVisible ? (
                          <span className="flex items-center gap-1">
                            <Check className="h-3.5 w-3.5" /> Hiện
                          </span>
                        ) : (
                          <span className="flex items-center gap-1">
                            <X className="h-3.5 w-3.5" /> Ẩn
                          </span>
                        )}
                      </button>
                    </td>
                  )
                })}
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
