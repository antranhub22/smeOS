"use client"

import { useState } from "react"
import { Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Disclosure } from "@/components/ui/disclosure"
import { InlineError } from "@/components/ui/inline-error"
import { acquisitionApi, type ShortLinkItem } from "./acquisition-api"

const KIND_OPTIONS = [
  { id: "QR", label: "Mã QR để in", hint: "Đặt ở quầy, tờ rơi, xe giao, hộp quà…" },
  { id: "SALES_LINK", label: "Link bán hàng", hint: "Gửi qua Zalo, Facebook, tin nhắn" },
] as const

/** Tạo QR/link động. Việc chính: tên + trang đích; vị trí đặt, UTM, hạn dùng nằm trong phần mở thêm. */
export function ShortLinkCreateForm({ onCreated, onCancel }: { onCreated: (link: ShortLinkItem) => void; onCancel: () => void }) {
  const [kind, setKind] = useState<"QR" | "SALES_LINK">("QR")
  const [name, setName] = useState("")
  const [targetPath, setTargetPath] = useState("/c/")
  const [placement, setPlacement] = useState("")
  const [campaign, setCampaign] = useState("")
  const [expiresAt, setExpiresAt] = useState("")
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setError(null)
    try {
      const link = await acquisitionApi.createLink({
        kind,
        name,
        targetPath: targetPath.trim(),
        placementLabel: placement || null,
        utmCampaign: campaign || null,
        expiresAt: expiresAt ? new Date(`${expiresAt}T23:59:59+07:00`).toISOString() : null,
      })
      onCreated(link)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Không tạo được, vui lòng thử lại")
    } finally {
      setSaving(false)
    }
  }

  const customized = [placement, campaign, expiresAt].filter(Boolean).length

  return (
    <form onSubmit={submit} className="space-y-4 rounded-2xl border border-border bg-surface p-4 sm:p-5">
      <div role="group" aria-label="Loại" className="grid grid-cols-1 gap-2 sm:grid-cols-2">
        {KIND_OPTIONS.map((opt) => (
          <button
            key={opt.id}
            type="button"
            aria-pressed={kind === opt.id}
            onClick={() => setKind(opt.id)}
            className={`rounded-xl border p-3 text-left transition-colors ${kind === opt.id ? "border-primary bg-primary/5" : "border-border hover:bg-surface-alt"}`}
          >
            <div className="text-body-sm font-semibold text-text">{opt.label}</div>
            <div className="text-caption text-text-muted">{opt.hint}</div>
          </button>
        ))}
      </div>

      <label className="block space-y-1">
        <span className="text-body-sm font-medium text-text">Tên để bạn nhận ra</span>
        <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Ví dụ: QR quầy thu ngân" maxLength={100} required />
      </label>
      <label className="block space-y-1">
        <span className="text-body-sm font-medium text-text">Trang khách sẽ mở</span>
        <Input value={targetPath} onChange={(e) => setTargetPath(e.target.value)} placeholder="/c/ma-catalog" required />
        <span className="block text-caption text-text-muted">Dán đường dẫn trang catalog, trang cửa hàng hoặc trang sản phẩm (phần sau tên miền, bắt đầu bằng /). Đổi được về sau mà không cần in lại.</span>
      </label>

      <Disclosure label="Vị trí đặt, chiến dịch và hạn dùng" {...(customized ? { appliedSummary: `Đã điền ${customized} mục` } : {})}>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <label className="block space-y-1">
            <span className="text-caption font-medium text-text">Vị trí đặt</span>
            <Input value={placement} onChange={(e) => setPlacement(e.target.value)} placeholder="Quầy thu ngân" maxLength={60} />
          </label>
          <label className="block space-y-1">
            <span className="text-caption font-medium text-text">Tên chiến dịch</span>
            <Input value={campaign} onChange={(e) => setCampaign(e.target.value)} placeholder="20-10" maxLength={60} />
          </label>
          <label className="block space-y-1">
            <span className="text-caption font-medium text-text">Hết hạn sau ngày</span>
            <Input type="date" value={expiresAt} onChange={(e) => setExpiresAt(e.target.value)} />
          </label>
        </div>
      </Disclosure>

      {error && <InlineError message={error} />}
      <div className="flex flex-wrap justify-end gap-2">
        <Button type="button" variant="ghost" size="sm" onClick={onCancel} disabled={saving}>Huỷ</Button>
        <Button type="submit" size="sm" disabled={saving}>
          {saving && <Loader2 size={14} className="mr-1 animate-spin" aria-hidden="true" />}
          {kind === "QR" ? "Tạo mã QR" : "Tạo link"}
        </Button>
      </div>
    </form>
  )
}
