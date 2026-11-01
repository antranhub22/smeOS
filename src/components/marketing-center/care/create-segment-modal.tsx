"use client"

import React, { useState } from "react"
import { X, Users, Sparkles } from "@/components/ui/icons"
import { Button } from "@/components/ui/button"

interface CreateSegmentModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: (segment: any) => void
}

const TIERS = [
  { id: "VIP", label: "VIP" },
  { id: "GOLD", label: "Vàng (Gold)" },
  { id: "SILVER", label: "Bạc (Silver)" },
  { id: "BRONZE", label: "Đồng (Bronze)" },
  { id: "NEW", label: "Khách mới" },
]

export function CreateSegmentModal({ isOpen, onClose, onSuccess }: CreateSegmentModalProps) {
  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const [selectedTiers, setSelectedTiers] = useState<string[]>([])
  const [minSpentVnd, setMinSpentVnd] = useState<string>("")
  const [minOrderCount, setMinOrderCount] = useState<string>("")
  const [occasionDays, setOccasionDays] = useState<string>("")
  const [requiredConsent, setRequiredConsent] = useState<string>("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  if (!isOpen) return null

  const handleToggleTier = (tier: string) => {
    setSelectedTiers((prev) =>
      prev.includes(tier) ? prev.filter((t) => t !== tier) : [...prev, tier]
    )
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) {
      setError("Vui lòng nhập tên nhóm khách hàng")
      return
    }

    setLoading(true)
    setError(null)

    const rules: Record<string, any> = {}
    if (selectedTiers.length > 0) rules.tiers = selectedTiers
    if (minSpentVnd.trim()) rules.minSpentVnd = Number(minSpentVnd.replace(/\D/g, ""))
    if (minOrderCount.trim()) rules.minOrderCount = Number(minOrderCount)
    if (occasionDays.trim()) rules.occasionUpcomingWithinDays = Number(occasionDays)
    if (requiredConsent) rules.requiredConsentChannel = requiredConsent

    try {
      const res = await fetch("/api/v1/customer-segments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          description: description.trim() || undefined,
          kind: "DYNAMIC",
          rules: Object.keys(rules).length > 0 ? rules : undefined,
        }),
      })

      const data = await res.json()
      if (!res.ok) {
        throw new Error(data.error?.message || "Không thể tạo nhóm khách hàng")
      }

      onSuccess(data.data)
      onClose()
    } catch (err: any) {
      setError(err.message || "Đã xảy ra lỗi khi tạo nhóm")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
      <div className="relative w-full max-w-lg rounded-2xl bg-surface border border-border shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between p-5 border-b border-border">
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-primary" aria-hidden="true" />
            <h3 className="text-title-sm font-bold text-text">Tạo nhóm khách hàng mới</h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Đóng"
            title="Đóng"
            className="p-1 rounded-lg text-text-muted hover:text-text hover:bg-surface-alt transition-colors"
          >
            <X className="w-5 h-5" aria-hidden="true" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4 max-h-[80vh] overflow-y-auto">
          {error && (
            <div className="p-3 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-caption">
              {error}
            </div>
          )}

          <div>
            <label className="block text-caption font-semibold text-text mb-1">
              Tên nhóm khách hàng *
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="VD: Khách VIP sinh nhật tháng này, Khách thân thiết..."
              className="w-full px-3.5 py-2 rounded-xl border border-border bg-surface text-text text-body-sm focus:outline-hidden focus:ring-2 focus:ring-primary/20 focus:border-primary"
            />
          </div>

          <div>
            <label className="block text-caption font-semibold text-text mb-1">Mô tả mục đích</label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Mô tả ngắn gọn về nhóm này..."
              className="w-full px-3.5 py-2 rounded-xl border border-border bg-surface text-text text-body-sm focus:outline-hidden focus:ring-2 focus:ring-primary/20 focus:border-primary"
            />
          </div>

          <div>
            <label className="block text-caption font-semibold text-text mb-1.5">
              Phân hạng khách hàng áp dụng
            </label>
            <div className="flex flex-wrap gap-2">
              {TIERS.map((tier) => {
                const isSelected = selectedTiers.includes(tier.id)
                return (
                  <button
                    key={tier.id}
                    type="button"
                    onClick={() => handleToggleTier(tier.id)}
                    className={`px-3 py-1.5 rounded-lg border text-caption font-medium transition-all ${
                      isSelected
                        ? "bg-primary text-white border-primary"
                        : "bg-surface-alt text-text border-border hover:border-border-hover"
                    }`}
                  >
                    {tier.label}
                  </button>
                )
              })}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-caption font-semibold text-text mb-1">
                Doanh số tối thiểu (đ)
              </label>
              <input
                type="text"
                value={minSpentVnd}
                onChange={(e) => setMinSpentVnd(e.target.value)}
                placeholder="VD: 5000000"
                className="w-full px-3 py-2 rounded-xl border border-border bg-surface text-text text-body-sm"
              />
            </div>
            <div>
              <label className="block text-caption font-semibold text-text mb-1">
                Số đơn tối thiểu
              </label>
              <input
                type="number"
                min="0"
                value={minOrderCount}
                onChange={(e) => setMinOrderCount(e.target.value)}
                placeholder="VD: 3"
                className="w-full px-3 py-2 rounded-xl border border-border bg-surface text-text text-body-sm"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-caption font-semibold text-text mb-1">
                Dịp kỷ niệm sắp tới (ngày)
              </label>
              <input
                type="number"
                min="1"
                max="90"
                value={occasionDays}
                onChange={(e) => setOccasionDays(e.target.value)}
                placeholder="VD: 7 (trong 7 ngày tới)"
                className="w-full px-3 py-2 rounded-xl border border-border bg-surface text-text text-body-sm"
              />
            </div>
            <div>
              <label className="block text-caption font-semibold text-text mb-1">
                Kênh tiếp thị đồng ý
              </label>
              <select
                value={requiredConsent}
                onChange={(e) => setRequiredConsent(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-border bg-surface text-text text-body-sm"
              >
                <option value="">Không bắt buộc</option>
                <option value="ZALO_ZNS">Đồng ý nhận Zalo</option>
                <option value="SMS">Đồng ý nhận SMS</option>
                <option value="PHONE_CALL">Đồng ý nhận cuộc gọi</option>
              </select>
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-border">
            <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
              Huỷ
            </Button>
            <Button type="submit" variant="primary" disabled={loading}>
              {loading ? "Đang lưu..." : "Lưu nhóm khách"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
