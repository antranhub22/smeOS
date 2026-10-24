"use client"

import React, { useEffect } from "react"
import { X, ExternalLink, Settings, Sparkles } from "lucide-react"
import Link from "next/link"
import type { Route } from "next"

/**
 * Ngăn Cài đặt của Điều hành — Đã chuyển giao toàn bộ về Trung Tâm Hồ Sơ & Cài Đặt (All-in-One SSOT).
 */
export function AdminSettingsDrawer({ onClose }: { onClose: () => void }) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose()
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [onClose])

  return (
    <div className="fixed inset-0 z-50 flex justify-end" role="dialog" aria-modal="true" aria-labelledby="admin-settings-title">
      <button type="button" aria-label="Đóng cài đặt" tabIndex={-1} onClick={onClose} className="absolute inset-0 bg-black/40 backdrop-blur-xs" />
      <div className="relative flex h-full w-full max-w-lg flex-col bg-background shadow-2xl">
        <div className="flex items-center justify-between border-b border-border bg-surface px-5 py-4">
          <div className="flex items-center gap-2">
            <Settings size={18} className="text-primary" />
            <h2 id="admin-settings-title" className="text-title-sm font-extrabold text-foreground">
              Cài Đặt Thẻ Chào & Vận Hành
            </h2>
          </div>
          <button type="button" onClick={onClose} aria-label="Đóng cài đặt" className="rounded-full p-2 text-text-muted hover:bg-surface-muted">
            <X size={18} />
          </button>
        </div>

        <div className="flex flex-col gap-6 p-6 overflow-y-auto">
          <div className="p-5 rounded-2xl border border-primary/20 bg-primary/5 text-center flex flex-col items-center gap-3">
            <div className="h-12 w-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center">
              <Sparkles size={24} />
            </div>
            <div>
              <h3 className="text-sm font-bold text-text">Đã Hợp Nhất Vào Hồ Sơ & Cài Đặt</h3>
              <p className="text-xs text-text-muted mt-1 leading-relaxed max-w-sm">
                Để loại bỏ sự phân mảnh và trùng lặp, toàn bộ ma trận quy trình, thời hạn tự hủy đơn, SLA và kênh điều phối Thẻ Chào đã được tập trung tại <strong>Trung Tâm Hồ Sơ & Cài Đặt</strong>.
              </p>
            </div>

            <Link
              href={"/cai-dat?tab=BROCHURE_FLOW" as Route}
              onClick={onClose}
              className="mt-2 inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-primary-foreground text-xs font-bold shadow-xs hover:bg-primary/90 transition-colors"
            >
              <ExternalLink size={14} />
              <span>Mở Cài Đặt Thẻ Chào (Tab 8)</span>
            </Link>
          </div>

          <div className="text-caption text-text-muted text-center">
            Bạn cũng có thể truy cập mục này bất kỳ lúc nào từ menu thanh điều hướng bên trái: <strong>Hồ Sơ & Cài Đặt</strong>.
          </div>
        </div>
      </div>
    </div>
  )
}
