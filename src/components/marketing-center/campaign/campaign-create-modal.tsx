"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { InlineError } from "@/components/ui/inline-error"
import { Input } from "@/components/ui/input"
import { X } from "@/components/ui/icons"
import {
  CAMPAIGN_OBJECTIVE_LABELS,
  CAMPAIGN_OBJECTIVES,
  type Campaign,
  type CampaignObjective,
  type CampaignStatus,
} from "@/modules/marketing-center/domain/campaign"
import { campaignApi } from "./campaign-api"

interface CampaignCreateModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: (campaign: Campaign) => void
}

const COMMON_OCCASIONS = [
  { code: "TET", label: "Tết Nguyên Đán" },
  { code: "VALENTINE", label: "Lễ tình nhân (14/2)" },
  { code: "WOMEN_DAY", label: "Quốc tế Phụ nữ (8/3)" },
  { code: "VIETNAM_WOMEN", label: "Phụ nữ Việt Nam (20/10)" },
  { code: "MID_AUTUMN", label: "Tết Trung Thu" },
  { code: "CHRISTMAS", label: "Giáng sinh & Năm mới" },
  { code: "BLACK_FRIDAY", label: "Ưu đãi lớn / Flash Sale" },
  { code: "BIRTHDAY", label: "Sinh nhật & Kỷ niệm" },
  { code: "OTHER", label: "Dịp khác / Thường ngày" },
]

export function CampaignCreateModal({ isOpen, onClose, onSuccess }: CampaignCreateModalProps) {
  const [name, setName] = useState("")
  const [objective, setObjective] = useState<CampaignObjective>("LEAD")
  const [occasionCode, setOccasionCode] = useState("TET")
  const [startsAt, setStartsAt] = useState("")
  const [endsAt, setEndsAt] = useState("")
  const [status, setStatus] = useState<CampaignStatus>("DRAFT")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  if (!isOpen) return null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    if (!name.trim()) {
      setError("Vui lòng nhập tên chiến dịch")
      return
    }

    setLoading(true)
    try {
      const created = await campaignApi.create({
        name: name.trim(),
        objective,
        occasion_code: occasionCode || null,
        starts_at: startsAt ? new Date(startsAt).toISOString() : null,
        ends_at: endsAt ? new Date(endsAt).toISOString() : null,
        status,
      })
      onSuccess(created)
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Không thể tạo chiến dịch")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="campaign-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm"
    >
      <div className="relative w-full max-w-lg rounded-2xl border border-border bg-surface p-6 shadow-xl">
        <div className="flex items-center justify-between border-b border-border pb-4">
          <h2 id="campaign-modal-title" className="text-h3 font-semibold text-text">
            Tạo chiến dịch mới
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1 text-text-muted hover:bg-surface-elevated hover:text-text"
            aria-label="Đóng"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {error && (
          <div className="mt-4">
            <InlineError message={error} />
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <div>
            <label htmlFor="camp-name" className="block text-caption font-medium text-text mb-1">
              Tên chiến dịch *
            </label>
            <Input
              id="camp-name"
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="VD: Chiến dịch Hoa Tết 2026, Quà tặng 20/10..."
              className="w-full"
            />
          </div>

          <div>
            <label className="block text-caption font-medium text-text mb-1">Mục tiêu chiến dịch *</label>
            <div className="grid grid-cols-2 gap-2">
              {CAMPAIGN_OBJECTIVES.map((obj) => (
                <button
                  key={obj}
                  type="button"
                  aria-pressed={objective === obj}
                  onClick={() => setObjective(obj)}
                  className={`rounded-xl border p-3 text-left transition-colors ${
                    objective === obj
                      ? "border-primary bg-primary/10 text-primary font-medium"
                      : "border-border bg-surface text-text hover:bg-surface-elevated"
                  }`}
                >
                  <div className="text-body-sm font-semibold">{CAMPAIGN_OBJECTIVE_LABELS[obj]}</div>
                </button>
              ))}
            </div>
          </div>

          <div>
            <label htmlFor="camp-occasion" className="block text-caption font-medium text-text mb-1">
              Dịp / Sự kiện kích cầu
            </label>
            <select
              id="camp-occasion"
              value={occasionCode}
              onChange={(e) => setOccasionCode(e.target.value)}
              className="w-full h-10 rounded-xl border border-border bg-surface px-3 text-body-sm text-text focus:outline-none focus:ring-1 focus:ring-primary"
            >
              {COMMON_OCCASIONS.map((occ) => (
                <option key={occ.code} value={occ.code}>
                  {occ.label}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label htmlFor="camp-start" className="block text-caption font-medium text-text mb-1">
                Bắt đầu từ
              </label>
              <Input
                id="camp-start"
                type="date"
                value={startsAt}
                onChange={(e) => setStartsAt(e.target.value)}
              />
            </div>
            <div>
              <label htmlFor="camp-end" className="block text-caption font-medium text-text mb-1">
                Kết thúc vào
              </label>
              <Input
                id="camp-end"
                type="date"
                value={endsAt}
                onChange={(e) => setEndsAt(e.target.value)}
              />
            </div>
          </div>

          <div>
            <label className="block text-caption font-medium text-text mb-1">Trạng thái ban đầu</label>
            <div className="flex gap-4">
              <label className="flex items-center gap-2 text-body-sm text-text cursor-pointer">
                <input
                  type="radio"
                  name="status"
                  checked={status === "DRAFT"}
                  onChange={() => setStatus("DRAFT")}
                  className="text-primary focus:ring-primary"
                />
                <span>Lưu bản nháp</span>
              </label>
              <label className="flex items-center gap-2 text-body-sm text-text cursor-pointer">
                <input
                  type="radio"
                  name="status"
                  checked={status === "ACTIVE"}
                  onChange={() => setStatus("ACTIVE")}
                  className="text-primary focus:ring-primary"
                />
                <span>Kích hoạt ngay</span>
              </label>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t border-border">
            <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
              Huỷ
            </Button>
            <Button type="submit" variant="primary" disabled={loading}>
              {loading ? "Đang tạo..." : "Tạo chiến dịch"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
