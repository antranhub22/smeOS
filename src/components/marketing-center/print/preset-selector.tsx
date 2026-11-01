"use client"

import React from "react"
import {
  PRINT_PRESETS,
  type PrintPresetCode,
} from "@/modules/print/domain/print-preset"
import { Badge } from "@/components/ui/badge"
import { Check, Layers } from "@/components/ui/icons"
import { formatNumber } from "@/lib/i18n/formatters"

export interface PresetSelectorProps {
  selectedPresetCode: PrintPresetCode
  onSelectPreset: (code: PrintPresetCode) => void
  selectedMaterial: string
  onSelectMaterial: (material: string) => void
  quantity: number
  onChangeQuantity: (quantity: number) => void
}

export const PRINT_MATERIALS = [
  {
    id: "couche-300",
    name: "Giấy Couche 300gsm",
    desc: "Bề mặt láng mịn, bắt sáng tốt. Chuẩn cho danh thiếp, menu, tờ rơi cao cấp.",
  },
  {
    id: "ford-250",
    name: "Giấy Ford 250gsm",
    desc: "Không lóa mắt, dễ viết bút mực. Thích hợp cho thiệp cảm ơn, thư tay, thẻ bảo hành.",
  },
  {
    id: "kraft-280",
    name: "Giấy Kraft nâu 280gsm",
    desc: "Mộc mạc, thân thiện môi trường. Phù hợp cho nhãn hàng thủ công, vintage, thời trang.",
  },
  {
    id: "decal-plastic",
    name: "Decal nhựa bám dính",
    desc: "Chống thấm nước, xé không rách. Chuẩn cho tem dán ly, hộp sản phẩm đông lạnh.",
  },
  {
    id: "hiflex-pp",
    name: "Bạt PP / Hiflex cản sáng",
    desc: "Bền màu ngoài trời, độ chịu lực cao. Khuyên dùng cho standee và áp phích lớn.",
  },
]

export const QUANTITY_PRESETS = [10, 50, 100, 200, 500, 1000]

export function PresetSelector({
  selectedPresetCode,
  onSelectPreset,
  selectedMaterial,
  onSelectMaterial,
  quantity,
  onChangeQuantity,
}: PresetSelectorProps) {
  const presetsList = Object.values(PRINT_PRESETS)

  return (
    <div className="space-y-6">
      {/* Khổ in chuẩn */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <label className="text-body-sm font-bold text-text">
            1. Chọn khổ in thành phẩm
          </label>
          <span className="text-caption text-text-muted">
            Quy cách chuẩn nhà in kèm lề xén
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {presetsList.map((preset) => {
            const isSelected = selectedPresetCode === preset.code
            return (
              <button
                key={preset.code}
                type="button"
                onClick={() => onSelectPreset(preset.code)}
                className={`p-3 rounded-xl border text-left transition-all relative flex flex-col justify-between ${
                  isSelected
                    ? "border-primary bg-selected/20 shadow-xs"
                    : "border-border bg-surface hover:border-primary/50"
                }`}
              >
                <div>
                  <div className="flex items-center justify-between gap-1 mb-1">
                    <span className="text-body-sm font-bold text-text">
                      {preset.name}
                    </span>
                    {isSelected && (
                      <span className="w-5 h-5 rounded-full bg-primary text-white flex items-center justify-center">
                        <Check className="w-3.5 h-3.5" />
                      </span>
                    )}
                  </div>
                  <p className="text-caption text-text-muted line-clamp-2 leading-relaxed">
                    {preset.description}
                  </p>
                </div>

                <div className="mt-3 pt-2 border-t border-border/60 flex items-center justify-between text-caption text-text-muted">
                  <span>Tràn lề: +{preset.bleedMm}mm</span>
                  <Badge tone={preset.minDpi >= 300 ? "accent" : "neutral"}>
                    {preset.minDpi} DPI
                  </Badge>
                </div>
              </button>
            )
          })}
        </div>
      </div>

      {/* Chất liệu giấy / bạt in */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <label className="text-body-sm font-bold text-text flex items-center gap-2">
            <Layers className="w-4 h-4 text-primary" />
            <span>2. Chất liệu in ấn</span>
          </label>
          <span className="text-caption text-text-muted">
            Gợi ý phù hợp từng loại sản phẩm
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {PRINT_MATERIALS.map((mat) => {
            const isSelected = selectedMaterial === mat.id
            return (
              <button
                key={mat.id}
                type="button"
                onClick={() => onSelectMaterial(mat.id)}
                className={`p-3 rounded-xl border text-left transition-all ${
                  isSelected
                    ? "border-primary bg-selected/20"
                    : "border-border bg-surface hover:border-primary/50"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-caption font-bold text-text">
                    {mat.name}
                  </span>
                  {isSelected && <Check className="w-4 h-4 text-primary" />}
                </div>
                <p className="text-caption text-text-muted mt-1 leading-snug">
                  {mat.desc}
                </p>
              </button>
            )
          })}
        </div>
      </div>

      {/* Số lượng dự kiến */}
      <div className="space-y-3">
        <label className="text-body-sm font-bold text-text">
          3. Số lượng bản in dự kiến
        </label>
        <div className="flex flex-wrap items-center gap-2">
          {QUANTITY_PRESETS.map((q) => (
            <button
              key={q}
              type="button"
              onClick={() => onChangeQuantity(q)}
              className={`px-3 py-1.5 rounded-lg text-caption font-semibold transition-all border ${
                quantity === q
                  ? "bg-primary text-white border-primary"
                  : "bg-surface text-text border-border hover:bg-surface-alt"
              }`}
            >
              {formatNumber(q)} bản
            </button>
          ))}
          <div className="flex items-center gap-2 ml-2">
            <input
              type="number"
              min={1}
              max={100000}
              value={quantity}
              onChange={(e) => onChangeQuantity(Math.max(1, Number(e.target.value) || 1))}
              aria-label="Số lượng in tùy chỉnh"
              className="w-24 px-2 py-1.5 rounded-lg border border-border bg-surface text-caption text-text text-center focus:outline-hidden focus:border-primary"
            />
            <span className="text-caption text-text-muted">bản</span>
          </div>
        </div>
      </div>
    </div>
  )
}
