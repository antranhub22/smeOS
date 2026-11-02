"use client"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Dialog } from "@/components/ui/dialog"
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
  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        if (!open) onCancel()
      }}
      title="Xác nhận thay đổi Ma trận ngành"
      description={`Vui lòng kiểm tra danh sách ${diffs.length} thay đổi trước khi lưu vào hệ thống:`}
      size="md"
      footer={
        <div className="flex justify-end gap-2">
          <Button variant="ghost" onClick={onCancel} disabled={isSaving}>
            Hủy bỏ
          </Button>
          <Button variant="primary" onClick={onConfirm} disabled={isSaving}>
            {isSaving ? "Đang lưu..." : "Xác nhận & Lưu"}
          </Button>
        </div>
      }
    >
      <div className="max-h-60 overflow-y-auto rounded-lg border border-border bg-surface-alt p-3 space-y-2">
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
    </Dialog>
  )
}
