"use client"

// Link chia sẻ chợ đối tác (N17): tạo link xem không cần đăng nhập, chọn thời hạn, huỷ bất kỳ lúc nào.
import React, { useCallback, useState } from "react"
import { CheckCircle, Copy, Share2 } from "@/components/ui/icons"
import { Button } from "@/components/ui/button"
import { Dialog } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { InlineError } from "@/components/ui/inline-error"
import { useConfirmDialog } from "@/components/ui/confirm-dialog"
import { formatDateTime } from "@/lib/i18n/formatters"

type LinkStatus = "ACTIVE" | "EXPIRED" | "REVOKED"
type ShareLink = { id: string; label: string; expiresAt: string; status: LinkStatus; viewCount: number; lastViewedAt: string | null }

const DAY_OPTIONS = [1, 7, 30, 90]
const STATUS_LABEL: Record<LinkStatus, string> = { ACTIVE: "Đang mở", EXPIRED: "Đã hết hạn", REVOKED: "Đã huỷ" }
const STATUS_TONE: Record<LinkStatus, string> = {
  ACTIVE: "bg-success-bg text-success-text",
  EXPIRED: "bg-surface-alt text-text-muted",
  REVOKED: "bg-danger-bg text-danger-text",
}
const fmt = (iso: string) => formatDateTime(iso)

async function call<T>(url: string, init?: RequestInit): Promise<{ data: T } | { error: string }> {
  try {
    const res = await fetch(url, { cache: "no-store", ...init })
    const json = (await res.json().catch(() => null)) as { data?: T; error?: { message?: string } } | null
    if (res.ok && json?.data) return { data: json.data }
    if (res.status === 403) return { error: "Tài khoản chưa có quyền chia sẻ chợ đối tác." }
    return { error: json?.error?.message ?? "Không thực hiện được. Vui lòng thử lại." }
  } catch {
    return { error: "Không kết nối được máy chủ." }
  }
}

export function MarketplaceShareDialog() {
  const [open, setOpen] = useState(false)
  const [links, setLinks] = useState<ShareLink[]>([])
  const [label, setLabel] = useState("")
  const [days, setDays] = useState(7)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [created, setCreated] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)
  const [confirm, confirmDialog] = useConfirmDialog()

  const load = useCallback(async () => {
    const r = await call<{ links: ShareLink[] }>("/api/v1/platform/marketplace/share-links")
    if ("error" in r) setError(r.error)
    else setLinks(r.data.links)
  }, [])

  function openDialog() {
    setOpen(true)
    setCreated(null)
    setError(null)
    void load()
  }

  async function create() {
    setBusy(true)
    setError(null)
    const r = await call<{ token: string }>("/api/v1/platform/marketplace/share-links", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ label, days }),
    })
    setBusy(false)
    if ("error" in r) return setError(r.error)
    setCreated(`${window.location.origin}/chia-se/cho-doi-tac/${r.data.token}`)
    setCopied(false)
    setLabel("")
    await load()
  }

  async function revoke(link: ShareLink) {
    const yes = await confirm({
      title: `Huỷ link "${link.label}"?`,
      consequence: "Người đang giữ link sẽ không xem được nữa. Không thể mở lại link này.",
      confirmLabel: "Huỷ link",
    })
    if (!yes) return
    const r = await call(`/api/v1/platform/marketplace/share-links/${link.id}`, { method: "DELETE" })
    if ("error" in r) setError(r.error)
    await load()
  }

  async function copy() {
    if (!created) return
    await navigator.clipboard.writeText(created).catch(() => undefined)
    setCopied(true)
  }

  return (
    <>
      {confirmDialog}
      <Button type="button" variant="outline" size="sm" onClick={openDialog}>
        <Share2 className="mr-1.5 h-4 w-4" />
        Chia sẻ
      </Button>
      <Dialog
        open={open}
        onOpenChange={setOpen}
        size="lg"
        title="Chia sẻ chợ đối tác"
        description="Người nhận xem được danh sách và bộ lọc mà không cần đăng nhập. Thông tin liên hệ luôn được che một phần."
      >
        <div className="space-y-5">
          <div className="space-y-3 rounded-xl border border-border p-4">
            <label className="block space-y-1 text-xs">
              <span className="font-medium text-text">Gửi cho ai?</span>
              <Input value={label} onChange={(e) => setLabel(e.target.value)} placeholder="Vd. BOD quý 4, nhóm kinh doanh" inputSize="sm" maxLength={120} />
            </label>
            <div className="space-y-1 text-xs">
              <span className="font-medium text-text">Link dùng được trong</span>
              <div className="flex flex-wrap items-center gap-2">
                {DAY_OPTIONS.map((d) => (
                  <Button key={d} type="button" size="sm" variant={days === d ? "primary" : "outline"} onClick={() => setDays(d)}>
                    {d} ngày
                  </Button>
                ))}
                <Input
                  type="number"
                  min={1}
                  max={365}
                  value={days}
                  onChange={(e) => setDays(Number(e.target.value))}
                  className="w-24"
                  inputSize="sm"
                  aria-label="Số ngày tuỳ chọn"
                />
              </div>
            </div>
            <Button type="button" size="sm" onClick={() => void create()} disabled={busy || !label.trim()}>
              {busy ? "Đang tạo..." : "Tạo link"}
            </Button>
            {created && (
              <div className="space-y-2 rounded-lg border border-success-border bg-success-bg p-3 text-xs">
                <p className="font-medium text-success-text">Đã tạo link. Sao chép ngay — vì lý do bảo mật, link chỉ hiện một lần.</p>
                <div className="flex gap-2">
                  <Input readOnly value={created} inputSize="sm" onFocus={(e) => e.currentTarget.select()} />
                  <Button type="button" size="sm" variant="outline" onClick={() => void copy()}>
                    {copied ? <CheckCircle className="mr-1 h-4 w-4" /> : <Copy className="mr-1 h-4 w-4" />}
                    {copied ? "Đã chép" : "Sao chép"}
                  </Button>
                </div>
              </div>
            )}
          </div>

          {error && <InlineError message={error} />}

          <div className="space-y-2">
            <h4 className="text-xs font-semibold text-text">Link đã tạo</h4>
            {links.length === 0 ? (
              <p className="text-xs text-text-muted">Chưa có link nào.</p>
            ) : (
              <ul className="divide-y divide-border rounded-xl border border-border">
                {links.map((l) => (
                  <li key={l.id} className="flex flex-wrap items-center justify-between gap-2 px-3 py-2 text-xs">
                    <div className="min-w-0 space-y-0.5">
                      <p className="truncate font-medium text-text">{l.label}</p>
                      <p className="text-text-muted">
                        Hết hạn {fmt(l.expiresAt)} · {l.viewCount} lượt xem
                        {l.lastViewedAt ? ` · xem gần nhất ${fmt(l.lastViewedAt)}` : ""}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`rounded-full px-2 py-0.5 font-medium ${STATUS_TONE[l.status]}`}>{STATUS_LABEL[l.status]}</span>
                      {l.status === "ACTIVE" && (
                        <Button type="button" size="sm" variant="ghost" onClick={() => void revoke(l)}>
                          Huỷ
                        </Button>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </Dialog>
    </>
  )
}
