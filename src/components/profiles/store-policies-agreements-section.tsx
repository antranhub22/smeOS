"use client"

import { Plus, Trash2 } from "@/components/ui/icons"
import { Button } from "@/components/ui/button"
import type { AgreementItem } from "@/modules/greeting-card/domain/store-policy"

/** Thỏa thuận khách phải xác nhận trước khi gửi đơn — mục C của chính sách cửa hàng. */
export function AgreementsSection({
  agreements,
  onAdd,
  onRemove,
  onUpdate,
}: {
  agreements: AgreementItem[]
  onAdd: () => void
  onRemove: (id: string) => void
  onUpdate: (id: string, patch: Partial<AgreementItem>) => void
}) {
  return (
    <div className="rounded-2xl border border-border bg-surface p-5 space-y-4">
      <div className="flex items-center justify-between pb-3 border-b border-border">
        <div>
          <h3 className="text-title-sm font-extrabold text-foreground">Thỏa thuận với Khách hàng (Hiển thị khi Review Đơn)</h3>
          <p className="text-caption text-text-muted">Các tình huống phát sinh có thể xảy ra mà khách bắt buộc phải xác nhận hiểu trước khi gửi đơn.</p>
        </div>
        <Button type="button" size="sm" variant="outline" onClick={onAdd} className="gap-1 h-8 text-caption font-bold">
          <Plus size={14} /> Thêm thỏa thuận
        </Button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {agreements.map((a) => (
          <div key={a.id} className="p-3.5 rounded-xl border border-border bg-surface-muted/30 flex flex-col gap-2 relative group">
            <button
              type="button"
              onClick={() => onRemove(a.id)}
              aria-label="Xóa thỏa thuận"
              className="absolute top-3 right-3 text-text-muted hover:text-danger p-1 rounded-md opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <Trash2 size={14} />
            </button>
            <input
              type="text"
              value={a.title}
              onChange={(e) => onUpdate(a.id, { title: e.target.value })}
              placeholder="Tiêu đề thỏa thuận..."
              className="font-bold text-body-sm text-foreground bg-transparent border-b border-transparent focus:border-primary focus:outline-none"
            />
            <textarea
              rows={2}
              value={a.customerText}
              onChange={(e) => onUpdate(a.id, { customerText: e.target.value })}
              placeholder="Nội dung khách cần đọc và hiểu..."
              className="text-caption text-text-muted bg-transparent border-none focus:ring-0 focus:outline-none resize-none p-0"
            />
            <input
              type="text"
              value={a.internalText || ""}
              onChange={(e) => onUpdate(a.id, { internalText: e.target.value })}
              placeholder="Quy chuẩn xử lý nội bộ..."
              className="text-caption text-text-muted italic bg-transparent border-t border-border/40 pt-1 focus:outline-none"
            />
          </div>
        ))}
      </div>
    </div>
  )
}
