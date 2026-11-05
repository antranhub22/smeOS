"use client"

// Thanh xoá hàng loạt — chỉ hiện với superadmin (N18, máy chủ vẫn kiểm). Xoá theo lựa chọn
// hoặc toàn bộ; toàn bộ phải gõ đúng số hồ sơ để xác nhận.
import React, { useState } from "react"
import { AlertCircle } from "@/components/ui/icon-set/alert-circle"
import { CheckCircle } from "@/components/ui/icon-set/check-circle"
import { CheckSquare } from "@/components/ui/icon-set/check-square"
import { Trash2 } from "@/components/ui/icon-set/trash2"
import { X } from "@/components/ui/icon-set/x"
import { Button } from "@/components/ui/button"
import { useConfirmDialog } from "@/components/ui/confirm-dialog"

export type BulkDeleteRequest = { ids: string[] } | { all: true; expectedTotal: number }
export type BulkDeleteResult = { deleted: number } | { error: string }

interface MarketplaceBulkDeleteBarProps {
  selecting: boolean
  selectedCount: number
  visibleIds: string[]
  totalCount: number
  onStart: () => void
  onStop: () => void
  onSelectIds: (ids: string[]) => void
  onClear: () => void
  /** Gọi API; xong thì người gọi tải lại danh sách. */
  run: (request: BulkDeleteRequest) => Promise<BulkDeleteResult>
  selectedIds: string[]
}

export function MarketplaceBulkDeleteBar(props: MarketplaceBulkDeleteBarProps) {
  const { selecting, selectedCount, visibleIds, totalCount, onStart, onStop, onSelectIds, onClear, run, selectedIds } = props
  const [confirm, confirmDialog] = useConfirmDialog()
  const [notice, setNotice] = useState<{ tone: "success" | "error"; message: string } | null>(null)

  async function execute(request: BulkDeleteRequest) {
    const result = await run(request)
    if ("error" in result) {
      setNotice({ tone: "error", message: result.error })
      return
    }
    setNotice({ tone: "success", message: `Đã xoá ${result.deleted} hồ sơ.` })
    onClear()
    onStop()
  }

  async function deleteSelected() {
    const yes = await confirm({
      title: `Xoá ${selectedCount} hồ sơ đã chọn?`,
      consequence: "Các hồ sơ biến mất khỏi chợ đối tác và mọi link chia sẻ, không khôi phục được. Muốn có lại phải nhập lại từ tệp hoặc Sheet.",
      confirmLabel: `Xoá ${selectedCount} hồ sơ`,
      tone: "danger",
    })
    if (yes) await execute({ ids: selectedIds })
  }

  async function deleteAll() {
    const yes = await confirm({
      title: `Xoá toàn bộ ${totalCount} hồ sơ đối tác?`,
      consequence: `Chợ đối tác sẽ trống hoàn toàn, mọi link chia sẻ hiện danh sách rỗng, không khôi phục được. Gõ ${totalCount} để xác nhận.`,
      confirmLabel: "Xoá toàn bộ",
      tone: "danger",
      requireText: String(totalCount),
    })
    if (yes) await execute({ all: true, expectedTotal: totalCount })
  }

  const noticeView = notice && (
    <div
      role="status"
      className={`flex items-center gap-2 rounded-xl border px-3 py-1.5 text-caption font-medium ${
        notice.tone === "success" ? "border-success-border bg-success-bg text-success-text" : "border-danger-border bg-danger-bg text-danger-text"
      }`}
    >
      {notice.tone === "success" ? <CheckCircle className="h-3.5 w-3.5 shrink-0" /> : <AlertCircle className="h-3.5 w-3.5 shrink-0" />}
      <span>{notice.message}</span>
    </div>
  )

  if (!selecting) {
    return (
      <div className="flex flex-wrap items-center gap-2">
        {confirmDialog}
        <Button type="button" variant="outline" size="sm" className="gap-1.5" onClick={onStart} disabled={totalCount === 0}>
          <CheckSquare className="h-4 w-4" /> Chọn để xoá
        </Button>
        <Button type="button" variant="outline" size="sm" className="gap-1.5 text-danger-text" onClick={() => void deleteAll()} disabled={totalCount === 0}>
          <Trash2 className="h-4 w-4" /> Xoá toàn bộ
        </Button>
        {noticeView}
      </div>
    )
  }

  return (
    <div className="flex flex-wrap items-center gap-2 rounded-xl border border-danger-border bg-danger-bg/40 px-3 py-2" role="toolbar" aria-label="Chọn hồ sơ để xoá">
      {confirmDialog}
      <span className="text-body-sm font-semibold text-text">{`Đã chọn ${selectedCount}`}</span>
      <Button type="button" variant="ghost" size="sm" onClick={() => onSelectIds(visibleIds)} disabled={visibleIds.length === 0}>
        {`Chọn tất cả đang hiển thị (${visibleIds.length})`}
      </Button>
      <Button type="button" variant="ghost" size="sm" onClick={onClear} disabled={selectedCount === 0}>
        Bỏ chọn
      </Button>
      <Button type="button" variant="danger" size="sm" className="gap-1.5" onClick={() => void deleteSelected()} disabled={selectedCount === 0}>
        <Trash2 className="h-4 w-4" /> {`Xoá ${selectedCount} hồ sơ`}
      </Button>
      <Button type="button" variant="outline" size="sm" className="gap-1.5" onClick={onStop}>
        <X className="h-4 w-4" /> Xong
      </Button>
      {noticeView}
    </div>
  )
}
