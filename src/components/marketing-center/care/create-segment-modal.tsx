"use client"

import React, { useState } from "react"
import { Users } from "@/components/ui/icon-set/users"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { NativeSelect } from "@/components/ui/select"
import { Dialog } from "@/components/ui/dialog"

/** Nhóm khách như màn Chăm sóc cần để hiển thị và chọn. */
export interface CareSegmentOption {
  id: string
  name: string
  kind: "DYNAMIC" | "STATIC"
}

interface CreateSegmentModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: (segment: CareSegmentOption) => void
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

    const rules: Record<string, unknown> = {}
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
    } catch (err: unknown) {
      setError((err instanceof Error && err.message) || "Đã xảy ra lỗi khi tạo nhóm")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        if (!open) onClose()
      }}
      title={
        <div className="flex items-center gap-2">
          <Users className="w-5 h-5 text-primary" aria-hidden="true" />
          <span>Tạo nhóm khách hàng mới</span>
        </div>
      }
      size="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-caption">
            {error}
          </div>
        )}

        <div>
          <label className="block text-caption font-semibold text-text mb-1">
            Tên nhóm khách hàng *
          </label>
          <Input
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="VD: Khách VIP sinh nhật tháng này, Khách thân thiết..."
          />
        </div>

        <div>
          <label className="block text-caption font-semibold text-text mb-1">Mô tả mục đích</label>
          <Input
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Mô tả ngắn gọn về nhóm này..."
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
                  type="button"
                  key={tier.id}
                  onClick={() => handleToggleTier(tier.id)}
                  className={`px-3 py-1.5 rounded-lg border text-caption font-medium cursor-pointer transition-all ${
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
            <Input
              value={minSpentVnd}
              onChange={(e) => setMinSpentVnd(e.target.value)}
              placeholder="VD: 5000000"
            />
          </div>
          <div>
            <label className="block text-caption font-semibold text-text mb-1">
              Số đơn tối thiểu
            </label>
            <Input
              type="number"
              min="0"
              value={minOrderCount}
              onChange={(e) => setMinOrderCount(e.target.value)}
              placeholder="VD: 3"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-caption font-semibold text-text mb-1">
              Dịp kỷ niệm sắp tới (ngày)
            </label>
            <Input
              type="number"
              min="1"
              max="90"
              value={occasionDays}
              onChange={(e) => setOccasionDays(e.target.value)}
              placeholder="VD: 7 (trong 7 ngày tới)"
            />
          </div>
          <div>
            <label className="block text-caption font-semibold text-text mb-1">
              Kênh tiếp thị đồng ý
            </label>
            <NativeSelect
              value={requiredConsent}
              onChange={(e) => setRequiredConsent(e.target.value)}
              className="w-full"
            >
              <option value="">Không bắt buộc</option>
              <option value="ZALO_ZNS">Đồng ý nhận Zalo</option>
              <option value="SMS">Đồng ý nhận SMS</option>
              <option value="PHONE_CALL">Đồng ý nhận cuộc gọi</option>
            </NativeSelect>
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
    </Dialog>
  )
}
