"use client"

import React, { useState, useRef } from "react"
import {
  Download,
  Upload,
  FileSpreadsheet,
  Images,
  RefreshCw,
  CheckCircle,
  AlertCircle,
} from "@/components/ui/icons"
import { Button } from "@/components/ui/button"

interface SyncToast {
  type: "success" | "error"
  message: string
}

interface MarketplaceSyncActionsProps {
  loading: boolean
  onRefresh: () => Promise<void>
}

export function MarketplaceSyncActions({ loading, onRefresh }: MarketplaceSyncActionsProps) {
  const [syncingSheet, setSyncingSheet] = useState(false)
  const [uploadingExcel, setUploadingExcel] = useState(false)
  const [syncingPhotos, setSyncingPhotos] = useState(false)
  const [toast, setToast] = useState<SyncToast | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const showToast = (type: "success" | "error", message: string) => {
    setToast({ type, message })
    setTimeout(() => setToast(null), 7000)
  }

  // 1. Đồng bộ từ Google Sheet
  const handleSyncSheet = async () => {
    setSyncingSheet(true)
    setToast(null)
    try {
      const res = await fetch("/api/v1/platform/marketplace/sync", { method: "POST" })
      const json = await res.json()
      if (res.ok && json.success) {
        const { added, updated, total } = json.data as { added: number; updated: number; total: number }
        showToast(
          "success",
          `✅ Đồng bộ Google Sheet: ${added} mới · ${updated} cập nhật · Tổng ${total} cửa hàng`
        )
        await onRefresh()
      } else {
        showToast("error", json.error ?? "Đồng bộ Sheet thất bại. Kiểm tra Service Account.")
      }
    } catch {
      showToast("error", "Không thể kết nối đến máy chủ.")
    } finally {
      setSyncingSheet(false)
    }
  }

  // 2. Upload file Excel
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploadingExcel(true)
    setToast(null)

    try {
      const formData = new FormData()
      formData.append("file", file)

      const res = await fetch("/api/v1/platform/marketplace/import-excel", {
        method: "POST",
        body: formData,
      })
      const json = await res.json()

      if (res.ok && json.success) {
        const { added, updated, total } = json.data as { added: number; updated: number; total: number }
        showToast(
          "success",
          `✅ Đã nạp file Excel: ${added} mới · ${updated} cập nhật · Tổng ${total} cửa hàng`
        )
        await onRefresh()
      } else {
        showToast("error", json.error ?? "Không thể đọc dữ liệu file Excel.")
      }
    } catch {
      showToast("error", "Lỗi tải file lên máy chủ.")
    } finally {
      setUploadingExcel(false)
      if (fileInputRef.current) {
        fileInputRef.current.value = ""
      }
    }
  }

  // 3. Tải ảnh thực tế từ Drive về máy chủ
  const handleSyncPhotos = async () => {
    setSyncingPhotos(true)
    setToast(null)
    try {
      const res = await fetch("/api/v1/platform/marketplace/sync-photos", { method: "POST" })
      const json = await res.json()
      if (res.ok && json.success) {
        const { totalDownloaded, totalFailed } = json.data as {
          totalDownloaded: number
          totalFailed: number
        }
        showToast(
          "success",
          `📸 Tải ảnh hoàn tất: ${totalDownloaded} ảnh thành công${
            totalFailed > 0 ? ` (${totalFailed} ảnh cần quyền Drive)` : ""
          }`
        )
        await onRefresh()
      } else {
        showToast("error", "Lỗi tải ảnh từ Google Drive.")
      }
    } catch {
      showToast("error", "Không thể kết nối máy chủ để tải ảnh.")
    } finally {
      setSyncingPhotos(false)
    }
  }

  const isBusy = syncingSheet || uploadingExcel || syncingPhotos || loading

  return (
    <div className="flex flex-wrap items-center gap-2">
      {/* Toast Notification */}
      {toast && (
        <div
          className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-medium border animate-in fade-in slide-in-from-top-2 ${
            toast.type === "success"
              ? "bg-success/10 border-success/30 text-success"
              : "bg-destructive/10 border-destructive/30 text-destructive"
          }`}
        >
          {toast.type === "success" ? (
            <CheckCircle className="h-3.5 w-3.5 shrink-0" />
          ) : (
            <AlertCircle className="h-3.5 w-3.5 shrink-0" />
          )}
          <span>{toast.message}</span>
        </div>
      )}

      {/* Hidden file input for Excel upload */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".xlsx,.xls,.csv"
        className="hidden"
        onChange={(e) => void handleFileUpload(e)}
      />

      {/* Upload Excel Button */}
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={() => fileInputRef.current?.click()}
        disabled={isBusy}
        title="Tải lên file Excel (.xlsx, .xls, .csv) chứa dữ liệu khảo sát"
      >
        <FileSpreadsheet className="h-4 w-4 mr-1.5 text-emerald-600" />
        {uploadingExcel ? "Đang đọc Excel..." : "Tải file Excel"}
      </Button>

      {/* Sync from Google Sheet Button */}
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={() => void handleSyncSheet()}
        disabled={isBusy}
        title="Đồng bộ tự động từ Google Sheet (qua Google Service Account)"
      >
        <Download className={`h-4 w-4 mr-1.5 text-primary ${syncingSheet ? "animate-pulse" : ""}`} />
        {syncingSheet ? "Đang đồng bộ..." : "Đồng bộ từ Sheet"}
      </Button>

      {/* Sync Photos Button */}
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={() => void handleSyncPhotos()}
        disabled={isBusy}
        title="Tải ảnh thực tế từ Google Drive về lưu trữ trên máy chủ"
      >
        <Images className={`h-4 w-4 mr-1.5 text-blue-600 ${syncingPhotos ? "animate-pulse" : ""}`} />
        {syncingPhotos ? "Đang tải ảnh..." : "Tải ảnh từ Drive"}
      </Button>

      {/* Refresh Button */}
      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={() => void onRefresh()}
        disabled={isBusy}
        title="Làm mới danh sách"
      >
        <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
      </Button>
    </div>
  )
}

