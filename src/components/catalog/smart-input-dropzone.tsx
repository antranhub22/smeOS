"use client"

import React, { useState, useRef } from "react"
import {
  UploadCloud,
  Video,
  FileText,
  Sparkles,
  Loader2,
  X,
  Image as ImageIcon,
  Store,
  Layers,
  CheckCircle2,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import type { CatalogProduct } from "./catalog-management-tab"
import { ProductLibraryModal } from "./product-library-modal"
import { ProductThumb } from "@/components/products/product-thumb"

export interface SmartInputData {
  imageFiles: File[]
  imagePreviewUrls: string[]
  videoUrl: string
  userDirectives: string
  selectedProducts?: CatalogProduct[]
}

interface SmartInputDropzoneProps {
  onAnalyze: (data: SmartInputData) => Promise<void>
  onSwitchToManual?: () => void
  isAnalyzing?: boolean
  availableProducts?: CatalogProduct[]
}

export function SmartInputDropzone({
  onAnalyze,
  onSwitchToManual,
  isAnalyzing = false,
  availableProducts = [],
}: SmartInputDropzoneProps) {
  // Input Source Mode: "upload" | "store"
  const [inputSource, setInputSource] = useState<"upload" | "store">("store")
  const [isLibraryOpen, setIsLibraryOpen] = useState(false)

  // Upload state
  const [imageFiles, setImageFiles] = useState<File[]>([])
  const [imagePreviewUrls, setImagePreviewUrls] = useState<string[]>([])
  const [saveToStore, setSaveToStore] = useState(true)

  // Store Selected Products state
  const [selectedProducts, setSelectedProducts] = useState<CatalogProduct[]>([])

  // Video & Directives
  const [videoUrl, setVideoUrl] = useState("")
  const [userDirectives, setUserDirectives] = useState("")
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return
    const files = Array.from(e.target.files)
    addFiles(files)
  }

  const addFiles = (files: File[]) => {
    const validImages = files.filter((f) => f.type.startsWith("image/"))
    if (validImages.length === 0) return

    const newUrls = validImages.map((f) => URL.createObjectURL(f))
    setImageFiles((prev) => [...prev, ...validImages])
    setImagePreviewUrls((prev) => [...prev, ...newUrls])
  }

  const handleRemoveImage = (index: number) => {
    setImageFiles((prev) => prev.filter((_, i) => i !== index))
    setImagePreviewUrls((prev) => {
      URL.revokeObjectURL(prev[index] || "")
      return prev.filter((_, i) => i !== index)
    })
  }

  const handleRemoveProduct = (productId: string) => {
    setSelectedProducts((prev) => prev.filter((p) => p.id !== productId))
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    if (e.dataTransfer.files) {
      addFiles(Array.from(e.dataTransfer.files))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Hợp nhất URL ảnh từ upload và ảnh từ kho sản phẩm
    const storeImageUrls = selectedProducts
      .map((p) => p.imageUrl)
      .filter((url): url is string => Boolean(url))

    const allPreviewUrls = [...imagePreviewUrls, ...storeImageUrls]

    // Gợi ý ghi chú nếu có sản phẩm từ kho được chọn
    let combinedDirectives = userDirectives.trim()
    if (selectedProducts.length > 0 && !combinedDirectives.includes("Sản phẩm từ kho:")) {
      const productNames = selectedProducts.map((p) => p.name).join(", ")
      combinedDirectives = combinedDirectives
        ? `${combinedDirectives} (Mẫu kho: ${productNames})`
        : `Mẫu kho: ${productNames}`
    }

    await onAnalyze({
      imageFiles,
      imagePreviewUrls: allPreviewUrls,
      videoUrl: videoUrl.trim(),
      userDirectives: combinedDirectives,
      selectedProducts,
    })
  }

  const hasAnyInput =
    imageFiles.length > 0 ||
    selectedProducts.length > 0 ||
    videoUrl.trim().length > 0 ||
    userDirectives.trim().length > 0

  return (
    <div className="rounded-2xl border border-primary-border bg-surface p-6 shadow-xs space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border pb-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-primary-muted text-primary text-caption font-bold uppercase tracking-wider">
            <Sparkles className="h-3.5 w-3.5" />
            <span>Tiếp nhận nguyên liệu AI • Chuẩn Dual-Source</span>
          </div>
          <h3 className="text-title font-bold text-text mt-2">
            Đưa nguyên liệu đầu vào — AI tự động phân tích & thiết lập
          </h3>
          <p className="text-body-sm text-text-muted mt-1 max-w-2xl">
            Lựa chọn lấy mẫu từ kho cửa hàng hoặc tải ảnh mới từ máy. Trợ lý AI sẽ tối ưu chất lượng, nhận diện sự kiện và tự động chuẩn bị toàn bộ các bước.
          </p>
        </div>
        {onSwitchToManual && (
          <Button
            type="button"
            variant="outline"
            onClick={onSwitchToManual}
            className="shrink-0 text-caption font-medium border-border hover:bg-surface-alt"
          >
            Chuyển sang Tự thiết kế từng bước →
          </Button>
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Khối Lựa chọn Nguồn Đầu Vào Kép (Dual-Source Selector) */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-body-sm font-bold text-text flex items-center gap-1.5">
              <ImageIcon className="h-4 w-4 text-primary" />
              <span>1. Hình ảnh sản phẩm (Chọn từ kho hoặc tải từ máy)</span>
            </label>
            <span className="text-caption text-text-muted">
              Hỗ trợ kết hợp cả 2 nguồn
            </span>
          </div>

          {/* Toggle 2 nguồn */}
          <div className="grid grid-cols-2 gap-3 p-1 rounded-xl bg-surface-alt border border-border">
            <button
              type="button"
              onClick={() => setInputSource("store")}
              className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-lg text-body-sm font-bold transition-all cursor-pointer ${
                inputSource === "store"
                  ? "bg-surface text-primary shadow-xs border border-primary/20"
                  : "text-text-muted hover:text-text"
              }`}
            >
              <Store className="h-4 w-4" />
              <span>🛍️ Chọn từ Kho tiệm ({selectedProducts.length > 0 ? `Đã chọn ${selectedProducts.length}` : `${availableProducts.length} mẫu`})</span>
            </button>
            <button
              type="button"
              onClick={() => setInputSource("upload")}
              className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-lg text-body-sm font-bold transition-all cursor-pointer ${
                inputSource === "upload"
                  ? "bg-surface text-primary shadow-xs border border-primary/20"
                  : "text-text-muted hover:text-text"
              }`}
            >
              <UploadCloud className="h-4 w-4" />
              <span>💻 Tải từ máy / thiết bị ({imageFiles.length > 0 ? `${imageFiles.length} ảnh` : "Kéo thả"})</span>
            </button>
          </div>

          {/* Nguồn 1: Chọn từ Kho sản phẩm */}
          {inputSource === "store" && (
            <div className="rounded-xl border border-border p-4 bg-surface-alt/30 space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <span className="text-caption font-semibold text-text">
                  Kho sản phẩm của bạn đang có <strong>{availableProducts.length}</strong> mẫu sẵn sàng.
                </span>
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={() => setIsLibraryOpen(true)}
                  className="gap-1.5 text-primary border-primary/30 hover:bg-primary-muted/20 font-bold"
                >
                  <Layers className="h-3.5 w-3.5" />
                  <span>Mở danh mục chọn sản phẩm →</span>
                </Button>
              </div>

              {/* Danh sách các sản phẩm kho đã chọn */}
              {selectedProducts.length > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-1">
                  {selectedProducts.map((p) => (
                    <div
                      key={p.id}
                      className="relative rounded-lg border border-primary-border bg-surface p-2 flex items-center gap-2"
                    >
                      <div className="h-10 w-10 rounded-md bg-surface-alt overflow-hidden shrink-0">
                        <ProductThumb
                          name={p.name}
                          masterImageUrl={p.imageUrl ?? undefined}
                          driveLink={p.driveLink ?? undefined}
                          size="row"
                        />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-caption font-bold text-text truncate">{p.name}</p>
                        <p className="text-meta text-primary font-semibold">
                          {p.price ? `${p.price.toLocaleString("vi-VN")} đ` : p.code}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemoveProduct(p.id)}
                        className="text-text-muted hover:text-danger p-1"
                        aria-label="Bỏ chọn"
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <div
                  role="button"
                  tabIndex={0}
                  onClick={() => setIsLibraryOpen(true)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault()
                      setIsLibraryOpen(true)
                    }
                  }}
                  className="p-6 border border-dashed border-border rounded-lg text-center hover:bg-surface cursor-pointer transition-colors"
                >
                  <p className="text-body-sm text-text-muted font-medium">
                    Chưa chọn mẫu nào từ kho. Nhấp vào đây để chọn các sản phẩm tiêu biểu của tiệm.
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Nguồn 2: Tải lên từ máy */}
          {inputSource === "upload" && (
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
                    Kéo thả ảnh bó/lẵng hoa từ máy vào đây, hoặc <span className="text-primary underline">nhấp để chọn</span>
                  </div>
                  <p className="text-caption text-text-muted">
                    Hỗ trợ PNG, JPG, WEBP. AI tự động tách nền, nâng nét và căn chỉnh khổ đẹp.
                  </p>
                </div>
              </div>

              {/* Tùy chọn lưu ngược vào kho tiệm */}
              <label className="flex items-center gap-2 text-caption text-text-muted cursor-pointer hover:text-text">
                <input
                  type="checkbox"
                  checked={saveToStore}
                  onChange={(e) => setSaveToStore(e.target.checked)}
                  className="rounded border-border text-primary focus:ring-primary"
                />
                <span>Tự động lưu các ảnh mới này vào Kho sản phẩm tiệm để tái sử dụng sau này</span>
              </label>

              {/* Danh sách ảnh máy đã tải */}
              {imagePreviewUrls.length > 0 && (
                <div className="flex flex-wrap gap-3 pt-1">
                  {imagePreviewUrls.map((url, idx) => (
                    <div key={idx} className="relative h-20 w-20 rounded-lg overflow-hidden border border-border group bg-surface">
                      <img src={url} alt={`Ảnh hoa ${idx + 1}`} className="h-full w-full object-cover" />
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation()
                          handleRemoveImage(idx)
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
          )}
        </div>

        {/* Khối Link Video */}
        <div className="space-y-1.5">
          <label className="text-body-sm font-bold text-text flex items-center gap-1.5">
            <Video className="h-4 w-4 text-primary" />
            <span>2. Video giới thiệu sản phẩm (Tùy chọn)</span>
          </label>
          <Input
            value={videoUrl}
            onChange={(e) => setVideoUrl(e.target.value)}
            placeholder="Dán link video TikTok, YouTube hoặc file MP4 trực tiếp..."
            className="text-body-sm"
          />
          <p className="text-caption text-text-muted">
            Video giữ nguyên chất lượng gốc, tự động nhúng vào khu vực video nổi bật của trang.
          </p>
        </div>

        {/* Khối Ghi chú / Văn bản */}
        <div className="space-y-1.5">
          <label className="text-body-sm font-bold text-text flex items-center gap-1.5">
            <FileText className="h-4 w-4 text-primary" />
            <span>3. Ghi chú yêu cầu / Định hướng nội dung (Tùy chọn)</span>
          </label>
          <textarea
            value={userDirectives}
            onChange={(e) => setUserDirectives(e.target.value)}
            rows={2}
            placeholder="VD: Hoa hồng đỏ 20/10 tặng mẹ hoặc vợ, tầm giá 800k - 1.2 triệu, lời văn ấm áp tri ân..."
            className="w-full rounded-md border border-border bg-surface px-3 py-2 text-body-sm text-text focus:outline-none focus:ring-1 focus:ring-primary"
          />
          <p className="text-caption text-text-muted">
            AI sẽ lồng ghép yêu cầu này vào tiêu đề, câu chuyện thương hiệu và bảng giá sản phẩm.
          </p>
        </div>

        {/* Nút hành động chính */}
        <div className="flex items-center justify-between pt-3 border-t border-border">
          <span className="text-caption text-text-muted">
            Sau khi AI phân tích, bạn sẽ được xem và chỉnh sửa toàn bộ các bước trước khi xuất bản.
          </span>
          <Button
            type="submit"
            disabled={!hasAnyInput || isAnalyzing}
            className="bg-primary text-surface hover:bg-primary-dark flex items-center gap-2 px-6"
          >
            {isAnalyzing ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Đang phân tích & tối ưu...</span>
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4" />
                <span>AI Phân tích & Tự động thiết lập →</span>
              </>
            )}
          </Button>
        </div>
      </form>

      {/* Modal Kho Sản Phẩm */}
      <ProductLibraryModal
        open={isLibraryOpen}
        onClose={() => setIsLibraryOpen(false)}
        products={availableProducts}
        selectedIds={selectedProducts.map((p) => p.id)}
        onSelectProducts={(chosen) => setSelectedProducts(chosen)}
      />
    </div>
  )
}
