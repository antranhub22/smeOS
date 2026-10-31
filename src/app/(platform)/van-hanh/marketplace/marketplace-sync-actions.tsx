"use client"

// Nút đồng bộ chợ đối tác — cần N17 (máy chủ kiểm, trả 403 nếu thiếu); mọi thao tác ghi nhật ký nền tảng.
import React, { useRef, useState } from "react"
import { AlertCircle, CheckCircle, Download, FileSpreadsheet, Images, RefreshCw } from "@/components/ui/icons"
import { Button } from "@/components/ui/button"
import { useConfirmDialog } from "@/components/ui/confirm-dialog"

type Notice = { tone: "success" | "error"; message: string }
type Summary = { added: number; updated: number; total: number; skipped: number }
type PhotoSummary = { stores: number; downloaded: number; failed: number; remaining: number }

interface MarketplaceSyncActionsProps {
  loading: boolean
  onRefresh: () => Promise<void>
}

/** Gọi API, trả dữ liệu hoặc câu báo lỗi dễ hiểu (API trả `{ error: { message } }`). */
async function callApi<T>(url: string, init: RequestInit): Promise<{ data: T } | { error: string }> {
  try {
    const res = await fetch(url, init)
    const json = (await res.json().catch(() => null)) as { data?: T; error?: { message?: string } } | null
    if (res.ok && json?.data) return { data: json.data }
    if (res.status === 403) return { error: "Tài khoản chưa có quyền cập nhật chợ đối tác." }
    return { error: json?.error?.message ?? "Không thực hiện được. Vui lòng thử lại." }
  } catch {
    return { error: "Không kết nối được máy chủ." }
  }
}

const importMessage = (from: string, s: Summary) =>
  `${from}: ${s.added} cửa hàng mới, ${s.updated} cập nhật, tổng ${s.total}` + (s.skipped ? ` (bỏ qua ${s.skipped} dòng thiếu tên)` : "")

export function MarketplaceSyncActions({ loading, onRefresh }: MarketplaceSyncActionsProps) {
  const [busy, setBusy] = useState<"sheet" | "excel" | "photos" | null>(null)
  const [notice, setNotice] = useState<Notice | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [confirm, confirmDialog] = useConfirmDialog()

  async function run<T>(kind: "sheet" | "excel" | "photos", call: () => Promise<{ data: T } | { error: string }>, ok: (d: T) => string) {
    setBusy(kind)
    setNotice(null)
    const result = await call()
    setBusy(null)
    if ("error" in result) {
      setNotice({ tone: "error", message: result.error })
      return
    }
    setNotice({ tone: "success", message: ok(result.data) })
    await onRefresh()
  }

  async function syncSheet() {
    const yes = await confirm({
      title: "Đồng bộ từ Google Sheet?",
      consequence: "Hồ sơ cửa hàng trùng tên sẽ được ghi đè bằng dữ liệu mới nhất trên Sheet. Ảnh đã tải được giữ nguyên.",
      confirmLabel: "Đồng bộ",
    })
    if (!yes) return
    await run<Summary>("sheet", () => callApi("/api/v1/platform/marketplace/sync", { method: "POST" }), (s) => importMessage("Đã đồng bộ Sheet", s))
  }

  async function uploadExcel(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (fileInputRef.current) fileInputRef.current.value = ""
    if (!file) return
    const yes = await confirm({
      title: `Nhập tệp ${file.name}?`,
      consequence: "Hồ sơ cửa hàng trùng tên sẽ được ghi đè bằng dữ liệu trong tệp. Ảnh đã tải được giữ nguyên.",
      confirmLabel: "Nhập tệp",
    })
    if (!yes) return
    const body = new FormData()
    body.append("file", file)
    await run<Summary>("excel", () => callApi("/api/v1/platform/marketplace/import-excel", { method: "POST", body }), (s) => importMessage("Đã nhập tệp", s))
  }

  async function syncPhotos() {
    await run<PhotoSummary>(
      "photos",
      () => callApi("/api/v1/platform/marketplace/sync-photos", { method: "POST" }),
      (s) =>
        s.stores === 0
          ? "Ảnh khảo sát đã được tải đủ."
          : `Đã tải ${s.downloaded} ảnh của ${s.stores} cửa hàng` +
            (s.failed ? `, ${s.failed} ảnh không tải được (kiểm tra quyền chia sẻ Drive)` : "") +
            (s.remaining ? `. Còn ${s.remaining} cửa hàng — bấm lại để tải tiếp.` : ".")
    )
  }

  const disabled = busy !== null || loading

  return (
    <div className="flex flex-wrap items-center gap-2">
      {confirmDialog}
      {notice && (
        <div
          role="status"
          className={`flex items-center gap-2 rounded-xl border px-3 py-1.5 text-xs font-medium ${
            notice.tone === "success" ? "border-success-border bg-success-bg text-success-text" : "border-danger-border bg-danger-bg text-danger-text"
          }`}
        >
          {notice.tone === "success" ? <CheckCircle className="h-3.5 w-3.5 shrink-0" /> : <AlertCircle className="h-3.5 w-3.5 shrink-0" />}
          <span>{notice.message}</span>
        </div>
      )}

      <input ref={fileInputRef} type="file" accept=".xlsx,.xls,.csv" className="hidden" onChange={(e) => void uploadExcel(e)} />

      <Button type="button" variant="outline" size="sm" onClick={() => fileInputRef.current?.click()} disabled={disabled} title="Nhập tệp khảo sát .xlsx, .xls hoặc .csv (tối đa 10 MB)">
        <FileSpreadsheet className="mr-1.5 h-4 w-4 text-success" />
        {busy === "excel" ? "Đang nhập tệp..." : "Nhập tệp Excel"}
      </Button>
      <Button type="button" variant="outline" size="sm" onClick={() => void syncSheet()} disabled={disabled} title="Lấy dữ liệu khảo sát mới nhất từ Google Sheet">
        <Download className={`mr-1.5 h-4 w-4 text-primary ${busy === "sheet" ? "animate-pulse" : ""}`} />
        {busy === "sheet" ? "Đang đồng bộ..." : "Đồng bộ từ Sheet"}
      </Button>
      <Button type="button" variant="outline" size="sm" onClick={() => void syncPhotos()} disabled={disabled} title="Tải ảnh khảo sát từ Google Drive vào kho lưu trữ">
        <Images className={`mr-1.5 h-4 w-4 text-info ${busy === "photos" ? "animate-pulse" : ""}`} />
        {busy === "photos" ? "Đang tải ảnh..." : "Tải ảnh khảo sát"}
      </Button>
      <Button type="button" variant="ghost" size="sm" onClick={() => void onRefresh()} disabled={disabled} title="Làm mới danh sách" aria-label="Làm mới danh sách">
        <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
      </Button>
    </div>
  )
}
