"use client"

/**
 * Component chọn kênh phân phối bài đăng (Bước 2) cho Chức năng 04.
 * Tách ra khỏi page.tsx để tuân thủ SRP ≤350 dòng.
 */

import React from "react"
import { Check } from "@/components/ui/icons"
import { Card } from "@/components/ui/card"

export const CHANNELS_CONFIG = [
  {
    id: "facebook",
    label: "Facebook Fanpage",
    icon: "📘",
    tag: "Album & Bài viết",
    description: "Kể chuyện cảm xúc, thông điệp ý nghĩa & album ảnh sản phẩm",
  },
  {
    id: "instagram",
    label: "Instagram",
    icon: "📸",
    tag: "Visual & Hashtag",
    description: "Caption thẩm mỹ ngắn gọn, tinh tế theo phong cách hình ảnh",
  },
  {
    id: "tiktok",
    label: "TikTok Video",
    icon: "🎵",
    tag: "Kịch bản quay 30s",
    description: "Hook mở đầu 3s giữ chân, visual cues & âm thanh xu hướng",
  },
  {
    id: "zalo",
    label: "Zalo OA",
    icon: "💬",
    tag: "Tư vấn & Báo giá",
    description: "Tin nhắn chào mẫu mới, báo giá ưu đãi & tư vấn 1-chạm",
  },
]

interface ChannelSelectorProps {
  selectedChannels: string[]
  onToggle: (channelId: string) => void
  onSelectAll: () => void
  onClearAll: () => void
}

export function ChannelSelector({
  selectedChannels,
  onToggle,
  onSelectAll,
  onClearAll,
}: ChannelSelectorProps) {
  return (
    <Card className="border border-border bg-card p-5 shadow-sm flex flex-col gap-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <div className="text-xs font-semibold text-text-muted">
            Bước 2: Chọn kênh phân phối bài đăng
          </div>
          <div className="text-title font-extrabold text-text">
            Lựa chọn nền tảng viết bài & xuất bản
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-medium text-text-muted">
            Đã chọn:{" "}
            <strong className="text-primary font-bold">
              {selectedChannels.length}/{CHANNELS_CONFIG.length} kênh
            </strong>
          </span>
          <div className="h-4 w-px bg-border hidden sm:block" />
          <button
            type="button"
            onClick={onSelectAll}
            className="text-xs text-primary hover:underline font-semibold"
          >
            Chọn tất cả
          </button>
          <span className="text-xs text-text-muted">•</span>
          <button
            type="button"
            onClick={onClearAll}
            className="text-xs text-text-muted hover:text-text font-semibold"
          >
            Bỏ chọn hết
          </button>
        </div>
      </div>

      {/* Grid 4 Kênh phân phối */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {CHANNELS_CONFIG.map((ch) => {
          const isChecked = selectedChannels.includes(ch.id)
          return (
            <button
              key={ch.id}
              type="button"
              aria-pressed={isChecked}
              onClick={() => onToggle(ch.id)}
              className={`text-left rounded-xl border p-4 transition-all flex flex-col justify-between gap-2 relative select-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary ${
                isChecked
                  ? "border-primary bg-primary/5 ring-2 ring-primary/20 shadow-sm"
                  : "border-border hover:border-text-muted bg-background opacity-70 hover:opacity-100"
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-2xl">{ch.icon}</span>
                <div
                  className={`w-5 h-5 rounded-md border flex items-center justify-center transition-colors ${
                    isChecked
                      ? "bg-primary border-primary text-white"
                      : "border-border bg-surface"
                  }`}
                >
                  {isChecked && <Check size={13} strokeWidth={3} />}
                </div>
              </div>

              <div>
                <div className="text-xs font-bold text-text flex items-center gap-1.5">
                  {ch.label}
                </div>
                <div className="text-caption text-text-muted line-clamp-2 mt-0.5 leading-snug">
                  {ch.description}
                </div>
              </div>

              <div className="pt-2 border-t border-border/60 flex items-center justify-between w-full">
                <span className="text-caption font-semibold text-text-muted uppercase tracking-wider">
                  {ch.tag}
                </span>
                <span
                  className={`text-caption font-bold ${
                    isChecked ? "text-primary" : "text-text-muted"
                  }`}
                >
                  {isChecked ? "Sẽ tạo & đăng" : "Bỏ qua"}
                </span>
              </div>
            </button>
          )
        })}
      </div>
    </Card>
  )
}
