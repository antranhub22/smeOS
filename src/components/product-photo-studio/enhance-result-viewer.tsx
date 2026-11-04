"use client"

import { safeImageSrc } from "@/lib/safe-image-src"
import React, { useState } from "react"
import { CheckCircle2 } from "@/components/ui/icon-set/check-circle2"
import { AlertCircle } from "@/components/ui/icon-set/alert-circle"
import { Download } from "@/components/ui/icon-set/download"
import { RotateCcw } from "@/components/ui/icon-set/rotate-ccw"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
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
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => setActiveTab("compare")}
            className={`px-3 py-1.5 h-auto rounded-lg text-caption font-semibold transition-colors cursor-pointer ${
              activeTab === "compare" ? "bg-surface text-text shadow-xs" : "text-text-muted hover:text-text"
            }`}
          >
            So sánh Trước / Sau
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => setActiveTab("result")}
            className={`px-3 py-1.5 h-auto rounded-lg text-caption font-semibold transition-colors cursor-pointer ${
              activeTab === "result" ? "bg-surface text-text shadow-xs" : "text-text-muted hover:text-text"
            }`}
          >
            Chỉ xem ảnh Studio
          </Button>
        </div>

        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleDownload}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 h-auto rounded-xl border border-border text-caption font-semibold text-text hover:bg-surface-alt transition-colors shadow-2xs cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" /> Tải về
          </Button>
          <Button
            type="button"
            size="sm"
            onClick={onApprove}
            className="inline-flex items-center gap-1.5 px-4 py-1.5 h-auto rounded-xl bg-primary text-white text-caption font-semibold hover:bg-primary-dark transition-colors shadow-xs cursor-pointer"
          >
            <CheckCircle2 className="w-3.5 h-3.5" /> Sử dụng ảnh này
          </Button>
        </div>
      </div>

      {activeTab === "compare" ? (
        <EnhanceComparison originalUrl={originalUrl} enhancedUrl={masterUrl} />
      ) : (
        <div className="max-w-lg mx-auto rounded-2xl overflow-hidden border border-border shadow-md bg-surface-alt aspect-square">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={safeImageSrc(masterUrl)} alt="Ảnh sản phẩm studio hoàn chỉnh" className="w-full h-full object-contain" />
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
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setShowRetryBox(true)}
              className="h-auto p-0 text-caption font-semibold text-primary hover:underline flex items-center gap-1 cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" /> Yêu cầu chỉnh lại với gợi ý
            </Button>
          </div>
        ) : (
          <div className="pt-3 border-t border-border space-y-2">
            <label className="block text-caption font-bold text-text">
              Nhập hướng dẫn điều chỉnh cho AI
            </label>
            <div className="flex gap-2">
              <Input
                type="text"
                value={retryInput}
                onChange={(e) => setRetryInput(e.target.value)}
                placeholder="Ví dụ: Giữ nguyên chi tiết tem nhãn, ánh sáng nền ấm hơn..."
                className="flex-1 text-caption h-9"
              />
              <Button
                type="button"
                variant="secondary"
                size="sm"
                disabled={isRetrying}
                onClick={() => onRetry(retryInput || undefined)}
                className="h-9 px-4 text-caption font-semibold cursor-pointer"
              >
                {isRetrying ? "Đang xử lý..." : "Chạy lại"}
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
