"use client"

import React from "react"
import { Plus, Trash2, FileText } from "lucide-react"
import { Card } from "@/components/ui/card"
import type { IndustryPluginContract } from "@/modules/organization/domain/industry-plugin-contract"
import type { BomItem, TerminologyGetter } from "./create-product-types"

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
  const sampleMaterial =
    industry.identity.key === "FASHION"
      ? "Vải lụa satin / Dạ tweed"
      : industry.identity.key === "FNB"
      ? "Thịt bò / Sữa chua"
      : "Hoa hồng Ecuador"

  return (
    <Card className="p-5 sm:p-6 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-title-sm font-bold text-text">
          <FileText size={18} className="text-primary" />
          <span>{ti("productRecipe")}</span>
        </div>
        <button
          type="button"
          onClick={onAddBomItem}
          className="inline-flex items-center gap-1 text-caption font-bold text-primary hover:underline focus-visible:outline-2 focus-visible:outline-primary"
        >
          <Plus size={14} /> Thêm {ti("rawMaterialItem").toLowerCase()}
        </button>
      </div>

      <div className="space-y-3">
        {bomItems.map((item, idx) => (
          <div
            key={item.id}
            className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 rounded-xl border border-border bg-surface-alt/40 p-3 transition-colors hover:border-primary/40"
          >
            <div className="flex-1">
              <input
                type="text"
                value={item.name}
                onChange={(e) => onUpdateBomItem(item.id, "name", e.target.value)}
                placeholder={`Tên ${ti("rawMaterialItem").toLowerCase()} ${idx + 1} (vd: ${sampleMaterial})`}
                className="h-9 w-full rounded-lg border border-border bg-surface px-2.5 text-body-sm outline-none focus:border-primary focus-visible:outline-2 focus-visible:outline-primary"
              />
            </div>

            <div className="flex items-center gap-2">
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

              <div className="w-20">
                <input
                  type="text"
                  value={item.unit}
                  onChange={(e) => onUpdateBomItem(item.id, "unit", e.target.value)}
                  placeholder="đơn vị"
                  className="h-9 w-full rounded-lg border border-border bg-surface px-2 text-center text-body-sm outline-none focus:border-primary focus-visible:outline-2 focus-visible:outline-primary"
                />
              </div>

              <div className="w-28">
                <input
                  type="text"
                  value={item.color}
                  onChange={(e) => onUpdateBomItem(item.id, "color", e.target.value)}
                  placeholder="Màu sắc"
                  className="h-9 w-full rounded-lg border border-border bg-surface px-2 text-body-sm outline-none focus:border-primary focus-visible:outline-2 focus-visible:outline-primary"
                />
              </div>

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
