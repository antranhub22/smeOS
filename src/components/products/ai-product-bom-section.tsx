"use client"

import React from "react"
import { FileText } from "@/components/ui/icon-set/file-text"
import { Plus } from "@/components/ui/icon-set/plus"
import { Trash2 } from "@/components/ui/icon-set/trash2"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { NativeSelect } from "@/components/ui/select"
import { FLOWER_ROLES, type FlowerItem } from "./ai-product-helpers"

interface AiProductBomSectionProps {
  flowers: FlowerItem[]
  onChange: (flowers: FlowerItem[]) => void
}

export function AiProductBomSection({ flowers, onChange }: AiProductBomSectionProps) {
  const handleAddFlower = () => {
    onChange([
      ...flowers,
      {
        id: `flower-${Date.now()}-${Math.random().toString(36).substring(2, 5)}`,
        name: "",
        quantity: 1,
        unit: "cành",
        color: "",
        role: "Phụ",
      },
    ])
  }

  const handleUpdateFlower = (id: string, field: keyof FlowerItem, val: string | number) => {
    onChange(flowers.map((f) => (f.id === id ? { ...f, [field]: val } : f)))
  }

  const handleRemoveFlower = (id: string) => {
    onChange(flowers.filter((f) => f.id !== id))
  }

  return (
    <Card className="p-5 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-title-sm font-bold text-text">
          <FileText size={18} className="text-primary" />
          <span>Thành phần hoa</span>
        </div>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={handleAddFlower}
          className="flex items-center gap-1.5 text-primary hover:bg-primary-muted text-body-sm font-semibold"
        >
          <Plus size={15} />
          Thêm thành phần hoa
        </Button>
      </div>

      <div className="space-y-2.5">
        {flowers.map((item) => (
          <div
            key={item.id}
            className="grid grid-cols-12 gap-2.5 items-center rounded-xl border border-border bg-surface-alt/40 p-2.5"
          >
            <div className="col-span-12 sm:col-span-4">
              <Input
                type="text"
                value={item.name}
                onChange={(e) => handleUpdateFlower(item.id, "name", e.target.value)}
                placeholder="Tên loài hoa (VD: Hoa hồng đỏ)"
                className="h-9"
              />
            </div>

            <div className="col-span-4 sm:col-span-2">
              <Input
                type="number"
                min={1}
                value={item.quantity}
                onChange={(e) => handleUpdateFlower(item.id, "quantity", Number(e.target.value) || 1)}
                className="h-9 text-center"
              />
            </div>

            <div className="col-span-4 sm:col-span-2">
              <Input
                type="text"
                value={item.unit}
                onChange={(e) => handleUpdateFlower(item.id, "unit", e.target.value)}
                placeholder="cành"
                className="h-9 text-center"
              />
            </div>

            <div className="col-span-4 sm:col-span-2">
              <NativeSelect
                value={item.role}
                onChange={(e) => handleUpdateFlower(item.id, "role", e.target.value)}
                className="h-9"
              >
                {FLOWER_ROLES.map((r) => (
                  <option key={r} value={r}>
                    {r}
                  </option>
                ))}
              </NativeSelect>
            </div>

            <div className="col-span-12 sm:col-span-2 flex items-center justify-end">
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => handleRemoveFlower(item.id)}
                aria-label="Xoá thành phần hoa"
                className="h-9 w-9 text-text-muted hover:text-danger hover:bg-danger-bg"
              >
                <Trash2 size={16} />
              </Button>
            </div>
          </div>
        ))}
      </div>
    </Card>
  )
}
