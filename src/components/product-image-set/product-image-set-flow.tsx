"use client"

import React, { useState } from "react"
import Link from "next/link"
import { RefreshCw, Sparkles } from "@/components/ui/icons"
import { FeatureGuidanceCard } from "@/components/templates/shared/feature-guidance-card"
import { PhotoUploadPanel } from "@/components/product-photo-studio/photo-upload-panel"
import { BundleSelector } from "@/components/product-image-set/bundle-selector"
import { ImageSetViewer } from "@/components/product-image-set/image-set-viewer"
import { useGenerationJob } from "@/components/generation-job/use-generation-job"
import { Button } from "@/components/ui/button"
import { CostPreview, isCostAffordable } from "@/components/ui/cost-preview"
import { ResultPanel } from "@/components/ui/result-panel"
import { TaskStatus } from "@/components/ui/task-status"
import { isTaskBusy } from "@/lib/ui-system/task-state"
import { costCreditForFeature } from "@/modules/usage/domain/pricing"
import type { ProductImageSetResult } from "@/modules/product-image-set/use-cases/get-product-image-set-result"
import { ToolHero } from "@/components/ui/tool-hero"

/** Bộ máy đám mây tính giá cao nhất — báo trước mức tối đa để không thiếu credit giữa chừng. */
const MAX_COST = Math.max(costCreditForFeature("media.optimize"), costCreditForFeature("media.optimize.cloud"))

/**
 * Công cụ "Tạo bộ ảnh sản phẩm" theo chuẩn Progressive Disclosure — rollout đợt A-1 (03c).
 * Bật theo cờ `ux_pd_bo_anh_san_pham`.
 */
export function ProductImageSetFlow() {
  const job = useGenerationJob<ProductImageSetResult>({ tool: "bo-anh-san-pham", createUrl: "/api/v1/product-image-set" })
  const [file, setFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [bundleId, setBundleId] = useState("omnichannel_default")
  const [customNote, setCustomNote] = useState("")
  const [accepted, setAccepted] = useState(false)

  const busy = isTaskBusy(job.state)
  const affordable = isCostAffordable(MAX_COST, job.balance)

  const start = () => {
    if (!file) return
    setAccepted(false)
    void job.start({ file, body: { bundle_id: bundleId, custom_note: customNote } })
  }

  const startOver = () => {
    job.reset()
    setFile(null)
    setPreviewUrl(null)
    setAccepted(false)
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <ToolHero icon="Images" tone="rose" title="Bộ ảnh đa kênh" detail="Từ một ảnh, nhận đủ bộ ảnh nhiều tỉ lệ cho sàn thương mại, bài đăng và Story." />

      <FeatureGuidanceCard
        tag="HƯỚNG DẪN"
        title="Một ảnh gốc → Đủ bộ ảnh cho mọi kênh bán hàng"
        description="Tải một ảnh chụp chuẩn, hệ thống tạo đủ ảnh vuông cho sàn, ảnh dọc cho bài đăng và Story, cùng ảnh cận cảnh — tất cả vẫn là đúng một sản phẩm."
        tips={[
          "📸 Nên dùng ảnh đã làm đẹp ở công cụ Tạo ảnh sản phẩm",
          "✨ Mặc định tạo bộ ảnh đăng bán đa kênh",
          "🔒 Hệ thống tự kiểm cả bộ có cùng một sản phẩm",
        ]}
      />

      {job.state !== "succeeded" && (
        <section aria-label="Tải ảnh và tạo bộ ảnh" className="space-y-5">
          <PhotoUploadPanel
            onFileSelected={(f) => {
              setFile(f)
              setPreviewUrl(URL.createObjectURL(f))
            }}
            disabled={busy}
          />
          {file && (
            <>
              <BundleSelector
                selectedBundleId={bundleId}
                customNote={customNote}
                onBundleChange={setBundleId}
                onCustomNoteChange={setCustomNote}
              />
              <div className="flex flex-col items-stretch gap-2 sm:flex-row sm:items-center sm:justify-end">
                <CostPreview cost={MAX_COST} remaining={job.balance} estimated />
                <Button size="lg" onClick={start} disabled={busy || !affordable} aria-busy={busy || undefined}>
                  <Sparkles className="w-4 h-4" aria-hidden="true" /> Tạo bộ ảnh
                </Button>
              </div>
            </>
          )}
        </section>
      )}

      {job.state !== "idle" && job.state !== "succeeded" && (
        <TaskStatus
          state={job.state}
          title="Tạo bộ ảnh"
          detail={
            job.state === "failed"
              ? (job.error ?? undefined)
              : "Bạn có thể rời trang — mở lại công cụ này vẫn thấy kết quả."
          }
          failureKind={job.failureKind}
          elapsedSeconds={job.elapsed}
          onRetry={file ? start : undefined}
        />
      )}

      {job.state === "succeeded" && job.result && (
        <ResultPanel
          title="Bộ ảnh của bạn"
          stage="saved"
          secondaryActions={
            <Button variant="ghost" size="sm" onClick={startOver}>
              <RefreshCw className="w-3.5 h-3.5" aria-hidden="true" /> Tạo bộ ảnh khác
            </Button>
          }
        >
          <ImageSetViewer
            originalUrl={job.result.originalUrl || previewUrl || ""}
            result={job.result}
            onUseInCatalog={() => setAccepted(true)}
          />
          {accepted && (
            <p role="status" className="mt-3 rounded-xl border border-success-border bg-success-bg px-3.5 py-2.5 text-body-sm text-success-text">
              Bộ ảnh đã nằm trong <Link href="/kho-du-lieu" className="font-semibold underline">Kho dữ liệu</Link> — chọn ảnh từ kho khi tạo catalog.
            </p>
          )}
        </ResultPanel>
      )}
    </div>
  )
}
