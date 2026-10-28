"use client"

import React, { useRef } from "react"
import { UploadCloud, X } from "lucide-react"

interface SmartInputFileUploaderProps {
  imageFiles: File[]
  imagePreviewUrls: string[]
  saveToStore: boolean
  onAddFiles: (files: File[]) => void
  onRemoveImage: (index: number) => void
  onToggleSaveToStore: (value: boolean) => void
}

export function SmartInputFileUploader({
  imagePreviewUrls,
  saveToStore,
  onAddFiles,
  onRemoveImage,
  onToggleSaveToStore,
}: SmartInputFileUploaderProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return
    const files = Array.from(e.target.files)
    onAddFiles(files)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    if (e.dataTransfer.files) {
      onAddFiles(Array.from(e.dataTransfer.files))
    }
  }

  return (
    <div className="space-y-3">
      <div
        role="button"
        tabIndex={0}
        onDragOver={(e) => e.preventDefault()}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault()
            fileInputRef.current?.click()
          }
        }}
        className="border-2 border-dashed border-border hover:border-primary-border rounded-xl p-6 text-center bg-surface-alt/50 hover:bg-primary-muted/20 cursor-pointer transition-colors"
      >
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          accept="image/*"
          multiple
          className="hidden"
        />
        <div className="flex flex-col items-center justify-center gap-2">
          <div className="h-10 w-10 rounded-full bg-primary-muted flex items-center justify-center text-primary">
            <UploadCloud className="h-5 w-5" />
          </div>
          <div className="text-body-sm font-semibold text-text">
            Kéo thả ảnh sản phẩm từ máy vào đây, hoặc{" "}
            <span className="text-primary underline">nhấp để chọn</span>
          </div>
          <p className="text-caption text-text-muted">
            Hỗ trợ PNG, JPG, WEBP. AI tự động tối ưu và căn chỉnh khổ đẹp chuẩn 2026.
          </p>
        </div>
      </div>

      <label className="flex items-center gap-2 text-caption text-text-muted cursor-pointer hover:text-text">
        <input
          type="checkbox"
          checked={saveToStore}
          onChange={(e) => onToggleSaveToStore(e.target.checked)}
          className="rounded border-border text-primary focus:ring-primary"
        />
        <span>Tự động lưu các ảnh mới này vào Kho sản phẩm tiệm để tái sử dụng</span>
      </label>

      {imagePreviewUrls.length > 0 && (
        <div className="flex flex-wrap gap-3 pt-1">
          {imagePreviewUrls.map((url, idx) => (
            <div
              key={idx}
              className="relative h-20 w-20 rounded-lg overflow-hidden border border-border group bg-surface"
            >
              <img
                src={url}
                alt={`Ảnh sản phẩm ${idx + 1}`}
                className="h-full w-full object-cover"
              />
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation()
                  onRemoveImage(idx)
                }}
                className="absolute top-1 right-1 h-5 w-5 rounded-full bg-danger text-surface flex items-center justify-center opacity-80 hover:opacity-100 transition-opacity"
                aria-label="Xóa ảnh này"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
