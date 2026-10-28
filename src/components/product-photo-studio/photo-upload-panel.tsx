"use client"

import { safeImageSrc } from "@/lib/safe-image-src"
import React, { useRef, useState } from "react"
import { Upload, CheckCircle, AlertTriangle, XCircle } from "lucide-react"

interface PhotoUploadPanelProps {
  onFileSelected: (file: File) => void
  disabled?: boolean
}

export function PhotoUploadPanel({ onFileSelected, disabled }: PhotoUploadPanelProps) {
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
      alert("Vui lòng tải lên định dạng hình ảnh hợp lệ (JPG, PNG, WEBP).")
      return
    }

    const objectUrl = URL.createObjectURL(file)
    setPreview(objectUrl)

    const img = new Image()
    img.src = objectUrl
    img.onload = () => {
      const width = img.naturalWidth
      const height = img.naturalHeight
      const resText = `${width} × ${height} px`
      const sizeMb = (file.size / (1024 * 1024)).toFixed(1) + " MB"

      let status: "pass" | "warn" | "fail" = "pass"
      let statusText = "Độ phân giải & chất lượng đạt chuẩn"

      if (width < 800 || height < 800) {
        status = "warn"
        statusText = "Ảnh nhỏ, AI sẽ tự upscale tăng nét"
      } else if (file.size > 15 * 1024 * 1024) {
        status = "fail"
        statusText = "Ảnh vượt quá 15MB, vui lòng nén bớt"
      }

      setFileDetails({
        name: file.name,
        size: sizeMb,
        resolution: resText,
        status,
        statusText,
      })

      onFileSelected(file)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)
    if (disabled) return
    const file = e.dataTransfer.files?.[0]
    if (file) processFile(file)
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) processFile(file)
  }

  return (
    <div className="space-y-4">
      <button
        type="button"
        onDragOver={(e) => {
          e.preventDefault()
          if (!disabled) setDragOver(true)
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        onClick={() => !disabled && fileInputRef.current?.click()}
        className={`w-full relative border-2 border-dashed rounded-2xl p-8 text-center transition-all cursor-pointer ${
          dragOver
            ? "border-primary bg-primary/10 scale-[1.01]"
            : "border-border hover:border-primary/50 bg-surface-alt/40"
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
            <div className="relative w-36 h-36 rounded-xl overflow-hidden border border-border shadow-xs bg-surface shrink-0">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={safeImageSrc(preview)} alt="Ảnh sản phẩm gốc" className="w-full h-full object-contain" />
            </div>
            <div className="text-left space-y-1.5">
              <div className="font-semibold text-text text-body-sm">{fileDetails?.name}</div>
              <div className="text-caption text-text-muted">
                Kích thước: {fileDetails?.size} • Độ phân giải: {fileDetails?.resolution}
              </div>
              <div className="flex items-center gap-1.5 text-caption font-medium pt-1">
                {fileDetails?.status === "pass" && (
                  <span className="text-success flex items-center gap-1">
                    <CheckCircle className="w-3.5 h-3.5" /> {fileDetails.statusText}
                  </span>
                )}
                {fileDetails?.status === "warn" && (
                  <span className="text-warning flex items-center gap-1">
                    <AlertTriangle className="w-3.5 h-3.5" /> {fileDetails.statusText}
                  </span>
                )}
                {fileDetails?.status === "fail" && (
                  <span className="text-danger flex items-center gap-1">
                    <XCircle className="w-3.5 h-3.5" /> {fileDetails.statusText}
                  </span>
                )}
              </div>
              <div className="pt-2 text-caption text-primary font-medium hover:underline">
                Nhấp để chọn ảnh khác ↺
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="w-14 h-14 mx-auto rounded-2xl bg-primary/10 text-primary flex items-center justify-center shadow-xs">
              <Upload className="w-6 h-6" />
            </div>
            <div>
              <p className="text-body font-semibold text-text">
                Kéo thả ảnh chụp sản phẩm vào đây, hoặc{" "}
                <span className="text-primary underline">chọn từ thiết bị</span>
              </p>
              <p className="text-caption text-text-muted mt-1">
                Hỗ trợ ảnh chụp thô bằng điện thoại (JPG, PNG, WEBP). Dung lượng tối đa 15MB.
              </p>
            </div>
          </div>
        )}
      </button>
    </div>
  )
}
