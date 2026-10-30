"use client"

import { useCallback, useEffect, useState } from "react"
import { QrCode } from "@/components/ui/icons"
import { EmptyState } from "@/components/ui/empty-state"
import { InlineError } from "@/components/ui/inline-error"
import { SkeletonBlock } from "@/components/ui/skeleton"
import { useConfirmDialog } from "@/components/ui/confirm-dialog"
import { acquisitionApi, type ShortLinkItem } from "./acquisition-api"
import { ShortLinkCreateForm } from "./short-link-create-form"
import { ShortLinkRow } from "./short-link-row"

const FALLBACK_COLOR = "#1f2937"
const HEX = /^#[0-9a-f]{6}$/i

/** Danh sách QR/link động + tạo mới. `creating` do thanh tab điều khiển (nút chính). */
export function ShortLinksTab({ creating, onCreatingChange }: { creating: boolean; onCreatingChange: (v: boolean) => void }) {
  const [links, setLinks] = useState<ShortLinkItem[] | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [brand, setBrand] = useState<{ color: string; logoUrl: string | null }>({ color: FALLBACK_COLOR, logoUrl: null })
  const [confirm, confirmDialog] = useConfirmDialog()

  const fetchLinks = useCallback(
    () =>
      acquisitionApi
        .listLinks()
        .then((p) => {
          setLinks(p.items)
          setError(null)
        })
        .catch((e: Error) => setError(e.message)),
    [],
  )

  const load = () => {
    setError(null)
    void fetchLinks()
  }

  useEffect(() => {
    void fetchLinks()
    // Màu + logo thương hiệu cho QR; thiếu quyền xem hồ sơ thương hiệu → dùng màu trung tính.
    acquisitionApi.brandProfile()
      .then((b) => setBrand({ color: b.primary_color && HEX.test(b.primary_color) ? b.primary_color : FALLBACK_COLOR, logoUrl: b.logo_url }))
      .catch(() => null)
  }, [fetchLinks])

  const toggleActive = async (link: ShortLinkItem) => {
    if (link.is_active) {
      const ok = await confirm({
        title: `Tắt "${link.name}"?`,
        consequence: "Khách quét mã hoặc bấm link sẽ thấy thông báo link không còn dùng. Bạn bật lại được bất cứ lúc nào, mã đã in vẫn giữ nguyên.",
        confirmLabel: "Tắt link",
        tone: "danger",
      })
      if (!ok) return
    }
    try {
      const updated = await acquisitionApi.updateLink(link.id, { isActive: !link.is_active })
      setLinks((prev) => prev?.map((l) => (l.id === updated.id ? updated : l)) ?? null)
    } catch (e) {
      setError(e instanceof Error ? e.message : "Không đổi được trạng thái")
    }
  }

  return (
    <div className="space-y-4">
      {creating && (
        <ShortLinkCreateForm
          onCancel={() => onCreatingChange(false)}
          onCreated={(link) => {
            setLinks((prev) => [link, ...(prev ?? [])])
            onCreatingChange(false)
          }}
        />
      )}
      {error && <InlineError message={error} onRetry={load} />}
      {links === null && !error && <SkeletonBlock lines={3} label="Đang tải danh sách mã" />}
      {links?.length === 0 && !creating && (
        <EmptyState
          icon={QrCode}
          title="Chưa có mã QR hay link nào"
          reason="Tạo một mã cho mỗi chỗ đặt (quầy, tờ rơi, xe giao) để biết khách đến từ đâu."
          action={{ label: "Tạo mã QR đầu tiên", onClick: () => onCreatingChange(true) }}
        />
      )}
      {links && links.length > 0 && (
        <ul className="space-y-3">
          {links.map((link) => (
            <ShortLinkRow key={link.id} link={link} brand={brand} onToggleActive={toggleActive} />
          ))}
        </ul>
      )}
      {confirmDialog}
    </div>
  )
}
