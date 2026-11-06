"use client"

import { Button } from "@/components/ui/button"
import { Check } from "@/components/ui/icon-set/check"
import { CheckCircle2 } from "@/components/ui/icon-set/check-circle2"
import { FileDown } from "@/components/ui/icon-set/file-down"
import { Sparkles } from "@/components/ui/icon-set/sparkles"
import { formatNumber } from "@/lib/i18n/formatters"
import type { PrintPreset } from "@/modules/print/domain/print-preset"

export type PrintStep = 1 | 2 | 3 | 4

/** Thanh 4 bước của luồng in ấn; bấm vào một bước để quay lại bước đó. */
export function PrintStepper({
  currentStep,
  onSelect,
  steps,
}: {
  currentStep: PrintStep
  onSelect: (step: PrintStep) => void
  steps: { step: PrintStep; label: string; sub: string }[]
}) {
  return (
    <div className="p-4 rounded-2xl bg-surface border border-border shadow-xs">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        {steps.map((s) => {
        const isCompleted = currentStep > s.step
        const isCurrent = currentStep === s.step
        return (
          <Button variant="ghost"
            key={s.step}
            type="button"
            onClick={() => onSelect(s.step)}
            className={`text-[length:inherit] h-auto justify-start font-[inherit] gap-0 inline-block p-2.5 rounded-xl text-left border transition-all ${
              isCurrent
                ? "border-primary bg-selected/20 shadow-2xs"
                : isCompleted
                ? "border-success/30 bg-success/5 hover:border-success/50"
                : "border-border bg-surface-alt/40"
            }`}
          >
            <div className="flex items-center gap-2">
              <span
                className={`w-5 h-5 rounded-full flex items-center justify-center text-caption font-bold shrink-0 ${
                  isCompleted
                    ? "bg-success text-white"
                    : isCurrent
                    ? "bg-primary text-white"
                    : "bg-surface-alt text-text-muted"
                }`}
              >
                {isCompleted ? <Check className="w-3 h-3" /> : s.step}
              </span>
              <div className="min-w-0">
                <span className="block text-caption font-bold text-text truncate">
                  {s.label}
                </span>
                <span className="block text-caption text-text-muted truncate">{s.sub}</span>
              </div>
            </div>
          </Button>
        )
        })}
      </div>
    </div>
  )
}

/** Bước 4: bản in đã xuất — tóm tắt quy cách, tải lại, tạo bản khác. */
export function PrintExportSuccess({
  preset,
  materialName,
  quantity,
  onDownloadAgain,
  onStartOver,
}: {
  preset: PrintPreset
  materialName: string | undefined
  quantity: number
  onDownloadAgain: (() => void) | undefined
  onStartOver: () => void
}) {
  return (
    <div className="p-8 rounded-2xl bg-surface border border-border shadow-xs text-center max-w-2xl mx-auto space-y-6">
      <div className="w-16 h-16 rounded-full bg-success/10 text-success flex items-center justify-center mx-auto">
        <CheckCircle2 className="w-8 h-8" />
      </div>

      <div className="space-y-2">
        <h3 className="text-title-sm font-bold text-text">
          Bản in PDF chất lượng cao đã sẵn sàng!
        </h3>
        <p className="text-caption text-text-muted leading-relaxed">
          File đã tự động tải về thiết bị của bạn. Bản in đạt chuẩn 300 DPI với tràn lề +{preset.bleedMm}mm và đường xén sắc nét, sẵn sàng gửi thẳng xưởng in.
        </p>
      </div>

      <div className="p-4 rounded-xl bg-surface-alt border border-border text-left space-y-2 text-caption">
        <div className="flex justify-between">
          <span className="text-text-muted">Khổ in:</span>
          <strong className="text-text">{preset.name} ({preset.widthMm} × {preset.heightMm} mm)</strong>
        </div>
        <div className="flex justify-between">
          <span className="text-text-muted">Chất liệu đề xuất:</span>
          <strong className="text-text">{materialName}</strong>
        </div>
        <div className="flex justify-between">
          <span className="text-text-muted">Số lượng dự kiến:</span>
          <strong className="text-text">{formatNumber(quantity)} bản</strong>
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
        {onDownloadAgain && (
          <Button
            variant="outline"
            onClick={onDownloadAgain}
            className="flex items-center gap-2"
          >
            <FileDown className="w-4 h-4" />
            <span>Tải lại file PDF</span>
          </Button>
        )}

        <Button
          variant="secondary"
          onClick={onStartOver}
          className="flex items-center gap-2"
        >
          <Sparkles className="w-4 h-4" />
          <span>Tạo thêm bản in khác</span>
        </Button>
      </div>
    </div>
  )
}
