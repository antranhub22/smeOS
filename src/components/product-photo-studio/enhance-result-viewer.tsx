"use client"

import React, { useState } from "react"
import { CheckCircle2, AlertCircle, Download, RotateCcw, Share2, Sparkles } from "lucide-react"
import type { PhotoEnhanceQcEvaluation } from "@/modules/product-photo-studio/domain/photo-enhance-rules"
import { EnhanceComparison } from "./enhance-comparison"

export interface EnhanceResultViewerProps {
  originalUrl: string
  masterUrl: string
  qcEvaluation: PhotoEnhanceQcEvaluation
  onRetry: (hint?: string) => void
  onApprove: () => void
  isRetrying?: boolean
}

export function EnhanceResultViewer({
  originalUrl,
  masterUrl,
  qcEvaluation,
  onRetry,
  onApprove,
  isRetrying,
}: EnhanceResultViewerProps) {
  const [activeTab, setActiveTab] = useState<"compare" | "result">("compare")
  const [retryInput, setRetryInput] = useState("")
  const [showRetryBox, setShowRetryBox] = useState(false)

  const handleDownload = () => {
    window.open(masterUrl, "_blank")
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex gap-2 p-1 bg-slate-100 rounded-xl text-xs font-semibold">
          <button
            type="button"
            onClick={() => setActiveTab("compare")}
            className={`px-3 py-1.5 rounded-lg transition-colors ${
              activeTab === "compare" ? "bg-white text-slate-900 shadow-xs" : "text-slate-600 hover:text-slate-900"
            }`}
          >
            So sánh Trước / Sau
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("result")}
            className={`px-3 py-1.5 rounded-lg transition-colors ${
              activeTab === "result" ? "bg-white text-slate-900 shadow-xs" : "text-slate-600 hover:text-slate-900"
            }`}
          >
            Chỉ xem ảnh Studio
          </button>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleDownload}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors shadow-xs"
          >
            <Download className="w-3.5 h-3.5" /> Tải về
          </button>
          <button
            type="button"
            onClick={onApprove}
            className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-xl bg-amber-600 text-white text-xs font-semibold hover:bg-amber-700 transition-colors shadow-xs"
          >
            <CheckCircle2 className="w-3.5 h-3.5" /> Sử dụng ảnh này
          </button>
        </div>
      </div>

      {activeTab === "compare" ? (
        <EnhanceComparison originalUrl={originalUrl} enhancedUrl={masterUrl} />
      ) : (
        <div className="max-w-lg mx-auto rounded-2xl overflow-hidden border border-slate-200 shadow-md bg-slate-900 aspect-square">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={masterUrl} alt="Ảnh sản phẩm studio hoàn chỉnh" className="w-full h-full object-contain" />
        </div>
      )}

      {/* QC Summary Card */}
      <div className="border border-slate-200 rounded-2xl p-5 bg-white shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <span className="text-sm font-bold text-slate-800">Báo cáo kiểm định chất lượng (QC)</span>
            {qcEvaluation.passed ? (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800">
                <CheckCircle2 className="w-3.5 h-3.5" /> Đạt chuẩn thương mại
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-rose-100 text-rose-800">
                <AlertCircle className="w-3.5 h-3.5" /> Cần tinh chỉnh lại
              </span>
            )}
          </div>
          <div className="text-xs font-semibold text-slate-500">
            Điểm tổng thể:{" "}
            <span className="text-amber-700 font-bold text-sm">
              {(qcEvaluation.overallScore * 100).toFixed(0)}/100
            </span>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          {qcEvaluation.items.map((item) => (
            <div
              key={item.code}
              className={`p-2.5 rounded-xl border text-left ${
                item.passed ? "bg-slate-50 border-slate-200/80" : "bg-rose-50/50 border-rose-200"
              }`}
            >
              <div className="flex items-center justify-between text-[11px] font-medium text-slate-600">
                <span className="capitalize">{item.code.replace("_", " ")}</span>
                <span className={item.passed ? "text-emerald-700 font-bold" : "text-rose-700 font-bold"}>
                  {(item.score * 100).toFixed(0)}%
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Retry trigger */}
        {!showRetryBox ? (
          <div className="flex items-center justify-between pt-2">
            <span className="text-xs text-slate-500">Chưa hài lòng với kết quả này?</span>
            <button
              type="button"
              onClick={() => setShowRetryBox(true)}
              className="text-xs font-semibold text-amber-700 hover:text-amber-800 flex items-center gap-1"
            >
              <RotateCcw className="w-3.5 h-3.5" /> Yêu cầu chỉnh lại với gợi ý
            </button>
          </div>
        ) : (
          <div className="pt-3 border-t border-slate-100 space-y-2">
            <label className="block text-xs font-bold text-slate-700">
              Nhập hướng dẫn điều chỉnh cho AI
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={retryInput}
                onChange={(e) => setRetryInput(e.target.value)}
                placeholder="Ví dụ: Giữ nguyên chi tiết tem nhãn, ánh sáng nền ấm hơn..."
                className="flex-1 text-xs rounded-xl border border-slate-200 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-amber-500/20"
              />
              <button
                type="button"
                disabled={isRetrying}
                onClick={() => onRetry(retryInput || undefined)}
                className="px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-semibold hover:bg-slate-800 disabled:opacity-50 transition-colors"
              >
                {isRetrying ? "Đang xử lý..." : "Chạy lại"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
