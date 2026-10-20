"use client"

import { useState } from "react"
import { X, Calendar, AlertCircle, Loader2 } from "lucide-react"

export interface ManualBlockModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
  products: Array<{ id: string; name: string; code: string }>
  preselectedProductId?: string | undefined
  preselectedDate?: string | undefined
}

export function ManualBlockModal({
  isOpen,
  onClose,
  onSuccess,
  products,
  preselectedProductId,
  preselectedDate,
}: ManualBlockModalProps) {
  const [productId, setProductId] = useState(preselectedProductId ?? products[0]?.id ?? "")
  const [checkInDate, setCheckInDate] = useState(preselectedDate ?? new Date().toISOString().slice(0, 10))
  const [checkOutDate, setCheckOutDate] = useState(
    preselectedDate
      ? new Date(new Date(preselectedDate).getTime() + 86400000).toISOString().slice(0, 10)
      : new Date(Date.now() + 86400000).toISOString().slice(0, 10)
  )
  const [note, setNote] = useState("Bảo trì / Sửa chữa")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  if (!isOpen) return null

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)

    if (!productId) {
      setError("Vui lòng chọn phòng / sản phẩm")
      return
    }
    if (!checkInDate || !checkOutDate) {
      setError("Vui lòng nhập ngày bắt đầu và kết thúc")
      return
    }
    if (checkOutDate <= checkInDate) {
      setError("Ngày kết thúc phải sau ngày bắt đầu")
      return
    }

    try {
      setLoading(true)
      const res = await fetch("/api/v1/availability/blocks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId,
          checkInDate,
          checkOutDate,
          note: note.trim() || undefined,
        }),
      })

      const data = await res.json()
      if (!res.ok) {
        throw new Error(data.error?.message || "Không thể tạo khối chặn")
      }

      onSuccess()
      onClose()
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Đã có lỗi xảy ra")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="manual-block-title"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs"
    >
      <div className="w-full max-w-md rounded-2xl border border-border bg-surface p-6 shadow-xl">
        <div className="flex items-center justify-between border-b border-border pb-4">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <Calendar size={18} />
            </div>
            <h2 id="manual-block-title" className="text-base font-bold text-text">
              Khóa ngày / Chặn bảo trì
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Đóng"
            className="rounded-lg p-1 text-text-muted hover:bg-surface-alt hover:text-text transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {error && (
          <div className="mt-4 flex items-center gap-2 rounded-xl border border-danger/20 bg-danger/10 px-3 py-2 text-xs font-medium text-danger">
            <AlertCircle size={14} className="shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <div>
            <label htmlFor="block-product" className="block text-xs font-semibold text-text mb-1">
              Phòng / Sản phẩm
            </label>
            <select
              id="block-product"
              value={productId}
              onChange={(e) => setProductId(e.target.value)}
              className="w-full rounded-xl border border-border bg-surface px-3 py-2 text-sm text-text focus:border-primary focus:outline-none"
            >
              {products.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} ({p.code})
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label htmlFor="block-checkin" className="block text-xs font-semibold text-text mb-1">
                Từ ngày (Check-in)
              </label>
              <input
                id="block-checkin"
                type="date"
                value={checkInDate}
                onChange={(e) => setCheckInDate(e.target.value)}
                className="w-full rounded-xl border border-border bg-surface px-3 py-2 text-sm text-text focus:border-primary focus:outline-none"
              />
            </div>
            <div>
              <label htmlFor="block-checkout" className="block text-xs font-semibold text-text mb-1">
                Đến ngày (Check-out)
              </label>
              <input
                id="block-checkout"
                type="date"
                value={checkOutDate}
                onChange={(e) => setCheckOutDate(e.target.value)}
                className="w-full rounded-xl border border-border bg-surface px-3 py-2 text-sm text-text focus:border-primary focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label htmlFor="block-note" className="block text-xs font-semibold text-text mb-1">
              Lý do / Ghi chú
            </label>
            <input
              id="block-note"
              type="text"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="VD: Khách quen đặt trực tiếp, Sơn sửa, Bảo dưỡng..."
              className="w-full rounded-xl border border-border bg-surface px-3 py-2 text-sm text-text focus:border-primary focus:outline-none"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="rounded-xl border border-border px-4 py-2 text-sm font-medium text-text hover:bg-surface-alt transition-colors"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center gap-1.5 rounded-xl bg-primary px-4 py-2 text-sm font-bold text-white shadow-xs hover:opacity-95 disabled:opacity-50 transition-all"
            >
              {loading && <Loader2 size={15} className="animate-spin" />}
              <span>Xác nhận khóa</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
