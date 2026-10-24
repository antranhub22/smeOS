import React from "react"
import { Store, Building2, Sparkles, Briefcase } from "lucide-react"
import {
  LANDING_TYPE_OPTIONS,
  type LandingPageType,
} from "@/modules/landing-page/domain/preset-catalog"

interface LandingTypeSelectorProps {
  selectedType: LandingPageType
  onSelectType: (type: LandingPageType) => void
}

export function LandingTypeSelector({ selectedType, onSelectType }: LandingTypeSelectorProps) {
  const iconMap = {
    Store,
    Building2,
    Sparkles,
    Briefcase,
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
      {LANDING_TYPE_OPTIONS.map((opt) => {
        const isSelected = selectedType === opt.type
        const IconComponent = iconMap[opt.iconName as keyof typeof iconMap] || Store

        return (
          <button
            key={opt.type}
            type="button"
            onClick={() => onSelectType(opt.type)}
            className={`flex flex-col text-left p-3.5 rounded-2xl border transition-all ${
              isSelected
                ? "border-primary bg-primary-muted/20 shadow-sm ring-1 ring-primary"
                : "border-border bg-surface hover:border-border-focus hover:bg-surface-alt"
            }`}
          >
            <div className="flex items-center gap-2 mb-2">
              <div
                className={`p-2 rounded-xl ${
                  isSelected ? "bg-primary text-on-primary" : "bg-surface-alt text-text-muted"
                }`}
              >
                <IconComponent className="h-4 w-4" />
              </div>
              <span className="font-bold text-sm text-text line-clamp-1">{opt.title}</span>
            </div>
            <p className="text-xs text-text-muted leading-relaxed line-clamp-2">{opt.subTitle}</p>
          </button>
        )
      })}
    </div>
  )
}
