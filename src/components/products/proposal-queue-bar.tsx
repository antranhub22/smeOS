"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { ClipboardCheck } from "@/components/ui/icons"

const COUNT_LIMIT = 100

/**
 * Hàng chờ duyệt của Điều hành: đếm mẫu nhân viên đề xuất đang chờ và bật/tắt
 * chế độ chỉ xem các mẫu đó. Ẩn khi không có gì chờ duyệt và chưa bật lọc.
 */
export function ProposalQueueBar({ active, onToggle }: { active: boolean; onToggle: () => void }) {
  const [count, setCount] = useState<number | null>(null)
  const [changes, setChanges] = useState<Array<{ id: string; productId: string; productName: string }>>([])

  useEffect(() => {
    const ctrl = new AbortController()
    fetch(`/api/v1/products?proposal=pending&limit=${COUNT_LIMIT}`, { signal: ctrl.signal })
      .then((res) => (res.ok ? res.json() : null))
      .then((body: { data?: unknown[]; next_cursor?: string | null } | null) => {
        if (body?.data) setCount(body.data.length)
      })
      .catch(() => undefined)
    fetch("/api/v1/product-change-requests?status=PENDING", { signal: ctrl.signal })
      .then((res) => (res.ok ? res.json() : null))
      .then((body: { data?: Array<{ id: string; productId: string; productName: string }> } | null) => setChanges(body?.data ?? []))
      .catch(() => undefined)
    return () => ctrl.abort()
  }, [active])

  if (!active && !count && changes.length === 0) return null
  const label = count === null ? "" : count >= COUNT_LIMIT ? `${COUNT_LIMIT}+` : String(count)

  return (
    <div className="mx-4 mt-3 flex flex-wrap items-center gap-3 rounded-xl border border-warning/30 bg-warning-bg px-3.5 py-2.5 text-body-sm text-warning-text">
      <ClipboardCheck size={16} className="flex-shrink-0" aria-hidden="true" />
      <span className="flex-1 font-medium">
        {active ? "Đang xem các mẫu nhân viên đề xuất chờ duyệt" : `${label} mẫu nhân viên đề xuất đang chờ bạn duyệt`}
      </span>
      <button
        type="button"
        onClick={onToggle}
        className="h-9 rounded-xl border border-warning/40 bg-surface px-3 font-bold text-text hover:bg-surface-alt focus-visible:outline-2 focus-visible:outline-primary"
      >
        {active ? "Xem tất cả mẫu" : "Xem mẫu chờ duyệt"}
      </button>
      {changes.length > 0 && (
        <p className="w-full text-caption text-text">
          {changes.length} đề xuất sửa mẫu chính thức chờ duyệt:{" "}
          {changes.slice(0, 5).map((c, i) => (
            <span key={c.id}>
              {i > 0 && ", "}
              <Link href={`/san-pham/${c.productId}` as never} className="font-semibold text-primary underline">{c.productName}</Link>
            </span>
          ))}
          {changes.length > 5 && " …"}
        </p>
      )}
    </div>
  )
}
