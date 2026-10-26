"use client"

import React, { useState, useEffect } from "react"
import { Sparkles, Images, Loader2, RefreshCw } from "lucide-react"
import { FeatureGuidanceCard } from "@/components/templates/shared/feature-guidance-card"
import { PhotoUploadPanel } from "@/components/product-photo-studio/photo-upload-panel"
import { BundleSelector } from "@/components/product-image-set/bundle-selector"
import { ImageSetViewer } from "@/components/product-image-set/image-set-viewer"
import type { ProductImageSetResult } from "@/modules/product-image-set/use-cases/get-product-image-set-result"

export function ProductImageSetClient() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [bundleId, setBundleId] = useState("omnichannel_default")
  const [customNote, setCustomNote] = useState("")

  const [isUploading, setIsUploading] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [jobId, setJobId] = useState<string | null>(null)
  const [jobResult, setJobResult] = useState<ProductImageSetResult | null>(null)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  const handlePhotoSelected = (file: File, url: string) => {
    setSelectedFile(file)
    setPreviewUrl(url)
    setJobResult(null)
    setErrorMsg(null)
  }

  const handleStartGenerateSet = async () => {
    if (!selectedFile) return
    setIsUploading(true)
    setErrorMsg(null)

    try {
      // 1. Tải ảnh lên kho theo chuẩn hệ thống: upload-url -> PUT -> POST /api/v1/assets
      const { uploadBrandAsset } = await import("@/components/profiles/upload-brand-asset")
      const { assetId } = await uploadBrandAsset(selectedFile)

      setIsUploading(false)
      setIsProcessing(true)

      // 2. Tạo job sinh bộ ảnh biến thể
      const res = await fetch("/api/v1/product-image-set", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Idempotency-Key": `image-set-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
        },
        body: JSON.stringify({
          asset_id: assetId,
          bundle_id: bundleId,
          custom_note: customNote,
        }),
      })

      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        throw new Error(err.message || "Không thể tạo bộ ảnh thương mại")
      }

      const data = await res.json()
      setJobId(data.job_id)
    } catch (err: unknown) {
      setIsUploading(false)
      setIsProcessing(false)
      setErrorMsg(err instanceof Error ? err.message : "Đã có lỗi xảy ra khi tạo bộ ảnh")
    }
  }

  // Polling kết quả job
  useEffect(() => {
    if (!jobId || !isProcessing) return

    let cancelled = false
    const interval = setInterval(async () => {
      try {
        const res = await fetch(`/api/v1/product-image-set/${jobId}`)
        if (!res.ok) return
        const data: ProductImageSetResult = await res.json()

        if (cancelled) return

        if (data.status === "COMPLETED" || data.status === "FAILED") {
          setIsProcessing(false)
          setJobResult(data)
          if (data.status === "FAILED") {
            setErrorMsg(data.error || "Quá trình sinh bộ ảnh không thành công")
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

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center shadow-xs">
            <Images className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-slate-900">
                Tạo bộ ảnh sản phẩm từ một ảnh gốc
              </h1>
              <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800">
                Công cụ 02
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Sinh trọn gói ảnh đa tỉ lệ, đa góc cạnh và đa phong cách đồng bộ từ một ảnh duy nhất
            </p>
          </div>
        </div>
      </div>

      <FeatureGuidanceCard
        tag="HƯỚNG DẪN CÔNG CỤ 02"
        title="Một ảnh gốc → Đủ bộ ảnh cho mọi kênh bán hàng"
        description="Từ 1 ảnh chụp chuẩn, AI sẽ tự động tạo đủ bộ ảnh cho sàn TMĐT (1:1), bài đăng MXH (4:5), Story/Reels (9:16) và ảnh cận cảnh với cam kết 100% cùng một sản phẩm."
        tips={[
          "📸 Khuyên dùng ảnh đã qua xử lý chuẩn từ Công cụ 01",
          "✨ Mặc định tạo trọn gói 'Bộ Đăng Bán Đa Kênh'",
          "🔒 Tự động kiểm định tính nhất quán cả bộ (Set Consistency)",
        ]}
      />

      {errorMsg && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold">
          {errorMsg}
        </div>
      )}

      {/* Upload & Configure Flow */}
      {!jobResult && !isProcessing && (
        <div className="space-y-6">
          <PhotoUploadPanel
            onPhotoSelected={handlePhotoSelected}
            disabled={isUploading || isProcessing}
          />

          {selectedFile && (
            <>
              <BundleSelector
                selectedBundleId={bundleId}
                customNote={customNote}
                onBundleChange={setBundleId}
                onCustomNoteChange={setCustomNote}
              />

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  disabled={isUploading || isProcessing}
                  onClick={handleStartGenerateSet}
                  className="px-6 py-3 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-sm shadow-md hover:shadow-lg transition-all flex items-center gap-2 disabled:opacity-50 cursor-pointer"
                >
                  <Sparkles className="w-4 h-4" /> Tạo trọn bộ ảnh ngay ✨
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
              AI đang sinh bộ ảnh đa kênh & kiểm định nhất quán...
            </div>
            <div className="text-xs text-slate-500 mt-1">
              Đang xuất các tỉ lệ 1:1, 4:5, 9:16 và đối chiếu độ trung thực sản phẩm.
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
              <RefreshCw className="w-3.5 h-3.5" /> Tạo bộ ảnh sản phẩm khác
            </button>
          </div>

          <ImageSetViewer
            originalUrl={jobResult.originalUrl || previewUrl || ""}
            result={jobResult}
            onUseInCatalog={() => {
              alert("Đã lưu bộ ảnh vào Thư viện và sẵn sàng gắn vào Catalog!")
            }}
          />
        </div>
      )}
    </div>
  )
}
