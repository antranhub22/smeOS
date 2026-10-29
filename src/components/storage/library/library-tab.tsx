"use client"

import type { Route } from "next"
import Link from "next/link"
import { useCallback, useEffect, useState } from "react"
import { AlertCircle, ExternalLink, FileText, Music, Search, Trash2 } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { ProductThumb } from "@/components/products/product-thumb"
import { SkeletonBlock } from "@/components/ui/skeleton"
import { formatDate } from "@/lib/i18n/formatters"
import type { LibraryType } from "@/modules/storage/domain/library"
import { LIBRARY_TAB_LABEL, statusLabel, subtypeLabel } from "./library-labels"

export type LibraryItemView = {
  id: string
  type: LibraryType
  subtype: string | null
  title: string
  status: string | null
  created_at: string
  branch: { id: string; name: string } | null
  thumbnail_url: string | null
  drive_link: string | null
  open_href: string
}

const SINCE_OPTIONS = [
  { value: "", label: "Mọi lúc" },
  { value: "7", label: "7 ngày qua" },
  { value: "30", label: "30 ngày qua" },
  { value: "90", label: "90 ngày qua" },
]

type Props = {
  type: LibraryType
  /** `all` | `hq` | id chi nhánh — Screen Contract `kho-du-lieu.md` §5. */
  scope: string
  showBranch: boolean
  refreshKey: number
  onTrash?: ((item: LibraryItemView) => void) | undefined
}

/** Lưới một loại dữ liệu của Kho dữ liệu v2 (`GET /api/v1/storage/library`). */
export function LibraryTab({ type, scope, showBranch, refreshKey, onTrash }: Props) {
  const [items, setItems] = useState<LibraryItemView[]>([])
  const [cursor, setCursor] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [q, setQ] = useState("")
  const [sinceDays, setSinceDays] = useState("")

  const load = useCallback(
    async (after: string | null) => {
      setLoading(true)
      setError(null)
      const params = new URLSearchParams({ type, scope })
      if (q.trim()) params.set("q", q.trim())
      if (sinceDays) params.set("from", new Date(Date.now() - Number(sinceDays) * 86_400_000).toISOString())
      if (after) params.set("cursor", after)
      try {
        const res = await fetch(`/api/v1/storage/library?${params}`)
        if (!res.ok) throw new Error()
        const body = (await res.json()) as { data: { items: LibraryItemView[]; next_cursor: string | null } }
        setItems((prev) => (after ? [...prev, ...body.data.items] : body.data.items))
        setCursor(body.data.next_cursor)
      } catch {
        setError("Chưa tải được danh sách. Vui lòng thử lại.")
      } finally {
        setLoading(false)
      }
    },
    [type, scope, q, sinceDays]
  )

  useEffect(() => {
    const timer = setTimeout(() => void load(null), q ? 300 : 0)
    return () => clearTimeout(timer)
  }, [load, q, refreshKey])

  const label = LIBRARY_TAB_LABEL[type].toLowerCase()

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
        <label className="relative flex-1">
          <span className="sr-only">Tìm {label}</span>
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" aria-hidden />
          <input
            type="search"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder={`Tìm ${label} theo tên`}
            className="w-full rounded-xl border border-border bg-surface-alt py-2 pl-9 pr-3.5 text-body-sm outline-none transition-colors focus:border-primary"
          />
        </label>
        <label className="sm:w-44">
          <span className="sr-only">Thời gian tạo</span>
          <select
            value={sinceDays}
            onChange={(e) => setSinceDays(e.target.value)}
            className="w-full rounded-xl border border-border bg-surface-alt px-3 py-2 text-body-sm outline-none focus:border-primary"
          >
            {SINCE_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </label>
      </div>

      {error && (
        <div role="alert" className="flex items-center gap-2 rounded-xl border border-danger/30 bg-danger-bg p-3.5 text-xs text-danger">
          <AlertCircle size={15} />
          {error}
          <Button variant="outline" size="sm" className="ml-auto text-xs" onClick={() => void load(null)}>
            Thử lại
          </Button>
        </div>
      )}

      {!loading && !error && items.length === 0 && (
        <Card className="border-dashed bg-surface-alt p-8 text-center">
          <FileText size={32} className="mx-auto mb-2 text-text-muted opacity-50" aria-hidden />
          <div className="text-sm font-bold text-text">Chưa có {label} nào</div>
          <p className="mx-auto mt-1 max-w-sm text-xs text-text-muted">Mục bạn tạo trong công cụ sẽ tự xuất hiện ở đây.</p>
        </Card>
      )}

      <div className="grid grid-cols-2 gap-3.5 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
        {items.map((item) => {
          const name = item.title || subtypeLabel(item.subtype) || LIBRARY_TAB_LABEL[type]
          const status = statusLabel(item.status)
          return (
            <Card key={item.id} className="flex flex-col overflow-hidden rounded-2xl border border-border bg-surface">
              <div className="relative aspect-square w-full overflow-hidden bg-surface-alt">
                {type === "audio" ? (
                  <div className="flex h-full w-full items-center justify-center text-text-muted">
                    <Music size={28} className="opacity-50" aria-hidden />
                  </div>
                ) : (
                  <ProductThumb name={name} masterImageUrl={item.thumbnail_url ?? undefined} driveLink={item.drive_link ?? undefined} size="card" />
                )}
                {showBranch && (
                  <Badge className="absolute left-2 top-2 border-none bg-surface px-1.5 py-0 text-caption font-bold text-text">
                    {item.branch?.name ?? "Trụ sở"}
                  </Badge>
                )}
              </div>
              <div className="flex flex-col gap-1.5 p-3">
                <div className="truncate text-meta font-semibold text-text" title={name}>
                  {name}
                </div>
                <div className="text-caption text-text-muted">
                  {formatDate(item.created_at)}
                  {status ? ` · ${status}` : ""}
                </div>
                <div className="flex items-center gap-1.5">
                  <Link
                    href={item.open_href as Route}
                    className="flex h-7 flex-1 items-center justify-center gap-1 rounded-lg border border-border text-xs font-semibold text-text hover:bg-surface-alt focus-visible:outline-2 focus-visible:outline-primary"
                  >
                    <ExternalLink size={12} aria-hidden />
                    Mở
                  </Link>
                  {onTrash && (
                    <button
                      type="button"
                      onClick={() => onTrash(item)}
                      aria-label={`Chuyển ${name} vào thùng rác`}
                      title="Chuyển vào thùng rác 30 ngày (Chỉ Điều hành)"
                      className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border border-border text-text-muted hover:bg-danger-bg hover:text-danger"
                    >
                      <Trash2 size={13} aria-hidden />
                    </button>
                  )}
                </div>
              </div>
            </Card>
          )
        })}
      </div>

      {loading && <SkeletonBlock lines={3} label="Đang tải danh sách" />}
      {cursor && !loading && (
        <Button variant="outline" size="sm" className="mx-auto text-xs" onClick={() => void load(cursor)}>
          Xem thêm
        </Button>
      )}
    </div>
  )
}
