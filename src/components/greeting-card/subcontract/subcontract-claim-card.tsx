"use client"

import React, { useEffect, useState } from "react"
import {
  CheckCircle2,
  Clock,
  AlertTriangle,
  XCircle,
  MapPin,
  Calendar,
  Sparkles,
  Layers,
  ArrowRight,
  ShieldCheck,
  Camera,
  UploadCloud,
  ImageIcon,
  Loader2,
  Trash2,
  Phone,
  Lock,
  Eye,
  User,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  formatGraceCountdown,
  getGraceSecondsRemaining,
  type SubcontractDispatchStatus,
} from "@/modules/greeting-card/domain/subcontract-order"

export interface SubcontractCardProduct {
  name: string
  imageUrl?: string | null
  bomItems?: Array<{ name: string; quantity: number; unit: string; role?: string }>
}

export interface SubcontractClaimCardProps {
  orderCode: string
  branchId: string
  branchName: string
  product: SubcontractCardProduct
  deliveryAddress: string
  deliveryTime: string
  recipientName?: string | null | undefined
  recipientPhone?: string | null | undefined
  isPhoneMasked?: boolean | undefined
  cardMessage?: string | null | undefined
  specialNotes?: string | null | undefined
  subcontractPriceVnd: number
  dispatchStatus: SubcontractDispatchStatus
  claimedByBranchId?: string | null | undefined
  claimedBranchName?: string | null | undefined
  graceExpiresAt?: string | null | undefined
  productionStatus?: string | null | undefined
  qcPhotos?: string[] | undefined
  onClaim: () => Promise<void>
  onCancelClaim: () => Promise<void>
  onCommitEarly?: (() => Promise<void>) | undefined
  onQcUploaded?: (() => void) | undefined
}

export function SubcontractClaimCard({
  orderCode,
  branchId,
  branchName,
  product,
  deliveryAddress,
  deliveryTime,
  recipientName,
  recipientPhone,
  isPhoneMasked,
  cardMessage,
  specialNotes,
  subcontractPriceVnd,
  dispatchStatus,
  claimedByBranchId,
  claimedBranchName,
  graceExpiresAt,
  productionStatus,
  qcPhotos,
  onClaim,
  onCancelClaim,
  onCommitEarly,
  onQcUploaded,
}: SubcontractClaimCardProps) {
  const [loading, setLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const [imageError, setImageError] = useState(false)
  const [graceSeconds, setGraceSeconds] = useState(() =>
    getGraceSecondsRemaining(graceExpiresAt ?? null)
  )

  // Quản lý upload ảnh thành phẩm QC từ máy
  const fileInputRef = React.useRef<HTMLInputElement>(null)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [uploadingQc, setUploadingQc] = useState(false)
  const [qcSuccessMsg, setQcSuccessMsg] = useState<string | null>(null)
  const [currentQcPhotos, setCurrentQcPhotos] = useState<string[]>(qcPhotos ?? [])
  const [brokenQcPhotos, setBrokenQcPhotos] = useState<Record<string, boolean>>({})

  useEffect(() => {
    if (qcPhotos) setCurrentQcPhotos(qcPhotos)
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
      setCurrentQcPhotos((prev) => [...prev, uploadedUrl])
      setQcSuccessMsg(json?.data?.message || "Đã tải ảnh thành phẩm lên thành công và AI đã xác thực!")
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
      const res = await fetch(`/api/v1/public/subcontract/${orderCode}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "DELETE_QC",
          branchId,
          photoUrl,
        }),
      })
      const json = await res.json()
      if (!res.ok) {
        throw new Error(json?.error?.message || "Lỗi khi xóa ảnh")
      }
      setCurrentQcPhotos((prev) => prev.filter((p) => p !== photoUrl))
      onQcUploaded?.()
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : "Lỗi khi xóa ảnh")
    }
  }

  const isMyClaim = claimedByBranchId === branchId
  const isClaimedByOther =
    (dispatchStatus === "CLAIMED_GRACE" || dispatchStatus === "COMMITTED") && !isMyClaim

  useEffect(() => {
    if (dispatchStatus !== "CLAIMED_GRACE" || !graceExpiresAt) return

    const timer = setInterval(() => {
      const remaining = getGraceSecondsRemaining(graceExpiresAt)
      setGraceSeconds(remaining)
      if (remaining <= 0) {
        clearInterval(timer)
      }
    }, 1000)

    return () => clearInterval(timer)
  }, [dispatchStatus, graceExpiresAt])

  async function handleClaim() {
    setLoading(true)
    setErrorMsg(null)
    try {
      await onClaim()
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : "Không thể tiếp nhận đơn")
    } finally {
      setLoading(false)
    }
  }

  async function handleCancel() {
    if (!window.confirm("Bạn có chắc chắn muốn hủy nhận đơn này để nhường cho chi nhánh khác?")) {
      return
    }
    setLoading(true)
    setErrorMsg(null)
    try {
      await onCancelClaim()
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : "Lỗi khi hủy đơn")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="w-full max-w-lg mx-auto bg-surface rounded-2xl border border-border shadow-md overflow-hidden flex flex-col">
      {/* Header Bar */}
      <div className="bg-primary/10 border-b border-border p-4 flex items-center justify-between">
        <div>
          <span className="text-caption font-bold uppercase tracking-wider text-primary flex items-center gap-1">
            <Sparkles size={13} /> Thẻ Gia Công Đơn Hàng Chuỗi
          </span>
          <h2 className="text-title font-extrabold text-foreground">
            Đơn hàng #{orderCode}
          </h2>
        </div>
        <div className="text-right">
          <span className="text-caption text-text-muted block">Thù lao gia công</span>
          <span className="text-title font-black text-primary">
            {subcontractPriceVnd.toLocaleString("vi-VN")} đ
          </span>
        </div>
      </div>

      <div className="p-5 flex flex-col gap-4">
        {errorMsg && (
          <div className="p-3 rounded-xl bg-danger-bg border border-danger/30 text-danger text-body-sm flex items-center gap-2">
            <AlertTriangle size={16} />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Trạng thái đơn bị chi nhánh khác nhận */}
        {isClaimedByOther && (
          <div className="p-4 rounded-xl bg-surface-muted border border-border text-center flex flex-col items-center gap-2">
            <CheckCircle2 size={32} className="text-text-muted" />
            <h4 className="text-body font-bold text-foreground">
              Đơn hàng đã được tiếp nhận
            </h4>
            <p className="text-caption text-text-muted max-w-xs">
              Đơn hàng này đã được {claimedBranchName ? `Chi nhánh ${claimedBranchName}` : "chi nhánh khác"} tiếp nhận gia công. Rất cảm ơn bạn đã quan tâm!
            </p>
          </div>
        )}

        {/* Trạng thái chi nhánh hiện tại đang trong Grace Period */}
        {dispatchStatus === "CLAIMED_GRACE" && isMyClaim && (
          <div className="p-4 rounded-xl bg-warning-bg border border-warning/30 flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <span className="text-body-sm font-bold text-warning flex items-center gap-1.5">
                <Clock size={16} /> Thời gian kiểm tra kho hoa & nguyên liệu:
              </span>
              <span className="font-mono text-title font-black text-warning">
                {formatGraceCountdown(graceSeconds)}
              </span>
            </div>
            <p className="text-caption text-text-muted">
              Vui lòng đối chiếu với kho thực tế. Nếu không đủ hoa/phụ liệu, bạn có quyền bấm hủy trong thời gian này để nhường cho chi nhánh khác.
            </p>
            <div className="flex items-center gap-2 pt-2 border-t border-border">
              <Button
                variant="outline"
                disabled={loading || graceSeconds <= 0}
                onClick={handleCancel}
                className="flex-1 text-danger hover:bg-danger-bg text-caption font-bold h-10 border-danger/40"
              >
                <XCircle size={15} className="mr-1" /> Hủy nhận (Kho thiếu hoa)
              </Button>
              {onCommitEarly && (
                <Button
                  variant="secondary"
                  disabled={loading}
                  onClick={onCommitEarly}
                  className="flex-1 text-caption font-bold h-10"
                >
                  <ShieldCheck size={15} className="mr-1" /> Xác nhận đủ & Làm ngay
                </Button>
              )}
            </div>
          </div>
        )}

        {/* Trạng thái ĐÃ CHỐT SẢN XUẤT CHÍNH THỨC (COMMITTED) */}
        {dispatchStatus === "COMMITTED" && isMyClaim && (
          <div className="p-4 rounded-xl bg-success/10 border border-success/30 flex flex-col gap-2 text-center items-center">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-success/20 text-success text-caption font-extrabold uppercase">
              <ShieldCheck size={14} /> Đơn hàng đã chốt vào sản xuất
            </div>
            <h4 className="text-body font-extrabold text-foreground">
              Chi nhánh của bạn đang thực hiện đơn hàng này
            </h4>
            <p className="text-caption text-text-muted max-w-sm">
              Hệ thống đã gửi thông báo bắt đầu chế tác và sẽ tự động gửi tin nhắn Telegram nhắc gửi ảnh QC và bàn giao shipper theo đúng tiến độ.
            </p>
          </div>
        )}

        {/* Khối Tải ảnh thành phẩm kiểm định (QC) khi đã chốt đơn */}
        {dispatchStatus === "COMMITTED" && isMyClaim && (
          <div
            id="qc-upload-section"
            className="p-4 rounded-xl bg-surface border-2 border-primary/40 shadow-sm flex flex-col gap-3"
          >
            <div className="flex items-center justify-between border-b border-border pb-2.5">
              <span className="text-body-sm font-extrabold text-foreground flex items-center gap-1.5">
                <Camera size={18} className="text-primary" /> ẢNH THÀNH PHẨM KIỂM ĐỊNH (QC)
              </span>
              {currentQcPhotos.length > 0 ? (
                <span className="text-caption font-bold px-2 py-0.5 rounded-full bg-success/20 text-success flex items-center gap-1">
                  <CheckCircle2 size={12} /> Đã có {currentQcPhotos.length} ảnh
                </span>
              ) : (
                <span className="text-caption font-bold px-2 py-0.5 rounded-full bg-warning/20 text-warning flex items-center gap-1">
                  <Clock size={12} /> Chưa có ảnh
                </span>
              )}
            </div>

            {qcSuccessMsg && (
              <div className="p-2.5 rounded-lg bg-success/15 border border-success/30 text-success text-body-sm flex items-center gap-2">
                <CheckCircle2 size={16} className="shrink-0" />
                <span>{qcSuccessMsg}</span>
              </div>
            )}

            {/* Input file ẩn bắt sự kiện camera / file picker của máy */}
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
              <div className="flex flex-col gap-3 p-3 rounded-xl bg-surface-muted border border-border">
                <div className="relative w-full h-56 rounded-lg overflow-hidden bg-black/5 flex items-center justify-center">
                  <img
                    src={previewUrl}
                    alt="Xem trước ảnh chụp"
                    className="w-full h-full object-contain"
                  />
                </div>
                <div className="flex items-center justify-between text-caption text-text-muted">
                  <span className="truncate max-w-[200px]">{selectedFile?.name}</span>
                  <span>{selectedFile ? `${(selectedFile.size / (1024 * 1024)).toFixed(2)} MB` : ""}</span>
                </div>
                <div className="flex items-center gap-2 pt-1">
                  <Button
                    variant="outline"
                    disabled={uploadingQc}
                    onClick={handleCancelPreview}
                    className="flex-1 h-11 text-caption font-bold"
                  >
                    <Trash2 size={15} className="mr-1 text-danger" /> Chọn ảnh khác
                  </Button>
                  <Button
                    variant="secondary"
                    disabled={uploadingQc}
                    onClick={handleUploadQcPhoto}
                    className="flex-1 h-11 text-caption font-extrabold shadow-md"
                  >
                    {uploadingQc ? (
                      <>
                        <Loader2 size={16} className="animate-spin mr-1.5" /> Đang tải lên...
                      </>
                    ) : (
                      <>
                        <UploadCloud size={16} className="mr-1.5" /> GỬI DUYỆT ẢNH QC
                      </>
                    )}
                  </Button>
                </div>
              </div>
            ) : (
              /* Nút bấm lớn kích hoạt Camera / Bộ chọn tệp từ máy */
              <div className="flex flex-col gap-2">
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
              </div>
            )}

            {/* Danh sách các ảnh QC đã tải lên trước đó */}
            {currentQcPhotos.length > 0 && !previewUrl && (
              <div className="flex flex-col gap-1.5 pt-2 border-t border-border">
                <span className="text-caption font-bold text-text-muted flex items-center gap-1">
                  <ImageIcon size={13} /> Các ảnh thành phẩm đã tải lên:
                </span>
                <div className="grid grid-cols-3 gap-2">
                  {currentQcPhotos.map((url, idx) => {
                    let imgSrc = url.startsWith("http") || url.startsWith("data:") || url.startsWith("/api/v1/storage/")
                      ? url
                      : (url.startsWith("org/") ? `/api/v1/storage/${url}` : url)

                    // Chuẩn hóa nếu URL trỏ nhầm localhost lúc chạy trên remote
                    if (typeof window !== "undefined" && (imgSrc.includes("localhost:") || imgSrc.includes("127.0.0.1:"))) {
                      try {
                        const parsed = new URL(imgSrc)
                        imgSrc = `${window.location.origin}${parsed.pathname}${parsed.search}`
                      } catch {
                        // ignore
                      }
                    }

                    const isBroken = Boolean(brokenQcPhotos[url])

                    return (
                      <div
                        key={idx}
                        className="relative h-24 rounded-lg overflow-hidden border border-border bg-surface-muted shadow-sm group"
                      >
                        {!isBroken ? (
                          <img
                            src={imgSrc}
                            alt={`Ảnh QC #${idx + 1}`}
                            className="w-full h-full object-cover transition-transform group-hover:scale-105"
                            loading="lazy"
                            onError={() => setBrokenQcPhotos((prev) => ({ ...prev, [url]: true }))}
                          />
                        ) : (
                          <div className="w-full h-full flex flex-col items-center justify-center bg-surface-subtle text-text-muted p-1 text-center">
                            <ImageIcon size={18} className="opacity-40 mb-1" />
                            <span className="text-[10px] leading-tight text-text-muted font-medium">Ảnh QC #{idx + 1}</span>
                            <span className="text-[9px] text-danger/80">Không tải được</span>
                          </div>
                        )}
                        <button
                          type="button"
                          onClick={() => handleDeleteQcPhoto(url)}
                          title="Xóa ảnh này"
                          className="absolute top-1 right-1 p-1 rounded-md bg-black/60 hover:bg-danger text-white transition-colors opacity-80 hover:opacity-100 z-10"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Chi tiết sản phẩm & Định mức nguyên vật liệu */}
        <div className="bg-surface-muted rounded-xl p-3.5 border border-border flex flex-col gap-3">
          <div className="flex items-center gap-3">
            {product.imageUrl && !imageError ? (() => {
              let sampleSrc = product.imageUrl
              if (typeof window !== "undefined" && (sampleSrc.includes("localhost:") || sampleSrc.includes("127.0.0.1:"))) {
                try {
                  const parsed = new URL(sampleSrc)
                  sampleSrc = `${window.location.origin}${parsed.pathname}${parsed.search}`
                } catch {
                  // ignore
                }
              }
              return (
                <img
                  src={sampleSrc}
                  alt={product.name}
                  onError={() => setImageError(true)}
                  className="w-16 h-16 rounded-lg object-cover border border-border shadow-sm shrink-0"
                />
              )
            })() : (
              <div className="w-16 h-16 rounded-lg bg-surface border border-border flex flex-col items-center justify-center text-text-muted shrink-0">
                <ImageIcon size={22} className="opacity-50" />
                <span className="text-[10px] mt-0.5 font-medium">Theo mẫu</span>
              </div>
            )}
            <div className="min-w-0 flex-1">
              <span className="text-caption text-text-muted block">Mẫu sản phẩm</span>
              <h3 className="text-body font-bold text-foreground truncate">
                {product.name}
              </h3>
            </div>
          </div>

          {/* Danh mục nguyên liệu BOM */}
          {product.bomItems && product.bomItems.length > 0 && (
            <div className="pt-2 border-t border-border">
              <span className="text-caption font-bold text-foreground flex items-center gap-1 mb-1.5">
                <Layers size={13} className="text-primary" /> Định lượng nguyên vật liệu cần có:
              </span>
              <div className="grid grid-cols-2 gap-1.5 text-caption">
                {product.bomItems.map((item, idx) => (
                  <div key={idx} className="bg-surface p-1.5 rounded border border-border flex justify-between">
                    <span className="text-foreground truncate">{item.name}</span>
                    <span className="font-bold text-primary whitespace-nowrap ml-1">
                      {item.quantity} {item.unit}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Địa chỉ & Người nhận & Thời gian giao */}
        <div className="flex flex-col gap-2 text-body-sm">
          <div className="flex items-start gap-2">
            <MapPin size={16} className="text-primary mt-0.5 shrink-0" />
            <div>
              <span className="text-caption text-text-muted block">Địa chỉ giao hàng:</span>
              <span className="text-foreground font-semibold">{deliveryAddress}</span>
            </div>
          </div>

          {(recipientName || recipientPhone) && (
            <div className="flex items-start gap-2">
              <Phone size={16} className="text-primary mt-0.5 shrink-0" />
              <div className="flex-1">
                <span className="text-caption text-text-muted block">Người nhận hàng:</span>
                <div className="flex flex-wrap items-center gap-2 mt-0.5">
                  {recipientName && (
                    <span className="text-foreground font-semibold flex items-center gap-1">
                      <User size={13} className="text-text-muted" /> {recipientName}
                    </span>
                  )}
                  {recipientPhone && (
                    <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-surface-muted border border-border">
                      {isPhoneMasked ? (
                        <>
                          <Lock size={12} className="text-warning" />
                          <span className="font-mono text-caption font-bold text-foreground tracking-wider">
                            {recipientPhone}
                          </span>
                          <span className="text-[10px] text-text-muted italic">
                            (Mở khi hoàn thành ảnh QC)
                          </span>
                        </>
                      ) : (
                        <>
                          <a
                            href={`tel:${recipientPhone}`}
                            className="font-mono text-caption font-black text-primary hover:underline flex items-center gap-1"
                          >
                            <Phone size={11} /> {recipientPhone}
                          </a>
                          <span className="text-[10px] font-bold text-success">
                            ✓ Đã mở khóa liên hệ
                          </span>
                        </>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          <div className="flex items-start gap-2">
            <Calendar size={16} className="text-primary mt-0.5 shrink-0" />
            <div>
              <span className="text-caption text-text-muted block">Thời gian cần giao:</span>
              <span className="text-foreground font-semibold">{deliveryTime}</span>
            </div>
          </div>

          {cardMessage && (
            <div className="p-2.5 rounded-lg bg-surface-muted border border-border text-caption">
              <span className="font-bold text-foreground block mb-0.5">Lời chúc thiệp:</span>
              <span className="italic text-text-muted">&ldquo;{cardMessage}&rdquo;</span>
            </div>
          )}

          {specialNotes && (
            <div className="p-2.5 rounded-lg bg-warning-bg/50 border border-warning/20 text-caption">
              <span className="font-bold text-warning block mb-0.5">Ghi chú đặc biệt:</span>
              <span className="text-foreground">{specialNotes}</span>
            </div>
          )}
        </div>

        {/* Tác vụ Tiếp nhận khi đơn OPEN */}
        {dispatchStatus === "OPEN" && (
          <div className="pt-3 border-t border-border flex flex-col gap-2">
            <Button
              variant="primary"
              disabled={loading}
              onClick={handleClaim}
              className="w-full h-12 text-body font-extrabold flex items-center justify-center gap-2 rounded-xl shadow-md cursor-pointer"
            >
              <span>{loading ? "Đang xử lý..." : "TIẾP NHẬN ĐƠN NÀY"}</span>
              <ArrowRight size={18} />
            </Button>
            <p className="text-caption text-text-muted text-center">
              Sau khi bấm nhận, bạn sẽ có thời gian kiểm tra kho hoa trước khi đơn chốt vào sản xuất chính thức.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
