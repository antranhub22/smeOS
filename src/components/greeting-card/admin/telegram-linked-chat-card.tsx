import React, { useState } from "react"
import { CheckCircle2, Copy, Trash2 } from "@/components/ui/icons"
import { apiSend } from "@/components/greeting-card/greeting-api"

interface LinkedChat {
  id: string
  title: string
  type: string
}

/** Một chat đã liên kết: bấm để chọn gửi thử, nút "Gỡ" để bot thôi gửi tới chat này. */
export function TelegramLinkedChatCard({
  chat,
  selected,
  copied,
  onSelect,
  onRemoved,
}: {
  chat: LinkedChat
  selected: boolean
  copied: boolean
  onSelect: (id: string) => void
  onRemoved: () => void
}) {
  const [removing, setRemoving] = useState(false)

  const handleRemove = async () => {
    if (!window.confirm(`Gỡ "${chat.title}"? Bot sẽ không gửi tin tới đây nữa. Muốn dùng lại, gửi mã liên kết vào đó rồi quét lại.`)) return
    setRemoving(true)
    try {
      await apiSend(`/api/v1/greeting-card/integrations/telegram-dispatch?chatId=${encodeURIComponent(chat.id)}`, "DELETE", undefined, "Không gỡ được")
      onRemoved()
    } catch (err) {
      window.alert(err instanceof Error ? err.message : "Không gỡ được")
    } finally {
      setRemoving(false)
    }
  }

  return (
    <div
      className={`p-3 rounded-xl border transition-all flex items-center justify-between gap-2 ${
        selected ? "border-primary bg-primary/5 shadow-sm" : "border-border bg-surface hover:border-primary/50"
      }`}
    >
      <button type="button" onClick={() => onSelect(chat.id)} className="min-w-0 flex-1 text-left cursor-pointer">
        <div className="text-body-sm font-bold text-foreground truncate">{chat.title}</div>
        <div className="flex items-center gap-2 mt-0.5">
          <span className="text-caption-sm text-text-muted capitalize">[{chat.type}]</span>
          <code className="text-caption-sm font-mono font-semibold text-primary">{chat.id}</code>
        </div>
      </button>
      <div className="shrink-0 flex items-center gap-2 text-caption font-medium">
        <button type="button" onClick={() => onSelect(chat.id)} className="inline-flex items-center gap-1 text-primary">
          {copied ? (
            <span className="text-success inline-flex items-center gap-1 font-bold">
              <CheckCircle2 size={14} /> Đã chọn
            </span>
          ) : (
            <>
              <Copy size={13} /> Chọn
            </>
          )}
        </button>
        <button
          type="button"
          onClick={handleRemove}
          disabled={removing}
          className="inline-flex items-center gap-1 text-danger hover:underline disabled:opacity-50"
        >
          <Trash2 size={13} /> {removing ? "Đang gỡ…" : "Gỡ"}
        </button>
      </div>
    </div>
  )
}
