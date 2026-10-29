"use client"

import React, { useState } from "react"
import Link from "next/link"
import { Camera, RefreshCw, Sparkles } from "lucide-react"
import { FeatureGuidanceCard } from "@/components/templates/shared/feature-guidance-card"
import { PhotoUploadPanel } from "@/components/product-photo-studio/photo-upload-panel"
import { PresetSelector } from "@/components/product-photo-studio/preset-selector"
import { EnhanceResultViewer } from "@/components/product-photo-studio/enhance-result-viewer"
import { Button } from "@/components/ui/button"
import { CostPreview, isCostAffordable } from "@/components/ui/cost-preview"
import { ResultPanel } from "@/components/ui/result-panel"
import { TaskStatus } from "@/components/ui/task-status"
import { isTaskBusy } from "@/lib/ui-system/task-state"
import { costCreditForFeature } from "@/modules/usage/domain/pricing"
import { useProductPhotoJob } from "./use-product-photo-job"

/** Bộ máy đám mây tính giá cao nhất — báo trước mức tối đa để không thiếu credit giữa chừng. */
const MAX_COST = Math.max(costCreditForFeature("media.optimize"), costCreditForFeature("media.optimize.cloud"))

/**
 * Công cụ "Tạo ảnh sản phẩm chuyên nghiệp" theo chuẩn Progressive Disclosure — pilot 03c
 * (Chặng 01 tải ảnh + Chặng 02 + bước tạo ảnh). Bật theo cờ `ux_pd_anh_san_pham`.
 */
export function ProductPhotoStudioFlow() {
  const job = useProductPhotoJob()
  const [file, setFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [presetId, setPresetId] = useState("auto")
  const [ratioId, setRatioId] = useState("auto")
  const [customNote, setCustomNote] = useState("")
  const [accepted, setAccepted] = useState(false)

  const busy = isTaskBusy(job.state)
  const affordable = isCostAffordable(MAX_COST, job.balance)

  const start = (extraHint?: string) => {
    if (!file) return
    const note = extraHint ? (customNote ? `${customNote}. ${extraHint}` : extraHint) : customNote
    if (extraHint) setCustomNote(note)
    setAccepted(false)
    void job.start({ file, presetId, ratioId, customNote: note })
  }

  const startOver = () => {
    job.reset()
    setFile(null)
    setPreviewUrl(null)
    setAccepted(false)
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <header className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center shadow-xs">
          <Camera className="w-5 h-5" aria-hidden="true" />
        </div>
        <div>
          <h1 className="text-title font-bold text-text">Tạo ảnh sản phẩm chuyên nghiệp</h1>
          <p className="text-caption text-text-muted mt-0.5">
            Biến ảnh chụp bằng điện thoại thành ảnh studio đạt chuẩn sàn thương mại
          </p>
        </div>
      </header>

      <FeatureGuidanceCard
        tag="HƯỚNG DẪN"
        title="Chụp ảnh → Tải lên → Nhận ảnh studio"
        description="Tải ảnh lên, hệ thống tự làm sáng, thay phông nền gọn gàng và đổ bóng studio mà vẫn giữ nguyên hình dáng sản phẩm."
        tips={[
          "📸 Chụp rõ nét, đủ sáng, không bị che khuất",
          "🎯 Sản phẩm chiếm khoảng 60–80% khung hình",
          "✨ Phông nền và tỉ lệ được chọn tự động nếu bạn không đổi",
        ]}
      />

      {job.state !== "succeeded" && (
        <section aria-label="Tải ảnh và tạo" className="space-y-5">
          <PhotoUploadPanel
            onFileSelected={(f) => {
              setFile(f)
              setPreviewUrl(URL.createObjectURL(f))
            }}
            disabled={busy}
          />

          {file && (
            <>
              <PresetSelector
                selectedPreset={presetId}
                selectedRatio={ratioId}
                customNote={customNote}
                onPresetChange={setPresetId}
                onRatioChange={setRatioId}
                onCustomNoteChange={setCustomNote}
              />
              <div className="flex flex-col items-stretch gap-2 sm:flex-row sm:items-center sm:justify-end">
                <CostPreview cost={MAX_COST} remaining={job.balance} estimated />
                <Button size="lg" onClick={() => start()} disabled={busy || !affordable} aria-busy={busy || undefined}>
                  <Sparkles className="w-4 h-4" aria-hidden="true" /> Tạo ảnh sản phẩm
                </Button>
              </div>
            </>
          )}
        </section>
      )}

      {job.state !== "idle" && job.state !== "succeeded" && (
        <TaskStatus
          state={job.state}
          title="Tạo ảnh"
          detail={
            job.state === "failed"
              ? (job.error ?? undefined)
              : "Bạn có thể rời trang — mở lại công cụ này vẫn thấy kết quả."
          }
          failureKind={job.failureKind}
          elapsedSeconds={job.elapsed}
          onRetry={file ? () => start() : undefined}
        />
      )}

      {job.state === "succeeded" && job.result && (
        <ResultPanel
          title="Ảnh studio của bạn"
          stage="saved"
          secondaryActions={
            <Button variant="ghost" size="sm" onClick={startOver}>
              <RefreshCw className="w-3.5 h-3.5" aria-hidden="true" /> Tạo ảnh khác
            </Button>
          }
        >
          <EnhanceResultViewer
            originalUrl={job.result.originalUrl || previewUrl || ""}
            masterUrl={job.result.masterUrl || previewUrl || ""}
            qcEvaluation={job.result.qcEvaluation}
            onRetry={(hint) => start(hint)}
            onApprove={() => setAccepted(true)}
            isRetrying={busy}
          />
          {accepted && (
            <p role="status" className="mt-3 rounded-xl border border-success-border bg-success-bg px-3.5 py-2.5 text-body-sm text-success-text">
              Ảnh đã nằm trong <Link href="/kho-du-lieu" className="font-semibold underline">Kho dữ liệu</Link> — dùng được cho catalog và bài viết bán hàng.
            </p>
          )}
        </ResultPanel>
      )}
    </div>
  )
}
