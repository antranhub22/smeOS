"use client"

import React, { useRef, useState } from "react"
import { UploadCloud, Image as ImageIcon, Sparkles, X, CheckCircle, RefreshCw } from "@/components/ui/icons"
import { Button } from "@/components/ui/button"

export interface DirectProductUploadProps {
  onImageSelected: (file: File, previewUrl: string) => void
  onClear: () => void
  selectedFile: File | null
  previewUrl: string | null
  isProcessing?: boolean
  processingStatusText?: string
  disabled?: boolean
}

export function DirectProductUpload({
  onImageSelected,
  onClear,
  selectedFile,
  previewUrl,
  isProcessing = false,
  processingStatusText = "Đang xử lý...",
  disabled = false,
}: DirectProductUploadProps) {
  const fileInputRef = useRef<HTMLInputElement | null>(null)
  const [isDragOver, setIsDragOver] = useState(false)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const url = URL.createObjectURL(file)
      onImageSelected(file, url)
    }
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    if (!disabled && !isProcessing) {
      setIsDragOver(true)
    }
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
    if (disabled || isProcessing) return

    const file = e.dataTransfer.files?.[0]
    if (file && file.type.startsWith("image/")) {
      const url = URL.createObjectURL(file)
      onImageSelected(file, url)
    }
  }

  return (
    <div className="flex flex-col gap-3">
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/avif"
        className="hidden"
        onChange={handleFileChange}
        disabled={disabled || isProcessing}
      />

      {!selectedFile || !previewUrl ? (
        <button
          type="button"
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => {
            if (!disabled && !isProcessing) {
              fileInputRef.current?.click()
            }
          }}
          className={`w-full border-2 border-dashed rounded-2xl p-6 transition-all text-center flex flex-col items-center justify-center gap-3 cursor-pointer ${
            isDragOver
              ? "border-primary bg-primary/10 scale-[0.99]"
              : "border-border hover:border-primary/50 hover:bg-surface-alt/60 bg-surface/40"
          }`}
        >
          <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center shadow-xs">
            <UploadCloud size={24} />
          </div>
          <div>
            <div className="text-sm font-bold text-text">
              Kéo thả ảnh sản phẩm chụp thô vào đây hoặc{" "}
              <span className="text-primary hover:underline">tải từ máy</span>
            </div>
            <p className="text-caption text-text-muted mt-1">
              Hỗ trợ JPG, PNG, WEBP. AI sẽ tự động phân tích thị giác và lưu vào danh mục sản phẩm.
            </p>
          </div>
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-border bg-surface text-caption font-semibold text-text shadow-2xs mt-1">
            <ImageIcon size={14} />
            Chọn ảnh từ thiết bị
          </span>
        </button>
      ) : (
        <div className="relative rounded-2xl border border-border bg-surface p-4 flex flex-col sm:flex-row items-center gap-4">
          <div className="relative w-28 h-28 rounded-xl overflow-hidden border border-border shrink-0 bg-background">
            <img
              src={previewUrl}
              alt="Ảnh sản phẩm tải lên"
              className="w-full h-full object-cover"
            />
            {isProcessing && (
              <div className="absolute inset-0 bg-background/80 backdrop-blur-xs flex items-center justify-center">
                <RefreshCw size={20} className="animate-spin text-primary" />
              </div>
            )}
          </div>

          <div className="flex-1 min-w-0 text-center sm:text-left">
            <div className="flex items-center justify-center sm:justify-start gap-2">
              <span className="text-xs font-bold text-text truncate max-w-[260px]">
                {selectedFile.name}
              </span>
              <span className="text-caption text-text-muted">
                ({(selectedFile.size / (1024 * 1024)).toFixed(2)} MB)
              </span>
            </div>

            <p className="text-caption text-text-muted mt-1">
              {isProcessing
                ? processingStatusText
                : "Ảnh đã sẵn sàng. Khi bấm sinh nội dung, AI sẽ nhận diện đặc điểm sản phẩm và tạo bài viết."}
            </p>

            <div className="mt-3 flex items-center justify-center sm:justify-start gap-2">
              {!isProcessing ? (
                <>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => fileInputRef.current?.click()}
                    className="text-xs h-7 px-2.5"
                    disabled={disabled}
                  >
                    Đổi ảnh khác
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={onClear}
                    className="text-xs h-7 px-2.5 text-danger hover:text-danger hover:bg-danger/10"
                    disabled={disabled}
                  >
                    <X size={13} className="mr-1" />
                    Hủy ảnh
                  </Button>
                </>
              ) : (
                <div className="flex items-center gap-1.5 text-xs text-primary font-semibold">
                  <Sparkles size={14} className="animate-spin" />
                  {processingStatusText}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
