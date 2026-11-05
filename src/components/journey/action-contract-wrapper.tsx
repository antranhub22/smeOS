"use client"

import React from "react"
import { ArrowLeft } from "@/components/ui/icon-set/arrow-left"
import { Loader2 } from "@/components/ui/icon-set/loader2"
import { AlertCircle } from "@/components/ui/icon-set/alert-circle"
import { ArrowRight } from "@/components/ui/icon-set/arrow-right"
import { RefreshCw } from "@/components/ui/icon-set/refresh-cw"
import { Button } from "@/components/ui/button"
import { NextActions, type NextActionItem } from "./next-actions"

interface ActionContractWrapperProps {
  title: string
  description?: string
  currentPhase: "INPUT" | "CONFIRM" | "PROCESSING" | "RESULT"
  onBack?: () => void
  inputNode?: React.ReactNode
  confirmNode?: React.ReactNode
  onConfirm?: () => void
  onProceedToConfirm?: () => void
  processingMessage?: string
  resultNode?: React.ReactNode
  nextActions?: NextActionItem[]
  errorMessage?: string | null
  onRetry?: () => void
}

export function ActionContractWrapper({
  title,
  description,
  currentPhase,
  onBack,
  inputNode,
  confirmNode,
  onConfirm,
  onProceedToConfirm,
  processingMessage = "Hệ thống đang xử lý tác vụ, vui lòng chờ giây lát...",
  resultNode,
  nextActions,
  errorMessage,
  onRetry,
}: ActionContractWrapperProps) {
  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      {/* Header bar */}
      <div className="flex items-center justify-between pb-4 border-b border-border bg-surface px-4 py-3 rounded-xl">
        <div className="flex items-center gap-3">
          {onBack && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onBack}
              className="w-9 h-9 p-0"
              title="Quay lại"
            >
              <ArrowLeft className="w-4 h-4" aria-hidden="true" />
            </Button>
          )}
          <div>
            <h2 className="text-title font-bold text-text">
              {title}
            </h2>
            {description && (
              <p className="text-meta text-text-muted mt-0.5">
                {description}
              </p>
            )}
          </div>
        </div>

        {/* Phase Indicator Badge */}
        <span className="text-caption font-semibold px-2.5 py-1 rounded-md bg-selected text-primary border border-border">
          {currentPhase === "INPUT" && "Bước 1: Nhập thông tin"}
          {currentPhase === "CONFIRM" && "Bước 2: Xác nhận"}
          {currentPhase === "PROCESSING" && "Bước 3: Đang xử lý"}
          {currentPhase === "RESULT" && "Bước 4: Hoàn thành"}
        </span>
      </div>

      {/* Error Banner */}
      {errorMessage && (
        <div className="p-4 rounded-xl bg-danger-bg border border-danger flex items-start justify-between gap-3">
          <div className="flex items-start gap-2.5">
            <AlertCircle className="w-5 h-5 text-danger shrink-0 mt-0.5" aria-hidden="true" />
            <div>
              <h3 className="text-body-sm font-bold text-danger">
                Đã xảy ra lỗi khi thực hiện tác vụ
              </h3>
              <p className="text-body-sm text-text mt-0.5">
                {errorMessage}
              </p>
            </div>
          </div>
          {onRetry && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onRetry}
              className="gap-1.5 border-danger text-danger hover:bg-danger-bg shrink-0"
            >
              <RefreshCw className="w-3.5 h-3.5" aria-hidden="true" />
              <span>Thử lại</span>
            </Button>
          )}
        </div>
      )}

      {/* Body Content based on Phase */}
      <div className="bg-surface border border-border rounded-2xl p-5 sm:p-6 shadow-xs min-h-[300px]">
        {currentPhase === "INPUT" && (
          <div className="space-y-6">
            <div>{inputNode}</div>
            {onProceedToConfirm && (
              <div className="flex justify-end pt-4 border-t border-border">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={onProceedToConfirm}
                  className="gap-2"
                >
                  <span>Tiếp tục xác nhận</span>
                  <ArrowRight className="w-4 h-4" aria-hidden="true" />
                </Button>
              </div>
            )}
          </div>
        )}

        {currentPhase === "CONFIRM" && (
          <div className="space-y-6">
            <div>{confirmNode}</div>
            {onConfirm && (
              <div className="flex justify-end gap-3 pt-4 border-t border-border">
                {onBack && (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={onBack}
                  >
                    Chỉnh sửa lại
                  </Button>
                )}
                <Button
                  type="button"
                  variant="primary"
                  onClick={onConfirm}
                  className="gap-2"
                >
                  <span>Tiến hành ngay</span>
                  <ArrowRight className="w-4 h-4" aria-hidden="true" />
                </Button>
              </div>
            )}
          </div>
        )}

        {currentPhase === "PROCESSING" && (
          <div className="flex flex-col items-center justify-center py-16 text-center space-y-4">
            <Loader2 className="w-10 h-10 text-primary animate-spin motion-reduce:animate-none" aria-hidden="true" />
            <div>
              <h3 className="text-title-sm font-bold text-text">
                Đang xử lý dữ liệu
              </h3>
              <p className="text-body-sm text-text-muted mt-1 max-w-md">
                {processingMessage}
              </p>
            </div>
          </div>
        )}

        {currentPhase === "RESULT" && (
          <div className="space-y-6">
            <div>{resultNode}</div>
            {nextActions && nextActions.length > 0 && (
              <div className="pt-6 border-t border-border">
                <NextActions actions={nextActions} />
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
