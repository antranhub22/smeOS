"use client"

import React, { useState } from "react"
import { Truck, CheckCircle2, AlertTriangle, Loader2, Phone, User } from "lucide-react"
import { Button } from "@/components/ui/button"

interface ShipperSubmitCardProps {
  orderCode: string
  branchId: string
  productionStatus: string
  deliveryStatus?: string | null | undefined
  /** Thông tin shipper đã được cung cấp trước đó (nếu có) */
  existingShipperInfo?: {
    shipperName: string
    shipperPhone: string
    submittedAt: string
  } | null | undefined
  onSubmitted?: (() => void) | undefined
}

const VIETNAM_PHONE_RE = /^(0|\+84)(3[2-9]|5[6-9]|7[0689]|8[1-9]|9[0-9])\d{7}$/

export function ShipperSubmitCard({
  orderCode,
  branchId,
  productionStatus,
  deliveryStatus,
  existingShipperInfo,
  onSubmitted,
}: ShipperSubmitCardProps) {
  const [shipperName, setShipperName] = useState("")
  const [shipperPhone, setShipperPhone] = useState("")
  const [shipperNote, setShipperNote] = useState("")
  const [submitting, setSubmitting] = useState(false)
  const [successMsg, setSuccessMsg] = useState<string | null>(null)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  // Chỉ hiển thị khi đơn đã READY (ảnh TP pass AI)
  if (productionStatus !== "READY") return null

  // Đã có thông tin shipper → hiển thị thông tin xác nhận
  if (existingShipperInfo || deliveryStatus === "DELIVERING" || deliveryStatus === "DELIVERED") {
    return (
      <div className="p-4 rounded-xl bg-success/10 border border-success/30 flex flex-col gap-2">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-full bg-success/20">
            <CheckCircle2 size={18} className="text-success" />
          </div>
          <span className="text-body-sm font-extrabold text-success">Đã xác nhận thông tin giao hàng</span>
        </div>
        {existingShipperInfo && (
          <div className="text-caption text-text-muted flex flex-col gap-0.5 pl-9">
            <span className="flex items-center gap-1.5">
              <User size={12} />
              <strong className="text-foreground">{existingShipperInfo.shipperName}</strong>
            </span>
            <span className="flex items-center gap-1.5">
              <Phone size={12} />
              <a
                href={`tel:${existingShipperInfo.shipperPhone}`}
                className="text-primary underline"
              >
                {existingShipperInfo.shipperPhone}
              </a>
            </span>
          </div>
        )}
        <p className="text-caption text-text-muted pl-9">
          Điều phối viên đã được thông báo. Vui lòng chuẩn bị hàng để bàn giao cho shipper.
        </p>
      </div>
    )
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setErrorMsg(null)

    if (!shipperName.trim() || shipperName.trim().length < 2) {
      setErrorMsg("Vui lòng nhập tên shipper (tối thiểu 2 ký tự)")
      return
    }
    if (!VIETNAM_PHONE_RE.test(shipperPhone.trim())) {
      setErrorMsg("Số điện thoại không hợp lệ (ví dụ: 0912345678)")
      return
    }

    setSubmitting(true)
    try {
      const res = await fetch(
        `/api/v1/public/subcontract/${encodeURIComponent(orderCode)}/submit-shipper`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            branchId,
            shipperName: shipperName.trim(),
            shipperPhone: shipperPhone.trim(),
            shipperNote: shipperNote.trim() || undefined,
          }),
        }
      )
      const json = await res.json().catch(() => ({}))
      if (!res.ok) {
        const msg =
          json?.error?.details?.shipperPhone ||
          json?.error?.details?.shipperName ||
          json?.error?.message ||
          "Không thể gửi thông tin shipper"
        throw new Error(msg)
      }
      setSuccessMsg(json?.data?.message || "✅ Đã ghi nhận thông tin shipper thành công!")
      onSubmitted?.()
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : "Lỗi kết nối, vui lòng thử lại")
    } finally {
      setSubmitting(false)
    }
  }

  if (successMsg) {
    return (
      <div className="p-4 rounded-xl bg-success/10 border border-success/30 flex flex-col gap-2">
        <div className="flex items-center gap-2">
          <CheckCircle2 size={20} className="text-success shrink-0" />
          <p className="text-body-sm font-bold text-success">{successMsg}</p>
        </div>
      </div>
    )
  }

  return (
    <div
      id="shipper-submit-section"
      className="p-4 rounded-xl bg-surface border-2 border-primary/40 shadow-sm flex flex-col gap-3"
    >
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border pb-2.5">
        <span className="text-body-sm font-extrabold text-foreground flex items-center gap-1.5">
          <Truck size={18} className="text-primary" /> THÔNG TIN SHIPPER GIAO HÀNG
        </span>
        <span className="text-caption font-bold px-2 py-0.5 rounded-full bg-warning/20 text-warning flex items-center gap-1">
          Cần cung cấp
        </span>
      </div>

      {/* Hướng dẫn */}
      <p className="text-caption text-text-muted leading-relaxed">
        Ảnh thành phẩm đã được xác nhận ✅. Vui lòng nhập thông tin shipper/tài xế sẽ đến nhận hàng để điều phối viên chuẩn bị bàn giao.
      </p>

      {errorMsg && (
        <div className="p-2.5 rounded-lg bg-danger-bg border border-danger/30 text-danger text-caption flex items-center gap-2">
          <AlertTriangle size={14} className="shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      <form onSubmit={(e) => void handleSubmit(e)} className="flex flex-col gap-3">
        {/* Tên shipper */}
        <div className="flex flex-col gap-1">
          <label
            htmlFor="shipper-name"
            className="text-caption font-bold text-foreground flex items-center gap-1"
          >
            <User size={13} className="text-primary" /> Tên shipper / tài xế{" "}
            <span className="text-danger">*</span>
          </label>
          <input
            id="shipper-name"
            type="text"
            autoComplete="name"
            placeholder="Ví dụ: Nguyễn Văn A"
            value={shipperName}
            onChange={(e) => setShipperName(e.target.value)}
            disabled={submitting}
            className="h-10 px-3 rounded-lg border border-border bg-surface text-body-sm text-foreground placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-colors"
          />
        </div>

        {/* SĐT shipper */}
        <div className="flex flex-col gap-1">
          <label
            htmlFor="shipper-phone"
            className="text-caption font-bold text-foreground flex items-center gap-1"
          >
            <Phone size={13} className="text-primary" /> Số điện thoại shipper{" "}
            <span className="text-danger">*</span>
          </label>
          <input
            id="shipper-phone"
            type="tel"
            autoComplete="tel"
            inputMode="numeric"
            placeholder="Ví dụ: 0912345678"
            value={shipperPhone}
            onChange={(e) => setShipperPhone(e.target.value)}
            disabled={submitting}
            className="h-10 px-3 rounded-lg border border-border bg-surface text-body-sm text-foreground placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-colors"
          />
        </div>

        {/* Ghi chú (tuỳ chọn) */}
        <div className="flex flex-col gap-1">
          <label htmlFor="shipper-note" className="text-caption font-semibold text-text-muted">
            Ghi chú thêm (tuỳ chọn)
          </label>
          <input
            id="shipper-note"
            type="text"
            placeholder="Ví dụ: Shipper đến lúc 14:00, xe máy biển 51..."
            value={shipperNote}
            onChange={(e) => setShipperNote(e.target.value)}
            disabled={submitting}
            maxLength={200}
            className="h-10 px-3 rounded-lg border border-border bg-surface text-body-sm text-foreground placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-colors"
          />
        </div>

        <Button
          type="submit"
          variant="primary"
          disabled={submitting}
          className="w-full h-11 font-extrabold text-caption rounded-xl shadow-md"
        >
          {submitting ? (
            <>
              <Loader2 size={16} className="animate-spin mr-1.5" />
              Đang gửi...
            </>
          ) : (
            <>
              <Truck size={16} className="mr-1.5" />
              XÁC NHẬN THÔNG TIN SHIPPER
            </>
          )}
        </Button>
      </form>
    </div>
  )
}
