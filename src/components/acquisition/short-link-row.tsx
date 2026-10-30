"use client"

import { useState } from "react"
import { BarChart3, Copy, Download, Power } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { triggerDownload } from "@/core/media/qr-engine"
import { publicShortUrl, type ShortLinkItem } from "./acquisition-api"
import { renderBrandedQrPng, renderQrSvgDataUrl } from "./qr-branding"
import { ShortLinkStatsPanel } from "./short-link-stats-panel"

interface Props {
  link: ShortLinkItem
  brand: { color: string; logoUrl: string | null }
  onToggleActive: (link: ShortLinkItem) => void
}

function isExpired(link: ShortLinkItem): boolean {
  return link.expires_at !== null && new Date(link.expires_at).getTime() <= Date.now()
}

export function ShortLinkRow({ link, brand, onToggleActive }: Props) {
  const [showStats, setShowStats] = useState(false)
  const [busy, setBusy] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)
  const url = publicShortUrl(link.code)
  const live = link.is_active && !isExpired(link)
  const fileBase = `QR-${link.placement_label || link.name}`.replace(/[^\p{L}\p{N}-]+/gu, "-").slice(0, 60)

  const download = async (format: "png" | "svg") => {
    setBusy(format)
    try {
      const dataUrl = format === "png"
        ? await renderBrandedQrPng({ url, color: brand.color, logoUrl: brand.logoUrl, caption: "Quét để xem mẫu & nhận tư vấn" })
        : await renderQrSvgDataUrl(url, brand.color)
      triggerDownload(dataUrl, `${fileBase}.${format}`)
    } finally {
      setBusy(null)
    }
  }

  const copy = async () => {
    await navigator.clipboard.writeText(url).catch(() => null)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  return (
    <li className="space-y-3 rounded-2xl border border-border bg-surface p-4">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div className="min-w-0 space-y-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="truncate text-body font-semibold text-text">{link.name}</span>
            <Badge tone="neutral">{link.kind === "QR" ? "Mã QR" : "Link bán hàng"}</Badge>
            {!live && <Badge tone="warning" className="text-warning-text">{link.is_active ? "Đã hết hạn" : "Đang tắt"}</Badge>}
          </div>
          <p className="break-all text-caption text-text-muted">
            {url} → {link.target_path}
            {link.placement_label ? ` · Đặt ở: ${link.placement_label}` : ""}
          </p>
        </div>
        <p className="text-caption text-text">
          <span className="font-semibold tabular-nums">{link.scan_count}</span> lượt quét ·{" "}
          <span className="font-semibold tabular-nums">{link._count.leads}</span> khách để lại thông tin
        </p>
      </div>
      <div className="flex flex-wrap gap-2">
        <Button variant="outline" size="xs" onClick={copy}><Copy size={14} className="mr-1" aria-hidden="true" />{copied ? "Đã chép" : "Chép link"}</Button>
        <Button variant="outline" size="xs" onClick={() => download("png")} disabled={busy !== null}><Download size={14} className="mr-1" aria-hidden="true" />{busy === "png" ? "Đang tạo…" : "Tải QR có logo"}</Button>
        <Button variant="outline" size="xs" onClick={() => download("svg")} disabled={busy !== null}><Download size={14} className="mr-1" aria-hidden="true" />{busy === "svg" ? "Đang tạo…" : "Tải bản in (SVG)"}</Button>
        <Button variant="outline" size="xs" aria-expanded={showStats} onClick={() => setShowStats((v) => !v)}><BarChart3 size={14} className="mr-1" aria-hidden="true" />Thống kê</Button>
        <Button variant="ghost" size="xs" onClick={() => onToggleActive(link)}><Power size={14} className="mr-1" aria-hidden="true" />{link.is_active ? "Tắt" : "Bật lại"}</Button>
      </div>
      {showStats && <ShortLinkStatsPanel linkId={link.id} />}
    </li>
  )
}
