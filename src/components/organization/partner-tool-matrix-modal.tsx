"use client"

import React, { useState } from "react"
import { Shield, Sparkles, X, Check, CheckCircle2 } from "lucide-react"
import { STORE_NAV_ENTRIES } from "@/components/layout/nav/nav-store"

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
      const res = await fetch(`/api/v1/coordinator/partners/${partnerId}/tools`, {
        method: "PATCH",
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
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-2xl border border-neutral-200 animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-start justify-between pb-3 border-b border-neutral-100">
          <div>
            <div className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-rose-600" />
              <h3 className="font-bold text-base text-neutral-800">
                Phân quyền Công cụ Chi nhánh
              </h3>
            </div>
            <p className="text-xs text-neutral-500 mt-1">
              Cửa hàng: <span className="font-semibold text-neutral-700">{partnerName}</span> ({partnerCode})
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-neutral-400 hover:text-neutral-600 p-1 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {errorMsg && (
          <div className="p-3 my-3 text-xs bg-rose-50 text-rose-600 rounded-xl border border-rose-100">
            {errorMsg}
          </div>
        )}

        {/* Quick action bar */}
        <div className="flex items-center justify-between py-3 border-b border-neutral-100 text-xs">
          <span className="text-neutral-500">
            Đã mở khóa: <b className="text-neutral-800">{selectedKeys.size}/{availableTools.length}</b> công cụ
          </span>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={selectAll}
              className="text-rose-600 hover:text-rose-700 font-medium"
            >
              Chọn tất cả
            </button>
            <span className="text-neutral-300">|</span>
            <button
              type="button"
              onClick={deselectAll}
              className="text-neutral-500 hover:text-neutral-700 font-medium"
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
                    ? "bg-rose-50/40 border-rose-200"
                    : "bg-neutral-50/50 border-neutral-200/80 hover:bg-neutral-50"
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${
                      isChecked
                        ? "bg-rose-600 border-rose-600 text-white"
                        : "border-neutral-300 bg-white"
                    }`}
                  >
                    {isChecked && <Check size={11} strokeWidth={3} />}
                  </div>
                  <div>
                    <div className="text-xs font-bold text-neutral-800 flex items-center gap-1.5">
                      <span>{tool.label}</span>
                      {tool.capability && (
                        <span className="text-[10px] px-1.5 py-0.2 rounded bg-neutral-100 text-neutral-500 font-mono">
                          {tool.capability}
                        </span>
                      )}
                    </div>
                    <span className="text-[11px] text-neutral-400 font-mono">
                      {tool.href}
                    </span>
                  </div>
                </div>

                <span
                  className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                    isChecked
                      ? "bg-emerald-50 text-emerald-700 border border-emerald-100"
                      : "bg-neutral-100 text-neutral-400"
                  }`}
                >
                  {isChecked ? "Cho phép" : "Khóa"}
                </span>
              </label>
            )
          })}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-2 pt-4 border-t border-neutral-100 mt-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-neutral-600 hover:bg-neutral-100 rounded-xl transition-colors"
          >
            Hủy
          </button>
          <button
            type="button"
            disabled={saving}
            onClick={handleSave}
            className="px-5 py-2 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 disabled:opacity-50 rounded-xl transition-colors flex items-center gap-1.5"
          >
            {saving ? "Đang lưu..." : "Lưu phân quyền"}
          </button>
        </div>
      </div>
    </div>
  )
}
