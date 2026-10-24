"use client"

import React, { useRef, useState } from "react"
import { Upload, Image as ImageIcon, CheckCircle, AlertTriangle, XCircle, Sparkles } from "lucide-react"

export interface PhotoUploadPanelProps {
  onPhotoSelected: (file: File, previewUrl: string) => void
  disabled?: boolean
}

export function PhotoUploadPanel({ onPhotoSelected, disabled }: PhotoUploadPanelProps) {
  const [dragOver, setDragOver] = useState(false)
  const [preview, setPreview] = useState<string | null>(null)
  const [fileDetails, setFileDetails] = useState<{
    name: string
    size: string
    resolution?: string
    status: "pass" | "warn" | "fail"
    statusText: string
  } | null>(null)

  const fileInputRef = useRef<HTMLInputElement>(null)

  const processFile = (file: File) => {
    if (!file.type.startsWith("image/")) {
      alert("Vui lòng chọn tệp hình ảnh hợp lệ (JPG, PNG, WEBP)")
      return
    }

    const url = URL.createObjectURL(file)
    setPreview(url)

    const img = new Image()
    img.onload = () => {
      const isLowRes = img.width < 600 || img.height < 600
      const isGoodRes = img.width >= 1000 && img.height >= 1000
      const sizeMb = (file.size / (1024 * 1024)).toFixed(1)

      setFileDetails({
        name: file.name,
        size: `${sizeMb} MB`,
        resolution: `${img.width} × ${img.height} px`,
        status: isGoodRes ? "pass" : isLowRes ? "warn" : "pass",
        statusText: isGoodRes
          ? "Độ phân giải rất tốt cho ảnh studio"
          : isLowRes
          ? "Ảnh hơi nhỏ, kết quả có thể kém nét"
          : "Độ phân giải đạt chuẩn",
      })

      onPhotoSelected(file, url)
    }
    img.src = url
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)
    if (disabled) return
    const file = e.dataTransfer.files[0]
    if (file) processFile(file)
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) processFile(file)
  }

  return (
    <div className="space-y-4">
      <div
        onDragOver={(e) => {
          e.preventDefault()
          if (!disabled) setDragOver(true)
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        onClick={() => !disabled && fileInputRef.current?.click()}
        className={`relative border-2 border-dashed rounded-2xl p-8 text-center transition-all cursor-pointer ${
          dragOver
            ? "border-amber-500 bg-amber-50/50 scale-[1.01]"
            : "border-slate-200 hover:border-slate-300 bg-slate-50/60"
        } ${disabled ? "opacity-60 cursor-not-allowed" : ""}`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          disabled={disabled}
          onChange={handleChange}
        />

        {preview ? (
          <div className="flex flex-col sm:flex-row items-center gap-6 justify-center">
            <div className="relative w-36 h-36 rounded-xl overflow-hidden border border-slate-200 shadow-sm bg-white shrink-0">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={preview} alt="Ảnh sản phẩm gốc" className="w-full h-full object-contain" />
            </div>
            <div className="text-left space-y-1.5">
              <div className="font-semibold text-slate-800 text-sm">{fileDetails?.name}</div>
              <div className="text-xs text-slate-500">
                Kích thước: {fileDetails?.size} • Độ phân giải: {fileDetails?.resolution}
              </div>
              <div className="flex items-center gap-1.5 text-xs font-medium pt-1">
                {fileDetails?.status === "pass" && (
                  <span className="text-emerald-700 flex items-center gap-1">
                    <CheckCircle className="w-3.5 h-3.5" /> {fileDetails.statusText}
                  </span>
                )}
                {fileDetails?.status === "warn" && (
                  <span className="text-amber-700 flex items-center gap-1">
                    <AlertTriangle className="w-3.5 h-3.5" /> {fileDetails.statusText}
                  </span>
                )}
                {fileDetails?.status === "fail" && (
                  <span className="text-rose-700 flex items-center gap-1">
                    <XCircle className="w-3.5 h-3.5" /> {fileDetails.statusText}
                  </span>
                )}
              </div>
              <div className="pt-2 text-xs text-amber-700 font-medium hover:underline">
                Nhấp để chọn ảnh khác ↺
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="w-14 h-14 mx-auto rounded-2xl bg-amber-100/80 text-amber-700 flex items-center justify-center shadow-sm">
              <Upload className="w-6 h-6" />
            </div>
            <div>
              <p className="text-base font-semibold text-slate-800">
                Kéo thả ảnh chụp sản phẩm vào đây, hoặc{" "}
                <span className="text-amber-700 underline">chọn từ thiết bị</span>
              </p>
              <p className="text-xs text-slate-500 mt-1">
                Hỗ trợ ảnh chụp thô bằng điện thoại (JPG, PNG, WEBP). Dung lượng tối đa 15MB.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
