"use client"

import React, { useState } from "react"
import {
  CheckCircle2,
  UploadCloud,
  ImageIcon,
  Loader2,
  Trash2,
  Check,
  FileCheck2,
  MapPin,
  Clock,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { PhotoSourcePicker } from "./photo-source-picker"
import { subcontractAccessHeaders } from "@/components/greeting-card/subcontract/subcontract-access"

export interface DeliveryProofInfo {
  photoUrls: string[]
  note?: string | null | undefined
  deliveredAt?: string | null | undefined
  deliveredByBranch?: string | null | undefined
}

export interface DeliveryProofCardProps {
  orderCode: string
  branchId: string
  productionStatus?: string | null | undefined
  deliveryStatus?: string | null | undefined
  orderStatus?: string | null | undefined
  existingDeliveryProof?: DeliveryProofInfo | null | undefined
  onDelivered?: () => void
}

export function DeliveryProofCard({
  orderCode,
  branchId,
  productionStatus,
  deliveryStatus,
  orderStatus,
  existingDeliveryProof,
  onDelivered,
}: DeliveryProofCardProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [note, setNote] = useState("")
  const [submitting, setSubmitting] = useState(false)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const [successJustSubmitted, setSuccessJustSubmitted] = useState(false)

  const isDelivered =
    deliveryStatus === "DELIVERED" ||
    orderStatus === "COMPLETED" ||
    Boolean(existingDeliveryProof?.deliveredAt) ||
    successJustSubmitted

  // Chỉ hiển thị khối giao hàng khi sản phẩm đã làm xong (READY) hoặc đang đi giao (DELIVERING) hoặc đã hoàn tất
  const canShow =
    isDelivered ||
    deliveryStatus === "DELIVERING" ||
    deliveryStatus === "DISPATCHED" ||
    productionStatus === "READY"

  if (!canShow) {
    return null
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith("image/")) {
      setErrorMsg("Vui lòng chỉ chọn tệp hình ảnh (JPG, PNG, WebP)")
      return
    }

    if (file.size > 10 * 1024 * 1024) {
      setErrorMsg("Ảnh vượt quá dung lượng tối đa cho phép (10MB)")
      return
    }

    setErrorMsg(null)
    setSelectedFile(file)
    const objectUrl = URL.createObjectURL(file)
    setPreviewUrl(objectUrl)
  }

  function handleCancelPreview() {
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl)
    }
    setSelectedFile(null)
    setPreviewUrl(null)
  }

  async function handleSubmitProof() {
    if (!selectedFile) {
      setErrorMsg("Vui lòng chụp hoặc chọn ảnh giao hàng trước khi xác nhận")
      return
    }

    setSubmitting(true)
    setErrorMsg(null)

    try {
      const formData = new FormData()
      formData.append("file", selectedFile)
      formData.append("branchId", branchId)
      if (note.trim()) {
        formData.append("note", note.trim())
      }

      const res = await fetch(`/api/v1/public/subcontract/${orderCode}/submit-delivery`, {
        method: "POST",
        headers: subcontractAccessHeaders(),
        body: formData,
      })

      const json = await res.json().catch(() => ({}))

      if (!res.ok) {
        throw new Error(json.error?.message || "Không thể tải ảnh bằng chứng giao hàng")
      }

      setSuccessJustSubmitted(true)
      handleCancelPreview()
      if (onDelivered) {
        onDelivered()
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Đã có lỗi xảy ra khi xác nhận giao hàng"
      setErrorMsg(message)
    } finally {
      setSubmitting(false)
    }
  }

  // Giao diện khi đơn hàng ĐÃ HOÀN TẤT GIAO HÀNG
  if (isDelivered) {
    const photos = existingDeliveryProof?.photoUrls ?? []
    const deliveredAtText = existingDeliveryProof?.deliveredAt
      ? new Date(existingDeliveryProof.deliveredAt).toLocaleString("vi-VN", {
          hour: "2-digit",
          minute: "2-digit",
          day: "2-digit",
          month: "2-digit",
          year: "numeric",
        })
      : "Vừa xong"

    return (
      <div className="w-full max-w-lg mt-4 bg-surface rounded-2xl border border-success/30 shadow-md p-5 flex flex-col gap-3">
        <div className="flex items-center justify-between pb-3 border-b border-border">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-success/10 flex items-center justify-center text-success">
              <CheckCircle2 size={18} />
            </div>
            <div>
              <h3 className="text-body font-black text-foreground">
                Đã Hoàn Tất Giao Hàng (POD)
              </h3>
              <p className="text-caption text-text-muted flex items-center gap-1 mt-0.5">
                <Clock size={11} /> {deliveredAtText}
              </p>
            </div>
          </div>
          <span className="px-2.5 py-1 rounded-full text-caption font-extrabold bg-success/15 text-success">
            Giao thành công
          </span>
        </div>

        {existingDeliveryProof?.note && (
          <div className="p-3 rounded-xl bg-surface-muted/60 border border-border text-body-sm text-foreground">
            <span className="font-bold text-caption text-text-muted block mb-0.5">Ghi chú giao hàng:</span>
            {existingDeliveryProof.note}
          </div>
        )}

        {photos.length > 0 && (
          <div className="flex flex-col gap-1.5 pt-1">
            <span className="text-caption font-bold text-text-muted flex items-center gap-1">
              <ImageIcon size={13} /> Ảnh bằng chứng giao hàng (POD):
            </span>
            <div className="grid grid-cols-3 gap-2">
              {photos.map((url, idx) => (
                <a
                  key={idx}
                  href={url}
                  target="_blank"
                  rel="noreferrer"
                  className="relative aspect-square rounded-xl overflow-hidden border border-border bg-surface-muted group block"
                >
                  <img
                    src={url}
                    alt={`Ảnh POD ${idx + 1}`}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                  />
                  <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-caption font-bold">
                    Xem ảnh
                  </div>
                </a>
              ))}
            </div>
          </div>
        )}

        <div className="pt-2 border-t border-border flex items-center justify-between text-caption text-text-muted">
          <span className="flex items-center gap-1 text-success font-semibold">
            <Check size={14} /> Khách hàng đã nhận được thông báo hoàn tất
          </span>
        </div>
      </div>
    )
  }

  // Giao diện khi CỬA HÀNG THỰC HIỆN XÁC NHẬN GIAO HÀNG (Tải ảnh POD)
  return (
    <div className="w-full max-w-lg mt-4 bg-surface rounded-2xl border-2 border-primary/20 shadow-lg p-5 flex flex-col gap-4">
      <div className="flex items-start justify-between gap-2 pb-3 border-b border-border">
        <div>
          <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-primary/10 text-primary text-caption font-extrabold uppercase tracking-wide mb-1">
            <FileCheck2 size={12} /> Bằng chứng giao hàng (POD)
          </div>
          <h3 className="text-body font-black text-foreground">
            Xác Nhận Đã Giao Hàng Cho Khách
          </h3>
          <p className="text-caption text-text-muted mt-0.5">
            Chụp ảnh người nhận / đặt trước cửa nhà / phiếu ký nhận để hoàn tất đơn hàng và ghi nhận đối soát thù lao.
          </p>
        </div>
      </div>

      {errorMsg && (
        <div className="p-3 rounded-xl bg-danger-bg border border-danger/30 text-danger text-body-sm font-semibold">
          {errorMsg}
        </div>
      )}

      {previewUrl ? (
        /* Khung xem trước ảnh POD trước khi gửi */
        <div className="flex flex-col gap-3">
          <div className="relative aspect-4/3 w-full rounded-xl overflow-hidden border-2 border-primary/40 bg-surface-muted shadow-inner">
            <img
              src={previewUrl}
              alt="Xem trước ảnh giao hàng"
              className="w-full h-full object-cover"
            />
          </div>
          <div className="flex items-center justify-between text-caption text-text-muted">
            <span className="truncate max-w-[200px]">{selectedFile?.name}</span>
            <span>{selectedFile ? `${(selectedFile.size / (1024 * 1024)).toFixed(2)} MB` : ""}</span>
          </div>

          <div>
            <label className="block text-caption font-bold text-foreground mb-1">
              Ghi chú khi giao hàng (tùy chọn):
            </label>
            <input
              type="text"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Vd: Đã giao tận tay người nhận, Bảo vệ nhận hộ..."
              className="w-full h-10 px-3 rounded-xl border border-border bg-background text-body-sm text-foreground focus:outline-hidden focus:ring-2 focus:ring-primary/30"
            />
          </div>

          <div className="flex items-center gap-2 pt-1">
            <Button
              variant="outline"
              disabled={submitting}
              onClick={handleCancelPreview}
              className="flex-1 h-11 text-caption font-bold"
            >
              <Trash2 size={15} className="mr-1 text-danger" /> Chọn ảnh khác
            </Button>
            <Button
              variant="primary"
              disabled={submitting}
              onClick={handleSubmitProof}
              className="flex-1 h-11 text-caption font-extrabold shadow-md"
            >
              {submitting ? (
                <>
                  <Loader2 size={16} className="animate-spin mr-1.5" /> Đang tải lên...
                </>
              ) : (
                <>
                  <UploadCloud size={16} className="mr-1.5" /> XÁC NHẬN GIAO THÀNH CÔNG
                </>
              )}
            </Button>
          </div>
        </div>
      ) : (
        /* Nút lớn chụp ảnh từ Camera hoặc chọn từ máy */
        <PhotoSourcePicker
          hint="Ảnh chụp người nhận / tại địa chỉ giao"
          onChange={handleFileChange}
        />
      )}
    </div>
  )
}
