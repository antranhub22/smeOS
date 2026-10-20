"use client"

import React, { useState } from "react"
import { AlertTriangle, ShieldAlert, Loader2, X } from "lucide-react"
import { Button } from "@/components/ui/button"

export interface BypassRequestModalProps {
  isOpen: boolean
  stepTitle: string
  stepKey: "QC" | "SHIPPER" | "POD"
  onClose: () => void
  onSubmit: (reason: string) => Promise<void>
}

export function BypassRequestModal({
  isOpen,
  stepTitle,
  stepKey,
  onClose,
  onSubmit,
}: BypassRequestModalProps) {
  const [reason, setReason] = useState("")
  const [submitting, setSubmitting] = useState(false)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  if (!isOpen) return null

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setErrorMsg(null)

    if (!reason.trim() || reason.trim().length < 5) {
      setErrorMsg("Vui lòng ghi rõ lý do bất khả kháng (tối thiểu 5 ký tự).")
      return
    }

    setSubmitting(true)
    try {
      await onSubmit(reason.trim())
      setReason("")
      onClose()
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : "Lỗi khi gửi yêu cầu")
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="bypass-modal-title"
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in"
    >
      <div className="w-full max-w-md bg-surface rounded-2xl border border-border shadow-xl overflow-hidden flex flex-col animate-in zoom-in-95">
        {/* Header */}
        <div className="p-4 bg-warning/10 border-b border-warning/20 flex items-center justify-between">
          <div className="flex items-center gap-2 text-warning font-extrabold text-body-sm">
            <ShieldAlert size={18} />
            <span id="bypass-modal-title">Xin Bỏ Qua: {stepTitle}</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={submitting}
            className="p-1 rounded-lg hover:bg-black/5 text-text-muted hover:text-foreground cursor-pointer"
          >
            <X size={16} />
          </button>
        </div>

        {/* Warning Content */}
        <form onSubmit={handleSubmit} className="p-4 sm:p-5 flex flex-col gap-4">
          <div className="p-3.5 rounded-xl bg-danger-bg border border-danger/30 flex flex-col gap-2 text-caption">
            <div className="flex items-center gap-2 text-danger font-extrabold">
              <AlertTriangle size={16} className="shrink-0" />
              <span>CẢNH BÁO TRỪ ĐIỂM HỢP TÁC & PHÂN BỔ ĐƠN</span>
            </div>
            <p className="text-foreground leading-relaxed">
              Việc không cung cấp đầy đủ bằng chứng ({stepKey}) ảnh hưởng đến độ tin cậy dịch vụ của toàn chuỗi:
            </p>
            <ul className="list-disc pl-4 text-danger font-semibold space-y-1">
              <li>Chi nhánh sẽ <strong>bị trừ 2 điểm chất lượng KPI</strong> nếu được duyệt bỏ qua.</li>
              <li>Điểm KPI giảm sẽ <strong>hạ thứ tự ưu tiên nhận đơn gia công</strong> trong các đợt phân bổ tự động tiếp theo.</li>
            </ul>
          </div>

          <div>
            <label htmlFor="bypass-reason" className="block text-caption font-bold text-foreground mb-1.5">
              Lý do bất khả kháng (Bắt buộc) <span className="text-danger">*</span>
            </label>
            <textarea
              id="bypass-reason"
              required
              rows={3}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Ví dụ: Khách nhận gấp tại quầy / Thiết bị camera bị hỏng đột xuất..."
              className="w-full p-3 rounded-xl border border-border bg-surface text-body-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
            />
          </div>

          {errorMsg && (
            <p className="text-caption font-bold text-danger bg-danger-bg p-2.5 rounded-lg border border-danger/20">
              {errorMsg}
            </p>
          )}

          <div className="flex items-center gap-2 pt-1">
            <Button
              type="button"
              variant="outline"
              disabled={submitting}
              onClick={onClose}
              className="flex-1 h-10 text-caption font-bold"
            >
              Hủy bỏ
            </Button>
            <Button
              type="submit"
              variant="secondary"
              disabled={submitting}
              className="flex-1 h-10 text-caption font-extrabold bg-warning hover:bg-warning/90 text-white"
            >
              {submitting ? (
                <>
                  <Loader2 size={14} className="animate-spin mr-1.5" /> Đang gửi...
                </>
              ) : (
                "Xác nhận gửi Điều phối"
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
