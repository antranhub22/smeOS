"use client"

import React, { useState } from "react"
import { Shield, X, Check } from "@/components/ui/icons"
import { STORE_NAV_ENTRIES } from "@/components/layout/nav/nav-store"
import { Button } from "@/components/ui/button"

interface PartnerToolMatrixModalProps {
  partnerId: string
  partnerName: string
  partnerCode: string
  initialUnlockedTools?: string[] | null | undefined
  onClose: () => void
  onSuccess: (updatedTools: string[]) => void
}

export function PartnerToolMatrixModal({
  partnerId,
  partnerName,
  partnerCode,
  initialUnlockedTools,
  onClose,
  onSuccess,
}: PartnerToolMatrixModalProps) {
  // Lấy toàn bộ các công cụ thuộc nhóm cong-cu trừ mục Thư viện
  const availableTools = STORE_NAV_ENTRIES.filter(
    (e) => e.group === "cong-cu" && e.navKey !== "toolkit"
  )

  // Chưa cấu hình (null) -> mặc định chọn tất cả; mảng rỗng nghĩa là đã khoá hết
  const [selectedKeys, setSelectedKeys] = useState<Set<string>>(() => {
    if (Array.isArray(initialUnlockedTools)) {
      return new Set(initialUnlockedTools)
    }
    return new Set(availableTools.map((t) => t.navKey))
  })

  const [saving, setSaving] = useState(false)
  const [errorMsg, setErrorMsg] = useState("")

  const toggleTool = (navKey: string) => {
    setSelectedKeys((prev) => {
      const next = new Set(prev)
      if (next.has(navKey)) {
        next.delete(navKey)
      } else {
        next.add(navKey)
      }
      return next
    })
  }

  const selectAll = () => {
    setSelectedKeys(new Set(availableTools.map((t) => t.navKey)))
  }

  const deselectAll = () => {
    setSelectedKeys(new Set())
  }

  const handleSave = async () => {
    setSaving(true)
    setErrorMsg("")
    try {
      const res = await fetch(`/api/v1/network/partners/${partnerId}/unlocked-tools`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          unlockedTools: Array.from(selectedKeys),
        }),
      })

      const json = await res.json()
      if (!res.ok) {
        setErrorMsg(json.message || "Không thể lưu cấu hình công cụ")
        return
      }

      onSuccess(Array.from(selectedKeys))
      onClose()
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : "Đã xảy ra lỗi")
    } finally {
      setSaving(false)
    }
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="partner-tool-matrix-title"
      onKeyDown={(e) => {
        if (e.key === "Escape") onClose()
      }}
      className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4"
    >
      <div className="bg-surface rounded-2xl max-w-xl w-full p-6 shadow-2xl border border-border animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-start justify-between pb-3 border-b border-border">
          <div>
            <div className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-primary" />
              <h3 id="partner-tool-matrix-title" className="font-bold text-title text-text">
                Phân quyền Công cụ Chi nhánh
              </h3>
            </div>
            <p className="text-body-sm text-text-muted mt-1">
              Cửa hàng: <span className="font-semibold text-text">{partnerName}</span> ({partnerCode})
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Đóng"
            className="text-text-muted hover:text-text p-1 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {errorMsg && (
          <div className="p-3 my-3 text-xs bg-primary-muted text-primary rounded-xl border border-primary-border">
            {errorMsg}
          </div>
        )}

        <div className="mt-3">
          <p className="text-caption text-text-muted mt-2">Công cụ bị khoá sẽ ẩn khỏi menu và không mở được kể cả khi gõ thẳng địa chỉ.</p>
        </div>

        {/* Quick action bar */}
        <div className="flex items-center justify-between py-3 border-b border-border text-meta">
          <span className="text-text-muted">
            Đã mở khóa: <b className="text-text">{selectedKeys.size}/{availableTools.length}</b> công cụ
          </span>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={selectAll}
              className="text-primary hover:text-primary-dark font-medium"
            >
              Chọn tất cả
            </button>
            <span className="text-text-muted">|</span>
            <button
              type="button"
              onClick={deselectAll}
              className="text-text-muted hover:text-text font-medium"
            >
              Bỏ chọn tất cả
            </button>
          </div>
        </div>

        {/* Tools Grid */}
        <div className="max-h-72 overflow-y-auto py-2 space-y-2">
          {availableTools.map((tool) => {
            const isChecked = selectedKeys.has(tool.navKey)
            return (
              <label
                key={tool.navKey}
                onClick={() => toggleTool(tool.navKey)}
                className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer transition-all ${
                  isChecked
                    ? "bg-primary-muted/40 border-primary-border"
                    : "bg-surface-alt/50 border-border hover:bg-surface-alt"
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${
                      isChecked
                        ? "bg-primary border-primary text-white"
                        : "border-border bg-surface"
                    }`}
                  >
                    {isChecked && <Check size={11} strokeWidth={3} />}
                  </div>
                  <div>
                    <div className="text-body-sm font-bold text-text flex items-center gap-1.5">
                      <span>{tool.label}</span>
                      {tool.capability && (
                        <span className="text-caption px-1.5 py-0.2 rounded bg-surface-alt text-text-muted font-mono">
                          {tool.capability}
                        </span>
                      )}
                    </div>
                    <span className="text-caption text-text-muted font-mono">
                      {tool.href}
                    </span>
                  </div>
                </div>

                <span
                  className={`text-caption font-semibold px-2 py-0.5 rounded-full ${
                    isChecked
                      ? "bg-success-bg text-success border border-success-border"
                      : "bg-surface-alt text-text-muted"
                  }`}
                >
                  {isChecked ? "Cho phép" : "Khóa"}
                </span>
              </label>
            )
          })}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-2 pt-4 border-t border-border mt-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onClose}
          >
            Hủy
          </Button>
          <Button
            type="button"
            variant="primary"
            size="sm"
            disabled={saving}
            onClick={handleSave}
          >
            {saving ? "Đang lưu..." : "Lưu phân quyền"}
          </Button>
        </div>
      </div>
    </div>
  )
}
