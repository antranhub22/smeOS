"use client"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import type { MatrixDiffItem } from "../_lib/types"

interface MatrixDiffModalProps {
  isOpen: boolean
  diffs: MatrixDiffItem[]
  isSaving: boolean
  onConfirm: () => void
  onCancel: () => void
}

export function MatrixDiffModal({
  isOpen,
  diffs,
  isSaving,
  onConfirm,
  onCancel,
}: MatrixDiffModalProps) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
      <div className="w-full max-w-lg rounded-xl border border-border bg-surface p-6 shadow-2xl">
        <div className="space-y-1">
          <h3 className="text-lg font-bold text-text">Xác nhận thay đổi Ma trận ngành</h3>
          <p className="text-body-sm text-text-muted">
            Vui lòng kiểm tra danh sách {diffs.length} thay đổi trước khi lưu vào hệ thống:
          </p>
        </div>

        <div className="my-4 max-h-60 overflow-y-auto rounded-lg border border-border bg-surface-alt p-3 space-y-2">
          {diffs.map((diff, idx) => (
            <div
              key={`${diff.industryKey}-${diff.navKey}-${idx}`}
              className="flex items-center justify-between text-body-sm"
            >
              <div>
                <span className="font-semibold text-text">{diff.industryName}:</span>{" "}
                <span className="text-text-muted">{diff.navItemLabel}</span>
              </div>
              <Badge tone={diff.action === "HIDE" ? "warning" : "success"}>
                {diff.action === "HIDE" ? "Ẩn mục" : "Hiện mục"}
              </Badge>
            </div>
          ))}
        </div>

        <div className="flex justify-end gap-2">
          <Button variant="ghost" onClick={onCancel} disabled={isSaving}>
            Hủy bỏ
          </Button>
          <Button variant="primary" onClick={onConfirm} disabled={isSaving}>
            {isSaving ? "Đang lưu..." : "Xác nhận & Lưu"}
          </Button>
        </div>
      </div>
    </div>
  )
}
