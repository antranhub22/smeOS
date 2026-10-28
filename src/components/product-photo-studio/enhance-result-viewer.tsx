"use client"

import React, { useState } from "react"
import { CheckCircle2, AlertCircle, Download, RotateCcw } from "lucide-react"
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
        <div className="flex gap-2 p-1 bg-surface-alt rounded-xl text-caption font-semibold">
          <button
            type="button"
            onClick={() => setActiveTab("compare")}
            className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
              activeTab === "compare" ? "bg-surface text-text shadow-xs" : "text-text-muted hover:text-text"
            }`}
          >
            So sánh Trước / Sau
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("result")}
            className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
              activeTab === "result" ? "bg-surface text-text shadow-xs" : "text-text-muted hover:text-text"
            }`}
          >
            Chỉ xem ảnh Studio
          </button>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleDownload}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-border text-caption font-semibold text-text hover:bg-surface-alt transition-colors shadow-2xs cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" /> Tải về
          </button>
          <button
            type="button"
            onClick={onApprove}
            className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-xl bg-primary text-white text-caption font-semibold hover:bg-primary-dark transition-colors shadow-xs cursor-pointer"
          >
            <CheckCircle2 className="w-3.5 h-3.5" /> Sử dụng ảnh này
          </button>
        </div>
      </div>

      {activeTab === "compare" ? (
        <EnhanceComparison originalUrl={originalUrl} enhancedUrl={masterUrl} />
      ) : (
        <div className="max-w-lg mx-auto rounded-2xl overflow-hidden border border-border shadow-md bg-surface-alt aspect-square">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={masterUrl} alt="Ảnh sản phẩm studio hoàn chỉnh" className="w-full h-full object-contain" />
        </div>
      )}

      {/* QC Summary Card */}
      <div className="border border-border rounded-2xl p-5 bg-surface shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-border pb-3">
          <div className="flex items-center gap-2">
            <span className="text-body-sm font-bold text-text">Báo cáo kiểm định chất lượng (QC)</span>
            {qcEvaluation.passed ? (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-caption font-bold bg-success-bg text-success border border-success-border">
                <CheckCircle2 className="w-3.5 h-3.5" /> Đạt chuẩn thương mại
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-caption font-bold bg-danger-bg text-danger border border-danger-border">
                <AlertCircle className="w-3.5 h-3.5" /> Cần tinh chỉnh lại
              </span>
            )}
          </div>
          <div className="text-caption font-semibold text-text-muted">
            Điểm tổng thể:{" "}
            <span className="text-primary font-bold text-body-sm">
              {(qcEvaluation.overallScore * 100).toFixed(0)}/100
            </span>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          {qcEvaluation.items.map((item) => (
            <div
              key={item.code}
              className={`p-2.5 rounded-xl border text-left ${
                item.passed ? "bg-surface-alt border-border" : "bg-danger-bg border-danger-border"
              }`}
            >
              <div className="flex items-center justify-between text-caption font-medium text-text-muted">
                <span className="capitalize">{item.code.replace("_", " ")}</span>
                <span className={item.passed ? "text-success font-bold" : "text-danger font-bold"}>
                  {(item.score * 100).toFixed(0)}%
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Retry trigger */}
        {!showRetryBox ? (
          <div className="flex items-center justify-between pt-2">
            <span className="text-caption text-text-muted">Chưa hài lòng với kết quả này?</span>
            <button
              type="button"
              onClick={() => setShowRetryBox(true)}
              className="text-caption font-semibold text-primary hover:underline flex items-center gap-1 cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" /> Yêu cầu chỉnh lại với gợi ý
            </button>
          </div>
        ) : (
          <div className="pt-3 border-t border-border space-y-2">
            <label className="block text-caption font-bold text-text">
              Nhập hướng dẫn điều chỉnh cho AI
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={retryInput}
                onChange={(e) => setRetryInput(e.target.value)}
                placeholder="Ví dụ: Giữ nguyên chi tiết tem nhãn, ánh sáng nền ấm hơn..."
                className="flex-1 text-caption rounded-xl border border-border px-3 py-2 bg-surface text-text focus:outline-hidden focus:ring-1 focus:ring-primary"
              />
              <button
                type="button"
                disabled={isRetrying}
                onClick={() => onRetry(retryInput || undefined)}
                className="px-4 py-2 bg-primary text-white rounded-xl text-caption font-semibold hover:bg-primary-dark disabled:opacity-50 transition-colors cursor-pointer"
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
