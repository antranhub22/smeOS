"use client"

import React from "react"
import { Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"

export interface SubcontractPodPreviewProps {
  previewUrl: string
  submitting: boolean
  onCancel: () => void
}

export function SubcontractPodPreview({
  previewUrl,
  submitting,
  onCancel,
}: SubcontractPodPreviewProps) {
  return (
    <div className="flex flex-col gap-3 p-3 rounded-xl bg-surface-muted border border-border">
      <div className="relative w-full h-56 rounded-lg overflow-hidden bg-black/5 flex items-center justify-center">
        <img
          src={previewUrl}
          alt="Xem trước ảnh giao hàng"
          className="w-full h-full object-contain"
        />
      </div>
      <div className="flex items-center gap-2">
        <Button
          type="button"
          variant="outline"
          disabled={submitting}
          onClick={onCancel}
          className="flex-1 h-10 text-caption font-bold"
        >
          <Trash2 size={15} className="mr-1 text-danger" /> Chọn ảnh khác
        </Button>
      </div>
    </div>
  )
}
