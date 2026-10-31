"use client"

import { InfoTip } from "@/components/ui/info-tip"
import React from "react"
import { Plus, Trash2, FileText } from "@/components/ui/icons"
import { Card } from "@/components/ui/card"
import type { IndustryPluginContract } from "@/modules/organization/domain/industry-plugin-contract"
import type { BomItem, TerminologyGetter } from "./create-product-types"
import { getIndustryBomFieldsConfig } from "./create-product-types"

interface CreateBomCardProps {
  ti: TerminologyGetter
  industry: IndustryPluginContract
  bomItems: BomItem[]
  onAddBomItem: () => void
  onUpdateBomItem: (id: string, field: keyof BomItem, value: string | number) => void
  onRemoveBomItem: (id: string) => void
}

export function CreateBomCard({
  ti,
  industry,
  bomItems,
  onAddBomItem,
  onUpdateBomItem,
  onRemoveBomItem,
}: CreateBomCardProps) {
  const roles =
    industry.bomSpec?.componentRoles?.map((r) => r.label) || ["Chủ đạo", "Phụ", "Điểm nhấn"]
  const cfg = getIndustryBomFieldsConfig(industry.identity.key)
  const units = industry.bomSpec?.measurementUnits || []

  return (
    <Card className="p-5 sm:p-6 space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 pb-3 border-b border-border">
        <div>
          <div className="flex items-center gap-2 text-title-sm font-bold text-text">
            <FileText size={18} className="text-primary" />
            <span>{ti("productRecipe")}</span>
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-caption font-bold bg-danger-bg text-danger border border-danger/30">
              Định mức bàn giao cam kết *
            </span>
            <InfoTip label="Định mức công thức">Dữ liệu trọng yếu ràng buộc nghĩa vụ giữa cửa hàng và người mua. Không để xảy ra sai lệch khi bàn giao.</InfoTip>
          </div>
        </div>
        <button
          type="button"
          onClick={onAddBomItem}
          className="inline-flex items-center gap-1 text-caption font-bold text-primary hover:underline focus-visible:outline-2 focus-visible:outline-primary self-start sm:self-auto"
        >
          <Plus size={14} /> Thêm {ti("rawMaterialItem").toLowerCase()}
        </button>
      </div>

      {/* Header mô tả các cột */}
      <div className="hidden sm:flex items-center gap-2 px-3 text-caption font-semibold text-text-muted border-b border-border pb-2">
        <div className="flex-1">{cfg.materialLabel}</div>
        <div className="w-20 text-center">Số lượng</div>
        <div className="w-24 text-center">Đơn vị</div>
        {cfg.showColor && <div className="w-28">{cfg.colorLabel}</div>}
        {cfg.showNotes && <div className="w-32">{cfg.notesLabel}</div>}
        <div className="w-28">Vai trò</div>
        <div className="w-9" />
      </div>

      <div className="space-y-3">
        {bomItems.map((item, idx) => (
          <div
            key={item.id}
            className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 rounded-xl border border-border bg-surface-alt/40 p-3 transition-colors hover:border-primary/40"
          >
            {/* Tên vật tư */}
            <div className="flex-1">
              <input
                type="text"
                value={item.name}
                onChange={(e) => onUpdateBomItem(item.id, "name", e.target.value)}
                placeholder={`${cfg.materialLabel} ${idx + 1} — ${cfg.materialPlaceholder}`}
                className="h-9 w-full rounded-lg border border-border bg-surface px-2.5 text-body-sm outline-none focus:border-primary focus-visible:outline-2 focus-visible:outline-primary"
              />
            </div>

            <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
              {/* Số lượng */}
              <div className="w-20">
                <input
                  type="number"
                  min="1"
                  value={item.quantity}
                  onChange={(e) =>
                    onUpdateBomItem(
                      item.id,
                      "quantity",
                      Math.max(1, parseInt(e.target.value) || 1)
                    )
                  }
                  className="h-9 w-full rounded-lg border border-border bg-surface px-2 text-center text-body-sm outline-none focus:border-primary focus-visible:outline-2 focus-visible:outline-primary"
                />
              </div>

              {/* Đơn vị — có datalist gợi ý */}
              <div className="w-24">
                <input
                  type="text"
                  list={`unit-list-${item.id}`}
                  value={item.unit}
                  onChange={(e) => onUpdateBomItem(item.id, "unit", e.target.value)}
                  placeholder={cfg.unitHint}
                  className="h-9 w-full rounded-lg border border-border bg-surface px-2 text-center text-body-sm outline-none focus:border-primary focus-visible:outline-2 focus-visible:outline-primary"
                />
                <datalist id={`unit-list-${item.id}`}>
                  {units.map((u) => (
                    <option key={u} value={u} />
                  ))}
                </datalist>
              </div>

              {/* Màu sắc — hiện tùy ngành */}
              {cfg.showColor && (
                <div className="w-28">
                  <input
                    type="text"
                    value={item.color}
                    onChange={(e) => onUpdateBomItem(item.id, "color", e.target.value)}
                    placeholder={cfg.colorLabel}
                    className="h-9 w-full rounded-lg border border-border bg-surface px-2 text-body-sm outline-none focus:border-primary focus-visible:outline-2 focus-visible:outline-primary"
                  />
                </div>
              )}

              {/* Ghi chú mở rộng — hiện tùy ngành */}
              {cfg.showNotes && (
                <div className="w-32">
                  <input
                    type="text"
                    value={item.notes ?? ""}
                    onChange={(e) => onUpdateBomItem(item.id, "notes", e.target.value)}
                    placeholder={cfg.notesPlaceholder}
                    title={cfg.notesLabel}
                    className="h-9 w-full rounded-lg border border-border bg-surface px-2 text-body-sm outline-none focus:border-primary focus-visible:outline-2 focus-visible:outline-primary"
                  />
                </div>
              )}

              {/* Vai trò */}
              <div className="w-28">
                <select
                  value={item.role}
                  onChange={(e) => onUpdateBomItem(item.id, "role", e.target.value)}
                  className="h-9 w-full rounded-lg border border-border bg-surface px-2 text-caption font-medium outline-none focus:border-primary focus-visible:outline-2 focus-visible:outline-primary"
                >
                  {roles.map((r) => (
                    <option key={r} value={r}>
                      {r}
                    </option>
                  ))}
                </select>
              </div>

              {/* Nút xóa */}
              <button
                type="button"
                onClick={() => onRemoveBomItem(item.id)}
                disabled={bomItems.length <= 1}
                aria-label={`Xoá ${ti("rawMaterialItem").toLowerCase()} này`}
                className="flex h-9 w-9 items-center justify-center rounded-lg text-text-muted hover:bg-danger-bg hover:text-danger disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-text-muted transition-colors focus-visible:outline-2 focus-visible:outline-primary"
              >
                <Trash2 size={16} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </Card>
  )
}
