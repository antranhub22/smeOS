import React from "react"
import {
  LANDING_TYPE_OPTIONS,
  type LandingPageType,
} from "@/modules/landing-page/domain/preset-catalog"

interface LandingTypeSelectorProps {
  selectedType: LandingPageType
  onSelectType: (type: LandingPageType) => void
}

/**
 * Mục đích trang — nhóm radio gọn (archetype E, UX-028). Giá trị được gửi cho AI soạn nội dung;
 * mô tả chỉ hiện cho lựa chọn đang chọn để không lặp 4 đoạn giới thiệu.
 */
export function LandingTypeSelector({ selectedType, onSelectType }: LandingTypeSelectorProps) {
  const selected = LANDING_TYPE_OPTIONS.find((o) => o.type === selectedType)

  return (
    <fieldset className="space-y-2">
      <legend className="text-body-sm font-semibold text-text">Mục đích trang</legend>
      <div className="flex flex-wrap gap-2">
        {LANDING_TYPE_OPTIONS.map((opt) => {
          const isSelected = selectedType === opt.type
          return (
            <label
              key={opt.type}
              className={`cursor-pointer rounded-full border px-3.5 py-2 text-body-sm transition-colors focus-within:ring-2 focus-within:ring-primary ${
                isSelected ? "border-primary bg-selected font-semibold text-selected-text" : "border-border bg-surface text-text hover:bg-surface-alt"
              }`}
            >
              <input
                type="radio"
                name="landing-page-type"
                value={opt.type}
                checked={isSelected}
                onChange={() => onSelectType(opt.type)}
                className="sr-only"
              />
              {opt.title}
            </label>
          )
        })}
      </div>
      {selected && <p className="text-body-sm text-text-muted">{selected.subTitle}</p>}
    </fieldset>
  )
}
