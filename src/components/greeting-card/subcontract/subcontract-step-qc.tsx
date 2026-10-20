"use client"

import React, { useRef, useState } from "react"
import {
  Camera,
  CheckCircle2,
  Clock,
  UploadCloud,
  Loader2,
  Lock,
  ChevronDown,
  Trash2,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { SubcontractQcGallery } from "./subcontract-qc-gallery"
import { SubcontractQcPreview } from "./subcontract-qc-preview"
import { SubcontractRecipientContact } from "./subcontract-recipient-contact"
import { useStepCountdown } from "./use-step-countdown"
import { StepCountdownBadge } from "./step-countdown-badge"

export interface SubcontractStepQcProps {
  orderCode: string
  branchId: string
  recipientName?: string | null | undefined
  recipientPhone?: string | null | undefined
  isPhoneMasked?: boolean | undefined
  qcPhotos?: string[] | undefined
  productionStatus?: string | null | undefined
  deadlineMs?: number | null | undefined
  isActive: boolean
  isCompleted: boolean
  isUnlocked: boolean
  onActivate: () => void
  onQcUploaded?: (() => void) | undefined
}

export function SubcontractStepQc({
  orderCode,
  branchId,
  recipientName,
  recipientPhone,
  isPhoneMasked,
  qcPhotos = [],
  productionStatus,
  deadlineMs,
  isActive,
  isCompleted,
  isUnlocked,
  onActivate,
  onQcUploaded,
}: SubcontractStepQcProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const countdown = useStepCountdown(isUnlocked && !isCompleted ? deadlineMs : null)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [uploadingQc, setUploadingQc] = useState(false)
  const [qcSuccessMsg, setQcSuccessMsg] = useState<string | null>(null)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const [currentQcPhotos, setCurrentQcPhotos] = useState<string[]>(qcPhotos)

  React.useEffect(() => {
    setCurrentQcPhotos(qcPhotos)
  }, [qcPhotos])

  function handleTriggerFileInput() {
    setErrorMsg(null)
    setQcSuccessMsg(null)
    fileInputRef.current?.click()
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith("image/")) {
      setErrorMsg("Vui lòng chọn tệp hình ảnh (JPG, PNG, WebP).")
      return
    }

    if (file.size > 10 * 1024 * 1024) {
      setErrorMsg("Kích thước ảnh vượt quá giới hạn 10MB.")
      return
    }

    setSelectedFile(file)
    const url = URL.createObjectURL(file)
    setPreviewUrl(url)
    setErrorMsg(null)
  }

  function handleCancelPreview() {
    setSelectedFile(null)
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl)
      setPreviewUrl(null)
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  async function handleUploadQcPhoto() {
    if (!selectedFile) return
    setUploadingQc(true)
    setErrorMsg(null)
    setQcSuccessMsg(null)

    try {
      const formData = new FormData()
      formData.append("file", selectedFile)
      formData.append("branchId", branchId)

      const res = await fetch(`/api/v1/public/subcontract/${encodeURIComponent(orderCode)}/upload-qc`, {
        method: "POST",
        body: formData,
      })

      const json = await res.json().catch(() => ({}))
      if (!res.ok) {
        throw new Error(json?.error?.message || json?.message || "Không thể tải ảnh thành phẩm lên máy chủ")
      }

      const uploadedUrl = json?.data?.photoUrl || previewUrl
      if (uploadedUrl) setCurrentQcPhotos((prev) => [...prev, uploadedUrl])
      setQcSuccessMsg(json?.data?.message || "Đã tải ảnh thành phẩm lên thành công và gửi kiểm định chất lượng!")
      handleCancelPreview()
      onQcUploaded?.()
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : "Lỗi khi tải ảnh lên")
    } finally {
      setUploadingQc(false)
    }
  }

  async function handleDeleteQcPhoto(photoUrl: string) {
    if (!confirm("Bạn có chắc chắn muốn xóa ảnh thành phẩm này không?")) return
    setErrorMsg(null)
    try {
      const res = await fetch(`/api/v1/public/subcontract/${encodeURIComponent(orderCode)}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "DELETE_QC", branchId, photoUrl }),
      })
      const json = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(json?.error?.message || "Lỗi khi xóa ảnh")
      setCurrentQcPhotos((prev) => prev.filter((p) => p !== photoUrl))
      onQcUploaded?.()
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : "Lỗi khi xóa ảnh")
    }
  }

  return (
    <section
      aria-label="Công đoạn 2: Chế tác & Kiểm định chất lượng (QC)"
      className={cn(
        "rounded-2xl border transition-all duration-300 overflow-hidden",
        isActive
          ? "border-primary/50 bg-surface shadow-md ring-2 ring-primary/20 opacity-100"
          : isCompleted
          ? "border-success/30 bg-surface/90 opacity-85 hover:opacity-100"
          : isUnlocked
          ? "border-border/60 bg-surface/80 opacity-70 hover:opacity-95"
          : "border-border/40 bg-surface/50 opacity-50 cursor-not-allowed"
      )}
    >
      {/* Header bar của Bước 2 */}
      <button
        type="button"
        onClick={onActivate}
        disabled={!isUnlocked}
        className="w-full p-4 flex items-center justify-between text-left border-b border-border/60 bg-surface-muted/30 hover:bg-surface-muted/60 transition-colors cursor-pointer disabled:cursor-not-allowed"
      >
        <div className="flex items-center gap-2.5">
          <div
            className={cn(
              "flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-caption font-black",
              isCompleted
                ? "bg-success text-white"
                : isActive
                ? "bg-primary text-white ring-2 ring-primary/30"
                : isUnlocked
                ? "bg-surface-muted text-foreground border border-border"
                : "bg-surface-muted text-text-muted/60 border border-border/40"
            )}
          >
            {isCompleted ? <CheckCircle2 size={16} /> : !isUnlocked ? <Lock size={12} /> : "2"}
          </div>
          <div>
            <span className="text-body-sm font-extrabold text-foreground block">
              2. Chế tác & Kiểm định chất lượng (QC)
            </span>
            <span className="text-caption text-text-muted">
              {isCompleted
                ? "Đã có ảnh thành phẩm đạt kiểm định"
                : isUnlocked
                ? "Chụp ảnh thành phẩm gửi kiểm duyệt chất lượng"
                : "Chờ hoàn thành Bước 1"}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {isCompleted ? (
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-success/20 text-success text-caption font-bold">
              <CheckCircle2 size={12} /> Đã có {currentQcPhotos.length} ảnh
            </span>
          ) : isUnlocked ? (
            countdown ? (
              <StepCountdownBadge countdown={countdown} labelPrefix="QC trước" />
            ) : (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-warning/20 text-warning text-caption font-bold">
                <Clock size={12} /> Cần ảnh QC
              </span>
            )
          ) : (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-surface-muted text-text-muted text-caption font-bold">
              <Lock size={12} /> Khóa
            </span>
          )}
          <ChevronDown
            size={16}
            className={cn(
              "text-text-muted transition-transform duration-200",
              isActive ? "rotate-180 text-primary" : ""
            )}
          />
        </div>
      </button>

      {/* Thân chi tiết Bước 2 */}
      <div className={cn("p-4 sm:p-5 flex flex-col gap-4", !isActive && "hidden")}>
        {!isUnlocked ? (
          <div className="p-4 rounded-xl bg-surface-muted text-center flex flex-col items-center gap-2 text-text-muted">
            <Lock size={24} className="opacity-50" />
            <p className="text-caption">
              Vui lòng tiếp nhận đơn hàng ở <strong>Bước 1</strong> để mở khóa công đoạn chế tác và kiểm định chất lượng.
            </p>
          </div>
        ) : (
          <>
            {/* Banner đếm ngược hạn chót nổi bật khi mở bước */}
            {countdown && !isCompleted && (
              <div
                className={cn(
                  "p-3 rounded-xl border flex items-center justify-between gap-2 text-caption",
                  countdown.isOverdue
                    ? "bg-danger-bg border-danger/30 text-danger font-bold"
                    : "bg-primary/5 border-primary/20 text-foreground"
                )}
              >
                <div className="flex items-center gap-2">
                  <Clock size={16} className={countdown.isOverdue ? "text-danger" : "text-primary"} />
                  <span>
                    Hạn hoàn tất kiểm định QC: <strong>{countdown.targetTimeStr || "Đang tính"}</strong>
                  </span>
                </div>
                <strong className={cn("text-body-sm font-black", countdown.isOverdue ? "text-danger" : "text-primary")}>
                  {countdown.formatted}
                </strong>
              </div>
            )}
            {errorMsg && (
              <div className="p-3 rounded-xl bg-danger-bg border border-danger/30 text-danger text-body-sm">
                {errorMsg}
              </div>
            )}

            {qcSuccessMsg && (
              <div className="p-3 rounded-xl bg-success/15 border border-success/30 text-success text-body-sm flex items-center gap-2">
                <CheckCircle2 size={16} className="shrink-0" />
                <span>{qcSuccessMsg}</span>
              </div>
            )}

            {/* Input file ẩn */}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              capture="environment"
              className="hidden"
              onChange={handleFileChange}
            />

            {/* Xem trước ảnh vừa chọn từ máy */}
            {previewUrl ? (
              <SubcontractQcPreview
                previewUrl={previewUrl}
                selectedFile={selectedFile}
                uploadingQc={uploadingQc}
                onCancel={handleCancelPreview}
                onUpload={handleUploadQcPhoto}
              />
            ) : (
              /* Nút mở Camera / Thư viện ảnh */
              <Button
                variant="outline"
                onClick={handleTriggerFileInput}
                className="w-full h-20 border-2 border-dashed border-primary/50 hover:border-primary hover:bg-primary/5 rounded-xl flex flex-col items-center justify-center gap-1.5 cursor-pointer transition-all"
              >
                <div className="flex items-center gap-2 text-primary font-bold text-body-sm">
                  <Camera size={20} />
                  <span>CHỤP ẢNH TỪ CAMERA HOẶC CHỌN TỪ MÁY</span>
                </div>
                <span className="text-caption text-text-muted">
                  Nhấp vào đây để mở Camera hoặc thư viện ảnh trên thiết bị của bạn
                </span>
              </Button>
            )}


            {/* Danh sách các ảnh QC đã tải lên */}
            {!previewUrl && (
              <SubcontractQcGallery
                photos={currentQcPhotos}
                onDeletePhoto={handleDeleteQcPhoto}
              />
            )}

            {/* Khối bảo mật số điện thoại người nhận */}
            <SubcontractRecipientContact
              recipientName={recipientName}
              recipientPhone={recipientPhone}
              isPhoneMasked={isPhoneMasked}
            />
          </>
        )}
      </div>
    </section>
  )
}
