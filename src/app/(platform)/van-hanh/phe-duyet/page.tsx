"use client"

/**
 * /van-hanh/phe-duyet — Màn hình tổng hợp tất cả yêu cầu chờ Admin SaaS phê duyệt.
 * Bao gồm: mở khóa ngôn ngữ quốc tế, chuyển đổi mô hình cửa hàng, nâng hạn mức chat AI công khai.
 */

import { useCallback, useEffect, useState } from "react"
import { CheckCircle2, XCircle, RefreshCw, InboxIcon } from "@/components/ui/icons"
import {
  ApprovalCard,
  TYPE_META,
  approvalRequestBody,
  type ApproveResult,
  type PendingApprovalItem,
} from "@/components/platform/approval-card"
import { SkeletonBlock } from "@/components/ui/skeleton"
import { useI18n } from "@/lib/i18n"

export default function PheQuyetPage() {
  const { t, dict } = useI18n()
  const [items, setItems] = useState<PendingApprovalItem[] | null>(null)
  const [loi, setLoi] = useState<string | null>(null)
  const [processing, setProcessing] = useState<string | null>(null)
  const [toast, setToast] = useState<ApproveResult | null>(null)
  const [filter, setFilter] = useState<"ALL" | PendingApprovalItem["type"]>("ALL")

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
    void Promise.resolve().then(() => tai())
  }, [tai])

  const showToast = (result: ApproveResult) => {
    setToast(result)
    setTimeout(() => setToast(null), 4000)
  }

  const handleApprove = async (item: PendingApprovalItem) => {
    setProcessing(item.id)
    try {
      const body = approvalRequestBody(item, "approve")

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
      // Từ chối = xóa yêu cầu chờ duyệt khỏi settings
      const res = await fetch(`/api/v1/platform/organizations/${item.organizationId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(approvalRequestBody(item, "reject")),
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

  const countOf = (t: "ALL" | PendingApprovalItem["type"]) =>
    (items ?? []).filter((i) => t === "ALL" || i.type === t).length

  return (
    <div className="space-y-5 max-w-3xl mx-auto">
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div>
          <h1 className="text-title font-bold text-text">{dict.platform.approval.title}</h1>
          <p className="text-body-sm text-text-muted mt-0.5">
            {dict.platform.approval.subtitle}
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
            {(["ALL", ...(Object.keys(TYPE_META) as PendingApprovalItem["type"][])] as const).map((t) => (
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
                {t === "ALL" ? "Tất cả" : (
                  <>
                    {TYPE_META[t].icon} {TYPE_META[t].tabLabel}
                  </>
                )}
                <span
                  className={`ml-0.5 px-1.5 py-0.5 rounded-full text-caption font-bold ${
                    filter === t ? "bg-white/20" : "bg-muted text-text"
                  }`}
                >
                  {countOf(t)}
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
