"use client"

/**
 * /van-hanh/phe-duyet — Màn hình tổng hợp tất cả yêu cầu chờ Admin SaaS phê duyệt.
 * Bao gồm: mở khóa ngôn ngữ quốc tế, chuyển đổi mô hình cửa hàng.
 */

import { useCallback, useEffect, useState } from "react"
import Link from "next/link"
import {
  Clock,
  CheckCircle2,
  XCircle,
  Globe,
  Store,
  RefreshCw,
  InboxIcon,
  ExternalLink,
} from "lucide-react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { SkeletonBlock } from "@/components/ui/skeleton"

type PendingApprovalItem = {
  id: string
  organizationId: string
  organizationName: string
  organizationSlug: string
  type: "LANGUAGE_UNLOCK" | "MODEL_CHANGE"
  requestedAt: string
  requestedBy?: string
  note?: string | null
  requestedLocales?: string[]
  requestedModelType?: string
}

type ApproveResult = { success: boolean; message: string }

const TYPE_META: Record<
  PendingApprovalItem["type"],
  { label: string; icon: React.ReactNode; color: string; bg: string }
> = {
  LANGUAGE_UNLOCK: {
    label: "Mở khóa Ngôn ngữ Quốc tế",
    icon: <Globe size={15} aria-hidden />,
    color: "text-primary",
    bg: "bg-primary/5 border-primary/30",
  },
  MODEL_CHANGE: {
    label: "Chuyển đổi Mô hình Cửa hàng",
    icon: <Store size={15} aria-hidden />,
    color: "text-warning",
    bg: "bg-warning-bg border-warning/30",
  },
}

function formatTime(iso: string) {
  return new Date(iso).toLocaleString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })
}

function ApprovalCard({
  item,
  onApprove,
  onReject,
  processing,
}: {
  item: PendingApprovalItem
  onApprove: (item: PendingApprovalItem) => void
  onReject: (item: PendingApprovalItem) => void
  processing: boolean
}) {
  const meta = TYPE_META[item.type]

  return (
    <Card
      className={`p-4 border rounded-2xl space-y-3 ${meta.bg}`}
      role="article"
      aria-label={`Yêu cầu ${meta.label} từ ${item.organizationName}`}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className={`${meta.color}`}>{meta.icon}</span>
          <span className={`text-body-sm font-bold ${meta.color}`}>{meta.label}</span>
        </div>
        <span className="flex items-center gap-1 text-caption text-text-muted shrink-0">
          <Clock size={12} aria-hidden />
          {formatTime(item.requestedAt)}
        </span>
      </div>

      {/* Thông tin tổ chức */}
      <div className="flex items-center gap-2">
        <div className="flex flex-col gap-0.5">
          <Link
            href={`/van-hanh/to-chuc/${item.organizationId}` as never}
            className="text-body-sm font-semibold text-text hover:text-primary inline-flex items-center gap-1"
          >
            {item.organizationName}
            <ExternalLink size={11} aria-hidden />
          </Link>
          <span className="text-caption text-text-muted">@{item.organizationSlug}</span>
        </div>
      </div>

      {/* Chi tiết yêu cầu */}
      <div className="rounded-xl bg-surface border border-border p-3 space-y-1.5 text-caption">
        {item.type === "LANGUAGE_UNLOCK" && item.requestedLocales && (
          <div>
            <span className="text-text-muted">Gói ngôn ngữ yêu cầu: </span>
            <strong className="text-text">
              {item.requestedLocales
                .filter((l) => l !== "vi")
                .map((l) => (l === "en" ? "🇬🇧 Tiếng Anh (en)" : l))
                .join(", ")}
            </strong>
          </div>
        )}
        {item.type === "MODEL_CHANGE" && item.requestedModelType && (
          <div>
            <span className="text-text-muted">Chuyển sang: </span>
            <strong className="text-text">
              {item.requestedModelType === "CHAIN"
                ? "🏪 Chuỗi cửa hàng (CHAIN)"
                : "🏬 1 Cửa hàng độc lập (SINGLE)"}
            </strong>
          </div>
        )}
        {item.requestedBy && (
          <div>
            <span className="text-text-muted">Người gửi: </span>
            <span className="text-text">{item.requestedBy}</span>
          </div>
        )}
        {item.note && (
          <div>
            <span className="text-text-muted">Ghi chú: </span>
            <em className="text-text">&ldquo;{item.note}&rdquo;</em>
          </div>
        )}
      </div>

      {/* Action buttons */}
      <div className="flex items-center justify-end gap-2 pt-1">
        <button
          type="button"
          id={`reject-${item.id}`}
          disabled={processing}
          onClick={() => onReject(item)}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-danger/30 bg-danger/5 text-caption font-semibold text-danger hover:bg-danger/10 transition-colors disabled:opacity-50 cursor-pointer"
        >
          <XCircle size={13} aria-hidden />
          Từ chối
        </button>
        <Button
          type="button"
          id={`approve-${item.id}`}
          size="sm"
          disabled={processing}
          onClick={() => onApprove(item)}
          className="gap-1.5 font-bold shadow-xs"
        >
          <CheckCircle2 size={13} aria-hidden />
          {processing ? "Đang xử lý…" : "Phê duyệt"}
        </Button>
      </div>
    </Card>
  )
}

export default function PheQuyetPage() {
  const [items, setItems] = useState<PendingApprovalItem[] | null>(null)
  const [loi, setLoi] = useState<string | null>(null)
  const [processing, setProcessing] = useState<string | null>(null)
  const [toast, setToast] = useState<ApproveResult | null>(null)
  const [filter, setFilter] = useState<"ALL" | "LANGUAGE_UNLOCK" | "MODEL_CHANGE">("ALL")

  const tai = useCallback(async () => {
    setLoi(null)
    try {
      const res = await fetch("/api/v1/platform/pending-approvals")
      const json = (await res.json()) as { data: PendingApprovalItem[]; total: number }
      if (!res.ok) throw new Error("Không tải được danh sách yêu cầu")
      setItems(json.data)
    } catch {
      setLoi("Không tải được danh sách yêu cầu phê duyệt.")
    }
  }, [])

  useEffect(() => {
    void tai()
  }, [tai])

  const showToast = (result: ApproveResult) => {
    setToast(result)
    setTimeout(() => setToast(null), 4000)
  }

  const handleApprove = async (item: PendingApprovalItem) => {
    setProcessing(item.id)
    try {
      let body: Record<string, unknown>

      if (item.type === "LANGUAGE_UNLOCK") {
        body = { unlocked_locales: ["vi", ...(item.requestedLocales ?? [])] }
      } else {
        body = {
          target_type: item.requestedModelType,
          note: "Phê duyệt bởi Admin SaaS từ màn hình Phê duyệt",
        }
      }

      const res = await fetch(`/api/v1/platform/organizations/${item.organizationId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      })

      if (!res.ok) throw new Error("Phê duyệt thất bại")

      showToast({ success: true, message: `✅ Đã phê duyệt yêu cầu từ "${item.organizationName}" thành công!` })
      await tai()
    } catch (err) {
      showToast({
        success: false,
        message: err instanceof Error ? err.message : "Phê duyệt thất bại",
      })
    } finally {
      setProcessing(null)
    }
  }

  const handleReject = async (item: PendingApprovalItem) => {
    if (
      !window.confirm(
        `Xác nhận TỪ CHỐI yêu cầu "${TYPE_META[item.type].label}" từ cửa hàng "${item.organizationName}"?`
      )
    )
      return

    setProcessing(item.id)
    try {
      // Từ chối = xóa pending field khỏi settings
      const fieldKey =
        item.type === "LANGUAGE_UNLOCK" ? "clear_pending_language_unlock" : "clear_pending_model_change"

      const res = await fetch(`/api/v1/platform/organizations/${item.organizationId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ [fieldKey]: true }),
      })

      if (!res.ok) throw new Error("Từ chối thất bại")

      showToast({
        success: true,
        message: `🚫 Đã từ chối yêu cầu từ "${item.organizationName}".`,
      })
      await tai()
    } catch (err) {
      showToast({
        success: false,
        message: err instanceof Error ? err.message : "Từ chối thất bại",
      })
    } finally {
      setProcessing(null)
    }
  }

  const filtered = (items ?? []).filter(
    (i) => filter === "ALL" || i.type === filter
  )

  const countByType = {
    ALL: (items ?? []).length,
    LANGUAGE_UNLOCK: (items ?? []).filter((i) => i.type === "LANGUAGE_UNLOCK").length,
    MODEL_CHANGE: (items ?? []).filter((i) => i.type === "MODEL_CHANGE").length,
  }

  return (
    <div className="space-y-5 max-w-3xl mx-auto">
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div>
          <h1 className="text-title font-bold text-text">Yêu cầu Phê duyệt</h1>
          <p className="text-body-sm text-text-muted mt-0.5">
            Tất cả yêu cầu mở khóa & chuyển đổi từ các cửa hàng đang chờ Admin SaaS xét duyệt
          </p>
        </div>
        <button
          type="button"
          id="refresh-pending-approvals"
          onClick={() => void tai()}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border bg-surface text-caption font-semibold text-text-muted hover:bg-surface-alt hover:text-text transition-colors cursor-pointer"
        >
          <RefreshCw size={13} aria-hidden />
          Tải lại
        </button>
      </div>

      {/* Toast notification */}
      {toast && (
        <div
          role="status"
          className={`p-3 rounded-xl border text-body-sm font-semibold flex items-center gap-2 ${
            toast.success
              ? "bg-primary/10 border-primary/30 text-primary"
              : "bg-danger/10 border-danger/30 text-danger"
          }`}
        >
          {toast.success ? <CheckCircle2 size={16} aria-hidden /> : <XCircle size={16} aria-hidden />}
          {toast.message}
        </div>
      )}

      {/* Lỗi */}
      {loi && (
        <div role="alert" className="p-3 bg-danger/10 border border-danger/30 rounded-xl text-body-sm text-danger">
          {loi}
        </div>
      )}

      {/* Skeleton */}
      {!items && !loi && <SkeletonBlock lines={6} />}

      {/* Filter tabs */}
      {items && (
        <>
          <div className="flex items-center gap-1.5 flex-wrap">
            {(["ALL", "LANGUAGE_UNLOCK", "MODEL_CHANGE"] as const).map((t) => (
              <button
                key={t}
                type="button"
                id={`filter-${t.toLowerCase()}`}
                onClick={() => setFilter(t)}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-caption font-semibold transition-colors cursor-pointer ${
                  filter === t
                    ? "bg-primary text-surface"
                    : "bg-surface border border-border text-text-muted hover:bg-surface-alt"
                }`}
              >
                {t === "ALL" && "Tất cả"}
                {t === "LANGUAGE_UNLOCK" && (
                  <>
                    <Globe size={12} aria-hidden /> Mở khóa Ngôn ngữ
                  </>
                )}
                {t === "MODEL_CHANGE" && (
                  <>
                    <Store size={12} aria-hidden /> Chuyển đổi Mô hình
                  </>
                )}
                <span
                  className={`ml-0.5 px-1.5 py-0.5 rounded-full text-[10px] font-bold ${
                    filter === t ? "bg-white/20" : "bg-muted text-text"
                  }`}
                >
                  {countByType[t]}
                </span>
              </button>
            ))}
          </div>

          {/* Danh sách */}
          {filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center space-y-3">
              <div className="w-14 h-14 rounded-2xl bg-surface-muted flex items-center justify-center">
                <InboxIcon size={24} className="text-text-muted" aria-hidden />
              </div>
              <div>
                <p className="text-body-sm font-semibold text-text">Không có yêu cầu nào</p>
                <p className="text-caption text-text-muted mt-0.5">
                  {filter === "ALL"
                    ? "Hiện tại không có yêu cầu nào chờ phê duyệt."
                    : "Không có yêu cầu nào trong danh mục này."}
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              {filtered.map((item) => (
                <ApprovalCard
                  key={item.id}
                  item={item}
                  onApprove={handleApprove}
                  onReject={handleReject}
                  processing={processing === item.id}
                />
              ))}
            </div>
          )}
        </>
      )}
    </div>
  )
}
