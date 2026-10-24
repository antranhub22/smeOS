"use client"

import React, { useState, useEffect } from "react"
import { Sparkles, Camera, Loader2, RefreshCw } from "lucide-react"
import { FeatureGuidanceCard } from "@/components/templates/shared/feature-guidance-card"
import { PhotoUploadPanel } from "@/components/product-photo-studio/photo-upload-panel"
import { PresetSelector } from "@/components/product-photo-studio/preset-selector"
import { EnhanceResultViewer } from "@/components/product-photo-studio/enhance-result-viewer"
import type { ProductPhotoResult } from "@/modules/product-photo-studio/use-cases/get-product-photo-result"

export function ProductPhotoStudioClient() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [presetId, setPresetId] = useState("auto")
  const [ratioId, setRatioId] = useState("auto")
  const [customNote, setCustomNote] = useState("")

  const [isUploading, setIsUploading] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [jobId, setJobId] = useState<string | null>(null)
  const [jobResult, setJobResult] = useState<ProductPhotoResult | null>(null)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  const handlePhotoSelected = (file: File, url: string) => {
    setSelectedFile(file)
    setPreviewUrl(url)
    setJobResult(null)
    setErrorMsg(null)
  }

  const handleStartEnhance = async () => {
    if (!selectedFile) return
    setIsUploading(true)
    setErrorMsg(null)

    try {
      // 1. Tải ảnh lên kho theo chuẩn hệ thống: upload-url -> PUT -> POST /api/v1/assets
      const { uploadBrandAsset } = await import("@/components/profiles/upload-brand-asset")
      const { assetId } = await uploadBrandAsset(selectedFile)

      // 2. Tạo job xử lý ảnh với provider single-call
      setIsUploading(false)
      setIsProcessing(true)

      const enhanceRes = await fetch("/api/v1/product-photo", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Idempotency-Key": `photo-enhance-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
        },
        body: JSON.stringify({
          asset_id: assetId,
          preset_id: presetId,
          aspect_ratio: ratioId,
          custom_note: customNote,
        }),
      })

      if (!enhanceRes.ok) {
        const err = await enhanceRes.json().catch(() => ({}))
        throw new Error(err.message || "Không thể tạo phiên xử lý ảnh studio")
      }

      const enhanceData = await enhanceRes.json()
      setJobId(enhanceData.job_id)
    } catch (err: unknown) {
      setIsUploading(false)
      setIsProcessing(false)
      setErrorMsg(err instanceof Error ? err.message : "Đã có lỗi xảy ra khi xử lý")
    }
  }

  // Polling kết quả job
  useEffect(() => {
    if (!jobId || !isProcessing) return

    let cancelled = false
    const interval = setInterval(async () => {
      try {
        const res = await fetch(`/api/v1/product-photo/${jobId}`)
        if (!res.ok) return
        const data: ProductPhotoResult = await res.json()

        if (cancelled) return

        if (data.status === "COMPLETED" || data.status === "FAILED") {
          setIsProcessing(false)
          setJobResult(data)
          if (data.status === "FAILED") {
            setErrorMsg(data.error || "Quá trình nâng cấp ảnh không thành công")
          }
          clearInterval(interval)
        }
      } catch {
        // network retry
      }
    }, 2500)

    return () => {
      cancelled = true
      clearInterval(interval)
    }
  }, [jobId, isProcessing])

  const handleRetry = async (retryHint?: string) => {
    if (!jobId) return
    setIsProcessing(true)
    setErrorMsg(null)

    try {
      const res = await fetch(`/api/v1/product-photo/${jobId}/retry`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Idempotency-Key": `photo-retry-${Date.now()}`,
        },
        body: JSON.stringify({ retry_hint: retryHint }),
      })

      if (!res.ok) {
        throw new Error("Không thể gửi yêu cầu điều chỉnh lại")
      }

      const data = await res.json()
      setJobId(data.job_id)
    } catch (err: unknown) {
      setIsProcessing(false)
      setErrorMsg(err instanceof Error ? err.message : "Lỗi khi chạy lại")
    }
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center shadow-xs">
            <Camera className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-slate-900">Tạo ảnh sản phẩm chuyên nghiệp</h1>
              <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800">
                Công cụ 01
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Biến ảnh chụp thô bằng điện thoại thành ảnh studio thương mại đạt chuẩn sàn bằng AI
            </p>
          </div>
        </div>
      </div>

      <FeatureGuidanceCard
        tag="HƯỚNG DẪN CÔNG CỤ 01"
        title="Chụp ảnh thô → Tải lên → Nhận ảnh studio hoàn chỉnh"
        description="Chỉ cần tải ảnh lên, hệ thống sẽ tự động dùng AI Provider tối ưu ánh sáng, xóa bỏ phông nền lộn xộn và đổ bóng studio mà vẫn giữ nguyên 100% hình thái sản phẩm."
        tips={[
          "📸 Chụp sản phẩm rõ nét, đủ sáng, tránh bị che khuất",
          "🎯 Sản phẩm nằm trọn trong khung hình (chiếm 60-80%)",
          "✨ Mặc định tự động chọn phông nền & tỉ lệ tối ưu",
        ]}
      />

      {errorMsg && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold">
          {errorMsg}
        </div>
      )}

      {/* Main Flow: Upload & Configure */}
      {!jobResult && !isProcessing && (
        <div className="space-y-6">
          <PhotoUploadPanel
            onPhotoSelected={handlePhotoSelected}
            disabled={isUploading || isProcessing}
          />

          {selectedFile && (
            <>
              <PresetSelector
                selectedPreset={presetId}
                selectedRatio={ratioId}
                customNote={customNote}
                onPresetChange={setPresetId}
                onRatioChange={setRatioId}
                onCustomNoteChange={setCustomNote}
              />

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  disabled={isUploading || isProcessing}
                  onClick={handleStartEnhance}
                  className="px-6 py-3 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-sm shadow-md hover:shadow-lg transition-all flex items-center gap-2 disabled:opacity-50 cursor-pointer"
                >
                  <Sparkles className="w-4 h-4" /> Tạo ảnh chuyên nghiệp ✨
                </button>
              </div>
            </>
          )}
        </div>
      )}

      {isProcessing && (
        <div className="p-12 rounded-2xl border border-amber-200 bg-amber-50/50 text-center space-y-4 max-w-md mx-auto my-6 shadow-xs">
          <Loader2 className="w-10 h-10 mx-auto text-amber-600 animate-spin" />
          <div>
            <div className="font-bold text-slate-800 text-base">
              AI đang hoàn thiện ảnh sản phẩm studio...
            </div>
            <div className="text-xs text-slate-500 mt-1">
              Đang tối ưu ánh sáng, xóa phông nền và đối chiếu chuẩn kiểm định QC.
            </div>
          </div>
        </div>
      )}

      {/* Result Display */}
      {jobResult && (
        <div className="space-y-4">
          <div className="flex justify-end">
            <button
              type="button"
              onClick={() => {
                setJobResult(null)
                setSelectedFile(null)
                setPreviewUrl(null)
              }}
              className="text-xs font-semibold text-slate-600 hover:text-slate-900 flex items-center gap-1.5"
            >
              <RefreshCw className="w-3.5 h-3.5" /> Tạo ảnh sản phẩm khác
            </button>
          </div>

          <EnhanceResultViewer
            originalUrl={jobResult.originalUrl || previewUrl || ""}
            masterUrl={jobResult.masterUrl || previewUrl || ""}
            qcEvaluation={jobResult.qcEvaluation}
            onRetry={handleRetry}
            onApprove={() => {
              alert("Ảnh đã được lưu và sẵn sàng sử dụng cho catalog & bài viết bán hàng!")
            }}
            isRetrying={isProcessing}
          />
        </div>
      )}
    </div>
  )
}
